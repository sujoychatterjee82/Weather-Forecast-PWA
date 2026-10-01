/**
 * Export weather data to Excel, CSV and PDF.
 * All generation happens in the browser; no server is involved.
 */

import { formatDateForFilename, slugify } from '../utils/helpers.js';
import { formatFullDate, formatTime, formatShortDate } from '../utils/formatters.js';
import { t } from '../i18n/translations.js';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function exportFilename(weather, ext) {
  const slug = slugify(weather.location?.name || 'location');
  const date = formatDateForFilename(new Date());
  return `weather-${slug}-${date}.${ext}`;
}

/* --------------------------------------------------------------------------
 * Row builders
 * ---------------------------------------------------------------------- */

function summaryRows(weather) {
  const c = weather.current || {};
  const aq = weather.airQuality || {};
  const astro = weather.astronomy || {};
  return [
    ['Field', 'Value'],
    ['Location', weather.location?.name || ''],
    ['Region', weather.location?.region || ''],
    ['Country', weather.location?.country || ''],
    ['Latitude', weather.location?.latitude ?? ''],
    ['Longitude', weather.location?.longitude ?? ''],
    ['Source', weather.source || ''],
    ['Temperature (°C)', c.temperature ?? ''],
    ['Feels like (°C)', c.feelsLike ?? ''],
    ['Humidity (%)', c.humidity ?? ''],
    ['Wind speed (km/h)', c.windSpeed ?? ''],
    ['Wind direction (°)', c.windDirection ?? ''],
    ['Pressure (hPa)', c.pressure ?? ''],
    ['Visibility (km)', c.visibility ?? ''],
    ['Precipitation (mm)', c.precipitation ?? ''],
    ['Rain probability (%)', c.rainProbability ?? ''],
    ['UV index', c.uv ?? ''],
    ['Condition', c.condition || ''],
    ['AQI', aq.aqi ?? ''],
    ['AQI source', aq.aqiSource || ''],
    ['PM2.5', aq.pm25 ?? ''],
    ['PM10', aq.pm10 ?? ''],
    ['Sunrise', astro.sunrise || ''],
    ['Sunset', astro.sunset || '']
  ];
}

function dailyRows(weather) {
  const header = [
    'Date', 'Day', 'Condition', 'Max °C', 'Min °C',
    'Rain probability %', 'Precipitation mm', 'Wind km/h', 'UV', 'Sunrise', 'Sunset'
  ];
  const rows = [header];
  for (const d of weather.daily || []) {
    rows.push([
      d.date || '',
      d.date || '',
      d.condition || '',
      d.tempMax ?? '',
      d.tempMin ?? '',
      d.rainProbability ?? '',
      d.precipitation ?? '',
      d.windSpeed ?? '',
      d.uv ?? '',
      d.sunrise || '',
      d.sunset || ''
    ]);
  }
  return rows;
}

function hourlyRows(weather) {
  const header = ['Time', 'Temp °C', 'Feels °C', 'Humidity %', 'Rain %', 'Precip mm', 'Wind km/h', 'UV', 'Condition'];
  const rows = [header];
  for (const h of weather.hourly || []) {
    rows.push([
      h.time || '',
      h.temperature ?? '',
      h.feelsLike ?? '',
      h.humidity ?? '',
      h.rainProbability ?? '',
      h.precipitation ?? '',
      h.windSpeed ?? '',
      h.uv ?? '',
      h.condition || ''
    ]);
  }
  return rows;
}

function aqiRows(weather) {
  const aq = weather.airQuality || {};
  return [
    ['Field', 'Value'],
    ['AQI', aq.aqi ?? ''],
    ['Source', aq.aqiSource || ''],
    ['PM2.5 (µg/m³)', aq.pm25 ?? ''],
    ['PM10 (µg/m³)', aq.pm10 ?? ''],
    ['CO (µg/m³)', aq.co ?? ''],
    ['NO₂ (µg/m³)', aq.no2 ?? ''],
    ['SO₂ (µg/m³)', aq.so2 ?? ''],
    ['O₃ (µg/m³)', aq.o3 ?? '']
  ];
}

function locationRows(weather) {
  return [
    ['Field', 'Value'],
    ['Name', weather.location?.name || ''],
    ['Region', weather.location?.region || ''],
    ['Country', weather.location?.country || ''],
    ['Latitude', weather.location?.latitude ?? ''],
    ['Longitude', weather.location?.longitude ?? ''],
    ['Timezone', weather.location?.timezone || '']
  ];
}

/* --------------------------------------------------------------------------
 * Excel
 * ---------------------------------------------------------------------- */

export async function exportExcel(weather, { lang = 'en' } = {}) {
  if (!window.XLSX) throw new Error('SheetJS not loaded');
  const wb = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows(weather));
  const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows(weather));
  const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyRows(weather));
  const aqiSheet = XLSX.utils.aoa_to_sheet(aqiRows(weather));
  const locationSheet = XLSX.utils.aoa_to_sheet(locationRows(weather));

  // Column widths
  const widths = (arr) => arr.map((w) => ({ wch: w }));
  summarySheet['!cols'] = widths([24, 30]);
  dailySheet['!cols'] = widths([12, 12, 22, 10, 10, 16, 16, 12, 8, 20, 20]);
  hourlySheet['!cols'] = widths([18, 10, 10, 12, 10, 12, 12, 8, 22]);
  aqiSheet['!cols'] = widths([20, 20]);
  locationSheet['!cols'] = widths([14, 30]);

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Weather Summary');
  XLSX.utils.book_append_sheet(wb, dailySheet, '7-Day Forecast');
  XLSX.utils.book_append_sheet(wb, hourlySheet, '24-Hour Forecast');
  XLSX.utils.book_append_sheet(wb, aqiSheet, 'Air Quality');
  XLSX.utils.book_append_sheet(wb, locationSheet, 'Location');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  triggerDownload(blob, exportFilename(weather, 'xlsx'));
}

/* --------------------------------------------------------------------------
 * CSV
 * ---------------------------------------------------------------------- */

function rowsToCsv(rows) {
  return rows.map((r) => r.map((cell) => {
    const s = cell == null ? '' : String(cell);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }).join(',')).join('\r\n');
}

export function exportCsv(weather) {
  const blocks = [];
  blocks.push('Weather Summary');
  blocks.push(rowsToCsv(summaryRows(weather)));
  blocks.push('');
  blocks.push('7-Day Forecast');
  blocks.push(rowsToCsv(dailyRows(weather)));
  blocks.push('');
  blocks.push('24-Hour Forecast');
  blocks.push(rowsToCsv(hourlyRows(weather)));
  blocks.push('');
  blocks.push('Air Quality');
  blocks.push(rowsToCsv(aqiRows(weather)));
  blocks.push('');
  blocks.push('Location');
  blocks.push(rowsToCsv(locationRows(weather)));

  const csv = '\uFEFF' + blocks.join('\r\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, exportFilename(weather, 'csv'));
}

/* --------------------------------------------------------------------------
 * PDF
 * ---------------------------------------------------------------------- */

export async function exportPdf(weather, { lang = 'en' } = {}) {
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF not loaded');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const heading = (txt) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(String(txt), margin, y);
    y += 18;
  };
  const body = (txt) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(txt ?? ''), pageWidth - margin * 2);
    for (const line of lines) {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 13;
    }
  };
  const gap = (n = 8) => { y += n; };
  const checkPage = () => { if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; } };

  const loc = weather.location || {};
  const cur = weather.current || {};
  const aq = weather.airQuality || {};
  const astro = weather.astronomy || {};

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Weather Report', margin, y);
  y += 22;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${loc.name || ''}${loc.region ? ', ' + loc.region : ''}`, margin, y);
  y += 16;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  doc.setTextColor(0);
  y += 22;

  heading('Current Conditions');
  body(`Temperature: ${cur.temperature ?? '—'} °C`);
  body(`Feels like: ${cur.feelsLike ?? '—'} °C`);
  body(`Condition: ${cur.condition || '—'}`);
  body(`Humidity: ${cur.humidity ?? '—'} %`);
  body(`Wind: ${cur.windSpeed ?? '—'} km/h ${cur.windDirection != null ? '(' + cur.windDirection + '°)' : ''}`);
  body(`Pressure: ${cur.pressure ?? '—'} hPa`);
  body(`Visibility: ${cur.visibility ?? '—'} km`);
  body(`Precipitation: ${cur.precipitation ?? '—'} mm`);
  body(`Rain probability: ${cur.rainProbability ?? '—'} %`);
  body(`UV index: ${cur.uv ?? '—'}`);
  body(`AQI: ${aq.aqi ?? '—'} ${aq.aqiSource ? '(' + aq.aqiSource + ')' : ''}`);
  body(`Sunrise: ${astro.sunrise || '—'}`);
  body(`Sunset: ${astro.sunset || '—'}`);
  gap();

  checkPage();
  heading('7-Day Forecast');
  for (const d of weather.daily || []) {
    checkPage();
    body(`${d.date || ''}  ${d.condition || ''}  High ${d.tempMax ?? '—'}° / Low ${d.tempMin ?? '—'}°  Rain ${d.rainProbability ?? '—'}%`);
  }
  gap();

  checkPage();
  heading('Next 24 Hours');
  for (const h of (weather.hourly || []).slice(0, 24)) {
    checkPage();
    body(`${h.time || ''}  ${h.temperature ?? '—'}°  (feels ${h.feelsLike ?? '—'}°)  Rain ${h.rainProbability ?? '—'}%  Wind ${h.windSpeed ?? '—'} km/h`);
  }

  // Optional: embed the temperature chart canvas if present
  const canvas = document.getElementById('chart-temp-daily');
  if (canvas) {
    try {
      const img = canvas.toDataURL('image/png');
      doc.addPage();
      y = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Temperature Chart — 7 Days', margin, y);
      y += 20;
      const maxW = pageWidth - margin * 2;
      const ratio = canvas.height / canvas.width;
      const imgW = maxW;
      const imgH = imgW * ratio;
      doc.addImage(img, 'PNG', margin, y, imgW, imgH);
    } catch (err) {
      console.warn('[export] could not embed chart', err);
    }
  }

  doc.save(exportFilename(weather, 'pdf'));
}

export default { exportExcel, exportCsv, exportPdf };