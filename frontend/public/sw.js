// LiraQuest - Service Worker Oficial para Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '🔔 Alerta LiraQuest', body: event.data.text() };
    }
  }

  const title = data.title || '⚔️ LiraQuest — Alerta do Reino';
  const options = {
    body: data.body || 'Aviso da família recebido!',
    icon: data.icon || '/assets/favicon.ico',
    badge: data.badge || '/assets/favicon.ico',
    tag: data.tag || 'liraquest-clan-alert',
    data: {
      url: data.url || '/#saude',
    },
    vibrate: [200, 100, 200, 100, 300],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/#saude';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
