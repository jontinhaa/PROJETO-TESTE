const CACHE_NAME = 'hydro-mpsa-vFinal';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/leitor.js',
  './assets/moinho.mp4',
  './assets/peneira.mp4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Estratégia "Um por Um" (Mais robusta)
      for (const file of FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.error('[SW] Falha ao cachear:', file, error);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se achou no cache, retorna
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não achou, busca na rede
      return fetch(event.request);
    })
  );
});
