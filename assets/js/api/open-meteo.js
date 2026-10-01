/**
 * Open-Meteo provider — primary weather source (no API key required).
 * Produces the normalized weather payload used across the app.
 *
 * Docs: https://open-meteo.com/en/docs
 */

import { fetchJson, safeNum } from '../utils/helpers.js';
import { CONFIG } from '../config.js';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/** WMO weather codes → normalized condition + icon key. */
const WMO_MAP = {
  0:  { condition: 'Clear sky',            icon: 'sun',         bn: 'পরিষ্কার আকাশ' },
  1:  { condition: 'Mainly clear',         icon: 'sun',         bn: 'প্রধানত পরিষ্কার' },
  2:  { condition: 'Partly cloudy',        icon: 'partly-cloudy', bn: 'আংশিক মেঘলা' },
  3:  { condition: 'Overcast',             icon: 'cloudy',      bn: 'মেঘাচ্ছন্ন' },
  45: { condition: 'Fog',                  icon: 'fog',         bn: 'কুয়াশা' },
  48: { condition: 'Depositing rime fog',  icon: 'fog',         bn: 'কুয়াশা' },
  51: { condition: 'Light drizzle',        icon: 'rain',        bn: 'হালকা গুঁড়ি' },
  53: { condition: 'Drizzle',              icon: 'rain',        bn: 'গুঁড়ি' },
  55: { condition: 'Dense drizzle',        icon: 'rain',        bn: 'ঘন গুঁড়ি' },
  56: { condition: 'Freezing drizzle',     icon: 'rain',        bn: 'হিমায়িত গুঁড়ি' },
  57: { condition: 'Dense freezing drizzle', icon: 'rain',      bn: 'ঘন হিমায়িত গুঁড়ি' },
  61: { condition: 'Slight rain',          icon: 'rain',        bn: 'হালকা বৃষ্টি' },
  63: { condition: 'Rain',                 icon: 'rain',        bn: 'বৃষ্টি' },
  65: { condition: 'Heavy rain',           icon: 'heavy-rain',  bn: 'ভারী বৃষ্টি' },
  66: { condition: 'Freezing rain',        icon: 'rain',        bn: 'হিমায়িত বৃষ্টি' },
  67: { condition: 'Heavy freezing rain',  icon: 'heavy-rain',  bn: 'ভারী হিমায়িত বৃষ্টি' },
  71: { condition: 'Slight snow',          icon: 'snow',        bn: 'হালকা তুষার' },
  73: { condition: 'Snow',                 icon: 'snow',        bn: 'তুষার' },
  75: { condition: 'Heavy snow',           icon: 'snow',        bn: 'ভারী তুষার' },
  77: { condition: 'Snow grains',          icon: 'snow',        bn: 'তুষারকণা' },
  80: { condition: 'Slight rain showers',  icon: 'rain',        bn: 'হালকা বৃষ্টির ঝাপটা' },
  81: { condition: 'Rain showers',         icon: 'rain',        bn: 'বৃষ্টির ঝাপটা' },
  82: { condition: 'Violent rain showers', icon: 'heavy-rain',  bn: 'প্রবল বৃষ্টির ঝাপটা' },
  85: { condition: 'Slight snow showers',  icon: 'snow',        bn: 'হালকা তুষারঝাপটা' },
  86: { condition: 'Heavy snow showers',   icon: 'snow',        bn: 'ভারী তুষারঝাপটা' },
  95: { condition: 'Thunderstorm',         icon: 'thunder',     bn: 'বজ্রঝড়' },
  96: { condition: 'Thunderstorm with slight hail', icon: 'thunder', bn: 'শিলাসহ বজ্রঝড়' },
  99: { condition: 'Thunderstorm with heavy hail',  icon: 'thunder', bn: 'ভারী শিলাসহ বজ্রঝড়' }
};

function wmoInfo(code, lang = 'en') {
  const entry = WMO_MAP[code] || { condition: 'Unknown', icon: 'cloudy', bn: 'অজানা' };
  return { condition: lang === 'bn' ? entry.bn : entry.condition, icon: entry.icon };
}

async function fetchForecast(location) {
  const { latitude, longitude } = location;
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'visibility'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant'
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh'
  });

  return fetchJson(`${FORECAST_URL}?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT });
}

async function fetchAir(location) {
  try {
    const params = new URLSearchParams({
      latitude: location.latitude.toFixed(4),
      longitude: location.longitude.toFixed(4),
      current: ['us_aqi','pm2_5','pm10','carbon_monoxide','nitrogen_dioxide','sulphur_dioxide','ozone'].join(','),
      timezone: 'auto'
    });
    return await fetchJson(`${AIR_URL}?${params}`, { timeout: CONFIG.REQUEST_TIMEOUT });
  } catch (err) {
    console.warn('[open-meteo] air quality fetch failed', err);
    return null;
  }
}

/** Convert an Open-Meteo wall-clock string into the normalized hourly array. */
function buildHourly(data, location, lang) {
  const hourly = data.hourly || {};
  const times = hourly.time || [];
  const out = [];
  const now = Date.now();
  // Open-Meteo returns ISO times without offset; parse as location-local.
  for (let i = 0; i < times.length; i++) {
    const iso = times[i];
    const info = wmoInfo(hourly.weather_code?.[i], lang);
    const entry = {
      time: iso,
      temperature: safeNum(hourly.temperature_2m?.[i]),
      feelsLike: safeNum(hourly.apparent_temperature?.[i]),
      humidity: safeNum(hourly.relative_humidity_2m?.[i]),
      precipitation: safeNum(hourly.precipitation?.[i]),
      rainProbability: safeNum(hourly.precipitation_probability?.[i]),
      windSpeed: safeNum(hourly.wind_speed_10m?.[i]),
      windDirection: safeNum(hourly.wind_direction_10m?.[i]),
      uv: safeNum(hourly.uv_index?.[i]),
      visibility: safeNum(hourly.visibility?.[i]),
      condition: info.condition,
      icon: info.icon,
      isNow: false
    };
    out.push(entry);
  }

  // Mark the closest hour to "now" (based on the first entry's date).
  if (out.length > 0 && times[0]) {
    // Find the entry whose timestamp is closest to the current wall-clock hour.
    const todayIso = times[0].slice(0, 10);
    const nowDate = new Date();
    const nowIso = `${todayIso}T${String(nowDate.getHours()).padStart(2, '0')}:00`;
    let best = 0, bestDiff = Infinity;
    for (let i = 0; i < out.length; i++) {
      const diff = Math.abs(new Date(out[i].time).getTime() - new Date(nowIso).getTime());
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    out[best].isNow = true;
    // Trim to next 24 hours starting from best.
    return out.slice(best, best + 24);
  }
  return out.slice(0, 24);
}

function buildDaily(data, lang) {
  const d = data.daily || {};
  const times = d.time || [];
  const out = [];
  for (let i = 0; i < times.length; i++) {
    const info = wmoInfo(d.weather_code?.[i], lang);
    out.push({
      date: times[i],
      condition: info.condition,
      icon: info.icon,
      tempMax: safeNum(d.temperature_2m_max?.[i]),
      tempMin: safeNum(d.temperature_2m_min?.[i]),
      feelsMax: safeNum(d.apparent_temperature_max?.[i]),
      feelsMin: safeNum(d.apparent_temperature_min?.[i]),
      rainProbability: safeNum(d.precipitation_probability_max?.[i]),
      precipitation: safeNum(d.precipitation_sum?.[i]),
      windSpeed: safeNum(d.wind_speed_10m_max?.[i]),
      windDirection: safeNum(d.wind_direction_10m_dominant?.[i]),
      uv: safeNum(d.uv_index_max?.[i]),
      sunrise: d.sunrise?.[i] || null,
      sunset: d.sunset?.[i] || null
    });
  }
  return out;
}

export const OpenMeteoProvider = {
  id: 'open-meteo',
  name: 'Open-Meteo',

  async fetch(location, { lang = 'en' } = {}) {
    const [forecast, air] = await Promise.all([
      fetchForecast(location),
      fetchAir(location)
    ]);

    const current = forecast.current || {};
    const info = wmoInfo(current.weather_code, lang);

    const astronomy = {
      sunrise: forecast.daily?.sunrise?.[0] || null,
      sunset: forecast.daily?.sunset?.[0] || null
    };

    const airQuality = air && air.current ? {
      aqi: safeNum(air.current.us_aqi),
      aqiSource: 'US EPA (Open-Meteo)',
      pm25: safeNum(air.current.pm2_5),
      pm10: safeNum(air.current.pm10),
      co: safeNum(air.current.carbon_monoxide),
      no2: safeNum(air.current.nitrogen_dioxide),
      so2: safeNum(air.current.sulphur_dioxide),
      o3: safeNum(air.current.ozone)
    } : {
      aqi: null, aqiSource: '', pm25: null, pm10: null, co: null, no2: null, so2: null, o3: null
    };

    const hourly = buildHourly(forecast, location, lang);
    const daily = buildDaily(forecast, lang);

    return {
      source: 'open-meteo',
      location: {
        name: location.name || '',
        region: location.region || '',
        country: location.country || '',
        latitude: Number(forecast.latitude ?? location.latitude),
        longitude: Number(forecast.longitude ?? location.longitude),
        timezone: forecast.timezone || 'auto'
      },
      current: {
        temperature: safeNum(current.temperature_2m),
        feelsLike: safeNum(current.apparent_temperature),
        humidity: safeNum(current.relative_humidity_2m),
        windSpeed: safeNum(current.wind_speed_10m),
        windDirection: safeNum(current.wind_direction_10m),
        pressure: safeNum(current.pressure_msl ?? current.surface_pressure),
        visibility: hourly[0]?.visibility ?? null,
        precipitation: safeNum(current.precipitation),
        rainProbability: hourly[0]?.rainProbability ?? null,
        uv: hourly[0]?.uv ?? null,
        condition: info.condition,
        icon: info.icon
      },
      hourly,
      daily,
      airQuality,
      astronomy
    };
  }
};

export default OpenMeteoProvider;