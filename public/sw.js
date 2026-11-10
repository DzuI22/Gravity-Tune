const CACHE_NAME = 'gravity-tune-v6';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always ignore API calls and media streams
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('youtube') ||
    event.request.url.includes('googlevideo') ||
    event.request.url.includes('ytimg')
  ) {
    return;
  }

  // Network First: Always try network to get the freshest build, fallback to cache only when offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
