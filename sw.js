const CACHE_NAME = 'gmail-builder-v1.1.0';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/css/styles.css?v=2',
  './assets/js/main.js',
  './assets/js/ui.js',
  './assets/js/query-builder.js',
  './assets/js/examples.js',
  './assets/js/i18n.js',
  './locales/en.json',
  './locales/es.json',
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

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      
      // Fallback to network
      return fetch(event.request).then(networkResponse => {
        // Cache the dynamically fetched responses too
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // If both cache and network fail (e.g. offline and un-cached page)
        // just fail silently or return offline.html if we had one
      });
    })
  );
});
