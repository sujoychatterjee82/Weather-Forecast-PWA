/**
 * Leaflet weather map with OpenWeatherMap overlay layers.
 * Uses OpenStreetMap as the base tile layer. Weather overlays require
 * an OpenWeatherMap API key; if it's missing, the base map still works.
 */

import { CONFIG } from '../config.js';
import { t } from '../i18n/translations.js';

let map = null;
let marker = null;
let baseLayer = null;
let weatherLayer = null;
let currentLayerKey = 'rain';

const LAYER_DEFS = {
  rain:     { layer: 'precipitation_new', label: 'Rain',       opacity: 0.7 },
  clouds:   { layer: 'clouds_new',        label: 'Clouds',     opacity: 0.6 },
  wind:     { layer: 'wind_new',          label: 'Wind',       opacity: 0.7 },
  temp:     { layer: 'temp_new',          label: 'Temperature',opacity: 0.6 },
  pressure: { layer: 'pressure_new',      label: 'Pressure',   opacity: 0.6 }
};

function hasKey() {
  return Boolean(CONFIG.API_KEYS.OPENWEATHER_MAP && CONFIG.FEATURES.OPENWEATHER_MAP);
}

function setStatus(msg) {
  const node = document.getElementById('map-status');
  if (node) node.textContent = msg || '';
}

/** Initialise the map once. Returns the map instance. */
export function initMap(location, { lang = 'en' } = {}) {
  const container = document.getElementById('weather-map');
  if (!container || !window.L) {
    setStatus(t('map.unavailable', lang));
    return null;
  }
  if (map) {
    updateLocation(location, { lang });
    return map;
  }

  const center = location ? [location.latitude, location.longitude] : [23.6739, 87.1510];
  map = L.map(container, {
    center,
    zoom: 6,
    zoomControl: true,
    attributionControl: true,
    worldCopyJump: true
  });

  baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  baseLayer.on('tileerror', () => {
    setStatus(t('map.unavailable', lang));
  });

  marker = L.marker(center).addTo(map);

  applyLayer(currentLayerKey, { lang });

  return map;
}

export function updateLocation(location, { lang = 'en' } = {}) {
  if (!map || !location) return;
  const center = [location.latitude, location.longitude];
  map.setView(center, Math.max(map.getZoom(), 8), { animate: true });
  if (marker) marker.setLatLng(center);
  else marker = L.marker(center).addTo(map);
  setStatus('');
}

export function applyLayer(key, { lang = 'en' } = {}) {
  if (!map) return;
  if (weatherLayer) {
    map.removeLayer(weatherLayer);
    weatherLayer = null;
  }
  if (key === 'none') {
    currentLayerKey = key;
    setStatus('');
    updateLayerButtons(key);
    return;
  }
  const def = LAYER_DEFS[key];
  if (!def) {
    currentLayerKey = 'none';
    updateLayerButtons('none');
    return;
  }
  if (!hasKey()) {
    setStatus(t('map.noKey', lang));
    currentLayerKey = key;
    updateLayerButtons(key);
    return;
  }
  const url = `https://tile.openweathermap.org/map/${def.layer}/{z}/{x}/{y}.png?appid=${encodeURIComponent(CONFIG.API_KEYS.OPENWEATHER_MAP)}`;
  try {
    weatherLayer = L.tileLayer(url, { opacity: def.opacity, maxZoom: 18 });
    weatherLayer.on('tileerror', () => setStatus(t('map.unavailable', lang)));
    weatherLayer.addTo(map);
    setStatus('');
  } catch (err) {
    console.warn('[map] failed to apply layer', err);
    setStatus(t('map.unavailable', lang));
  }
  currentLayerKey = key;
  updateLayerButtons(key);
}

function updateLayerButtons(active) {
  document.querySelectorAll('.layer-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-map-layer') === active);
  });
}

export function bindLayerButtons({ onChange } = {}) {
  document.querySelectorAll('.layer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-map-layer');
      applyLayer(key);
      if (onChange) onChange(key);
    });
  });
}

export function invalidateSize() {
  if (map) setTimeout(() => map.invalidateSize(), 150);
}

export default { initMap, updateLocation, applyLayer, bindLayerButtons, invalidateSize };