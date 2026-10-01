/**
 * Rule-based farmer forecast.
 * Analyses hourly + daily data and returns advisory blocks.
 */

import { t } from '../i18n/translations.js';

function hoursInRange(hourly, fromHour, toHour) {
  return hourly.filter((h) => {
    const hh = Number((h.time || '').slice(11, 13));
    if (Number.isNaN(hh)) return false;
    if (fromHour <= toHour) return hh >= fromHour && hh < toHour;
    return hh >= fromHour || hh < toHour;
  });
}

function avg(arr) {
  const nums = arr.filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function farmerForecast(weather, { lang = 'en' } = {}) {
  const hourly = weather.hourly || [];
  const daily = weather.daily || [];
  const current = weather.current || {};

  const today = hourly.slice(0, 24);
  const morning = hoursInRange(today, 6, 12);
  const afternoon = hoursInRange(today, 12, 17);
  const evening = hoursInRange(today, 17, 22);

  const rainProb = (arr) => Math.round(avg(arr.map((h) => h.rainProbability ?? 0)) ?? 0);
  const rainAmt = (arr) => arr.reduce((s, h) => s + (Number(h.precipitation) || 0), 0);

  const morningP = rainProb(morning);
  const afternoonP = rainProb(afternoon);
  const eveningP = rainProb(evening);
  const totalRain = rainAmt(today);
  const tomorrow = daily[1];

  const windPeak = Math.max(
    ...today.map((h) => Number(h.windSpeed) || 0),
    Number(current.windSpeed) || 0
  );

  const blocks = [];

  // Rain today
  let rainTodayLine;
  if (today.length === 0) {
    rainTodayLine = lang === 'bn' ? 'তথ্য নেই।' : 'No data.';
  } else if (afternoonP >= 60) {
    rainTodayLine = lang === 'bn' ? 'দুপুরের পরে বৃষ্টির সম্ভাবনা বেশি।' : 'Rain likely in the afternoon.';
  } else if (eveningP >= 60) {
    rainTodayLine = lang === 'bn' ? 'সন্ধ্যায় বৃষ্টির সম্ভাবনা বেশি।' : 'Rain likely in the evening.';
  } else if (morningP >= 60) {
    rainTodayLine = lang === 'bn' ? 'সকালে বৃষ্টির সম্ভাবনা বেশি।' : 'Rain likely in the morning.';
  } else if (Math.max(morningP, afternoonP, eveningP) >= 35) {
    rainTodayLine = lang === 'bn' ? 'মাঝে মাঝে বৃষ্টি হতে পারে।' : 'Rain possible at times.';
  } else {
    rainTodayLine = lang === 'bn' ? 'উল্লেখযোগ্য বৃষ্টির সম্ভাবনা কম।' : 'Low chance of significant rain.';
  }
  blocks.push({ title: t('farmer.rainToday', lang), value: rainTodayLine });

  // Rain probability max
  const maxP = Math.max(morningP, afternoonP, eveningP, 0);
  blocks.push({ title: t('farmer.rainChance', lang), value: `${maxP}%` });

  // Rain amount
  blocks.push({
    title: t('farmer.rainAmount', lang),
    value: totalRain > 0 ? `${totalRain.toFixed(1)} mm` : (lang === 'bn' ? 'নেই' : 'None')
  });

  // Tomorrow's rain
  if (tomorrow) {
    blocks.push({
      title: t('farmer.tomorrow', lang),
      value: `${tomorrow.rainProbability ?? 0}%`
    });
  }

  // Wind
  let windLine;
  if (windPeak >= 45) windLine = lang === 'bn' ? 'জোরে বাতাসের সম্ভাবনা বেশি।' : 'Strong wind likely.';
  else if (windPeak >= 25) windLine = lang === 'bn' ? 'মাঝারি বাতাস প্রত্যাশিত।' : 'Moderate wind expected.';
  else windLine = lang === 'bn' ? 'বাতাস সাধারণত হালকা।' : 'Wind generally light.';
  blocks.push({ title: t('farmer.wind', lang), value: `${Math.round(windPeak)} km/h — ${windLine}` });

  // Dry / wet periods
  const dryRanges = describeRange(today.filter((h) => (h.rainProbability ?? 0) < 25), lang, 'dry');
  const wetRanges = describeRange(today.filter((h) => (h.rainProbability ?? 0) >= 50), lang, 'wet');
  blocks.push({ title: t('farmer.dry', lang), value: dryRanges });
  blocks.push({ title: t('farmer.wet', lang), value: wetRanges });

  // Suggested outdoor windows
  const suggested = describeRange(
    today.filter((h) => (h.rainProbability ?? 0) < 20 && (h.windSpeed ?? 0) < 30),
    lang,
    'suggested'
  );
  blocks.push({ title: t('farmer.suggested', lang), value: suggested });

  return {
    advisory: t('farmer.advisory', lang),
    blocks
  };
}

function describeRange(hours, lang, kind) {
  if (!hours.length) {
    if (kind === 'dry') return lang === 'bn' ? 'উল্লেখযোগ্য শুষ্ক সময় নেই।' : 'No significant dry window.';
    if (kind === 'wet') return lang === 'bn' ? 'উল্লেখযোগ্য ভেজা সময় নেই।' : 'No significant wet window.';
    return lang === 'bn' ? 'সুস্পষ্ট সময় নেই।' : 'No clear window.';
  }
  const hours_nums = hours.map((h) => Number((h.time || '').slice(11, 13))).filter(Number.isFinite).sort((a, b) => a - b);
  if (!hours_nums.length) return '—';
  const min = hours_nums[0];
  const max = hours_nums[hours_nums.length - 1];
  const fmt = (n) => {
    if (lang === 'bn') {
      let h = n;
      const suffix = h < 12 ? 'পূ' : 'অ';
      if (h === 0) h = 12; else if (h > 12) h -= 12;
      return `${h} ${suffix}`;
    }
    const ap = n < 12 ? 'am' : 'pm';
    let h = n;
    if (h === 0) h = 12; else if (h > 12) h -= 12;
    return `${h}${ap}`;
  };
  const label = kind === 'dry'
    ? (lang === 'bn' ? 'শুষ্ক' : 'Dry')
    : kind === 'wet'
      ? (lang === 'bn' ? 'ভেজা' : 'Wet')
      : (lang === 'bn' ? 'প্রস্তাবিত' : 'Suggested');
  return `${label}: ${fmt(min)} – ${fmt(max + 1)}`;
}

export default farmerForecast;