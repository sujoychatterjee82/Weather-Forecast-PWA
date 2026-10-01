/**
 * Provider orchestration and normalization entry point.
 * Order of precedence: Open-Meteo → WeatherAPI → OpenWeatherMap → cached data.
 */

import OpenMeteoProvider from './open-meteo.js';
import WeatherAPIProvider from './weatherapi.js';
import OpenWeatherProvider from './openweather.js';
import cache from '../utils/cache.js';
import { withLock, isValidWeatherPayload } from '../utils/helpers.js';

const PROVIDERS = [OpenMeteoProvider, WeatherAPIProvider, OpenWeatherProvider];

async function tryProviders(location, opts) {
  const errors = [];
  for (const provider of PROVIDERS) {
    try {
      if (provider.isConfigured && !provider.isConfigured()) {
        console.info(`[weather-service] Skipping ${provider.id} (not configured)`);
        continue;
      }
      const data = await provider.fetch(location, opts);
      if (isValidWeatherPayload(data)) {
        return data;
      }
      errors.push(new Error(`${provider.id} returned invalid payload`));
      console.warn(`[weather-service] ${provider.id} returned invalid payload`);
    } catch (err) {
      errors.push(err);
      console.warn(`[weather-service] ${provider.id} failed`, err);
    }
  }
  const combined = new Error('All weather providers failed');
  combined.causes = errors;
  throw combined;
}

export const WeatherService = {
  /**
   * Get the weather for a location.
   * @param {object} location - { name, region, country, latitude, longitude }
   * @param {object} [options] - { forceRefresh, lang, onStatus }
   */
  async getWeather(location, { forceRefresh = false, lang = 'en', onStatus } = {}) {
    const key = `weather:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;

    // Fresh cache hit
    if (!forceRefresh) {
      const fresh = cache.getFresh(location);
      if (fresh) {
        onStatus && onStatus({ type: 'cache', entry: fresh });
        return { ...fresh.data, _cached: true, _cacheAge: fresh.age, _cacheTimestamp: fresh.timestamp };
      }
    }

    return withLock(key, async () => {
      try {
        const data = await tryProviders(location, { lang });
        cache.set(location, data);
        onStatus && onStatus({ type: 'live', source: data.source });
        return data;
      } catch (err) {
        // Fall back to stale cache (may still be usable offline).
        const stale = cache.getStale(location);
        if (stale) {
          onStatus && onStatus({ type: 'stale', entry: stale });
          return { ...stale.data, _cached: true, _stale: true, _cacheAge: stale.age, _cacheTimestamp: stale.timestamp };
        }
        throw err;
      }
    });
  },

  /** Force a refetch, invalidating fresh cache first. */
  async refresh(location, opts) {
    cache.invalidate(location);
    return this.getWeather(location, { ...opts, forceRefresh: true });
  },

  /** Look up a location by free-form query (city name or pincode). */
  async search(query, { lang = 'en' } = {}) {
    const q = String(query || '').trim();
    if (q.length < 2) return [];
    // If the query is numeric and looks like an Indian pincode, try pincode first.
    if (/^\d{5,6}$/.test(q)) {
      try {
        const { resolvePincode } = await import('../location/location-service.js');
        const loc = await resolvePincode(q, { lang });
        if (loc) return [loc];
      } catch (err) {
        console.warn('[weather-service] pincode lookup failed', err);
      }
    }
    try {
      const { geocodeCity } = await import('../location/location-service.js');
      return await geocodeCity(q, { lang });
    } catch (err) {
      console.warn('[weather-service] geocode failed', err);
      return [];
    }
  }
};

export default WeatherService;