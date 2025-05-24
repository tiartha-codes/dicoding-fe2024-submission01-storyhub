export default class LoginPresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        console.log('View instance in LoginPresenter:', view); // Debugging
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async getLogin({ email, password }) {
        console.log('View instance:', this.#view); // Debugging
        this.#view.showSubmitLoadingButton(); // Menampilkan tombol loading saat proses login dimulai.
        try {
            const response = await this.#model.getLogin({ email, password }); // Memanggil API login.

            if (!response.ok) {
                console.error('getLogin response error:', response); // Log error jika respons tidak OK.
                this.#view.loginFailed(response.message); // Menampilkan pesan error ke pengguna.
                return;
            }

            // Menyimpan token akses ke authModel dan menampilkan pesan sukses.
            this.#authModel.putAccessToken(response.data.accessToken);
            this.#view.loginSuccessfully(response.message, response.data);
            
        } catch (error) {
            console.error('getLogin error:', error); // Log error jika terjadi masalah saat login.
            this.#view.loginFailed('An error occurred while logging in. Please try again later.'); // Menampilkan pesan error generik.
        } finally {
            this.#view.hideSubmitLoadingButton(); // Menyembunyikan tombol loading setelah proses selesai.
        }
    }
}