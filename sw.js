const CACHE_NAME = 'bakery-calc-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event: Cache initial files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching app assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches if we ever change the CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Clone the response because it's a stream and can only be consumed once
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        console.log('📴 Offline and network request failed. Relying strictly on cache.');
      });
      
      // Return cached response instantly if we have it, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});