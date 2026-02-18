// Service Worker for TriGo PWA
const CACHE_NAME = 'trigo-v1';
const RUNTIME_CACHE = 'trigo-runtime-v1';

// Assets to cache on install - core app assets
const PRECACHE_ASSETS = [
  '/',
  '/logos/tlogo.png',
  '/logos/appicon.png',
  '/logos/logos.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (they should always go to network for real-time data)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Skip WebSocket connections
  if (event.request.url.startsWith('ws://') || event.request.url.startsWith('wss://')) {
    return;
  }

  // Skip external resources that shouldn't be cached
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.href.includes('fonts.bunny.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background (stale-while-revalidate strategy)
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
            })
            .catch(() => {
              // Network failed, but we have cache - that's fine
            });
          
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and it's a navigation request, return cached home page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // For other requests, return a basic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TriGo';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logos/tlogo.png',
    badge: '/logos/tlogo.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
