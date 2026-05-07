importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// v3
firebase.initializeApp({
  apiKey: "AIzaSyBU72fIkAyAe8_RdiGmGgZo3AmvLrmKnak",
  authDomain: "udom-market-notifications.firebaseapp.com",
  projectId: "udom-market-notifications",
  storageBucket: "udom-market-notifications.firebasestorage.app",
  messagingSenderId: "771482015905",
  appId: "1:771482015905:web:e1e467f02c5cbbf86cb8e0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "New Order";
  const body  = payload.notification?.body  || "You have a new order";

   // ── Tell open app windows to show toast ──
  self.clients.matchAll({ type: "window" }).then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: "NEW_ORDER", title, body });
    });
  });

  self.registration.showNotification(title, {
    body,
    icon: "/upmarket_logo.png",
    badge: "/upmarket_logo.png",
    vibrate: [200, 100, 200, 100, 200],
    sound: "/notification.mp3",
    silent: false,
    data: {
      url: payload.data?.url || "/trader/dashboard?section=orders"
    }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/trader/dashboard?section=orders";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});