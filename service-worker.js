/* Weather Forecast PWA — Service Worker
 * Handles offline shell caching + runtime caching for third-party assets.
 * Works under GitHub Pages subpaths (e.g. /repo/) thanks to relative URLs.
 */

const CACHE_VERSION = 'weather-pwa-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Relative to the service worker's own location. Under /repo/, `./` resolves to /repo/.
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/app.css',
  './assets/icons/icon.svg',
  './assets/icons/icon-maskable.svg',
  './assets/js/app.js',
  './assets/js/config.js',
  './assets/js/api/weather-service.js',
  './assets/js/api/open-meteo.js',
  './assets/js/api/weatherapi.js',
  './assets/js/api/openweather.js',
  './assets/js/location/location-service.js',
  './assets/js/charts/weather-charts.js',
  './assets/js/map/weather-map.js',
  './assets/js/export/export-service.js',
  './assets/js/i18n/translations.js',
  './assets/js/ui/renderer.js',
  './assets/js/ui/toast.js',
  './assets/js/ui/loading.js',
  './assets/js/utils/cache.js',
  './assets/js/utils/formatters.js',
  './assets/js/utils/clothing.js',
  './assets/js/utils/farmer-forecast.js',
  './assets/js/utils/helpers.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Use individual adds so one failure doesn't abort the whole install.
    await Promise.all(SHELL_URLS.map(async (url) => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (err) { console.warn('[SW] Failed to precache', url, err); }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => !k.startsWith(CACHE_VERSION))
      .map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Weather API requests: network-first, brief runtime cache (5 min) to help offline.
  if (/open-meteo\.com|weatherapi\.com|openweathermap\.org|zippopotam\.us|nominatim\.openstreetmap\.org/.test(url.hostname)) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE, 5 * 60 * 1000));
    return;
  }

  // CDN assets: stale-while-revalidate.
  if (!isSameOrigin) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // Same-origin navigations: network-first, fall back to cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, SHELL_CACHE, 0, './index.html'));
    return;
  }

  // Same-origin static assets: cache-first with network fallback.
  event.respondWith(cacheFirst(req, SHELL_CACHE));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreSearch: false });
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const fallback = await cache.match(req, { ignoreSearch: true });
    if (fallback) return fallback;
    throw err;
  }
}

async function networkFirst(req, cacheName, maxAgeMs = 0, fallbackUrl = null) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      if (maxAgeMs > 0) {
        const body = await res.clone().blob();
        const headers = new Headers(res.headers);
        headers.set('x-sw-cached-at', String(Date.now()));
        cache.put(req, new Response(body, { status: res.status, statusText: res.statusText, headers }));
      } else {
        cache.put(req, res.clone());
      }
    }
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) {
      if (maxAgeMs > 0) {
        const cachedAt = Number(cached.headers.get('x-sw-cached-at') || 0);
        // Even if expired, still return for offline resilience.
      }
      return cached;
    }
    if (fallbackUrl) {
      const fb = await cache.match(fallbackUrl);
      if (fb) return fb;
    }
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || network || Promise.reject(new Error('offline'));
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});