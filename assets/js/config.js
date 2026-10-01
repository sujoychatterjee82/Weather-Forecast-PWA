/**
 * Central application configuration.
 *
 * IMPORTANT — STATIC HOSTING SECURITY NOTICE
 * ------------------------------------------
 * This application is designed to run as a static site on GitHub Pages.
 * Any API key you place in this file will be shipped to the browser and is
 * therefore PUBLICLY VISIBLE to anyone who inspects the page or the network tab.
 *
 * - Do NOT put private credentials here.
 * - Never commit secrets that must remain confidential.
 * - A future optional server-side proxy (Node.js / serverless function) can be
 *   added to hold secret credentials. That is out of scope for this static build.
 * - The static GitHub Pages version MUST continue to work using keyless
 *   providers such as Open-Meteo, which requires no API key at all.
 */

export const CONFIG = {
  APP_NAME: 'Weather Forecast PWA',
  APP_VERSION: '1.0.0',

  DEFAULT_LOCATION: {
    name: 'Asansol',
    region: 'West Bengal',
    country: 'India',
    latitude: 23.6739,
    longitude: 87.1510
  },

  /** Application-level weather cache freshness (30 minutes). */
  CACHE_DURATION: 30 * 60 * 1000,

  /** Optional API keys (leave blank to skip that provider). */
  API_KEYS: {
    WEATHER_API: '',
    OPENWEATHER_MAP: '',
    GOOGLE_MAPS: ''
  },

  FEATURES: {
    WEATHER_API: true,
    OPENWEATHER_MAP: true,
    GOOGLE_MAPS: false,
    VOICE_SEARCH: true,
    EXPORT: true,
    PWA: true
  },

  /** Weather provider request timeouts (ms). */
  REQUEST_TIMEOUT: 12000
};

export default CONFIG;