const CACHE_NAME = 'srr-payroll-pwa-v2.8.1';
const STATIC_ASSETS = [
  '/payroll/',
  '/payroll/index.html',
  '/payroll/payroll.css',
  '/payroll/manifest.json',
  '/pwa.js',
  '/payroll/js/erp-core.js',
  '/payroll/js/erp-hr.js',
  '/payroll/js/erp-payroll.js',
  '/payroll/js/erp-fleet.js',
  '/payroll/js/erp-maintenance.js',
  '/payroll/js/erp-stock-inventory.js',
  '/payroll/js/erp-reports.js',
  '/images/logo.png',
  '/images/logo.svg',
  '/images/srijandev_logo.png',
  '/images/pwa-icon-192.png',
  '/images/pwa-icon-512.png'
];

// 1. Install Event - Cache fresh assets and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Payroll PWA Pre-cache partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Purge old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Handle Payroll APIs: Network-first with offline fallback response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ success: false, offline: true, message: 'Offline mode active. Using local data.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // HTML Navigation - Network-first with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/payroll/index.html')))
    );
    return;
  }

  // Static Assets - Network-First for instant updates, fallback to cache when offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
