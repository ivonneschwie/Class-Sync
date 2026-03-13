/**
 * ClassSync Service Worker
 * Implements an "Offline-First" strategy by pre-caching core application routes
 * and assets during the installation phase.
 */

const CACHE_NAME = 'class-sync-shell-v1';

// The list of routes and assets to pre-cache immediately on install
const PRE_CACHE_RESOURCES = [
  '/',
  '/timetable',
  '/summarizer',
  '/lesson-catalog',
  '/flashcards',
  '/profile',
  '/settings',
  '/login',
  '/signup',
  '/manifest.json',
  '/icon0.svg'
];

// 1. Install Event: Pre-cache the entire application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching application shell...');
      return cache.addAll(PRE_CACHE_RESOURCES);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// 3. Fetch Event: Serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Check if the request is for one of our pre-cached routes
  const isPreCached = PRE_CACHE_RESOURCES.some(path => url.pathname === path);

  if (isPreCached || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we have a successful network response, update the cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            // If even the cache fails for a navigation, return the root shell
            return cachedResponse || caches.match('/');
          });
        })
    );
  } else {
    // For other assets (images, fonts, scripts), use Cache-First strategy
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          // Optionally cache new static assets discovered during browsing
          if (response.status === 200 && (url.origin === self.location.origin)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
