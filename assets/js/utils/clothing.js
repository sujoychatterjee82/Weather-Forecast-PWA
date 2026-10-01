/**
 * Rule-based clothing suggestion.
 * Designed so an AI layer can replace the suggestion text without
 * touching the UI contract: the function returns { temp, lines: [] }.
 */

import { t } from '../i18n/translations.js';

export function clothingSuggestion(current, { lang = 'en', rainProbability = null } = {}) {
  const temp = current?.feelsLike ?? current?.temperature;
  const humidity = current?.humidity;
  const windSpeed = current?.windSpeed;
  const rainChance = rainProbability ?? current?.rainProbability ?? 0;

  const lines = [];

  if (temp == null) {
    lines.push(t('clothing.mild', lang));
  } else if (temp >= 32) {
    lines.push(t('clothing.hot', lang));
  } else if (temp >= 26) {
    lines.push(t('clothing.warm', lang));
  } else if (temp >= 18) {
    lines.push(t('clothing.mild', lang));
  } else if (temp >= 10) {
    lines.push(t('clothing.cool', lang));
  } else if (temp >= 0) {
    lines.push(t('clothing.cold', lang));
  } else {
    lines.push(t('clothing.freezing', lang));
  }

  if (rainChance >= 50) lines.push(t('clothing.rain', lang));
  if (windSpeed != null && windSpeed >= 30) lines.push(t('clothing.windy', lang));
  if (humidity != null && humidity >= 80 && temp != null && temp >= 26) lines.push(t('clothing.humid', lang));

  return { temp, lines };
}

export default clothingSuggestion;