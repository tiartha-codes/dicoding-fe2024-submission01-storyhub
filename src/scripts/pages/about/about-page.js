import AboutPresenter from './about-presenter.js';


class AboutPage {
  #presenter = null;
  #aboutContainer = null;

  async render() {
    return `
            <section class="about-page">
                <h1>About Story Hub</h1>
                <div id="about-container">
                    <p>Memuat informasi tentang Story Hub...</p>
                </div>
            </section>
        `;
  }

  async afterRender() {
        this.#aboutContainer = document.getElementById('about-container');
        this.#presenter = new AboutPresenter({ view: this });
        this.#presenter.loadAboutInfo();
    }

    showAboutInfo(description) {
        this.#aboutContainer.innerHTML = `<p>${description}</p>`;
    }

    showLoading() {
        this.#aboutContainer.innerHTML = `<p>Memuat informasi...</p>`;
    }

    showError(message) {
        this.#aboutContainer.innerHTML = `<p class="error-message">Terjadi kesalahan: ${message}</p>`;
    }
}

export default AboutPage;
