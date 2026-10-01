/**
 * All DOM rendering for the weather dashboard.
 * Consumes only the normalized weather payload from WeatherService.
 */

import { t, getLanguage } from '../i18n/translations.js';
import {
  formatNumber, formatFullDate, formatShortDate, formatWeekday,
  formatShortWeekday, formatTime, formatHourLabel, formatRelativeTime,
  windDir, aqiCategory, uvCategory, dayLength
} from '../utils/formatters.js';

/* ---------- Weather icons (inline SVG) ---------- */

const ICONS = {
  sun: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="12" fill="currentColor" fill-opacity="0.15"/><circle cx="32" cy="32" r="9"/><path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.5 13.5l4.2 4.2M46.3 46.3l4.2 4.2M13.5 50.5l4.2-4.2M46.3 17.7l4.2-4.2"/></svg>`,
  'partly-cloudy': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="22" r="7"/><path d="M22 8v3M8 22h3M13 13l2 2M31 13l-2 2"/><path d="M45 54H26a10 10 0 1 1 9.6-13h6.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/></svg>`,
  cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 50H20a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/></svg>`,
  fog: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 42H22a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/><path d="M12 50h40M16 56h32"/></svg>`,
  rain: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 38H22a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/><path d="M22 46l-2 6M32 46l-2 6M42 46l-2 6"/></svg>`,
  'heavy-rain': `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 34H22a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/><path d="M18 42l-3 8M28 42l-3 8M38 42l-3 8M48 42l-3 8"/></svg>`,
  thunder: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 34H22a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/><path d="M30 40l-4 8h6l-2 8 8-10h-6l2-6z" fill="currentColor"/></svg>`,
  snow: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M46 34H22a10 10 0 1 1 9.6-13h10.4a6.5 6.5 0 0 1 0 13Z" fill="currentColor" fill-opacity="0.12"/><path d="M22 46h.01M32 46h.01M42 46h.01M26 54h.01M36 54h.01"/></svg>`
};

export function weatherIcon(key, size = 32) {
  const svg = ICONS[key] || ICONS.cloudy;
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

const METRIC_ICONS = {
  humidity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7s-6 6.5-6 11.3a6 6 0 0 0 12 0c0-4.8-6-11.3-6-11.3Z"></path></svg>`,
  wind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11a3 3 0 1 0-3-3M3 16h15a3 3 0 1 1-3 3M3 12h18"></path></svg>`,
  pressure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
  visibility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.6A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="M16 13v6M8 13v6M12 15v6"></path></svg>`,
  uv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>`,
  aqi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11a3 3 0 1 0-3-3"></path><path d="M3 12h18"></path><path d="M3 16h15a3 3 0 1 1-3 3"></path></svg>`,
  sunrise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v6M4.9 8.9l1.4 1.4M2 14h20M17.7 10.3l1.4-1.4M6 18a6 6 0 0 1 12 0"></path></svg>`,
  sunset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10V4M4.9 13.1l1.4-1.4M2 18h20M17.7 11.7l1.4 1.4M6 22a6 6 0 0 1 12 0"></path></svg>`
};

/* ---------- Helpers ---------- */

function el(id) { return document.getElementById(id); }
function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text == null ? '—' : String(text);
}

function setHTML(id, html) {
  const node = el(id);
  if (node) node.innerHTML = html;
}

const provLabel = (source) => {
  if (!source) return '—';
  if (source.startsWith('open-meteo')) return t('provider.open-meteo');
  if (source.startsWith('weatherapi')) return t('provider.weatherapi');
  if (source.startsWith('openweather')) return t('provider.openweather');
  if (source === 'cache') return t('provider.cache');
  return source;
};

/* ---------- Hero ---------- */

export function renderHero(weather, { lang, stale = false } = {}) {
  const loc = weather.location || {};
  const cur = weather.current || {};

  setText('hero-location', loc.name || '—');
  const regionLine = [loc.region, loc.country].filter(Boolean).join(', ');
  setText('hero-region', regionLine || '—');

  const now = new Date();
  const wallIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  setText('hero-date', formatFullDate(wallIso, lang));
  setText('hero-time', formatTime(wallIso, lang));

  setText('hero-temp', cur.temperature == null ? '--°' : `${Math.round(cur.temperature)}°`);
  setText('hero-condition', cur.condition || '—');
  setText('hero-feels', cur.feelsLike == null ? '—' : `${t('metrics.feelsLike', lang)} ${Math.round(cur.feelsLike)}°`);

  const iconBox = el('hero-icon');
  if (iconBox) iconBox.innerHTML = weatherIcon(cur.icon || 'cloudy', 60);

  // Updated relative time
  const updated = el('hero-updated');
  if (updated) {
    const ts = weather._cacheTimestamp || Date.now();
    const rel = formatRelativeTime(ts, lang);
    updated.textContent = stale
      ? `${t('status.cached', lang)} · ${t('status.updated', lang)}: ${formatTime(wallIso, lang)}`
      : `${t('status.updated', lang)} ${rel}`;
  }

  // Source badge
  const badge = el('source-badge');
  if (badge) {
    if (stale || weather._stale) badge.textContent = t('status.cached', lang);
    else badge.textContent = `${t('status.fresh', lang)}: ${provLabel(weather.source)}`;
  }
}

/* ---------- Metrics ---------- */

export function renderMetrics(weather, { lang } = {}) {
  const cur = weather.current || {};
  const aq = weather.airQuality || {};
  const astro = weather.astronomy || {};
  const grid = el('metrics-grid');
  if (!grid) return;

  const aqiCat = aqiCategory(aq.aqi, lang);
  const uvCat = uvCategory(cur.uv, lang);

  const items = [
    {
      label: t('metrics.humidity', lang),
      icon: METRIC_ICONS.humidity,
      value: cur.humidity == null ? '—' : `${Math.round(cur.humidity)}%`,
      sub: humiditySub(cur.humidity, lang)
    },
    {
      label: t('metrics.wind', lang),
      icon: METRIC_ICONS.wind,
      value: cur.windSpeed == null ? '—' : `${Math.round(cur.windSpeed)} ${t('unit.kmh', lang)}`,
      sub: cur.windDirection == null ? '' : `${t('metrics.windDir', lang)}: ${windDir(cur.windDirection, lang)}`
    },
    {
      label: t('metrics.pressure', lang),
      icon: METRIC_ICONS.pressure,
      value: cur.pressure == null ? '—' : `${Math.round(cur.pressure)} ${t('unit.hpa', lang)}`,
      sub: ''
    },
    {
      label: t('metrics.visibility', lang),
      icon: METRIC_ICONS.visibility,
      value: cur.visibility == null ? '—' : `${formatNumber(cur.visibility, lang, 1)} ${t('unit.km', lang)}`,
      sub: ''
    },
    {
      label: t('metrics.precipitation', lang),
      icon: METRIC_ICONS.rain,
      value: cur.precipitation == null ? '—' : `${formatNumber(cur.precipitation, lang, 1)} ${t('unit.mm', lang)}`,
      sub: cur.rainProbability == null ? '' : `${t('metrics.rainChance', lang)}: ${Math.round(cur.rainProbability)}%`
    },
    {
      label: t('metrics.uv', lang),
      icon: METRIC_ICONS.uv,
      value: cur.uv == null ? '—' : formatNumber(cur.uv, lang, 1),
      sub: uvCat.label
    },
    {
      label: t('metrics.aqi', lang),
      icon: METRIC_ICONS.aqi,
      value: aq.aqi == null ? '—' : Math.round(aq.aqi),
      sub: aqiCat.label
    },
    {
      label: t('astro.sunrise', lang),
      icon: METRIC_ICONS.sunrise,
      value: astro.sunrise ? formatTime(astro.sunrise, lang) : '—',
      sub: ''
    },
    {
      label: t('astro.sunset', lang),
      icon: METRIC_ICONS.sunset,
      value: astro.sunset ? formatTime(astro.sunset, lang) : '—',
      sub: astro.sunrise && astro.sunset ? `${t('astro.daylight', lang)}: ${dayLength(astro.sunrise, astro.sunset, lang)}` : ''
    }
  ];

  grid.innerHTML = items.map((it) => `
    <article class="metric-card">
      <div class="metric-head">
        <span aria-hidden="true">${it.icon}</span>
        <span>${it.label}</span>
      </div>
      <p class="metric-value">${it.value}</p>
      ${it.sub ? `<p class="metric-sub">${it.sub}</p>` : ''}
    </article>
  `).join('');
}

function humiditySub(h, lang) {
  if (h == null) return '';
  if (h >= 80) return lang === 'bn' ? 'খুব আর্দ্র' : 'Very humid';
  if (h >= 60) return lang === 'bn' ? 'আর্দ্র' : 'Humid';
  if (h >= 35) return lang === 'bn' ? 'আরামদায়ক' : 'Comfortable';
  return lang === 'bn' ? 'শুষ্ক' : 'Dry';
}

/* ---------- AQI ---------- */

export function renderAQI(weather, { lang } = {}) {
  const container = el('aqi-content');
  if (!container) return;
  const aq = weather.airQuality || {};
  if (aq.aqi == null && aq.pm25 == null && aq.pm10 == null) {
    container.innerHTML = `<p class="text-muted text-sm">${t('aqi.unavailable', lang)}</p>`;
    return;
  }

  const cat = aqiCategory(aq.aqi, lang);

  const rows = [
    ['aqi.pm25', aq.pm25, 'µg/m³'],
    ['aqi.pm10', aq.pm10, 'µg/m³'],
    ['aqi.co',   aq.co,   'µg/m³'],
    ['aqi.no2',  aq.no2,  'µg/m³'],
    ['aqi.so2',  aq.so2,  'µg/m³'],
    ['aqi.o3',   aq.o3,   'µg/m³']
  ].filter(([, v]) => v != null);

  container.innerHTML = `
    <div class="aqi-hero">
      <div class="aqi-dot" style="background:${cat.color}" aria-hidden="true">
        ${aq.aqi == null ? '—' : Math.round(aq.aqi)}
      </div>
      <div>
        <p class="text-lg font-semibold">${cat.label}</p>
        <p class="text-xs text-muted">${aq.aqiSource ? `${t('aqi.source', lang)}: ${aq.aqiSource}` : ''}</p>
      </div>
    </div>
    <div class="aqi-grid">
      ${rows.map(([k, v]) => `
        <div class="aqi-item">
          <span>${t(k, lang)}</span>
          <strong>${formatNumber(v, lang, 1)} <small style="font-weight:500;color:var(--text-muted)">${rows.find(r => r[0] === k)[2]}</small></strong>
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------- Hourly ---------- */

export function renderHourly(weather, { lang } = {}) {
  const container = el('hourly-scroll');
  if (!container) return;
  const hourly = weather.hourly || [];
  if (!hourly.length) {
    container.innerHTML = `<p class="text-muted text-sm p-4">${t('aqi.unavailable', lang)}</p>`;
    return;
  }
  container.innerHTML = hourly.map((h) => `
    <div class="hour-card${h.isNow ? ' is-now' : ''}" role="listitem">
      <span class="hour-time">${h.isNow ? t('day.today', lang) : formatHourLabel(h.time, lang)}</span>
      <span class="hour-icon" aria-hidden="true">${weatherIcon(h.icon || 'cloudy', 26)}</span>
      <span class="hour-temp">${h.temperature == null ? '—' : Math.round(h.temperature) + '°'}</span>
      <span class="hour-meta">
        ${h.rainProbability != null ? `<span>💧 ${Math.round(h.rainProbability)}%</span>` : ''}
        ${h.windSpeed != null ? `<span>${Math.round(h.windSpeed)} ${t('unit.kmh', lang)}</span>` : ''}
      </span>
    </div>
  `).join('');
}

/* ---------- Daily ---------- */

export function renderDaily(weather, { lang } = {}) {
  const container = el('daily-list');
  if (!container) return;
  const daily = weather.daily || [];
  if (!daily.length) {
    container.innerHTML = `<p class="text-muted text-sm p-4">${t('aqi.unavailable', lang)}</p>`;
    return;
  }

  const todayDate = daily[0]?.date;

  container.innerHTML = daily.map((d, idx) => {
    const dayLabel = idx === 0 ? t('day.today', lang)
      : idx === 1 ? t('day.tomorrow', lang)
      : formatShortWeekday(d.date, lang);
    const dateLabel = formatShortDate(d.date, lang);
    const hi = d.tempMax == null ? '—' : `${Math.round(d.tempMax)}°`;
    const lo = d.tempMin == null ? '' : `${Math.round(d.tempMin)}°`;
    const metaParts = [];
    if (d.rainProbability != null) metaParts.push(`💧 ${Math.round(d.rainProbability)}%`);
    if (d.windSpeed != null) metaParts.push(`💨 ${Math.round(d.windSpeed)} ${t('unit.kmh', lang)}`);
    if (d.uv != null) metaParts.push(`☀ ${formatNumber(d.uv, lang, 1)}`);
    return `
      <div class="daily-row" role="listitem">
        <div>
          <p class="daily-day">${dayLabel}</p>
          <p class="daily-date">${dateLabel}</p>
        </div>
        <div class="daily-icon" aria-hidden="true">${weatherIcon(d.icon || 'cloudy', 26)}</div>
        <div>
          <p class="daily-cond">${d.condition || ''}</p>
          <p class="daily-meta">${metaParts.join(' · ')}</p>
        </div>
        <div class="daily-temp">${hi}${lo ? `<span class="lo">${lo}</span>` : ''}</div>
      </div>
    `;
  }).join('');
}

/* ---------- Weekly summary ---------- */

export function renderWeeklySummary(weather, { lang } = {}) {
  const container = el('weekly-summary');
  if (!container) return;
  const daily = weather.daily || [];
  if (!daily.length) { container.textContent = '—'; return; }

  const highs = daily.map((d) => d.tempMax).filter(Number.isFinite);
  const avgHigh = highs.length ? highs.reduce((a, b) => a + b, 0) / highs.length : null;
  const hottest = daily.reduce((a, b) => (a.tempMax ?? -Infinity) > (b.tempMax ?? -Infinity) ? a : b);
  const coolest = daily.reduce((a, b) => (a.tempMin ?? Infinity) < (b.tempMin ?? Infinity) ? a : b);
  const rainy = daily.filter((d) => (d.rainProbability ?? 0) >= 50);
  const windy = daily.filter((d) => (d.windSpeed ?? 0) >= 35);

  const lines = [];

  if (rainy.length) {
    const names = rainy.map((d) => formatShortWeekday(d.date, lang)).join(', ');
    lines.push(`${t('summary.rain', lang)}: ${names}.`);
  } else {
    lines.push(t('summary.dry', lang));
  }

  if (avgHigh != null) {
    const first = highs[0];
    const last = highs[highs.length - 1];
    if (last - first >= 2) lines.push(t('summary.warming', lang));
    else if (first - last >= 2) lines.push(t('summary.cooling', lang));
    else lines.push(t('summary.stable', lang));
  }

  if (hottest && hottest.tempMax != null) {
    lines.push(`${t('summary.hot', lang)} ${formatShortWeekday(hottest.date, lang)} (${Math.round(hottest.tempMax)}°).`);
  }
  if (coolest && coolest.tempMin != null) {
    lines.push(`${t('summary.cold', lang)} ${formatShortWeekday(coolest.date, lang)} (${Math.round(coolest.tempMin)}°).`);
  }
  if (windy.length) {
    const names = windy.map((d) => formatShortWeekday(d.date, lang)).join(', ');
    lines.push(`${t('summary.wind', lang)}: ${names}.`);
  }

  container.innerHTML = lines.map((l) => `
    <div class="summary-line">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4l3 2"></path></svg>
      <p>${l}</p>
    </div>
  `).join('');
}

/* ---------- Farmer forecast ---------- */

export function renderFarmer(weather, { lang } = {}) {
  const container = el('farmer-content');
  if (!container) return;
  // Imported lazily to keep renderer.js focused.
  import('../utils/farmer-forecast.js').then(({ farmerForecast }) => {
    const result = farmerForecast(weather, { lang });
    container.innerHTML = result.blocks.map((b) => `
      <div class="farmer-block">
        <h4>${b.title}</h4>
        <p>${b.value}</p>
      </div>
    `).join('') + `<p class="advisory-note">${result.advisory}</p>`;
  }).catch((err) => {
    console.warn('[renderer] farmer forecast failed', err);
    container.textContent = '—';
  });
}

/* ---------- Clothing ---------- */

export function renderClothing(weather, { lang } = {}) {
  const container = el('clothing-content');
  if (!container) return;
  import('../utils/clothing.js').then(({ clothingSuggestion }) => {
    const { temp, lines } = clothingSuggestion(weather.current, { lang });
    container.innerHTML = `
      <p class="text-2xl font-bold mb-2">${temp == null ? '—' : `${Math.round(temp)}°`}</p>
      <ul class="space-y-1">
        ${lines.map((l) => `<li class="text-sm">${l}</li>`).join('')}
      </ul>
    `;
  }).catch((err) => {
    console.warn('[renderer] clothing failed', err);
    container.textContent = '—';
  });
}

/* ---------- Astronomy ---------- */

export function renderAstro(weather, { lang } = {}) {
  const container = el('astro-content');
  if (!container) return;
  const a = weather.astronomy || {};
  const items = [
    { label: t('astro.sunrise', lang), value: a.sunrise ? formatTime(a.sunrise, lang) : '—' },
    { label: t('astro.sunset', lang), value: a.sunset ? formatTime(a.sunset, lang) : '—' },
    { label: t('astro.daylight', lang), value: a.sunrise && a.sunset ? dayLength(a.sunrise, a.sunset, lang) : '—' }
  ];
  container.innerHTML = `
    <div class="astro-grid">
      ${items.map((i) => `
        <div class="astro-card">
          <span class="astro-label">${i.label}</span>
          <span class="astro-value">${i.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------- Favourites / Recents ---------- */

export function renderFavourites(favourites, { lang, activeKey, onSelect, onRemove } = {}) {
  const container = el('favorites-list');
  if (!container) return;
  if (!favourites || !favourites.length) {
    container.innerHTML = `<p class="list-empty">${t('list.emptyFav', lang)}</p>`;
    return;
  }
  container.innerHTML = '';
  for (const fav of favourites) {
    const key = `${Number(fav.latitude).toFixed(4)},${Number(fav.longitude).toFixed(4)}`;
    const isActive = key === activeKey;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-item';
    btn.style.background = isActive ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : '';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"></path></svg>
      <span>${fav.name || `${fav.latitude.toFixed(2)}, ${fav.longitude.toFixed(2)}`}</span>
      <span style="color:var(--text-muted);font-size:12px;margin-left:auto;padding-right:6px">${fav.region || ''}</span>
    `;
    btn.addEventListener('click', () => onSelect && onSelect(fav));
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'list-remove';
    removeBtn.setAttribute('aria-label', 'Remove favourite');
    removeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>`;
    removeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      onRemove && onRemove(fav);
    });
    btn.appendChild(removeBtn);
    container.appendChild(btn);
  }
}

export function renderRecents(recents, { lang, onSelect } = {}) {
  const container = el('recents-list');
  if (!container) return;
  if (!recents || !recents.length) {
    container.innerHTML = `<p class="list-empty">${t('list.emptyRecents', lang)}</p>`;
    return;
  }
  container.innerHTML = '';
  for (const r of recents) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-item';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
      <span>${r.name || r.query}</span>
      <span style="color:var(--text-muted);font-size:12px;margin-left:auto">${r.region || ''}</span>
    `;
    btn.addEventListener('click', () => onSelect && onSelect(r));
    container.appendChild(btn);
  }
}

/* ---------- Static i18n text ---------- */

export function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const txt = t(key, lang);
    if (txt) node.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.getAttribute('data-i18n-placeholder');
    const txt = t(key, lang);
    if (txt) node.setAttribute('placeholder', txt);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    const key = node.getAttribute('data-i18n-aria');
    const txt = t(key, lang);
    if (txt) node.setAttribute('aria-label', txt);
  });
  const search = document.getElementById('search-input');
  if (search && !search.value) {
    search.setAttribute('placeholder', t('search.placeholder', lang));
  }
}

export default {
  renderHero, renderMetrics, renderAQI, renderHourly, renderDaily,
  renderWeeklySummary, renderFarmer, renderClothing, renderAstro,
  renderFavourites, renderRecents, applyTranslations, weatherIcon
};