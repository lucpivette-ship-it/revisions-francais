// Simple offline cache for the app shell + data, plus on-demand caching for
// vocabulary photos (added gradually by Luc) so they work offline too once
// they've been viewed once on a device.
const CACHE_VERSION = 'revfr-v1';
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/csv-parser.js',
  'js/data-loader.js',
  'js/progress.js',
  'js/tts.js',
  'js/vocab.js',
  'js/conjugation.js',
  'js/grammar.js',
  'js/app.js',
  'icons/icon.svg',
  'data/vocabulaire.csv',
  'data/verbes.csv',
  'data/grammaire.csv',
  'data/grammaire_qcm.csv',
  'SaintGeorges.jfif',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Vocabulary photos: cache-first, then network, cache what we fetch.
  if (url.pathname.includes('/images/vocab/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Everything else (app shell + data): cache-first, fall back to network.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
