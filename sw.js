const CACHE_NAME = 'tg-web-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Установка и кэширование базовых файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Перехват запросов (работа в оффлайне для загруженных частей)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 🔔 Обработка PUSH-уведомлений (звонки и сообщения)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Входящий вызов';
  const options = {
    body: data.body || 'Вам кто-то звонит...',
    icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'call-notification',
    requireInteraction: true, // Уведомление не исчезнет, пока не нажмут
    actions: [
      { action: 'accept', title: '📞 Ответить' },
      { action: 'decline', title: '📵 Сбросить' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Реакция на клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
