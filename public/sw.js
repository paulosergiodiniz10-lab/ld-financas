self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  return self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  // Passar na validação de PWA
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
