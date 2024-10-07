self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'https://placehold.co/100x100', // Add your app icon path here
      badge: 'https://placehold.co/100x100', // Add your badge icon path here
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      self.clients.openWindow('http://localhost:5173/admin')
    );
  });
