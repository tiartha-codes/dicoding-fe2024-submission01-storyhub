import HomePresenter from './home-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';

class HomePage {
    #presenter = null;
    #storyListContainer = null;
    #newStoryFormContainer = null;
    #descriptionInput = null;
    #photoInput = null;
    #locationCheckbox = null;
    #latInput = null;
    #lonInput = null;
    #submitButton = null;
    #messageContainer = null;

    async render() {
        return `
            <section class="home-page">
               
                <div class="new-story-form-container">
                    <h2>Bagikan Kisah Baru</h2>
                    <div class="form-group">
                        <label for="description">Deskripsi:</label>
                        <textarea id="description" placeholder="Tuliskan kisah Anda di sini..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="photo">Foto:</label>
                        <input type="file" id="photo" accept="image/jpeg, image/jpg, image/png">
                        <small class="form-text">Format: JPG, JPEG, PNG. Ukuran maksimal 1MB.</small>
                    </div>
                    <div class="form-group location-checkbox">
                        <input type="checkbox" id="location">
                        <label for="location">Tambahkan Lokasi (Opsional)</label>
                    </div>
                    <div class="location-inputs hidden">
                        <div class="form-group">
                            <label for="latitude">Latitude:</label>
                            <input type="number" id="latitude" placeholder="Contoh: -6.2088">
                        </div>
                        <div class="form-group">
                            <label for="longitude">Longitude:</label>
                            <input type="number" id="longitude" placeholder="Contoh: 106.8456">
                        </div>
                    </div>
                    <div class="form-group">
                        <button id="submit-new-story" class="btn primary">Bagikan</button>
                        <div id="message-container" class="message-container"></div>
                    </div>
                </div>

                <h1>Kisah Terbaru</h1>
                <div id="story-list-container" class="story-list">
                    <p>Memuat kisah terbaru...</p>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#storyListContainer = document.getElementById('story-list-container');
        this.#newStoryFormContainer = document.querySelector('.new-story-form-container');
        this.#descriptionInput = document.getElementById('description');
        this.#photoInput = document.getElementById('photo');
        this.#locationCheckbox = document.getElementById('location');
        this.#latInput = document.getElementById('latitude');
        this.#lonInput = document.getElementById('longitude');
        this.#submitButton = document.getElementById('submit-new-story');
        this.#messageContainer = document.getElementById('message-container');

        this.#presenter = new HomePresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        this.#locationCheckbox.addEventListener('change', this.#toggleLocationInputs);
        this.#submitButton.addEventListener('click', this.#submitNewStory);

        await this.#presenter.loadStories();
    }

    #toggleLocationInputs = () => {
        const locationInputs = document.querySelector('.location-inputs');
        locationInputs.classList.toggle('hidden');
    };

    #submitNewStory = async () => {
        if (!this.#descriptionInput.value.trim()) {
            this.showMessage('Deskripsi tidak boleh kosong.', true);
            return;
        }

        const file = this.#photoInput.files[0];
        if (!file) {
            this.showMessage('Foto harus diunggah.', true);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Format foto yang didukung adalah JPG, JPEG, dan PNG.', true);
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            this.showMessage('Ukuran foto maksimal 1MB.', true);
            return;
        }

        const data = {
            description: this.#descriptionInput.value,
            photo: file,
            lat: this.#locationCheckbox.checked ? parseFloat(this.#latInput.value) || null : null,
            lon: this.#locationCheckbox.checked ? parseFloat(this.#lonInput.value) || null : null,
        };

        await this.#presenter.addNewStory(data); // Panggil fungsi addNewStory di presenter
    };

    showStories(stories) {
        if (!stories || stories.length === 0) {
            this.#storyListContainer.innerHTML = '<p>Belum ada kisah terbaru.</p>';
            return;
        }

        this.#storyListContainer.innerHTML = '';
        stories.forEach(story => {
            const storyItem = document.createElement('div');
            storyItem.classList.add('story-item');
            storyItem.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}">
                <div class="story-info">
                    <h3>${story.name}</h3>
                    <p class="story-description">${story.description}</p>
                    <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
                </div>
            `;
            storyItem.addEventListener('click', () => {
                window.location.hash = `/detail/${story.id}`;
            });
            storyItem.style.cursor = 'pointer'; // Tambahkan cursor pointer untuk indikasi bisa diklik
            this.#storyListContainer.appendChild(storyItem);
        });
    }


    showLoadingStories() {
        this.#storyListContainer.innerHTML = '<p>Memuat kisah terbaru...</p>';
    }

    showErrorStories(message) {
        this.#storyListContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat kisah: ${message}</p>`;
    }

    showMessage(message, isError = false) {
        this.#messageContainer.textContent = message;
        this.#messageContainer.className = `message-container ${isError ? 'error' : 'success'}`;
    }

    clearNewStoryForm() {
        this.#descriptionInput.value = '';
        this.#photoInput.value = '';
        this.#locationCheckbox.checked = false;
        document.querySelector('.location-inputs').classList.add('hidden');
        this.#latInput.value = '';
        this.#lonInput.value = '';
        this.#messageContainer.textContent = '';
        this.#messageContainer.className = 'message-container';
    }

    showLoadingNewStory() {
        this.#submitButton.textContent = 'Mengunggah...';
        this.#submitButton.disabled = true;
    }

    hideLoadingNewStory() {
        this.#submitButton.textContent = 'Bagikan';
        this.#submitButton.disabled = false;
    }
}

export default HomePage;