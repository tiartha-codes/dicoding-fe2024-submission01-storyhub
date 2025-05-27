export default class LoginPresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async getLogin({ email, password }) {
        this.#view.showSubmitLoadingButton();
        console.log('LoginPresenter: getLogin dipanggil dengan email:', email);
        try {
            const response = await this.#model.getLogin({ email, password });
            console.log('LoginPresenter: Respons dari model.getLogin:', response);

            if (!response.ok || response.error) { // Periksa juga properti 'error' dari respons
                this.#view.loginFailed(response.message || 'Login gagal');
                return;
            }

            // Akses token dari response.loginResult.token
            if (response.loginResult && response.loginResult.token) {
                this.#authModel.putAccessToken(response.loginResult.token);
                console.log('LoginPresenter: Access token berhasil disimpan:', response.loginResult.token);
            } else {
                console.warn('LoginPresenter: Tidak ada token di response.loginResult:', response);
                this.#view.loginFailed('Login berhasil, tetapi token tidak ditemukan di dalam loginResult.');
                return;
            }

            this.#view.loginSuccessfully(response.message || 'Login berhasil', response.loginResult);
            console.log('LoginPresenter: Memanggil view.loginSuccessfully');

        } catch (error) {
            console.error('LoginPresenter: Terjadi kesalahan saat login:', error);
            this.#view.loginFailed(error.message || 'Terjadi kesalahan saat mencoba login. Silakan coba lagi nanti.');
        } finally {
            this.#view.hideSubmitLoadingButton();
            console.log('LoginPresenter: hideSubmitLoadingButton dipanggil');
        }
    }
}