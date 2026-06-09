self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (!data) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/favicon.svg',
      badge: data.badge ?? '/favicon.svg',
      data: data.data,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.orderId
    ? `/customer/orders/${event.notification.data.orderId}`
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => {
        if (!client.url) return false;
        const clientUrl = new URL(client.url);
        return clientUrl.pathname === url;
      });
      if (matchingClient) {
        return matchingClient.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
