/**
 * Application-level weather cache (30-minute freshness).
 * Uses localStorage with JSON serialization. Falls back gracefully when
 * storage is unavailable (e.g. private mode with quota exceeded).
 */

import { CONFIG } from '../config.js';

const PREFIX = 'weather:cache:';

function safeLocalStorage() {
  try {
    const k = '__wtest__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    return null;
  }
}

const storage = safeLocalStorage();

export function cacheKey(location) {
  if (!location) return '';
  const lat = Number(location.latitude).toFixed(4);
  const lon = Number(location.longitude).toFixed(4);
  return `${PREFIX}${lat}:${lon}`;
}

export const cache = {
  /**
   * Read a cache entry.
   * Returns { data, timestamp, age, fresh } or null.
   */
  get(location) {
    if (!storage) return null;
    const key = cacheKey(location);
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || !entry.data || !entry.timestamp) return null;
      const age = Date.now() - entry.timestamp;
      return {
        data: entry.data,
        timestamp: entry.timestamp,
        age,
        fresh: age < CONFIG.CACHE_DURATION
      };
    } catch (err) {
      console.warn('[cache] read failed', err);
      return null;
    }
  },

  /** Read only if the entry is still fresh. */
  getFresh(location) {
    const entry = this.get(location);
    return entry && entry.fresh ? entry : null;
  },

  /** Read regardless of age (stale fallback). */
  getStale(location) {
    return this.get(location);
  },

  set(location, data) {
    if (!storage) return;
    const key = cacheKey(location);
    try {
      storage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.warn('[cache] write failed', err);
      // Attempt to prune oldest entries and retry once.
      try { pruneCache(); storage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); }
      catch { /* give up silently */ }
    }
  },

  invalidate(location) {
    if (!storage) return;
    try { storage.removeItem(cacheKey(location)); } catch { /* ignore */ }
  },

  clear() {
    if (!storage) return;
    try {
      const keys = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => storage.removeItem(k));
    } catch { /* ignore */ }
  }
};

/** Remove the oldest cache entries when storage is tight. */
function pruneCache() {
  if (!storage) return;
  const entries = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (!k || !k.startsWith(PREFIX)) continue;
    try {
      const v = JSON.parse(storage.getItem(k));
      entries.push({ k, t: (v && v.timestamp) || 0 });
    } catch { entries.push({ k, t: 0 }); }
  }
  entries.sort((a, b) => a.t - b.t);
  const toRemove = entries.slice(0, Math.max(1, Math.ceil(entries.length / 3)));
  toRemove.forEach((e) => { try { storage.removeItem(e.k); } catch {} });
}

export default cache;