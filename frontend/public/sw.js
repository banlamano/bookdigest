// Service Worker for PWA
const CACHE_NAME = 'bookdigest-v2'; // Bumped version to invalidate old cache
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Install service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Fetch from network, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid basic responses (not opaque)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Don't cache Next.js dev server files (HMR, webpack chunks)
        const url = new URL(event.request.url);
        if (url.pathname.startsWith('/_next/')) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Update service worker and clear all old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients so the new SW takes control immediately
  self.clients.claim();
});

