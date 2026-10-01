/**
 * OpenWeatherMap provider (final fallback).
 * Requires an API key in CONFIG.API_KEYS.OPENWEATHER_MAP.
 * Skipped silently when the key is missing.
 *
 * Docs: https://openweathermap.org/current
 *       https://openweathermap.org/api/one-call-3 (paid)
 *       https://openweathermap.org/api/air-pollution
 * We intentionally use only free-tier endpoints.
 */

import { CONFIG } from '../config.js';
import { fetchJson, safeNum } from '../utils/helpers.js';

const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

function iconFromOwId(id, main = '') {
  const m = String(main).toLowerCase();
  if (m === 'thunderstorm') return 'thunder';
  if (m === 'drizzle' || m === 'rain') return id >= 502 ? 'heavy-rain' : 'rain';
  if (m === 'snow') return 'snow';
  if (m === 'mist' || m === 'fog' || m === 'haze' || m === 'smoke') return 'fog';
  if (m === 'clouds') return id === 801 || id === 802 ? 'partly-cloudy' : 'cloudy';
  if (m === 'clear') return 'sun';
  return 'cloudy';
}

function iconKeyToIcon(_k) { return _k; }

export const OpenWeatherProvider = {
  id: 'openweather',
  name: 'OpenWeather',

  isConfigured() {
    return Boolean(CONFIG.API_KEYS.OPENWEATHER_MAP && CONFIG.FEATURES.OPENWEATHER_MAP);
  },

  async fetch(location, { lang = 'en' } = {}) {
    if (!this.isConfigured()) throw new Error('OpenWeatherMap not configured');

    const key = CONFIG.API_KEYS.OPENWEATHER_MAP;
    const params = new URLSearchParams({
      lat: location.latitude.toFixed(4),
      lon: location.longitude.toFixed(4),
      units: 'metric',
      appid: key,
      lang: lang === 'bn' ? 'bn' : 'en'
    });

    const [current, forecast, air] = await Promise.all([
      fetchJson(`${CURRENT_URL}?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT }),
      fetchJson(`${FORECAST_URL}?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT }),
      fetchJson(`${AIR_URL}?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT }).catch(() => null)
    ]);

    const c = current || {};
    const main = c.main || {};
    const wind = c.wind || {};
    const weather0 = (c.weather && c.weather[0]) || {};

    // Build hourly from the 3-hour forecast list, up to 24 hours (8 entries).
    const list = forecast.list || [];
    const hourly = list.slice(0, 8).map((h, i) => {
      const hw = (h.weather && h.weather[0]) || {};
      return {
        time: isoFromUnix(h.dt),
        temperature: safeNum(h.main?.temp),
        feelsLike: safeNum(h.main?.feels_like),
        humidity: safeNum(h.main?.humidity),
        precipitation: safeNum(h.rain?.['3h']) ?? 0,
        rainProbability: Math.round((h.pop ?? 0) * 100),
        windSpeed: h.wind ? safeNum(h.wind.speed) * 3.6 : null, // m/s → km/h
        windDirection: safeNum(h.wind?.deg),
        uv: null,
        visibility: safeNum(h.visibility) != null ? h.visibility / 1000 : null,
        condition: hw.description || '',
        icon: iconFromOwId(hw.id, hw.main),
        isNow: i === 0
      };
    });

    // Build daily by grouping 3-hour entries by date.
    const dailyMap = new Map();
    for (const h of list) {
      const d = isoFromUnix(h.dt).slice(0, 10);
      if (!dailyMap.has(d)) dailyMap.set(d, []);
      dailyMap.get(d).push(h);
    }
    const daily = Array.from(dailyMap.entries()).map(([date, entries]) => {
      const temps = entries.map((e) => e.main?.temp).filter((n) => Number.isFinite(n));
      const conds = entries.map((e) => e.weather?.[0]);
      // Pick most common condition.
      const freq = new Map();
      for (const cc of conds) {
        if (!cc) continue;
        const k = cc.main + '|' + cc.description;
        freq.set(k, (freq.get(k) || 0) + 1);
      }
      let bestKey = null, bestCount = 0;
      for (const [k, v] of freq) { if (v > bestCount) { bestCount = v; bestKey = k; } }
      const [bestMain, bestDesc] = bestKey ? bestKey.split('|') : ['Clouds', ''];
      const pops = entries.map((e) => e.pop ?? 0);
      const rainSum = entries.reduce((s, e) => s + (Number(e.rain?.['3h']) || 0), 0);
      const winds = entries.map((e) => (e.wind?.speed || 0) * 3.6);
      return {
        date,
        condition: bestDesc || bestMain,
        icon: iconFromOwId(
          entries[0]?.weather?.[0]?.id,
          bestMain
        ),
        tempMax: temps.length ? Math.max(...temps) : null,
        tempMin: temps.length ? Math.min(...temps) : null,
        feelsMax: temps.length ? Math.max(...temps) : null,
        feelsMin: temps.length ? Math.min(...temps) : null,
        rainProbability: pops.length ? Math.round(Math.max(...pops) * 100) : null,
        precipitation: rainSum || null,
        windSpeed: winds.length ? Math.max(...winds) : null,
        windDirection: safeNum(entries[0]?.wind?.deg),
        uv: null,
        sunrise: null,
        sunset: null
      };
    }).slice(0, 7);

    const airCurrent = air?.list?.[0];
    const comp = airCurrent?.components || {};

    return {
      source: 'openweather',
      location: {
        name: c.name || location.name || '',
        region: location.region || '',
        country: (c.sys?.country) || location.country || '',
        latitude: safeNum(c.coord?.lat) ?? location.latitude,
        longitude: safeNum(c.coord?.lon) ?? location.longitude,
        timezone: 'auto'
      },
      current: {
        temperature: safeNum(main.temp),
        feelsLike: safeNum(main.feels_like),
        humidity: safeNum(main.humidity),
        windSpeed: wind.speed != null ? safeNum(wind.speed) * 3.6 : null,
        windDirection: safeNum(wind.deg),
        pressure: safeNum(main.pressure),
        visibility: safeNum(c.visibility) != null ? c.visibility / 1000 : null,
        precipitation: safeNum(c.rain?.['1h']) ?? 0,
        rainProbability: hourly[0]?.rainProbability ?? null,
        uv: null,
        condition: weather0.description || '',
        icon: iconFromOwId(weather0.id, weather0.main)
      },
      hourly,
      daily,
      airQuality: airCurrent ? {
        aqi: airCurrent.main?.aqi != null ? owAqiToUsAqi(airCurrent.main.aqi) : null,
        aqiSource: 'OpenWeather (EU→US approx.)',
        pm25: safeNum(comp.pm2_5),
        pm10: safeNum(comp.pm10),
        co: safeNum(comp.co),
        no2: safeNum(comp.no2),
        so2: safeNum(comp.so2),
        o3: safeNum(comp.o3)
      } : {
        aqi: null, aqiSource: '', pm25: null, pm10: null, co: null, no2: null, so2: null, o3: null
      },
      astronomy: { sunrise: null, sunset: null }
    };
  }
};

function isoFromUnix(sec) {
  const d = new Date(sec * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function owAqiToUsAqi(owIndex) {
  // OpenWeather returns 1..5. Map to representative US AQI midpoints.
  const map = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 300 };
  return map[owIndex] ?? null;
}

export default OpenWeatherProvider;