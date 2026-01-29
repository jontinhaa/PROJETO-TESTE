const CACHE_NAME = 'hydro-mpsa-vFinal-Range';
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
      // Baixa um por um para garantir
      for (const file of FILES) {
        try {
          await cache.add(file);
        } catch (e) {
          console.error('[SW] Erro no install:', file, e);
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

// A MÁGICA ACONTECE AQUI: Tratamento de Range Request (Vídeos)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Se for arquivo de vídeo (.mp4), usamos a lógica especial
  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(tratarVideo(event.request));
  } else {
    // Para o resto (HTML, JS, Imagens), usa o padrão
    event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request))
    );
  }
});

// Função que fatia o vídeo do cache
async function tratarVideo(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Se não tem no cache, tenta baixar da rede
  if (!cachedResponse) {
    return fetch(request);
  }

  // Se tem no cache, vamos fatiar!
  const blob = await cachedResponse.blob();
  const range = request.headers.get('range');

  // Se o navegador não pediu fatia (Range), entrega tudo
  if (!range) {
    return cachedResponse;
  }

  // Calcula os bytes que o navegador pediu
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : blob.size - 1;
  
  // Corta o arquivo
  const chunk = blob.slice(start, end + 1);

  // Cria a resposta 206 (Partial Content)
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Content-Range': `bytes ${start}-${end}/${blob.size}`,
    'Content-Length': chunk.size,
    'Accept-Ranges': 'bytes'
  });

  return new Response(chunk, { status: 206, statusText: 'Partial Content', headers: headers });
}
