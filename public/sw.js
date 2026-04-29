// Basic Service Worker to pass PWA installation requirements
const CACHE_NAME = 'questbound-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We don't need offline caching right now, so we just pass requests through.
  // But having the fetch listener is generally required for PWA installation prompts.
  event.respondWith(fetch(event.request).catch(() => new Response("Offline")));
});
