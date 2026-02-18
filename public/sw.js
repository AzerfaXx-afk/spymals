// Minimal Service Worker to enable PWA installability
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for development, can be cache-first for production
    // For now, just a pass-through to ensure fetch works
    event.respondWith(fetch(event.request));
});
