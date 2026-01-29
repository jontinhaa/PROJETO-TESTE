const CACHE_NAME = 'hydro-pro-v1'; // Sincronizado com o index.html
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/leitor.js',
  'assets/moinho.mp4',
  'assets/peneira.mp4'
];

// 1. INSTALAÇÃO (Cache Inicial)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tenta baixar arquivos core. Se falhar, não trava a instalação.
      // O download real e pesado é feito pelo botão no index.html
      CORE_FILES.forEach(file => cache.add(file).catch(err => console.log('SW Skip:', file)));
    })
  );
});

// 2. ATIVAÇÃO (Limpeza)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
  return self.clients.claim();
});

// 3. INTERCEPTAÇÃO (A Mágica do Vídeo)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Lógica Específica para Vídeos MP4 (Range Requests)
  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(servirVideoFatiado(event.request));
  } else {
    // Padrão para HTML/JS/CSS
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request))
    );
  }
});

// FUNÇÃO TÉCNICA: Serve vídeo fatiado do cache para satisfazer o player do Android
async function servirVideoFatiado(request) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(request);

  // Se não tem no cache, tenta rede
  if (!response) return fetch(request);

  const range = request.headers.get('range');
  
  // SE NÃO TEM RANGE (Browser pediu tudo): Entrega direto.
  // IMPORTANTE: Não ler o blob() aqui para não travar o corpo da resposta.
  if (!range) return response;

  // SE TEM RANGE (Browser pediu fatia):
  const blob = await response.blob();
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : blob.size - 1;
  
  // Fatiamento binário
  const chunk = blob.slice(start, end + 1);

  // Cabeçalhos HTTP 206 (Conteúdo Parcial)
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Content-Range': `bytes ${start}-${end}/${blob.size}`,
    'Content-Length': chunk.size,
    'Accept-Ranges': 'bytes'
  });

  return new Response(chunk, { status: 206, statusText: 'Partial Content', headers: headers });
}
