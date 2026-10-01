/**
 * Date, time, number and category formatters.
 * All date/time formatting respects an explicit IANA timezone
 * so the searched location's local time is shown, not the device's.
 */

const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EN_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const BN_DAYS = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];

export function getLocale(lang) {
  return lang === 'bn' ? 'bn-BD' : 'en-US';
}

export function formatNumber(value, lang, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(getLocale(lang), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  } catch {
    return String(value);
  }
}

/** Convert an ISO timestamp to a Date, treating plain ISO strings as location-local. */
function toDate(iso) {
  if (!iso) return null;
  if (iso instanceof Date) return iso;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date/time for the location's timezone.
 * For an ISO string without timezone offset (like Open-Meteo returns),
 * we still want to display the wall-clock value the API gave us, so we
 * parse the components directly and format them manually.
 */
function parseWallClock(iso) {
  if (typeof iso !== 'string') return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  return {
    year: +m[1], month: +m[2], day: +m[3],
    hour: m[4] ? +m[4] : 0,
    minute: m[5] ? +m[5] : 0
  };
}

export function formatFullDate(iso, lang = 'en') {
  const parts = parseWallClock(iso);
  if (!parts) return '—';
  const dayName = lang === 'bn' ? BN_DAYS[new Date(parts.year, parts.month - 1, parts.day).getDay()] : EN_DAYS[new Date(parts.year, parts.month - 1, parts.day).getDay()];
  const monthName = lang === 'bn' ? BN_MONTHS[parts.month - 1] : EN_MONTHS[parts.month - 1];
  return `${dayName}, ${parts.day} ${monthName}`;
}

export function formatShortDate(iso, lang = 'en') {
  const parts = parseWallClock(iso);
  if (!parts) return '—';
  const monthName = lang === 'bn' ? BN_MONTHS[parts.month - 1] : EN_MONTHS[parts.month - 1];
  return `${parts.day} ${monthName}`;
}

export function formatWeekday(iso, lang = 'en') {
  const parts = parseWallClock(iso);
  if (!parts) return '—';
  const idx = new Date(parts.year, parts.month - 1, parts.day).getDay();
  return lang === 'bn' ? BN_DAYS[idx] : EN_DAYS[idx];
}

export function formatShortWeekday(iso, lang = 'en') {
  const full = formatWeekday(iso, lang);
  if (lang === 'bn') return full;
  return full.slice(0, 3);
}

export function formatTime(iso, lang = 'en') {
  const parts = parseWallClock(iso);
  if (!parts) return '—';
  let h = parts.hour;
  const suffix = lang === 'bn' ? (h < 12 ? 'পূর্বাহ্ণ' : 'অপরাহ্ণ') : (h < 12 ? 'AM' : 'PM');
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const mm = String(parts.minute).padStart(2, '0');
  return `${h}:${mm} ${suffix}`;
}

export function formatHourLabel(iso, lang = 'en') {
  const parts = parseWallClock(iso);
  if (!parts) return '—';
  let h = parts.hour;
  if (lang === 'bn') {
    const suffix = h < 12 ? 'পূ' : 'অ';
    if (h === 0) h = 12; else if (h > 12) h -= 12;
    return `${h} ${suffix}`;
  }
  const suffix = h < 12 ? 'am' : 'pm';
  if (h === 0) h = 12; else if (h > 12) h -= 12;
  return `${h}${suffix}`;
}

/** Relative "updated X ago" label. */
export function formatRelativeTime(timestamp, lang = 'en') {
  if (!timestamp) return '—';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  if (mins < 60) return lang === 'bn' ? `${mins} মিনিট আগে` : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === 'bn' ? `${hours} ঘণ্টা আগে` : `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return lang === 'bn' ? `${days} দিন আগে` : `${days} day${days > 1 ? 's' : ''} ago`;
}

/** Wind direction in degrees → compass abbreviation. */
export function windDir(deg, lang = 'en') {
  if (deg == null || Number.isNaN(deg)) return '—';
  const dirs = lang === 'bn'
    ? ['উ','উ-পূ','পূ','দ-পূ','দ','দ-প','প','উ-প']
    : ['N','NE','E','SE','S','SW','W','NW'];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}

/** AQI (US EPA scale) → category + colour. */
export function aqiCategory(aqi, lang = 'en') {
  if (aqi == null || Number.isNaN(aqi)) return { label: lang === 'bn' ? 'অজানা' : 'Unknown', color: '#94a3b8' };
  const map = [
    { max: 50,  en: 'Good',           bn: 'ভালো',              color: '#22c55e' },
    { max: 100, en: 'Moderate',       bn: 'মাঝারি',            color: '#eab308' },
    { max: 150, en: 'Unhealthy (Sensitive)', bn: 'সংবেদনশীলদের জন্য অস্বাস্থ্যকর', color: '#f97316' },
    { max: 200, en: 'Unhealthy',      bn: 'অস্বাস্থ্যকর',       color: '#ef4444' },
    { max: 300, en: 'Very Unhealthy', bn: 'খুব অস্বাস্থ্যকর',   color: '#a855f7' },
    { max: Infinity, en: 'Hazardous', bn: 'বিপজ্জনক',          color: '#7f1d1d' }
  ];
  const found = map.find((m) => aqi <= m.max);
  return { label: lang === 'bn' ? found.bn : found.en, color: found.color };
}

/** UV index → category + advice. */
export function uvCategory(uv, lang = 'en') {
  if (uv == null || Number.isNaN(uv)) return { label: lang === 'bn' ? 'অজানা' : 'Unknown', advice: '', color: '#94a3b8' };
  if (uv < 3) return { label: lang === 'bn' ? 'কম' : 'Low', advice: lang === 'bn' ? 'সাধারণ নিরাপত্তা যথেষ্ট।' : 'No special protection needed.', color: '#22c55e' };
  if (uv < 6) return { label: lang === 'bn' ? 'মাঝারি' : 'Moderate', advice: lang === 'bn' ? 'দুপুরে ছায়ায় থাকুন, সানস্ক্রিন ব্যবহার করুন।' : 'Seek shade near midday and use sunscreen.', color: '#eab308' };
  if (uv < 8) return { label: lang === 'bn' ? 'উচ্চ' : 'High', advice: lang === 'bn' ? 'সানস্ক্রিন, টুপি ও সানগ্লাস ব্যবহার করুন।' : 'Use sunscreen, hat and sunglasses.', color: '#f97316' };
  if (uv < 11) return { label: lang === 'bn' ? 'খুব উচ্চ' : 'Very High', advice: lang === 'bn' ? 'দুপুরে বাইরে থাকা এড়িয়ে চলুন।' : 'Avoid sun exposure around midday.', color: '#ef4444' };
  return { label: lang === 'bn' ? 'চরম' : 'Extreme', advice: lang === 'bn' ? 'বাইরে বেরোনো এড়িয়ে চলুন, সম্পূর্ণ সুরক্ষা নিন।' : 'Avoid going outdoors; take full protection.', color: '#a855f7' };
}

/** Format a duration in hours+minutes between two wall-clock ISO strings. */
export function dayLength(sunriseIso, sunsetIso, lang = 'en') {
  const a = parseWallClock(sunriseIso);
  const b = parseWallClock(sunsetIso);
  if (!a || !b) return '—';
  const mins = (b.hour * 60 + b.minute) - (a.hour * 60 + a.minute);
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return lang === 'bn' ? `${h}ঘ ${m}মি` : `${h}h ${m}m`;
}