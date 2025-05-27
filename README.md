# App Starter Project with Webpack

Proyek ini adalah setup dasar untuk aplikasi web yang menggunakan webpack untuk proses bundling, Babel untuk transpile JavaScript, serta mendukung proses build dan serving aplikasi.

## Table of Contents

- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Download starter project [di sini](https://raw.githubusercontent.com/dicodingacademy/a219-web-intermediate-labs/099-shared-files/starter-project-with-webpack.zip).
2. Lakukan unzip file.
3. Pasang seluruh dependencies dengan perintah berikut.
   ```shell
   npm install
   ```

## Scripts

- Build for Production:
  ```shell
  npm run build
  ```
  Script ini menjalankan webpack dalam mode production menggunakan konfigurasi `webpack.prod.js` dan menghasilkan sejumlah file build ke direktori `dist`.

- Start Development Server:
  ```shell
  npm run start-dev
  ```
  Script ini menjalankan server pengembangan webpack dengan fitur live reload dan mode development sesuai konfigurasi di`webpack.dev.js`.

- Serve:
  ```shell
  npm run serve
  ```
  Script ini menggunakan [`http-server`](https://www.npmjs.com/package/http-server) untuk menyajikan konten dari direktori `dist`.

## Project Structure

Proyek starter ini dirancang agar kode tetap modular dan terorganisir.

```text
starter-project/
├── dist/                   # Compiled files for production
├── src/                    # Source project files
│   ├── public/             # Public files
│   ├── scripts/            # Source JavaScript files
│   │   └── index.js        # Main JavaScript entry file
│   ├── styles/             # Source CSS files
│   │   └── styles.css      # Main CSS file
│   └── index.html/         # Main HTML file
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Project metadata and dependencies
├── README.md               # Project documentation
├── STUDENT.txt             # Student information
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
└── webpack.prod.js         # Webpack production configuration
```
## Project Structure setelah di rubah
starter-project/
├── dist/                        # Hasil build production (output Webpack)
│
├── src/                         # Source project files
│   ├── public/                  # Public files (akan dicopy ke dist/)
│   │   ├── favicon.png
│   │   └── images/
│   │       ├── logo.png
│   │       ├── marker-icon.png
│   │       └── marker-shadow.png
│   │
│   ├── scripts/                 # Source JavaScript files
│   │   ├── config.js
│   │   ├── index.js             # Main JavaScript entry file
│   │   ├── templates.js
│   │   ├── data/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── app.js
│   │   │   ├── about/
│   │   │   │   ├── about-page.js
│   │   │   │   └── about-presenter.js
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login-page.js
│   │   │   │   │   └── login-presenter.js
│   │   │   │   └── register/
│   │   │   │       ├── register-page.js
│   │   │   │       └── register-presenter.js
│   │   │   ├── detail-story/
│   │   │   │   ├── detail-story-page.js
│   │   │   │   └── detail-story-presenter.js
│   │   │   ├── home/
│   │   │   │   ├── home-page.js
│   │   │   │   └── home-presenter.js
│   │   │   └── new-story/
│   │   │       ├── new-story-page.js
│   │   │       └── new-story-presenter.js
│   │   ├── routes/
│   │   │   ├── routes.js
│   │   │   └── url-parser.js
│   │   └── utils/
│   │       ├── index.js
│   │       └── util-auth.js
│   │
│   ├── styles/                  # Source CSS files
│   │   ├── about-page.css
│   │   ├── detail-story-page.css
│   │   ├── footer.css
│   │   ├── header.css
│   │   ├── home-page.css
│   │   ├── login-page.css
│   │   ├── new-story.css
│   │   ├── register-page.css
│   │   └── styles.css           # Main CSS file
│   │
│   └── index.html               # Main HTML file
│
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Lock file for npm dependencies
├── README.md                    # Project documentation
├── STUDENT.txt                  # Student information (isi data & API key)
├── webpack.common.js            # Webpack common configuration
├── webpack.dev.js               # Webpack development configuration
└── webpack.prod.js              # Webpack production configuration
