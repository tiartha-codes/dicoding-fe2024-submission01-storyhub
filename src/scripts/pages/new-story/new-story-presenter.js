class NewStoryPresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async addNewStory(data) {
        this.#view.showLoading();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showMessage('Anda belum login.', true);
                return;
            }

            const formData = new FormData();
            formData.append('description', data.description);
            formData.append('photo', data.photo);
            // Hanya kirim lat/lon jika benar-benar angka
            if (typeof data.lat === 'number' && !isNaN(data.lat)) formData.append('lat', data.lat);
            if (typeof data.lon === 'number' && !isNaN(data.lon)) formData.append('lon', data.lon);

            const response = await this.#model.addNewStory(formData);
            console.log('NewStoryPresenter: Respons dari addNewStory:', response);

            if (!response.error) {
                this.#view.showMessage('Story berhasil dibagikan!');
                if (typeof this.#view.clearNewStoryForm === 'function') {
                    this.#view.clearNewStoryForm();
                } else if (typeof this.#view.clearForm === 'function') {
                    this.#view.clearForm();
                }
                window.location.hash = '/';
            } else {
                this.#view.showMessage(response.message || 'Gagal membagikan Story.', true);
            }
        } catch (error) {
            console.error('NewStoryPresenter: Terjadi kesalahan saat menambahkan story:', error);
            this.#view.showMessage('Terjadi kesalahan saat mencoba membagikan Story.', true);
        } finally {
            this.#view.hideLoading();
        }
    }
}

export default NewStoryPresenter;