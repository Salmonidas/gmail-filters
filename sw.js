const CACHE_NAME = 'gmail-builder-v1.3.0';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/css/styles.css?v=3',
  './assets/js/main.js?v=2',
  './assets/js/ui.js',
  './assets/js/query-builder.js',
  './assets/js/examples.js',
  './assets/js/i18n.js',
  './assets/js/legal-i18n.js',
  './locales/en.json',
  './locales/es.json',
  './locales/en-US.json',
  './locales/es-ES.json',
  './assets/fonts/Roboto-Regular.ttf',
  './assets/fonts/Roboto-Medium.ttf',
  './assets/fonts/Roboto-Bold.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Only cache same-origin requests
  if (url.origin !== location.origin) return;

  // Network-first for JS files and locale JSONs (so updates apply immediately)
  const isJS = url.pathname.endsWith('.js') && !url.pathname.endsWith('sw.js');
  const isLocale = url.pathname.includes('/locales/');
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isJS || isLocale || isHTML) {
    // Network-first: try network, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets (fonts, images, CSS)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Offline and not cached - fail silently
      });
    })
  );
});
