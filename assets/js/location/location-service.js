/**
 * Location detection, city search, pincode lookup and reverse geocoding.
 * Uses Open-Meteo Geocoding + Zippopotam.us + Nominatim (all keyless).
 */

import { CONFIG } from '../config.js';
import { fetchJson, safeNum } from '../utils/helpers.js';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const ZIP_URL = 'https://api.zippopotam.us';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

/** City / town / region search. */
export async function geocodeCity(query, { lang = 'en', count = 8 } = {}) {
  const params = new URLSearchParams({
    name: query,
    count: String(count),
    language: lang === 'bn' ? 'bn' : 'en',
    format: 'json'
  });
  const data = await fetchJson(`${GEOCODE_URL}?${params}`);
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((r) => ({
    id: `geo:${r.id}`,
    name: r.name,
    region: r.admin1 || '',
    country: r.country || '',
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    timezone: r.timezone || 'auto',
    type: 'city'
  }));
}

/** Indian pincode lookup via Zippopotam.us. */
export async function resolvePincode(pincode, { lang = 'en' } = {}) {
  const code = String(pincode || '').trim();
  if (!/^\d{5,6}$/.test(code)) return null;
  try {
    const data = await fetchJson(`${ZIP_URL}/in/${code}`);
    if (!data || !Array.isArray(data.places) || data.places.length === 0) return null;
    const place = data.places[0];
    return {
      id: `pin:${code}`,
      name: place['place name'] || code,
      region: place.state || '',
      country: data.country || 'India',
      latitude: safeNum(place.latitude),
      longitude: safeNum(place.longitude),
      timezone: 'auto',
      type: 'pincode'
    };
  } catch (err) {
    console.warn('[location] pincode lookup failed', err);
    return null;
  }
}

/** Reverse geocode coordinates → nearest meaningful place name. */
export async function reverseGeocode(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
      zoom: '10',
      addressdetails: '1'
    });
    const data = await fetchJson(`${NOMINATIM_URL}?${params}`, {
      headers: { 'Accept-Language': 'en' },
      timeout: 8000
    });
    if (!data) return null;
    const a = data.address || {};
    const name = a.city || a.town || a.village || a.suburb || a.county || data.name || '';
    const region = a.state || a.region || '';
    const country = a.country || '';
    return {
      name: name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
      region,
      country,
      latitude,
      longitude,
      timezone: 'auto',
      type: 'coords'
    };
  } catch (err) {
    console.warn('[location] reverse geocode failed', err);
    return null;
  }
}

/** Browser geolocation with a bounded timeout. */
export function getBrowserLocation({ timeout = 10000, maximumAge = 5 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout, maximumAge }
    );
  });
}

/** Query the browser's permission state for geolocation (if supported). */
export async function geolocationPermissionState() {
  if (!('permissions' in navigator)) return 'prompt';
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'prompt';
  }
}

/** Return the configured default location. */
export function defaultLocation() {
  const d = CONFIG.DEFAULT_LOCATION;
  return {
    id: 'default',
    name: d.name,
    region: d.region,
    country: d.country,
    latitude: d.latitude,
    longitude: d.longitude,
    timezone: 'auto',
    type: 'default'
  };
}

/**
 * Detect the initial location for app launch.
 * Priority: stored → geolocation (only if permission already granted or prompt once) → default.
 */
export async function detectInitialLocation() {
  const stored = readStoredLocation();
  if (stored) return { location: stored, source: 'stored' };

  const perm = await geolocationPermissionState();
  if (perm === 'denied') {
    return { location: defaultLocation(), source: 'default' };
  }

  try {
    const coords = await getBrowserLocation({ timeout: 8000 });
    const place = await reverseGeocode(coords.latitude, coords.longitude);
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
    saveStoredLocation(location);
    return { location, source: 'geolocation' };
  } catch (err) {
    console.info('[location] geolocation unavailable, using default', err && err.message);
    return { location: defaultLocation(), source: 'default' };
  }
}

/* -------------------------------------------------------------------------
 * Local storage of the "active" location
 * ---------------------------------------------------------------------- */

const ACTIVE_KEY = 'weather:activeLocation';

export function saveStoredLocation(location) {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(location));
  } catch { /* ignore */ }
}

export function readStoredLocation() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const loc = JSON.parse(raw);
    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return null;
    return loc;
  } catch {
    return null;
  }
}

export function clearStoredLocation() {
  try { localStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ }
}

export default {
  geocodeCity,
  resolvePincode,
  reverseGeocode,
  getBrowserLocation,
  geolocationPermissionState,
  defaultLocation,
  detectInitialLocation,
  saveStoredLocation,
  readStoredLocation,
  clearStoredLocation
};