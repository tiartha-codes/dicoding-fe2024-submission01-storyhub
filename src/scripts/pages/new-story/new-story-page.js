import NewStoryPresenter from './new-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_API_KEY } from '../../config';

class NewStoryPage {
    #presenter = null;
    #descriptionInput = null;
    #photoSourceSelect = null;
    #photoInputFile = null;
    #cameraPreviewContainer = null;
    #cameraVideoElement = null;
    #captureButton = null;
    #cameraCanvasElement = null; // Canvas element
    #cameraStream = null;

    #locationCheckbox = null;
    #latInput = null;
    #lonInput = null;
    #submitButton = null;
    #messageContainer = null;
    #mapContainer = null;
    #map = null;
    #locationMarker = null;

    async render() {
        return `
            <section class="new-story-page">
                <h1>Bagikan Story Baru</h1>
                <div class="form-group">
                    <label for="description">Deskripsi:</label>
                    <textarea id="description" placeholder="Tuliskan Story Anda di sini..."></textarea>
                </div>
                <div class="form-group">
                    <label for="photo-source">Pilih Sumber Foto:</label>
                    <select id="photo-source">
                        <option value="media">Galeri/File</option>
                        <option value="camera">Kamera</option>
                    </select>
                </div>
                <div id="media-upload" class="form-group">
                    <label for="photo-file">Foto:</label>
                    <input type="file" id="photo-file" accept="image/*">
                    <small class="form-text">Format: JPG, JPEG, PNG. Ukuran maksimal 1MB.</small>
                </div>
                <div id="camera-input" class="camera-input hidden">
                    <div id="camera-preview" class="camera-preview">
                        <video id="camera-video" autoplay></video>
                    </div>
                    <button id="capture-btn" class="btn primary hidden">Ambil Foto</button>
                    <canvas id="camera-canvas" style="display:none;"></canvas>
                </div>
                <div class="form-group location-checkbox">
                    <input type="checkbox" id="location">
                    <label for="location">Tambahkan Lokasi (Opsional)</label>
                </div>
                <div class="location-inputs hidden">
                    <div id="map-container" class="map-container-new"></div>
                    <div class="form-group">
                        <label for="latitude">Latitude:</label>
                        <input type="number" id="latitude" placeholder="Contoh: -6.2088" readonly>
                    </div>
                    <div class="form-group">
                        <label for="longitude">Longitude:</label>
                        <input type="number" id="longitude" placeholder="Contoh: 106.8456" readonly>
                    </div>
                    <small class="form-text">Pilih lokasi dengan mengklik peta.</small>
                </div>
                <div class="form-group">
                    <button id="submit-new-story" class="btn primary">Bagikan</button>
                    <div id="message-container" class="message-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#descriptionInput = document.getElementById('description');
        this.#photoSourceSelect = document.getElementById('photo-source');
        this.#photoInputFile = document.getElementById('photo-file');
        this.#cameraPreviewContainer = document.getElementById('camera-preview');
        this.#cameraVideoElement = document.getElementById('camera-video');
        this.#captureButton = document.getElementById('capture-btn');
        this.#cameraCanvasElement = document.getElementById('camera-canvas');

        this.#locationCheckbox = document.getElementById('location');
        this.#latInput = document.getElementById('latitude');
        this.#lonInput = document.getElementById('longitude');
        this.#submitButton = document.getElementById('submit-new-story');
        this.#messageContainer = document.getElementById('message-container');
        this.#mapContainer = document.getElementById('map-container');

        this.#presenter = new NewStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        this.#photoSourceSelect.addEventListener('change', this.#handlePhotoSourceChange);
        this.#captureButton.addEventListener('click', this.#captureImage);
        this.#locationCheckbox.addEventListener('change', this.#toggleLocationInputs);
        this.#submitButton.addEventListener('click', this.#submitNewStory);

        this.#renderMap();
        this.#handlePhotoSourceChange(); // Initial state
    }

    #handlePhotoSourceChange = () => {
        const selectedSource = this.#photoSourceSelect.value;
        const mediaUploadDiv = document.getElementById('media-upload');
        const cameraInputDiv = document.getElementById('camera-input');

        if (selectedSource === 'media') {
            mediaUploadDiv.classList.remove('hidden');
            cameraInputDiv.classList.add('hidden');
            this.#stopCameraStream();
            this.#captureButton.classList.add('hidden');
        } else if (selectedSource === 'camera') {
            mediaUploadDiv.classList.add('hidden');
            cameraInputDiv.classList.remove('hidden');
            this.#openCamera();
            this.#captureButton.classList.remove('hidden');
        }
    };

    #openCamera = async () => {
        if (this.#cameraStream) {
            return; // Camera already open
        }
        try {
            this.#cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            this.#cameraVideoElement.srcObject = this.#cameraStream;
            // Set canvas dimensions to match video stream for capture
            this.#cameraVideoElement.addEventListener('loadedmetadata', () => {
                this.#cameraCanvasElement.width = this.#cameraVideoElement.videoWidth;
                this.#cameraCanvasElement.height = this.#cameraVideoElement.videoHeight;
            });
        } catch (error) {
            console.error('Gagal membuka kamera:', error);
            this.showMessage('Gagal membuka kamera.', true);
            this.#photoSourceSelect.value = 'media';
            this.#handlePhotoSourceChange();
        }
    };

    #stopCameraStream = () => {
        if (this.#cameraStream) {
            this.#cameraStream.getTracks().forEach(track => track.stop());
            this.#cameraVideoElement.srcObject = null;
            this.#cameraStream = null;
        }
    };

    #captureImage = () => {
        if (!this.#cameraStream) {
            this.showMessage('Kamera belum aktif.', true);
            return;
        }
        const context = this.#cameraCanvasElement.getContext('2d');
        // Draw image using video's actual dimensions
        context.drawImage(this.#cameraVideoElement, 0, 0, this.#cameraCanvasElement.width, this.#cameraCanvasElement.height);
        const imageDataURL = this.#cameraCanvasElement.toDataURL('image/png');

        // Create File object from data URL
        const byteString = atob(imageDataURL.split(',')[1]);
        const mimeString = imageDataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const capturedFile = new File([ab], 'captured_image.png', { type: mimeString });

        // Set file input with the captured image
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(capturedFile);
        this.#photoInputFile.files = dataTransfer.files;

        this.#stopCameraStream();
        this.#photoSourceSelect.value = 'media';
        this.#handlePhotoSourceChange();
        this.showMessage('Foto berhasil diambil.');
    };

    #renderMap() {
        if (!this.#mapContainer) return;

        this.#map = L.map(this.#mapContainer).setView([-2.5489, 118.0149], 5);
        L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', (e) => {
            this.#latInput.value = e.latlng.lat;
            this.#lonInput.value = e.latlng.lng;
            if (this.#locationMarker) {
                this.#map.removeLayer(this.#locationMarker);
            }
            this.#locationMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.#map);
        });
    }

    #toggleLocationInputs = () => {
        const locationInputs = document.querySelector('.location-inputs');
        locationInputs.classList.toggle('hidden');
        if (this.#locationCheckbox.checked && !this.#map) {
            this.#renderMap();
        }
    };

    #submitNewStory = async () => {
        if (!this.#descriptionInput.value.trim()) {
            this.showMessage('Deskripsi tidak boleh kosong.', true);
            return;
        }

        // Ambil file dari input file utama (bukan dari source select)
        const file = this.#photoInputFile.files[0];
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

    clearNewStoryForm() {
        this.#descriptionInput.value = '';
        this.#photoSourceSelect.value = 'media';
        this.#handlePhotoSourceChange();
        this.#photoInputFile.value = '';
        this.#stopCameraStream();
        this.#locationCheckbox.checked = false;
        document.querySelector('.location-inputs').classList.add('hidden');
        this.#latInput.value = '';
        this.#lonInput.value = '';
        this.#messageContainer.textContent = '';
        this.#messageContainer.className = 'message-container';
        if (this.#locationMarker && this.#map) {
            this.#map.removeLayer(this.#locationMarker);
            this.#locationMarker = null;
        }
        if (this.#map) {
            this.#map.setView([-2.5489, 118.0149], 5);
        }
    }

    showLoading() {
        this.#submitButton.textContent = 'Mengunggah...';
        this.#submitButton.disabled = true;
    }

    hideLoading() {
        this.#submitButton.textContent = 'Bagikan Story';
        this.#submitButton.disabled = false;
    }
}

export default NewStoryPage;