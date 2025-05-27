import DetailStoryPresenter from './detail-story-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_API_KEY } from '../../config';

class DetailStoryPage {
    #presenter = null;
    #storyDetailContainer = null;
    #mapContainer = null;
    #map = null;

    async render() {
        return `
            <section class="detail-story-page">
                <h1>Story</h1>
                <div id="map-container" class="map-container"></div>
                <div id="story-detail-container">
                    <p>Memuat detail Story...</p>
                </div>
                <button id="back-to-home" class="btn secondary">Kembali ke Beranda</button>
            </section>
        `;
    }

    async afterRender() {
        this.#storyDetailContainer = document.getElementById('story-detail-container');
        this.#mapContainer = document.getElementById('map-container');
        const storyId = window.location.hash.split('/').pop();

        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        await this.#presenter.loadStoryDetail(storyId);

        const backButton = document.getElementById('back-to-home');
        backButton.addEventListener('click', () => {
            window.location.hash = '/';
        });
    }

    showStoryDetail(story) {
        if (!story) {
            this.#storyDetailContainer.innerHTML = '<p class="error-message">Story tidak ditemukan.</p>';
            if (this.#map) {
                this.#map.remove();
                this.#map = null;
            }
            return;
        }

        this.#storyDetailContainer.innerHTML = `
            <div class="story-detail">
                <h1>Story ${story.name}</h1>
                <img src="${story.photoUrl}" alt="${story.description}">
                <div class="story-info">
                    <p class="story-date">Dibuat pada: ${new Date(story.createdAt).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    <p class="story-description">${story.description}</p>
                    ${story.lat !== null && story.lon !== null ? `
                        <div class="story-location-group">
                            <span class="story-location-label">Latitude</span>
                            <span class="story-location-value">${story.lat}</span><br>
                            <span class="story-location-label">Longitude</span>
                            <span class="story-location-value">${story.lon}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        this.#renderMap(story);
    }

    #renderMap(story) {
        if (!this.#mapContainer || story.lat === null || story.lon === null) return;

        if (!this.#map) {
            this.#map = L.map(this.#mapContainer).setView([story.lat, story.lon], 12);
            L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
        } else {
            this.#map.setView([story.lat, story.lon], 12);
            this.#map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.#map.removeLayer(layer);
                }
            });
        }

        L.marker([story.lat, story.lon]).addTo(this.#map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`)
            .openPopup();
    }

    showLoading() {
        this.#storyDetailContainer.innerHTML = '<p>Memuat detail Story...</p>';
        if (this.#mapContainer) this.#mapContainer.innerHTML = '<p>Memuat peta...</p>';
    }

    showError(message) {
        this.#storyDetailContainer.innerHTML = `<p class="error-message">Terjadi kesalahan: ${message}</p>`;
        if (this.#mapContainer) this.#mapContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat peta.</p>`;
    }
}

export default DetailStoryPage;