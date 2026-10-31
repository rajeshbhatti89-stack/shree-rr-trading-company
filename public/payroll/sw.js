const CACHE_NAME = 'srr-payroll-pwa-v2.7.2';
const STATIC_ASSETS = [
  '/payroll/',
  '/payroll/index.html',
  '/payroll/payroll.css',
  '/payroll/manifest.json',
  '/pwa.js',
  '/payroll/js/00-globals.js',
  '/payroll/js/01-clock-display.js',
  '/payroll/js/02-navigation-tabs-mobile-drawer.js',
  '/payroll/js/03-authentication-rbac-session.js',
  '/payroll/js/04-data-fetching.js',
  '/payroll/js/05-render-users-table.js',
  '/payroll/js/06-superadmin-dynamic-permissions-modal-handler.js',
  '/payroll/js/07-delete-user.js',
  '/payroll/js/08-add-edit-user-modal.js',
  '/payroll/js/09-vehicles-management-table.js',
  '/payroll/js/10-vehicle-bulk-import-engine-excel-csv.js',
  '/payroll/js/11-vehicle-availability-mttr-reliability-analytics.js',
  '/payroll/js/12-1-click-excel-mttr-availability-exporter.js',
  '/payroll/js/13-daily-muster-roll-today-s-live-attendance.js',
  '/payroll/js/14-tomorrow-s-shift-machine-schedule-system.js',
  '/payroll/js/15-attendance-glass-view-leave-balance-tracker-live-dynamic-sync-with-muster-roll-approved-leaves.js',
  '/payroll/js/16-1-click-excel-reports-exporters.js',
  '/payroll/js/17-bulk-employee-upload.js',
  '/payroll/js/18-salary-slips-table.js',
  '/payroll/js/19-whatsapp-dispatch-strict-1-page-pdf-engine.js',
  '/payroll/js/20-official-printable-salary-slip-modal.js',
  '/payroll/js/21-event-listeners-modals.js',
  '/payroll/js/22-leave-management-functions-modal-helpers.js',
  '/payroll/js/23-dashboard-metrics-calculation.js',
  '/payroll/js/23-populate-dropdowns.js',
  '/payroll/js/23-vehicle-statutory-compliance-tracking-engine.js',
  '/payroll/js/24-utilities.js',
  '/payroll/js/25-system-generated-hr-letters-appointment-engine.js',
  '/payroll/js/26-inventory-spares-management.js',
  '/payroll/js/27-job-cards-maintenance-engine.js',
  '/payroll/js/28-material-issue-challans-engine.js',
  '/payroll/js/29-vehicle-consumption-cost-analytics.js',
  '/payroll/js/30-vehicle-subnav-tabs.js',
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
