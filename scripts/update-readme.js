const fs = require('fs');
const path = require('path');

const readmePath = path.resolve(__dirname, '..', 'README.md');
if (!fs.existsSync(readmePath)) {
  console.error('README.md not found at', readmePath);
  process.exit(0);
}

let content = fs.readFileSync(readmePath, 'utf8');

// New release row for v7.5.3
const newVersionRow = '| **[GravityTune-v7.5.3.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v7.5.3/GravityTune-v7.5.3.apk)** | `v7.5.3` | `com.gravitytune.v7` | ~5.8 MB | Warm Amber OLED, Apple Music Lyrics, Sleep Mode, Standalone App |';

// Check if already updated
if (!content.includes('GravityTune-v7.5.3.apk')) {
  // Update Header Badges
  content = content.replace(
    /https:\/\/img\.shields\.io\/badge\/Version-v[0-9.]+-d1e289/,
    'https://img.shields.io/badge/Version-v7.5.3-d1e289'
  );

  // Update Download Table
  const tableHeader = '| Tautan Unduh | Versi |';
  if (content.includes(tableHeader)) {
    const tableRegex = /\| Tautan Unduh \| Versi \|[^\n]*\n\| :--- \| :--- \|[^\n]*\n(\| [^\n]+\n)*/;
    const newTable = `| Tautan Unduh | Versi | Package ID | Ukuran | Catatan Rilis |
| :--- | :--- | :--- | :--- | :--- |
| **[GravityTune-v7.5.3.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v7.5.3/GravityTune-v7.5.3.apk)** | \`v7.5.3\` | \`com.gravitytune.v7\` | ~5.8 MB | **Rilis Terbaru!** Standalone App, Warm Amber OLED, Apple Music Lyrics, In-App Sleep Mode |
| **[GravityTune-v5.1.0.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v5.1.0/GravityTune-v5.1.0.apk)** | \`v5.1.0\` | \`com.gravitytune.v5\` | ~5.5 MB | Liquid Glassmorphism, Podcast Library, YouTube Music Community |
| **[GravityTune-v2.5.0.apk](https://github.com/DzuI22/Gravity-Tune/releases/download/v2.5.0/GravityTune-v2.5.0.apk)** | \`v2.5.0\` | \`com.gravitytune.v2\` | ~5.3 MB | Classic Ultra Lightweight, Audio Crossfade, EBU Normalization |
`;
    content = content.replace(tableRegex, newTable);
  }

  // Add Standalone Version Comparison Section if not present
  if (!content.includes('## 📱 Format APK Mandiri & Komparasi Versi')) {
    const comparisonSection = `
---

## 📱 Format APK Mandiri & Komparasi Versi

Setiap versi GravityTune memiliki **Application ID (Package Name) terpisah** sehingga Anda dapat menginstal semua versi sekaligus di satu HP Android tanpa saling menimpa:

| Versi | Application ID (Gradle) | Nama di Layar HP | File APK | Sorotan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **v7.5.3** | \`com.gravitytune.v7\` | **GravityTune v7.5.3** | \`GravityTune-v7.5.3.apk\` | Warm Amber OLED, Apple Music Synced Lyrics, In-App Sleep Mode, Canvas Video Backdrop |
| **v5.1.0** | \`com.gravitytune.v5\` | **GravityTune v5.1** | \`GravityTune-v5.1.0.apk\` | Liquid Glassmorphism UI, Podcast Library, YouTube Community Playlists |
| **v2.5.0** | \`com.gravitytune.v2\` | **GravityTune v2.5** | \`GravityTune-v2.5.0.apk\` | Classic Ultra Lightweight, InnerTube Engine, Gapless Playback |
`;
    content = content.replace('## ✨ Features Unggulan di v2.5.0', `${comparisonSection}\n## ✨ Features Unggulan di v7.5.3 & Rilis Sebelumnya`);
  }

  fs.writeFileSync(readmePath, content, 'utf8');
  console.log('Successfully updated README.md for v7.5.3');
} else {
  console.log('README.md is already up to date with v7.5.3');
}
