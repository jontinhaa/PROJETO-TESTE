const CACHE_NAME = 'hydro-debug-v1';
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
      console.log('[SW] Iniciando cache arquivo por arquivo...');
      
      for (const file of FILES) {
        try {
          await cache.add(file);
          console.log(`%c [OK] Cacheado: ${file}`, 'color: green');
        } catch (error) {
          console.error(`%c [ERRO CRÍTICO] Falha ao baixar: ${file}`, 'color: red; font-weight: bold; font-size: 14px', error);
          // O erro aparecerá aqui especificamente
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
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
