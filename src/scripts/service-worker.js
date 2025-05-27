// service-worker.js

self.addEventListener('push', (event) => {
  const notificationData = event.data ? event.data.json() : { title: 'Notifikasi Baru', options: { body: 'Ada notifikasi baru.' } };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Tambahkan logika untuk membuka aplikasi atau halaman terkait notifikasi jika diperlukan
  clients.openWindow('/'); // Contoh: Buka halaman utama saat notifikasi diklik
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Subscription changed:', event);
  // Di sini Anda perlu mengirim ulang subscription baru ke server Anda
  const applicationServerPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerPublicKey
  };

  event.waitUntil(
    self.registration.pushManager.subscribe(subscribeOptions)
      .then(subscription => {
        console.log('New subscription:', subscription);
        // Kirim subscription baru ini ke server Anda (gunakan fungsi subscribeNotification di api.js)
        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys.p256dh;
        const auth = subscription.keys.auth;
        // Anda perlu memiliki cara untuk mendapatkan token pengguna saat ini di sini
        // Misalnya, dari localStorage atau state manajemen
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          return fetch('/notifications/subscribe', { // Sesuaikan URL jika perlu
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