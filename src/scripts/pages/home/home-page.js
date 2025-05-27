import HomePresenter from './home-presenter.js';
import * as StoryHubAPI from '../../data/api.js';
import { getAccessToken } from '../../utils/util-auth.js';
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { MAP_API_KEY } from '../../config'; // Asumsi API key ada di config

class HomePage {
    #presenter = null;
    #storyListContainer = null;
    #mapContainer = null; // Container untuk peta
    #map = null;

    async render() {
        return `
            <section class="home-page">
                <div id="map-container" class="map-container"></div>
                <h1>Story Terbaru</h1>
                <div id="story-list-container" class="story-list">
                    <p>Memuat story terbaru...</p>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#storyListContainer = document.getElementById('story-list-container');
        this.#mapContainer = document.getElementById('map-container');
        this.#presenter = new HomePresenter({
            view: this,
            model: StoryHubAPI,
            authModel: { getAccessToken },
        });

        await this.#presenter.loadStories();
    }

    showStories(stories) {
        if (!stories || stories.length === 0) {
            this.#storyListContainer.innerHTML = '<p>Belum ada story terbaru.</p>';
            if (this.#map) {
                this.#map.remove();
                this.#map = null;
            }
            return;
        }

        this.#storyListContainer.innerHTML = '';
        this.#renderMap(stories); // Render peta dengan lokasi stories

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
            storyItem.style.cursor = 'pointer';
            this.#storyListContainer.appendChild(storyItem);
        });
    }

    #renderMap(stories) {
        if (!this.#mapContainer) return;

        if (!this.#map) {
            this.#map = L.map(this.#mapContainer).setView([-2.5489, 118.0149], 5); // Set initial view ke Indonesia
            L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
        } else {
            this.#map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.#map.removeLayer(layer);
                }
            });
        }

        stories.forEach(story => {
            if (story.lat !== null && story.lon !== null) {
                const marker = L.marker([story.lat, story.lon]).addTo(this.#map);
                marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
            }
        });
    }

    showLoadingStories() {
        this.#storyListContainer.innerHTML = '<p>Memuat Story terbaru...</p>';
        if (this.#mapContainer) this.#mapContainer.innerHTML = '<p>Memuat peta...</p>';
    }

    showErrorStories(message) {
        this.#storyListContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat Story: ${message}</p>`;
        if (this.#mapContainer) this.#mapContainer.innerHTML = `<p class="error-message">Terjadi kesalahan memuat peta.</p>`;
    }
}

export default HomePage;