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
            if (data.lat !== null) formData.append('lat', data.lat);
            if (data.lon !== null) formData.append('lon', data.lon);

            const response = await this.#model.addNewStory(formData);
            console.log('NewStoryPresenter: Respons dari addNewStory:', response);

            if (!response.error) {
                this.#view.showMessage('Kisah berhasil dibagikan!');
                this.#view.clearForm();
                window.location.hash = '/';
            } else {
                this.#view.showMessage(response.message || 'Gagal membagikan kisah.', true);
            }
        } catch (error) {
            console.error('NewStoryPresenter: Terjadi kesalahan saat menambahkan story:', error);
            this.#view.showMessage('Terjadi kesalahan saat mencoba membagikan kisah.', true);
        } finally {
            this.#view.hideLoading();
        }
    }
}

export default NewStoryPresenter;