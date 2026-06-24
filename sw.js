const CACHE_NAME = 'ion-radio-v2.7';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=JetBrains+Mono&family=Oswald:wght@500&display=swap'
];

// Instalacja i cache'owanie zasobów aplikacji (App Shell)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // Wymusza aktywację nowej wersji od razu
  );
});

// Czyszczenie starego cache podczas aktywacji nowej wersji
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia obsługi żądań sieciowych
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Bezpieczeństwo: Omijaj cache dla zewnętrznych strumieni audio (np. http, icecast, shoutcast)
  // Przeglądarki mobilne wymagają bezpośredniego dostępu sieciowego dla tagów <audio>
  if (e.request.destination === 'audio' || e.request.headers.get('Range') || url.pathname.endsWith('.mp3') || url.port === '8005') {
    return; // Pozwól przeglądarce obsłużyć to domyślnie przez sieć
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // Zwróć z cache, jeśli istnieje, w przeciwnym razie pobierz z sieci
      return cachedResponse || fetch(e.request);
    })
  );
});
