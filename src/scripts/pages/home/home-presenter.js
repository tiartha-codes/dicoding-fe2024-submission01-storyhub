class HomePresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async loadStories() {
        this.#view.showLoadingStories();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showErrorStories('Anda belum login.');
                return;
            }

            const response = await this.#model.getAllStories(1, 10);
            console.log('HomePresenter: Respons dari getAllStories:', response);

            if (!response.error) {
                this.#view.showStories(response.listStory);
            } else {
                this.#view.showErrorStories(response.message || 'Gagal memuat kisah terbaru.');
            }
        } catch (error) {
            console.error('HomePresenter: Terjadi kesalahan saat memuat stories:', error);
            this.#view.showErrorStories('Terjadi kesalahan saat memuat kisah terbaru.');
        }
    }

    async addNewStory(data) {
        this.#view.showLoadingNewStory();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showMessage('Anda belum login.', true);
                return;
            }

            // Di home-presenter.js sebelum pemanggilan this.#model.addNewStory
            const formData = new FormData();
            formData.append('description', data.description);
            formData.append('photo', data.photo);
            if (data.lat !== null) formData.append('lat', data.lat);
            if (data.lon !== null) formData.append('lon', data.lon);

            console.log('Data yang akan dikirim (dari presenter):', {
                description: data.description,
                photo: data.photo ? { name: data.photo.name, size: data.photo.size, type: data.photo.type } : null,
                lat: data.lat,
                lon: data.lon,
            });

            // Log isi FormData (hati-hati dengan data biner yang mungkin tidak terbaca)
            for (const pair of formData.entries()) {
                console.log('FormData Entry:', pair[0], pair[1]);
            }

            const response = await this.#model.addNewStory(formData);

            if (!response.error) {
                this.#view.showMessage('Kisah berhasil dibagikan!');
                this.#view.clearNewStoryForm();
                await this.loadStories(); // Muat ulang daftar cerita setelah berhasil

                // Kode simulasi pengiriman notifikasi dari klien (TIDAK DISARANKAN UNTUK PRODUKSI)
                if ('serviceWorker' in navigator && window.serviceWorkerRegistration) {
                    const notificationData = {
                        title: 'Story berhasil dibuat',
                        options: {
                            body: `Anda telah membuat story baru dengan deskripsi: ${data.description}`
                        }
                    };
                    window.serviceWorkerRegistration.showNotification(notificationData.title, notificationData.options);
                }

            } else {
                this.#view.showMessage(response.message || 'Gagal membagikan kisah.', true);
            }
        } catch (error) {
            console.error('HomePresenter: Terjadi kesalahan saat menambahkan story:', error);
            this.#view.showMessage('Terjadi kesalahan saat mencoba membagikan kisah.', true);
        } finally {
            this.#view.hideLoadingNewStory();
        }
    }
}

export default HomePresenter;