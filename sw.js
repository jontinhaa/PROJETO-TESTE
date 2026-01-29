const CACHE_NAME = 'hydro-shell-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/leitor.js'
  // NÃO COLOCAR VÍDEOS AQUI. ELES VÃO PRO INDEXEDDB.
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))
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
  // Simples: se tem no cache, entrega. Se não, busca na rede.
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
