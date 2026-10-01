/**
 * WeatherAPI.com provider (fallback).
 * Requires an API key in CONFIG.API_KEYS.WEATHER_API.
 * Silently skipped when the key is missing.
 *
 * Docs: https://www.weatherapi.com/docs/
 */

import { CONFIG } from '../config.js';
import { fetchJson, safeNum } from '../utils/helpers.js';

const BASE = 'https://api.weatherapi.com/v1';

/** Map WeatherAPI condition codes/text to our internal icon keys. */
function iconFromText(text = '') {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('storm')) return 'thunder';
  if (t.includes('snow') || t.includes('sleet') || t.includes('blizzard')) return 'snow';
  if (t.includes('heavy rain') || t.includes('torrential')) return 'heavy-rain';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rain';
  if (t.includes('fog') || t.includes('mist')) return 'fog';
  if (t.includes('overcast')) return 'cloudy';
  if (t.includes('cloud') || t.includes('partly')) return 'partly-cloudy';
  if (t.includes('clear') || t.includes('sunny')) return 'sun';
  return 'cloudy';
}

function mapConditionText(c, lang) {
  if (!c) return '';
  return lang === 'bn' && c.text_bn ? c.text_bn : c.text || '';
}

async function fetchForecast(location, lang) {
  const params = new URLSearchParams({
    key: CONFIG.API_KEYS.WEATHER_API,
    q: `${location.latitude},${location.longitude}`,
    days: '7',
    aqi: 'yes',
    alerts: 'no',
    lang: lang === 'bn' ? 'bn' : 'en'
  });
  return fetchJson(`${BASE}/forecast.json?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT });
}

/** Convert a wall-clock string into the app's expected ISO-without-offset format. */
function toWallClock(str) {
  if (!str) return null;
  // WeatherAPI returns "YYYY-MM-DD HH:mm" — convert to "YYYY-MM-DDTHH:mm".
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return str;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
}

export const WeatherAPIProvider = {
  id: 'weatherapi',
  name: 'WeatherAPI',

  isConfigured() {
    return Boolean(CONFIG.API_KEYS.WEATHER_API && CONFIG.FEATURES.WEATHER_API);
  },

  async fetch(location, { lang = 'en' } = {}) {
    if (!this.isConfigured()) throw new Error('WeatherAPI not configured');

    const data = await fetchForecast(location, lang);
    const c = data.current || {};
    const cond = c.condition || {};
    const day0 = data.forecast?.forecastday?.[0] || {};
    const astro0 = day0.astro || {};

    const hourly = [];
    const today = day0.hour || [];
    for (const h of today) {
      const hc = h.condition || {};
      hourly.push({
        time: toWallClock(h.time),
        temperature: safeNum(h.temp_c),
        feelsLike: safeNum(h.feelslike_c),
        humidity: safeNum(h.humidity),
        precipitation: safeNum(h.precip_mm),
        rainProbability: safeNum(h.chance_of_rain),
        windSpeed: safeNum(h.wind_kph),
        windDirection: safeNum(h.wind_degree),
        uv: safeNum(h.uv),
        visibility: safeNum(h.vis_km),
        condition: mapConditionText(hc, lang),
        icon: iconFromText(hc.text),
        isNow: false
      });
    }
    // Add tomorrow's first few hours to reach ~24 hours.
    const tomorrow = data.forecast?.forecastday?.[1]?.hour || [];
    for (const h of tomorrow) {
      if (hourly.length >= 24) break;
      const hc = h.condition || {};
      hourly.push({
        time: toWallClock(h.time),
        temperature: safeNum(h.temp_c),
        feelsLike: safeNum(h.feelslike_c),
        humidity: safeNum(h.humidity),
        precipitation: safeNum(h.precip_mm),
        rainProbability: safeNum(h.chance_of_rain),
        windSpeed: safeNum(h.wind_kph),
        windDirection: safeNum(h.wind_degree),
        uv: safeNum(h.uv),
        visibility: safeNum(h.vis_km),
        condition: mapConditionText(hc, lang),
        icon: iconFromText(hc.text),
        isNow: false
      });
    }

    // Find current hour index.
    const nowIso = toWallClock(c.last_updated);
    if (nowIso) {
      let best = 0, bestDiff = Infinity;
      for (let i = 0; i < hourly.length; i++) {
        const diff = Math.abs(new Date(hourly[i].time).getTime() - new Date(nowIso).getTime());
        if (diff < bestDiff) { bestDiff = diff; best = i; }
      }
      if (hourly[best]) hourly[best].isNow = true;
    }
    const trimmedHourly = hourly.slice(0, 24);

    const daily = (data.forecast?.forecastday || []).map((d) => {
      const dc = d.day || {};
      const dcCond = dc.condition || {};
      return {
        date: d.date,
        condition: mapConditionText(dcCond, lang),
        icon: iconFromText(dcCond.text),
        tempMax: safeNum(dc.maxtemp_c),
        tempMin: safeNum(dc.mintemp_c),
        feelsMax: safeNum(dc.maxtemp_c),
        feelsMin: safeNum(dc.mintemp_c),
        rainProbability: safeNum(dc.daily_chance_of_rain),
        precipitation: safeNum(dc.totalprecip_mm),
        windSpeed: safeNum(dc.maxwind_kph),
        windDirection: safeNum(dc.wind_degree),
        uv: safeNum(dc.uv),
        sunrise: d.astro?.sunrise ? `${d.date}T${to24h(d.astro.sunrise)}` : null,
        sunset: d.astro?.sunset ? `${d.date}T${to24h(d.astro.sunset)}` : null
      };
    });

    const aqi = data.current?.air_quality || null;

    return {
      source: 'weatherapi',
      location: {
        name: data.location?.name || location.name || '',
        region: data.location?.region || location.region || '',
        country: data.location?.country || location.country || '',
        latitude: safeNum(data.location?.lat) ?? location.latitude,
        longitude: safeNum(data.location?.lon) ?? location.longitude,
        timezone: data.location?.tz_id || 'auto'
      },
      current: {
        temperature: safeNum(c.temp_c),
        feelsLike: safeNum(c.feelslike_c),
        humidity: safeNum(c.humidity),
        windSpeed: safeNum(c.wind_kph),
        windDirection: safeNum(c.wind_degree),
        pressure: safeNum(c.pressure_mb),
        visibility: safeNum(c.vis_km),
        precipitation: safeNum(c.precip_mm),
        rainProbability: trimmedHourly.find((h) => h.isNow)?.rainProbability ?? null,
        uv: safeNum(c.uv),
        condition: mapConditionText(cond, lang),
        icon: iconFromText(cond.text)
      },
      hourly: trimmedHourly,
      daily,
      airQuality: aqi ? {
        aqi: safeNum(aqi['us-epa-index']) != null ? usEpaIndexToAqi(aqi['us-epa-index']) : null,
        aqiSource: 'US EPA (WeatherAPI)',
        pm25: safeNum(aqi.pm2_5),
        pm10: safeNum(aqi.pm10),
        co: safeNum(aqi.co),
        no2: safeNum(aqi.no2),
        so2: safeNum(aqi.so2),
        o3: safeNum(aqi.o3)
      } : {
        aqi: null, aqiSource: '', pm25: null, pm10: null, co: null, no2: null, so2: null, o3: null
      },
      astronomy: {
        sunrise: astro0.sunrise ? `${data.forecast.forecastday[0].date}T${to24h(astro0.sunrise)}` : null,
        sunset: astro0.sunset ? `${data.forecast.forecastday[0].date}T${to24h(astro0.sunset)}` : null
      }
    };
  }
};

function to24h(str) {
  const m = String(str).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '00:00';
  let h = +m[1];
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function usEpaIndexToAqi(idx) {
  // WeatherAPI returns a 1..6 band. Map to a representative AQI midpoint.
  const map = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250, 6: 350 };
  return map[Number(idx)] ?? null;
}

export default WeatherAPIProvider;