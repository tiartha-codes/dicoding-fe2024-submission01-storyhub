export default class RegisterPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        console.log('Model instance in RegisterPresenter:', model); // Debugging
        this.#view = view;
        this.#model = model;
    }

    /**
     * Fungsi untuk menangani proses registrasi.
     * @param {Object} param0 - Objek yang berisi data registrasi (name, email, password).
     */
    async getRegistered({ name, email, password }) {
        this.#view.showSubmitLoadingButton(); // Menampilkan tombol loading saat proses registrasi dimulai.
        try {
            // Memanggil API untuk registrasi pengguna baru.
            const response = await this.#model.getRegistered({ name, email, password });

            // Jika respons tidak OK, tampilkan pesan error ke pengguna.
            if (!response.ok) {
                console.error('getRegistered: response:', response);
                this.#view.registeredFailed(response.message);
                return;
            }

            // Jika registrasi berhasil, tampilkan pesan sukses.
            this.#view.registeredSuccessfully(response.message, response.data);
        } catch (error) {
            // Tangani error jika terjadi masalah selama proses registrasi.
            console.error('getRegistered: error:', error);
            this.#view.registeredFailed(error.message);
        } finally {
            // Sembunyikan tombol loading setelah proses selesai.
            this.#view.hideSubmitLoadingButton();
        }
    }
}
