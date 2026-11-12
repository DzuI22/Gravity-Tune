const fs = require('fs');
const path = require('path');

const readmePath = path.resolve(__dirname, '..', 'README.md');
if (!fs.existsSync(readmePath)) {
  console.error('README.md not found at', readmePath);
  process.exit(0);
}

let content = fs.readFileSync(readmePath, 'utf8');

// Update Header Badge
content = content.replace(
  /https:\/\/img\.shields\.io\/badge\/Version-v[0-9.]+-d1e289/,
  'https://img.shields.io/badge/Version-v7.5.3-d1e289'
);

// Unified Download Table with common Package ID com.gravitytune.app
const tableHeader = '| Tautan Unduh | Versi |';
if (content.includes(tableHeader)) {
  const tableRegex = /\| Tautan Unduh \| Versi \|[^\n]*\n\| :--- \| :--- \|[^\n]*\n(\| [^\n]+\n)*/;
  const newTable = `| Tautan Unduh | Versi | Application ID | Tipe Instalasi | Catatan Rilis |
| :--- | :--- | :--- | :--- | :--- |
| **[GravityTune-v7.5.3.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v7.5.3/GravityTune-v7.5.3.apk)** | \`v7.5.3\` | \`com.gravitytune.app\` | **Direct Update (Menimpa Versi Lama)** | Warm Amber OLED, Apple Music Synced Lyrics, In-App Sleep Mode, Authentic Google Sign-in |
| **[GravityTune-v5.1.0.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v5.1.0/GravityTune-v5.1.0.apk)** | \`v5.1.0\` | \`com.gravitytune.app\` | Official Stable Release | Liquid Glassmorphism UI, Dedicated Podcast Library, Community Feeds |
| **[GravityTune-v2.5.0.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v2.5.0/GravityTune-v2.5.0.apk)** | \`v2.5.0\` | \`com.gravitytune.app\` | Legacy Lightweight | Ultra Lightweight Audio Stream, Gapless Playback |
`;
  content = content.replace(tableRegex, newTable);
}

// Update Installation & In-App Upgrade Note
const updateNote = `
---

## 🔄 Pembaruan Mulus (Seamless Update System)

Semua rilis GravityTune menggunakan **Application ID resmi yang seragam (\`com.gravitytune.app\`)**.
- Jika Anda memasang versi terbaru di atas versi sebelumnya (misal dari v2.5.0 atau v5.1.0 ke v7.5.3), sistem Android akan memunculkan dialog resmi **"Do you want to update this app?"**.
- Semua data playlist, akun, dan lagu favorit Anda tetap aman dan otomatis terbawa ke versi terbaru tanpa perlu menghapus aplikasi lama atau membuat duplikat aplikasi di smartphone.
`;

if (!content.includes('## 🔄 Pembaruan Mulus (Seamless Update System)')) {
  content = content.replace('## ✨ Features Unggulan', `${updateNote}\n## ✨ Features Unggulan`);
}

fs.writeFileSync(readmePath, content, 'utf8');
console.log('Successfully updated README.md with unified update notes!');
