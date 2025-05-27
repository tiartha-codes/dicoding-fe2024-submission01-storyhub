import NewStoryPresenter from './new-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';

class NewStoryPage {
    #presenter = null;
    #descriptionInput = null;
    #photoInput = null;
    #locationCheckbox = null;
    #latInput = null;
    #lonInput = null;
    #submitButton = null;
    #messageContainer = null;

    async render() {
        return `
            <section class="new-story-page">
                <h1>Buat Kisah Baru</h1>
                <div class="form-container">
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
                        <button id="submit-new-story" class="btn primary">Bagikan Kisah</button>
                        <div id="message-container" class="message-container"></div>
                    </div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#descriptionInput = document.getElementById('description');
        this.#photoInput = document.getElementById('photo');
        this.#locationCheckbox = document.getElementById('location');
        this.#latInput = document.getElementById('latitude');
        this.#lonInput = document.getElementById('longitude');
        this.#submitButton = document.getElementById('submit-new-story');
        this.#messageContainer = document.getElementById('message-container');

        this.#presenter = new NewStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        this.#locationCheckbox.addEventListener('change', this.#toggleLocationInputs);
        this.#submitButton.addEventListener('click', this.#submitNewStory);
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

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Format foto yang didukung adalah JPG, JPEG, dan PNG.', true);
            return;
        }

        // Validasi ukuran file
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

        this.#presenter.addNewStory(data);
    };

    showMessage(message, isError = false) {
        this.#messageContainer.textContent = message;
        this.#messageContainer.className = `message-container ${isError ? 'error' : 'success'}`;
    }

    clearForm() {
        this.#descriptionInput.value = '';
        this.#photoInput.value = '';
        this.#locationCheckbox.checked = false;
        document.querySelector('.location-inputs').classList.add('hidden');
        this.#latInput.value = '';
        this.#lonInput.value = '';
        this.#messageContainer.textContent = '';
        this.#messageContainer.className = 'message-container';
    }

    showLoading() {
        this.#submitButton.textContent = 'Mengunggah...';
        this.#submitButton.disabled = true;
    }

    hideLoading() {
        this.#submitButton.textContent = 'Bagikan Kisah';
        this.#submitButton.disabled = false;
    }
}

export default NewStoryPage;