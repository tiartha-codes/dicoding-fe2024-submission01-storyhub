import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/util-auth';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  /**
   * Constructor untuk menginisialisasi elemen utama aplikasi.
   * @param {Object} param0 - Objek yang berisi elemen DOM.
   * @param {HTMLElement} param0.content - Elemen utama untuk menampilkan konten halaman.
   * @param {HTMLElement} param0.navigationDrawer - Elemen drawer navigasi.
   * @param {HTMLElement} param0.drawerButton - Tombol untuk membuka/menutup drawer.
   */
  constructor({ content, navigationDrawer, drawerButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#init();
  }

  /**
   * Inisialisasi awal aplikasi.
   */
  #init() {
    this.#setupDrawer();
  }

  /**
   * Mengatur fungsi drawer navigasi (buka/tutup).
   */
  #setupDrawer() {
    // Toggle drawer saat tombol drawer diklik
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    // Tutup drawer jika pengguna mengklik di luar drawer
    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#navigationDrawer.classList.remove('open');
      }

      // Tutup drawer jika pengguna mengklik link di dalam drawer
      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  /**
   * Merender halaman berdasarkan rute aktif.
   */
  async renderPage() {
    const url = getActiveRoute(); // Mendapatkan rute aktif
    const page = routes[url]; // Mendapatkan halaman berdasarkan rute

    this.#content.innerHTML = await page.render(); // Merender konten halaman
    await page.afterRender(); // Menjalankan fungsi setelah halaman dirender
  }

  /**
   * Mengatur daftar navigasi berdasarkan status login pengguna.
   */
  #setupNavigationList() {
    const isLoggedIn = getAccessToken(); // Mengecek apakah pengguna sudah login
    const navListMain = this.#navigationDrawer.children.namedItem('navlist-main');
    const navList = this.#navigationDrawer.children.namedItem('navlist');

    // Jika pengguna belum login
    if (!isLoggedIn) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    // Jika pengguna sudah login
    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    // Menambahkan event listener untuk tombol logout
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (confirm('Are you sure to logout?')) {
        getLogout(); // Menghapus token login

        // Redirect ke halaman login
        location.hash = '/login';
      }
    });
  }

  /**
   * Merender halaman dengan transisi dan mengatur navigasi.
   */
  async renderPage() {
    const url = getActiveRoute(); // Mendapatkan rute aktif
    const route = routes[url]; // Mendapatkan rute yang sesuai

    // Mendapatkan instance halaman
    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render(); // Merender konten halaman
        page.afterRender(); // Menjalankan fungsi setelah halaman dirender
      },
    });

    // Menangani transisi halaman
    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' }); // Scroll ke atas setelah halaman dirender
      this.#setupNavigationList(); // Mengatur navigasi
    });
  }
}


