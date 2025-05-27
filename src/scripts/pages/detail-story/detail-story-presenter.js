class DetailStoryPresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async loadStoryDetail(storyId) {
        this.#view.showLoading();
        try {
            const token = this.#authModel.getAccessToken();
            if (!token) {
                this.#view.showError('Anda belum login.');
                return;
            }

            const response = await this.#model.getStoryDetail(storyId);
            console.log('DetailStoryPresenter: Respons dari getStoryDetail:', response);

            if (!response.error) {
                this.#view.showStoryDetail(response.story);
            } else {
                this.#view.showError(response.message || 'Gagal memuat detail Story.');
            }
        } catch (error) {
            console.error('DetailStoryPresenter: Terjadi kesalahan saat memuat detail Story:', error);
            this.#view.showError('Terjadi kesalahan saat memuat detail Story.');
        }
    }
}

export default DetailStoryPresenter;