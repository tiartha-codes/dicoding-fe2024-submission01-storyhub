// main.js atau file inisialisasi

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push Messaging are supported');

  navigator.serviceWorker.register('/service-worker.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);
      // Simpan swReg untuk digunakan nanti
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

      // Kirim subscription ke server Anda
      const endpoint = pushSubscription.endpoint;
      const p256dh = pushSubscription.keys.p256dh;
      const auth = pushSubscription.keys.auth;
      const accessToken = localStorage.getItem('accessToken'); // Pastikan Anda memiliki cara yang benar untuk mendapatkan token

      if (accessToken) {
        const response = await fetch('/notifications/subscribe', { // Sesuaikan URL jika perlu
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
    } catch (err) {
      console.error('Failed to subscribe the user: ', err);
    }
  } else {
    console.log('User is already subscribed.');
  }
}

// Fungsi untuk berhenti berlangganan (unsubscribe)
async function unsubscribeUserFromPush() {
  const swReg = window.serviceWorkerRegistration;
  const subscription = await swReg.pushManager.getSubscription();

  if (subscription) {
    try {
      const response = await fetch('/notifications/subscribe', { // Gunakan endpoint unsubscribe
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Pastikan token tersedia
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

// Anda mungkin ingin memanggil unsubscribeUserFromPush() di suatu tempat
// misalnya, saat pengguna logout atau di pengaturan notifikasi.