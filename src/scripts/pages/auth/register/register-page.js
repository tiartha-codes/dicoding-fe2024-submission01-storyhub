import RegisterPresenter from './register-presenter.js';
import * as StoryHubAPI from '../../../data/api.js';

export default class RegisterPage {
    #presenter = null;

        async render() {
        return `
        <section class="register-container">
        <div class="register-form-container">
          <h1 class="register__title">Daftar akun</h1>

          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="name-input" class="register-form__name-title">Nama Lengkap</label>

              <div class="register-form__title-container">
                <input id="name-input" type="text" name="name" placeholder="Your Name">
              </div>
            </div>
            <div class="form-control">
              <label for="email-input" class="register-form__email-title">Email</label>

              <div class="register-form__title-container">
                <input id="email-input" type="email" name="email" placeholder="Ex.: nama@email.com">
              </div>
            </div>
            <div class="form-control">
              <label for="password-input" class="register-form__password-title">Password</label>

              <div class="register-form__title-container">
                <input id="password-input" type="password" name="password" placeholder="New Password">
              </div>
            </div>
            <div class="form-buttons register-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Daftar</button>
              </div>
              <p class="register-form__already-have-account">Apakah anda sudah memiliki akun? <a href="#/login">Login</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
    }

      async afterRender() {
        this.#presenter = new RegisterPresenter({
            view: this,
            model: StoryHubAPI,
        });

        this.#setupForm();
    }

    /**
     * Fungsi untuk mengatur event listener pada form register.
     */
    #setupForm() {
        document.getElementById('register-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                name: document.getElementById('name-input').value,
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value,
            };

            await this.#presenter.getRegistered(data);
        });
    }


    registeredSuccessfully(message) {
        console.log(message);

        // Redirect to login page after successful registration
        location.hash = '/login';
    }

    /**
     * Fungsi yang dijalankan jika registrasi gagal.
     * @param {string} message - Pesan error.
     */
    registeredFailed(message) {
        alert(message);
    }

    /**
     * Menampilkan tombol loading saat proses registrasi dimulai.
     */
    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="fas fa-spinner loader-button"></i>Register account
            </button>
        `;
    }

    /**
     * Mengembalikan tombol ke keadaan semula setelah proses registrasi selesai.
     */
    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Register account</button>
        `;
    }
}