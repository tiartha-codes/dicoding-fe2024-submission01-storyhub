// CSS imports
import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';

// --- Kode dari service-worker.js ---
self.addEventListener('push', (event) => {
  const notificationData = event.data ? event.data.json() : { title: 'Notifikasi Baru', options: { body: 'Ada notifikasi baru.' } };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  clients.openWindow('/');
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Subscription changed:', event);
  const applicationServerPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerPublicKey
  };

  event.waitUntil(
    self.registration.pushManager.subscribe(subscribeOptions)
      .then(subscription => {
        console.log('New subscription:', subscription);
        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys.p256dh;
        const auth = subscription.keys.auth;
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          return fetch('/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ endpoint, keys: { p256dh, auth } })
          }).then(response => {
            if (!response.ok) {
              console.error('Error resubscribing:', response);
            }
            return response.json();
          }).then(data => {
            console.log('Resubscription response:', data);
          });
        } else {
          console.warn('Tidak ada token akses saat mencoba resubscribe.');
        }
      })
      .catch(err => {
        console.error('Error resubscribing:', err);
      })
  );
});
// --- Akhir kode service-worker.js ---

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    navigationDrawer: document.getElementById('navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // --- Kode dari main.js ---
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push Messaging are supported');

    navigator.serviceWorker.register('/index.js', { scope: '/' }) // Register dirinya sendiri
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);
        window.serviceWorkerRegistration = swReg;
        initializePushNotifications();
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
  } else {
    console.warn('Push messaging is not supported');
  }

  async function initializePushNotifications() {
    const applicationServerPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    const swReg = window.serviceWorkerRegistration;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      subscribeUserToPush(swReg, applicationServerPublicKey);
    } else {
      console.warn('Notification permission denied.', permission);
    }
  }

  async function subscribeUserToPush(swReg, applicationServerPublicKey) {
    const subscription = await swReg.pushManager.getSubscription();
    if (!subscription) {
      try {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: applicationServerPublicKey
        };
        const pushSubscription = await swReg.pushManager.subscribe(subscribeOptions);
        console.log('Subscribed:', JSON.stringify(pushSubscription));

        const endpoint = pushSubscription.endpoint;
        const p256dh = pushSubscription.keys.p256dh;
        const auth = pushSubscription.keys.auth;
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          const response = await fetch('/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ endpoint, keys: { p256dh, auth } })
          });
          const data = await response.json();
          console.log('Subscription response from server:', data);
        } else {
          console.warn('Tidak ada token akses saat mencoba subscribe.');
        }
      } catch (error) {
        console.error('Error subscribing user to push:', error);
      }
    } else {
      console.log('User is already subscribed.');
    }

    async function unsubscribeUserFromPush() {
      const swReg = window.serviceWorkerRegistration;
      const subscription = await swReg.pushManager.getSubscription();

      if (subscription) {
        try {
          const response = await fetch('/notifications/subscribe', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });

          const data = await response.json();
          console.log('Unsubscription response from server:', data);

          await subscription.unsubscribe();
          console.log('Successfully unsubscribed!');
        } catch (error) {
          console.error('Error unsubscribing', error);
        }
      } else {
        console.log('User is not subscribed.');
      }
    }

    // Contoh pemanggilan unsubscribe (mungkin perlu dihubungkan ke UI)
    // document.getElementById('unsubscribeButton').addEventListener('click', unsubscribeUserFromPush);
  }
  // --- Akhir kode main.js ---
});