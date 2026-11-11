<div align="center">

  <img src="https://raw.githubusercontent.com/DzuI22/Gravity-Tune/main/public/logo.png" width="160" height="160" alt="GravityTune Logo" style="border-radius: 24%">

  <h1>GravityTune</h1>

  <p align="center">
    <a href="README.md">
      <img src="https://img.shields.io/badge/🇮🇩%20Bahasa%20Indonesia-d1e289?style=for-the-badge&labelColor=131211&color=d1e289" />
    </a>
    <a href="README.md">
      <img src="https://img.shields.io/badge/🇺🇸%20English-d1e289?style=for-the-badge&labelColor=131211&color=d1e289" />
    </a>
  </p>

  <p align="center">
    <strong>Redefining the YouTube Music Experience on Web, PWA & Mobile.</strong>
    <br />
    <em>High-performance, privacy-focused, zero ads, and packed with audiophile features for people who truly care about their music.</em>
  </p>

  <p align="center">
    <a href="https://gravity-tune-three.vercel.app/"><b>Live Web App</b></a> •
    <a href="#features"><b>Features</b></a> •
    <a href="#installation--running"><b>Installation</b></a> •
    <a href="#ui-modes"><b>UI Modes</b></a> •
    <a href="https://github.com/DzuI22/Gravity-Tune/issues"><b>Support & Issues</b></a>
  </p>

  <div align="center">
    <img src="https://img.shields.io/badge/Version-v2.5.0-d1e289?style=for-the-badge&labelColor=131211&logo=vercel" alt="Version" />
    <img src="https://img.shields.io/badge/License-MIT-d1e289?style=for-the-badge&labelColor=131211" alt="License" />
    <img src="https://img.shields.io/badge/Stack-Next.js%2014-black?style=for-the-badge&labelColor=131211&logo=nextdotjs" alt="Next.js" />
    <img src="https://img.shields.io/badge/Engine-YouTube%20InnerTube-red?style=for-the-badge&labelColor=131211&logo=youtube" alt="YouTube Music" />
    <img src="https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&labelColor=131211&logo=pwa" alt="PWA" />
  </div>

</div>

<hr />

> [!NOTE]
> **GravityTune** adalah platform pemutar musik YouTube Music mutakhir yang dirancang sebagai Progressive Web Application (PWA) berkecepatan tinggi dengan estetika desain modern, privasi total tanpa pelacak, bebas iklan, dan kualitas streaming Ultra HD. Terinspirasi dari pengalaman UI mobile terbaik yang dioptimalkan untuk Smartphone Android/iOS maupun Desktop Browser.

---

## ✨ Features

<div align="center" id="features">

<table>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎵 Playback &amp; Streaming</h3>
        <ul>
          <li><strong>Ad-Free Playback:</strong> Pemutaran tanpa gangguan iklan dan background listening di HP.</li>
          <li><strong>InnerTube Engine:</strong> Akses penuh jutaan katalog lagu, artis, dan album resmi YouTube Music tanpa batasan.</li>
          <li><strong>Ultra HD Artwork Engine:</strong> Peningkatan otomatis seluruh thumbnail &amp; cover lagu menjadi 800×800 Ultra HD.</li>
          <li><strong>Offline Favorites:</strong> Simpan daftar lagu favorit langsung ke penyimpanan lokal perangkat secara privat.</li>
          <li><strong>Auto Sleep Timer:</strong> Pengatur waktu tidur cerdas (15m, 30m, 45m, 60m).</li>
        </ul>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🔊 Audio &amp; Performance</h3>
        <ul>
          <li><strong>High-Bitrate Audio Stream:</strong> Ekstraksi audio jernih (Opus / AAC 256kbps).</li>
          <li><strong>Audio Quality Selector:</strong> Pilihan kualitas High Audio, Normal, dan Data Saver.</li>
          <li><strong>Crossfade &amp; Gapless Logic:</strong> Pemutaran lagu berkesinambungan tanpa hening.</li>
          <li><strong>MediaSession API:</strong> Sinkronisasi kontrol pemutaran di Lock Screen HP, Dynamic Island, dan tombol media keyboard.</li>
          <li><strong>Super Fast PWA:</strong> Ukuran ringan, caching pintar, dan dapat diinstal langsung ke Homescreen.</li>
        </ul>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎤 Live Lyrics &amp; Discovery</h3>
        <ul>
          <li><strong>Live Synced Karaoke Lyrics:</strong> Lirik otomatis berjalan real-time dengan efek blur fokus interaktif via LRCLIB &amp; YouTube.</li>
          <li><strong>Curated Artist Showcase:</strong> Barisan foto asli resolusi tinggi dari puluhan musisi Indonesia, Internasional, dan K-Pop.</li>
          <li><strong>Instant Search &amp; Explore:</strong> Pencarian cepat dengan auto-complete dan filter kategori lagu/artis.</li>
          <li><strong>Listening Stats:</strong> Riwayat dan statistik lagu yang paling sering Anda dengarkan.</li>
        </ul>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎨 Interface &amp; Customization</h3>
        <ul>
          <li><strong>3 Dedicated Player Modes:</strong> Mode Full Player Bar, Dedicated Live Lyrics View, dan Active Queue Sheet.</li>
          <li><strong>Dynamic Ambient Glow:</strong> Gradien warna latar belakang yang beradaptasi secara elegan mengikuti warna sampul album.</li>
          <li><strong>Android Solid Dock:</strong> Tampilan MiniPlayer dan Bottom Navigation solid tanpa tabrakan teks di Android.</li>
          <li><strong>Comprehensive Settings Page:</strong> Halaman pengaturan lengkap dengan 17 menu kategori.</li>
          <li><strong>Smooth Spring Motion:</strong> Animasi haptic dan transisi lembut di setiap tombol dan navigasi.</li>
        </ul>
      </div>
    </td>
  </tr>
</table>

</div>

---

## 📱 UI Modes

GravityTune menghadirkan 3 mode tampilan pemutar musik yang dirancang presisi:

1. **Player Bar Mode:**
   - Menampilkan sampul album berukuran besar dengan sudut membulat modern.
   - Tombol squircle cepat: Share lagu, Tambah ke Favorit (Heart), dan Menu Tambahan.
   - Scrubber durasi presisi dengan waktu berjalan dan total durasi.
   - Kontrol pemutaran: Tombol Shuffle, Lagu Sebelumnya, Big Round Play/Pause, Lagu Selanjutnya, dan Mode Repeat (One/All).
   - Tombol pintasan bawah untuk membuka Queue, Sleep Timer (Moon), dan Lyrics.

2. **Live Lyrics Mode:**
   - Latar belakang gradien radial dinamis yang diambil dari nuansa warna cover album.
   - Header ringkas dengan thumbnail, judul lagu, tombol Close (X), dan More.
   - Tampilan lirik karaoke interaktif dengan auto-scroll dan penekanan baris aktif berkedip lembut.
   - Mini scrubber dan kontrol volume langsung dari halaman lirik.

3. **Active Queue Mode:**
   - Panel antrean lengkap dengan info bar jumlah lagu dan estimasi durasi total.
   - Tombol aksi: Acak antrean (Shuffle), Ulangi (Repeat), dan Autoplay Infinity pill.
   - Kartu "Continue Playing" khusus dengan aksen olive-lime untuk lagu yang sedang berputar.
   - Daftar antrean lagu berikutnya yang dapat di-tap langsung untuk melompat ke lagu tersebut.

---

## ⚙️ Settings Suite

Halaman pengaturan GravityTune dirancang dengan gaya card group modern beraksen icon hijau lime (`#d1e289`):

- **Account:** Manajemen sinkronisasi akun & data lokal.
- **Listening Stats:** Statistik personal lagu teratas, artis terfavorit, dan waktu mendengarkan.
- **Appearance:** Pengaturan tema, palet warna, dan gaya visual.
- **Playback:** Konfigurasi kualitas audio (High / Normal / Data Saver) dan perilaku streaming.
- **Lyrics:** Pengaturan penyedia lirik dan pra-muat teks.
- **Content:** Preferensi bahasa katalog dan rekomendasi wilayah.
- **Behavior:** Riwayat pencarian dan setelan privasi.
- **Integration:** Dukungan integrasi Last.fm, Libre.fm, dan Discord Rich Presence.
- **AI Integration:** Personalisasi rekomendasi musik cerdas.
- **Internet:** Pengaturan proxy, DNS, dan mode hemat kuota.
- **Storage:** Pemantauan ukuran cache & tombol satu klik bersihkan cache lokal.
- **Backup & Restore:** Ekspor dan impor data favorit serta riwayat putar.
- **Developer Options:** Fitur eksperimental dan console log.
- **Updates & About:** Informasi versi aplikasi, lisensi, dan identitas GravityTune.

---

## 🚀 Installation & Running

### Cara 1: Buka Web App (Langsung)
Kunjungi versi live yang selalu diperbarui:
👉 **[https://gravity-tune-three.vercel.app/](https://gravity-tune-three.vercel.app/)**

*(Bisa langsung di-install ke HP Android / iPhone melalui menu browser "Install App" / "Tambahkan ke Layar Utama")*

---

### Cara 2: Menjalankan di Lokal (Self-Hosted)

#### Prasyarat:
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- Git

#### Langkah Instalasi:
```bash
# 1. Clone repository
git clone https://github.com/DzuI22/Gravity-Tune.git
cd Gravity-Tune

# 2. Install dependencies
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Buka browser Anda di:
👉 **http://localhost:3000**

#### Build untuk Produksi:
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** [Next.js 14](https://nextjs.org/) (App Router) + React 18
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Music & Stream Engine:** [YouTube.js (InnerTube)](https://github.com/LuanRT/YouTube.js)
- **Lyrics Provider:** [LRCLIB](https://lrclib.net/) + YouTube Synced Captions
- **Deployment:** [Vercel](https://vercel.com)

---

## ⚖️ Legal Disclaimer

GravityTune adalah klien pihak ketiga independen berbasis web.
- Tidak berafiliasi dengan Google LLC atau YouTube.
- Seluruh konten audio dan hak cipta musik adalah milik masing-masing artis dan pemegang hak cipta resmi.
- Proyek ini dibuat untuk tujuan edukasi dan eksplorasi antarmuka pemutar musik modern.

---

## 📄 License

Proyek ini dilisensikan di bawah **MIT License**. Lihat berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.

<div align="center">
  <br />
  <p><b>Dibuat dengan dedikasi untuk penikmat musik di seluruh dunia. Jika kamu menyukai GravityTune, jangan lupa beri ⭐ di GitHub!</b></p>
</div>
