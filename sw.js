const CACHE_NAME = 'hydro-mpsa-v12'; // Mudei para v12 (FORÇA ATUALIZAÇÃO)
const FILES = [
  './index.html',
  './manifest.json',
  './assets/leitor.js',
  './assets/moinho.mp4',   // Garanta que está tudo minúsculo aqui
  './assets/peneira.mp4'   // Garanta que está tudo minúsculo aqui
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Baixando arquivos v12...');
        return cache.addAll(FILES);
      })
      .catch((err) => {
        // Se der erro aqui, é porque um dos arquivos da lista acima NÃO EXISTE ou está com nome errado
        console.error('[SW] ERRO CRÍTICO: Não foi possível baixar algum arquivo.', err);
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
