const CACHE_NAME = 'hydro-mpsa-v11'; // Mudei versão para limpar o erro
const FILES = [
  './index.html',
  './manifest.json',
  './assets/leitor.js',   // <--- GARANTA QUE O NOME NA PASTA É EXATAMENTE ESTE
  './assets/moinho.mp4',
  './assets/peneira.mp4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos...');
        return cache.addAll(FILES);
      })
      .catch((err) => {
        console.error('[SW] ERRO CRÍTICO NO CACHE:', err);
        // O erro no console vai te dizer qual arquivo falhou se você olhar os detalhes
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
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});