import DetailStoryPresenter from './detail-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';

class DetailStoryPage {
    #presenter = null;
    #storyDetailContainer = null;

    async render() {
        return `
            <section class="detail-story-page">
                <h1>Detail Kisah</h1>
                <div id="story-detail-container">
                    <p>Memuat detail kisah...</p>
                </div>
                <button id="back-to-home" class="btn secondary">Kembali ke Beranda</button>
            </section>
        `;
    }

    async afterRender() {
        this.#storyDetailContainer = document.getElementById('story-detail-container');
        const storyId = window.location.hash.split('/').pop(); // Mendapatkan ID dari URL hash

        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        await this.#presenter.loadStoryDetail(storyId);

        const backButton = document.getElementById('back-to-home');
        backButton.addEventListener('click', () => {
            window.location.hash = '/'; // Kembali ke halaman home
        });
    }

    showStoryDetail(story) {
        if (!story) {
            this.#storyDetailContainer.innerHTML = '<p class="error-message">Kisah tidak ditemukan.</p>';
            return;
        }

        this.#storyDetailContainer.innerHTML = `
            <div class="story-detail">
                <img src="${story.photoUrl}" alt="${story.description}">
                <div class="story-info">
                    <h3>${story.name}</h3>
                    <p class="story-description">${story.description}</p>
                    <p class="story-date">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}</p>
                    ${story.lat !== null && story.lon !== null ? `<p class="story-location">Lokasi: Latitude ${story.lat}, Longitude ${story.lon}</p>` : ''}
                </div>
            </div>
        `;
    }

    showLoading() {
        this.#storyDetailContainer.innerHTML = '<p>Memuat detail kisah...</p>';
    }

    showError(message) {
        this.#storyDetailContainer.innerHTML = `<p class="error-message">Terjadi kesalahan: ${message}</p>`;
    }
}

export default DetailStoryPage;