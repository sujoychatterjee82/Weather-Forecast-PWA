/**
 * Chart.js wrappers.
 * Handles theme-aware colours, responsive resize, and correct destroy/recreate.
 */

import { t } from '../i18n/translations.js';
import { formatHourLabel, formatShortWeekday } from '../utils/formatters.js';

const charts = new Map();

function themeColors() {
  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue('--text').trim() || '#0f172a';
  const muted = styles.getPropertyValue('--text-muted').trim() || '#64748b';
  const border = styles.getPropertyValue('--border').trim() || '#e2e8f0';
  const primary = styles.getPropertyValue('--primary').trim() || '#0ea5e9';
  return { text, muted, border, primary };
}

function destroy(id) {
  const existing = charts.get(id);
  if (existing) {
    try { existing.destroy(); } catch { /* ignore */ }
    charts.delete(id);
  }
}

function create(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return null;
  destroy(id);
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, config);
  charts.set(id, chart);
  return chart;
}

export function renderTemperatureChart(weather, { lang } = {}) {
  const hourly = weather.hourly || [];
  if (!hourly.length) { destroy('chart-temp-hourly'); return; }
  const c = themeColors();
  const labels = hourly.map((h) => formatHourLabel(h.time, lang));
  const temps = hourly.map((h) => h.temperature);
  const feels = hourly.map((h) => h.feelsLike);

  create('chart-temp-hourly', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('charts.temp', lang),
          data: temps,
          borderColor: c.primary,
          backgroundColor: 'color-mix' in window.CSS ? `color-mix(in srgb, ${c.primary} 18%, transparent)` : 'rgba(14,165,233,0.18)',
          tension: 0.35,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2
        },
        {
          label: t('metrics.feelsLike', lang),
          data: feels,
          borderColor: c.muted,
          borderDash: [5, 4],
          backgroundColor: 'transparent',
          tension: 0.35,
          fill: false,
          pointRadius: 0,
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.text, boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y == null ? '—' : Math.round(ctx.parsed.y) + '°'}`
          }
        }
      },
      scales: {
        x: { ticks: { color: c.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { color: c.border } },
        y: { ticks: { color: c.muted, callback: (v) => `${v}°` }, grid: { color: c.border } }
      }
    }
  });
}

export function renderRainChart(weather, { lang } = {}) {
  const hourly = weather.hourly || [];
  if (!hourly.length) { destroy('chart-rain-hourly'); return; }
  const c = themeColors();
  const labels = hourly.map((h) => formatHourLabel(h.time, lang));
  const data = hourly.map((h) => h.rainProbability);

  create('chart-rain-hourly', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: t('charts.rain', lang),
        data,
        backgroundColor: 'color-mix' in window.CSS ? `color-mix(in srgb, ${c.primary} 70%, transparent)` : 'rgba(14,165,233,0.7)',
        borderRadius: 4,
        maxBarThickness: 22
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${t('charts.rain', lang)}: ${ctx.parsed.y == null ? '—' : Math.round(ctx.parsed.y) + '%'}`
          }
        }
      },
      scales: {
        x: { ticks: { color: c.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } },
        y: { beginAtZero: true, max: 100, ticks: { color: c.muted, callback: (v) => `${v}%` }, grid: { color: c.border } }
      }
    }
  });
}

export function renderDailyTemperatureChart(weather, { lang } = {}) {
  const daily = weather.daily || [];
  if (!daily.length) { destroy('chart-temp-daily'); return; }
  const c = themeColors();
  const labels = daily.map((d, i) => i === 0 ? t('day.today', lang) : formatShortWeekday(d.date, lang));
  const highs = daily.map((d) => d.tempMax);
  const lows = daily.map((d) => d.tempMin);

  create('chart-temp-daily', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('charts.high', lang),
          data: highs,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.15)',
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: t('charts.low', lang),
          data: lows,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.text, boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y == null ? '—' : Math.round(ctx.parsed.y) + '°'}`
          }
        }
      },
      scales: {
        x: { ticks: { color: c.muted }, grid: { color: c.border } },
        y: { ticks: { color: c.muted, callback: (v) => `${v}°` }, grid: { color: c.border } }
      }
    }
  });
}

export function renderAllCharts(weather, { lang } = {}) {
  renderTemperatureChart(weather, { lang });
  renderRainChart(weather, { lang });
  renderDailyTemperatureChart(weather, { lang });
}

export function destroyAllCharts() {
  ['chart-temp-hourly', 'chart-rain-hourly', 'chart-temp-daily'].forEach(destroy);
}

export default { renderAllCharts, destroyAllCharts };