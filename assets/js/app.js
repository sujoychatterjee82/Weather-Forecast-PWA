/**
 * Application entry point.
 * Orchestrates location detection, weather fetching, rendering, charts,
 * map, favourites, recents, language, theme, export and PWA install.
 */

import { CONFIG } from './config.js';
import WeatherService from './api/weather-service.js';
import LocationService from './location/location-service.js';
import { renderAllCharts, destroyAllCharts } from './charts/weather-charts.js';
import { initMap, updateLocation, bindLayerButtons, invalidateSize } from './map/weather-map.js';
import { exportExcel, exportCsv, exportPdf } from './export/export-service.js';
import { toast } from './ui/toast.js';
import { showLoading, showDashboard, showError } from './ui/loading.js';
import * as Renderer from './ui/renderer.js';
import { setLanguage, getLanguage, t } from './i18n/translations.js';
import { debounce, qs, qsa, withLock } from './utils/helpers.js';

/* --------------------------------------------------------------------------
 * State
 * ---------------------------------------------------------------------- */

const state = {
  lang: 'en',
  location: null,
  weather: null,
  favourites: [],
  recents: [],
  installEvent: null,
  refreshInFlight: false
};

/* --------------------------------------------------------------------------
 * Local preferences
 * ---------------------------------------------------------------------- */

const LS = {
  lang: 'weather:lang',
  theme: 'weather:theme',
  favourites: 'weather:favourites',
  recents: 'weather:recents',
  installDismissed: 'weather:installDismissed'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/* --------------------------------------------------------------------------
 * Language
 * ---------------------------------------------------------------------- */

function setLang(lang) {
  state.lang = lang === 'bn' ? 'bn' : 'en';
  setLanguage(state.lang);
  try { localStorage.setItem(LS.lang, state.lang); } catch {}
  const label = document.getElementById('lang-label');
  if (label) label.textContent = state.lang === 'bn' ? 'বাং' : 'EN';
  Renderer.applyTranslations(state.lang);
  if (state.weather) renderAll(state.weather);
}

function toggleLang() {
  setLang(state.lang === 'bn' ? 'en' : 'bn');
}

/* --------------------------------------------------------------------------
 * Theme
 * ---------------------------------------------------------------------- */

function setTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  try { localStorage.setItem(LS.theme, dark ? 'dark' : 'light'); } catch {}
  // Charts re-render to pick up theme colours.
  if (state.weather) renderAllCharts(state.weather, { lang: state.lang });
}

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    setTheme(!document.documentElement.classList.contains('dark'));
  });
}

/* --------------------------------------------------------------------------
 * Rendering
 * ---------------------------------------------------------------------- */

function renderAll(weather) {
  const stale = Boolean(weather._stale || weather._cached);
  Renderer.renderHero(weather, { lang: state.lang, stale });
  Renderer.renderMetrics(weather, { lang: state.lang });
  Renderer.renderAQI(weather, { lang: state.lang });
  Renderer.renderHourly(weather, { lang: state.lang });
  Renderer.renderDaily(weather, { lang: state.lang });
  Renderer.renderWeeklySummary(weather, { lang: state.lang });
  Renderer.renderFarmer(weather, { lang: state.lang });
  Renderer.renderClothing(weather, { lang: state.lang });
  Renderer.renderAstro(weather, { lang: state.lang });
  renderAllCharts(weather, { lang: state.lang });
  if (state.location) updateLocation(state.location, { lang: state.lang });
  renderFavouritesList();
  renderRecentsList();
  showDashboard();
}

/* --------------------------------------------------------------------------
 * Weather load
 * ---------------------------------------------------------------------- */

async function loadWeather(location, { forceRefresh = false, silent = false } = {}) {
  if (!location) return;
  state.location = location;

  if (!silent) showLoading();

  try {
    const weather = await WeatherService.getWeather(location, {
      forceRefresh,
      lang: state.lang,
      onStatus: (info) => {
        if (info.type === 'stale') toast.info(t('toast.usingCache', state.lang));
      }
    });
    state.weather = weather;
    renderAll(weather);
    LocationService.saveStoredLocation(weather.location ? { ...location, ...weather.location } : location);
  } catch (err) {
    console.error('[app] weather load failed', err);
    showError(t('error.allFailed', state.lang));
    toast.error(t('error.network', state.lang));
  }
}

async function handleRefresh() {
  if (!state.location) return;
  if (state.refreshInFlight) return;
  state.refreshInFlight = true;
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.disabled = true;
  try {
    const weather = await WeatherService.refresh(state.location, { lang: state.lang });
    state.weather = weather;
    renderAll(weather);
    toast.success(t('toast.weatherUpdated', state.lang));
  } catch (err) {
    console.error('[app] refresh failed', err);
    toast.error(t('error.allFailed', state.lang));
  } finally {
    state.refreshInFlight = false;
    if (btn) btn.disabled = false;
  }
}

/* --------------------------------------------------------------------------
 * Initial location
 * ---------------------------------------------------------------------- */

async function bootstrapLocation() {
  const { location, source } = await LocationService.detectInitialLocation();
  state.location = location;
  if (source === 'geolocation') toast.success(t('toast.locationDetected', state.lang));
  if (source === 'default') {
    // Silent – the default is expected behaviour.
  }
  return location;
}

/* --------------------------------------------------------------------------
 * Search
 * ---------------------------------------------------------------------- */

function setupSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const suggBox = document.getElementById('search-suggestions');
  if (!form || !input || !suggBox) return;

  let lastResults = [];
  let activeIndex = -1;

  const hideSuggestions = () => {
    suggBox.classList.add('hidden');
    suggBox.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  };

  const renderSuggestions = (items) => {
    suggBox.innerHTML = '';
    if (!items.length) {
      const div = document.createElement('div');
      div.className = 'suggestion-empty';
      div.textContent = t('search.noResults', state.lang);
      suggBox.appendChild(div);
      suggBox.classList.remove('hidden');
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    for (const item of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'suggestion-item';
      btn.setAttribute('role', 'option');
      btn.innerHTML = `
        <span>${item.name}</span>
        <small>${[item.region, item.country].filter(Boolean).join(', ')}</small>
      `;
      btn.addEventListener('click', () => {
        hideSuggestions();
        selectLocation(item);
      });
      suggBox.appendChild(btn);
    }
    suggBox.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
  };

  const doSearch = debounce(async (q) => {
    if (!q || q.length < 2) {
      hideSuggestions();
      return;
    }
    try {
      const results = await WeatherService.search(q, { lang: state.lang });
      lastResults = results;
      renderSuggestions(results);
    } catch (err) {
      console.warn('[app] search failed', err);
      renderSuggestions([]);
    }
  }, 300);

  input.addEventListener('input', () => {
    const v = input.value.trim();
    clearBtn.classList.toggle('hidden', !v);
    if (!v) { hideSuggestions(); return; }
    doSearch(v);
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { hideSuggestions(); input.blur(); return; }
    if (ev.key === 'ArrowDown' && lastResults.length) {
      ev.preventDefault();
      activeIndex = Math.min(activeIndex + 1, lastResults.length - 1);
      highlightSuggestion(activeIndex, suggBox);
    }
    if (ev.key === 'ArrowUp' && lastResults.length) {
      ev.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightSuggestion(activeIndex, suggBox);
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (activeIndex >= 0 && lastResults[activeIndex]) {
        hideSuggestions();
        selectLocation(lastResults[activeIndex]);
      } else if (lastResults.length) {
        hideSuggestions();
        selectLocation(lastResults[0]);
      }
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    hideSuggestions();
    input.focus();
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (lastResults[0]) {
      hideSuggestions();
      selectLocation(lastResults[0]);
    } else if (input.value.trim()) {
      doSearch(input.value.trim());
    }
  });

  document.addEventListener('click', (ev) => {
    if (!suggBox.contains(ev.target) && ev.target !== input) hideSuggestions();
  });
}

function highlightSuggestion(index, box) {
  const items = qsa('.suggestion-item', box);
  items.forEach((n, i) => n.classList.toggle('is-active', i === index));
}

async function selectLocation(item) {
  if (!item) return;
  const location = {
    id: item.id || `${item.latitude},${item.longitude}`,
    name: item.name || '',
    region: item.region || '',
    country: item.country || '',
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    timezone: item.timezone || 'auto',
    type: item.type || 'search'
  };
  LocationService.saveStoredLocation(location);
  addRecent(location);
  await loadWeather(location, { forceRefresh: true });
  updateLocation(location, { lang: state.lang });
}

/* --------------------------------------------------------------------------
 * Recents
 * ---------------------------------------------------------------------- */

function addRecent(location) {
  const key = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
  const list = state.recents.filter((r) => `${r.latitude.toFixed(3)},${r.longitude.toFixed(3)}` !== key);
  list.unshift(location);
  state.recents = list.slice(0, 8);
  writeJSON(LS.recents, state.recents);
  renderRecentsList();
}

function renderRecentsList() {
  Renderer.renderRecents(state.recents, {
    lang: state.lang,
    onSelect: (item) => selectLocation(item)
  });
}

function setupRecents() {
  state.recents = readJSON(LS.recents, []);
  renderRecentsList();
  const btn = document.getElementById('clear-recents-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      state.recents = [];
      writeJSON(LS.recents, []);
      renderRecentsList();
      toast.info(t('toast.recentsCleared', state.lang));
    });
  }
}

/* --------------------------------------------------------------------------
 * Favourites
 * ---------------------------------------------------------------------- */

function favKey(loc) {
  return `${Number(loc.latitude).toFixed(4)},${Number(loc.longitude).toFixed(4)}`;
}

function isFavourite(loc) {
  return state.favourites.some((f) => favKey(f) === favKey(loc));
}

function addFavourite(loc) {
  if (isFavourite(loc)) {
    toast.info(t('toast.favExists', state.lang));
    return;
  }
  state.favourites.push(loc);
  writeJSON(LS.favourites, state.favourites);
  renderFavouritesList();
  toast.success(t('toast.favAdded', state.lang));
}

function removeFavourite(loc) {
  const k = favKey(loc);
  state.favourites = state.favourites.filter((f) => favKey(f) !== k);
  writeJSON(LS.favourites, state.favourites);
  renderFavouritesList();
  toast.info(t('toast.favRemoved', state.lang));
}

function renderFavouritesList() {
  const activeKey = state.location ? favKey(state.location) : '';
  Renderer.renderFavourites(state.favourites, {
    lang: state.lang,
    activeKey,
    onSelect: (item) => selectLocation(item),
    onRemove: (item) => removeFavourite(item)
  });
  const btn = document.getElementById('fav-add-btn');
  if (btn) {
    btn.style.color = state.location && isFavourite(state.location) ? 'var(--primary)' : '';
  }
}

function setupFavourites() {
  state.favourites = readJSON(LS.favourites, []);
  renderFavouritesList();
  const btn = document.getElementById('fav-add-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (!state.location) return;
      if (isFavourite(state.location)) removeFavourite(state.location);
      else addFavourite(state.location);
    });
  }
}

/* --------------------------------------------------------------------------
 * Voice search
 * ---------------------------------------------------------------------- */

function setupVoice() {
  const btn = document.getElementById('voice-btn');
  const input = document.getElementById('search-input');
  if (!btn || !input) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !CONFIG.FEATURES.VOICE_SEARCH) {
    btn.addEventListener('click', () => toast.warning(t('toast.voiceUnsupported', state.lang)));
    btn.style.opacity = '.6';
    return;
  }

  btn.addEventListener('click', () => {
    const rec = new SR();
    rec.lang = state.lang === 'bn' ? 'bn-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    btn.classList.add('is-listening');
    const toastHandle = toast.loading(t('toast.voiceListening', state.lang));

    rec.onresult = (ev) => {
      const transcript = ev.results?.[0]?.[0]?.transcript || '';
      toastHandle.dismiss();
      if (transcript) {
        input.value = transcript;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          const form = document.getElementById('search-form');
          if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 200);
      }
    };
    rec.onerror = (err) => {
      console.warn('[voice] error', err);
      toastHandle.dismiss();
      toast.error(t('toast.voiceUnsupported', state.lang));
    };
    rec.onend = () => btn.classList.remove('is-listening');

    try { rec.start(); } catch (err) {
      console.warn('[voice] start failed', err);
      toastHandle.dismiss();
    }
  });
}

/* --------------------------------------------------------------------------
 * Locate button
 * ---------------------------------------------------------------------- */

function setupLocate() {
  const btn = document.getElementById('locate-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const handle = toast.loading(t('status.loading', state.lang));
    try {
      const coords = await LocationService.getBrowserLocation();
      const place = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
      const location = place || {
        id: 'coords',
        name: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
        region: '',
        country: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezone: 'auto',
        type: 'coords'
      };
      handle.dismiss();
      toast.success(t('toast.locationDetected', state.lang));
      await selectLocation(location);
    } catch (err) {
      handle.dismiss();
      console.warn('[locate] failed', err);
      toast.warning(t('toast.locationDenied', state.lang));
    }
  });
}

/* --------------------------------------------------------------------------
 * Hourly scroll buttons
 * ---------------------------------------------------------------------- */

function setupHourlyScroll() {
  const container = document.getElementById('hourly-scroll');
  const prev = document.getElementById('hourly-prev');
  const next = document.getElementById('hourly-next');
  if (!container) return;
  const scrollBy = 240;
  if (prev) prev.addEventListener('click', () => container.scrollBy({ left: -scrollBy, behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => container.scrollBy({ left: scrollBy, behavior: 'smooth' }));
}

/* --------------------------------------------------------------------------
 * Export buttons
 * ---------------------------------------------------------------------- */

function setupExport() {
  const excelBtn = document.getElementById('export-excel');
  const csvBtn = document.getElementById('export-csv');
  const pdfBtn = document.getElementById('export-pdf');

  const guard = (fn) => async () => {
    if (!state.weather || !CONFIG.FEATURES.EXPORT) return;
    try {
      await fn(state.weather, { lang: state.lang });
      toast.success(t('export.done', state.lang));
    } catch (err) {
      console.error('[export] failed', err);
      toast.error(t('export.failed', state.lang));
    }
  };

  if (excelBtn) excelBtn.addEventListener('click', guard(exportExcel));
  if (csvBtn) csvBtn.addEventListener('click', guard(async (w) => exportCsv(w)));
  if (pdfBtn) pdfBtn.addEventListener('click', guard(exportPdf));
}

/* --------------------------------------------------------------------------
 * Offline / online banner
 * ---------------------------------------------------------------------- */

function setupOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  const update = () => {
    if (!banner) return;
    banner.classList.toggle('hidden', navigator.onLine);
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/* --------------------------------------------------------------------------
 * PWA install
 * ---------------------------------------------------------------------- */

function setupPWA() {
  const installBtn = document.getElementById('install-btn');
  const banner = document.getElementById('install-banner');
  const acceptBtn = document.getElementById('install-accept');
  const dismissBtn = document.getElementById('install-dismiss');

  const dismissed = (() => {
    try { return localStorage.getItem(LS.installDismissed) === '1'; } catch { return false; }
  })();

  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    state.installEvent = ev;
    if (!dismissed) {
      if (installBtn) installBtn.classList.remove('hidden');
      if (banner) banner.classList.remove('hidden');
    }
  });

  const triggerInstall = async () => {
    if (!state.installEvent) return;
    state.installEvent.prompt();
    try { await state.installEvent.userChoice; } catch {}
    state.installEvent = null;
    if (installBtn) installBtn.classList.add('hidden');
    if (banner) banner.classList.add('hidden');
  };

  if (installBtn) installBtn.addEventListener('click', triggerInstall);
  if (acceptBtn) acceptBtn.addEventListener('click', triggerInstall);
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      try { localStorage.setItem(LS.installDismissed, '1'); } catch {}
      if (banner) banner.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    if (banner) banner.classList.add('hidden');
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !CONFIG.FEATURES.PWA) return;
  window.addEventListener('load', () => {
    // Use a relative URL so it works under GitHub Pages subpaths.
    const swUrl = new URL('./service-worker.js', import.meta.url);
    navigator.serviceWorker.register(swUrl, { scope: './' })
      .then((reg) => {
        console.info('[app] Service worker registered at', reg.scope);
      })
      .catch((err) => {
        console.warn('[app] Service worker registration failed', err);
      });
  });
}

/* --------------------------------------------------------------------------
 * Global error guard
 * ---------------------------------------------------------------------- */

function setupGlobalErrors() {
  window.addEventListener('unhandledrejection', (ev) => {
    console.warn('[app] Unhandled rejection', ev.reason);
  });
}

/* --------------------------------------------------------------------------
 * Map
 * ---------------------------------------------------------------------- */

function setupMap() {
  bindLayerButtons();
  const mapSection = document.getElementById('map-section');
  if (!mapSection) return;
  // Lazy initialise the map when it first scrolls into view.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          initMap(state.location, { lang: state.lang });
          invalidateSize();
          io.disconnect();
          break;
        }
      }
    }, { rootMargin: '120px' });
    io.observe(mapSection);
  } else {
    initMap(state.location, { lang: state.lang });
  }
  window.addEventListener('resize', debounce(() => invalidateSize(), 250));
}

/* --------------------------------------------------------------------------
 * Boot
 * ---------------------------------------------------------------------- */

async function main() {
  try {
    const versionNode = document.getElementById('app-version');
    if (versionNode) versionNode.textContent = `v${CONFIG.APP_VERSION}`;

    const initialLang = (() => {
      try { return localStorage.getItem(LS.lang) || 'en'; } catch { return 'en'; }
    })();
    setLang(initialLang);

    initTheme();
    setupOnlineStatus();
    setupSearch();
    setupRecents();
    setupFavourites();
    setupVoice();
    setupLocate();
    setupHourlyScroll();
    setupExport();
    setupPWA();
    setupGlobalErrors();
    registerServiceWorker();

    const location = await bootstrapLocation();
    await loadWeather(location, { forceRefresh: false });

    // Defer map initialisation until after the dashboard exists.
    setupMap();

    // Re-render on visibility change (cheap way to refresh "updated X min ago").
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.weather) {
        Renderer.renderHero(state.weather, { lang: state.lang, stale: Boolean(state.weather._stale) });
      }
    });
  } catch (err) {
    console.error('[app] boot failed', err);
    showError(t('error.noData', state.lang));
  }
}

document.addEventListener('DOMContentLoaded', main);