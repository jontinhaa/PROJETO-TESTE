const CACHE_NAME = 'hydro-mpsa-vFix-Final';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/leitor.js',
  'assets/moinho.mp4',
  'assets/peneira.mp4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of FILES) {
        try {
          await cache.add(file);
        } catch (e) {
          console.log('[SW] Install skip:', file);
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
  const url = new URL(event.request.url);

  // Se for MP4, usa a lógica especial
  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(tratarVideo(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request))
    );
  }
});

async function tratarVideo(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Se não tem no cache, busca na rede
  if (!cachedResponse) {
    return fetch(request);
  }

  const range = request.headers.get('range');

  // --- A CORREÇÃO ESTÁ AQUI ---
  // Se o navegador NÃO pediu fatia (Range), entrega o arquivo original INTACTO.
  // Antes eu estava lendo o blob() aqui em cima, isso travava (Lock) o arquivo.
  if (!range) {
    return cachedResponse;
  }
  // -----------------------------

  // Agora sim, se tem Range, podemos abrir o arquivo e fatiar
  const blob = await cachedResponse.blob();
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : blob.size - 1;
  
  const chunk = blob.slice(start, end + 1);

  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Content-Range': `bytes ${start}-${end}/${blob.size}`,
    'Content-Length': chunk.size,
    'Accept-Ranges': 'bytes'
  });

  return new Response(chunk, { status: 206, statusText: 'Partial Content', headers: headers });
}
