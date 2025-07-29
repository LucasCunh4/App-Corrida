const CACHE_NAME = 'corrida-app-cache-v1';
// Lista de todos os arquivos que compõem o seu app
const urlsToCache = [
    '/',
    'index.html',
    'historico.html',
    'rankings.html',
    'graficos.html',
    'desafios.html',
    'criar-desafio.html',
    'treinador.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icon-192x192.png',
    'icon-512x512.png'
];

// Evento de instalação: abre o cache e salva nossos arquivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de "fetch": intercepta os pedidos de rede
self.addEventListener('fetch', event => {
    event.respondWith(
        // Tenta encontrar o recurso no cache primeiro
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retorna ele
                if (response) {
                    return response;
                }
                // Se não encontrar, faz o pedido à rede
                return fetch(event.request);
            })
    );
});
