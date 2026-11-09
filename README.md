# 🎵 GravityTune

> **Audiophile Music Client** dengan arsitektur mesin open-source (InnerTube / ArchiveTune) dan estetika mewah modern gabungan **Spotify & Apple Music**.

---

## ✨ Fitur Unggulan

1. **Mesin YouTube Music (InnerTube Engine)**
   - Streaming jutaan katalog lagu, artis, album, dan playlist tanpa iklan.
   - Tanpa perlu API Key berbayar.
   - Ekstraksi audio resolusi tinggi (Opus / AAC / M4A).

2. **Apple Music × Spotify Modernist UI/UX**
   - **Dynamic Ambient Blur:** Warna latar belakang beradaptasi secara dinamis mengikuti warna dominan sampul album lagu yang sedang diputar.
   - **Live Time-Synced Karaoke Lyrics:** Didukung oleh LRCLIB API dengan efek teks menyala (*glowing*) dan auto-scroll ke detik yang sedang dinyanyikan.
   - **Spotify Floating Mini-Player:** Kontrol pemutaran mengambang dengan scrub bar interaktif, kontrol volume, dan transisi ke fullscreen.
   - **Fullscreen Player Modal:** Tampilan sampul album besar dengan bayangan lembut, tab lirik langsung, dan antrean lagu (*Up Next Queue*).

3. **Audio Controls & OS Integration**
   - **MediaSession API:** Mendukung kontrol pemutaran di lock screen HP / desktop notification bar dan tombol media keyboard.
   - **Offline Favorites:** Menyimpan lagu favorit langsung ke penyimpanan lokal (*local storage*) tanpa perlu login akun.

---

## 🚀 Cara Menjalankan

### Cara 1: Double Click (Windows)
Cukup jalankan file `start.bat` di dalam folder ini:
```
D:\Gravity-Tune\start.bat
```

### Cara 2: Terminal / PowerShell
```bash
cd D:\Gravity-Tune
npm run dev
```

Buka browser Anda di:
👉 **http://localhost:3000**

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS + Glassmorphism (`backdrop-blur`) + SF Pro / Inter Typography
- **Icons & Motion:** Lucide React + Framer Motion
- **Music API:** `youtubei.js` (YouTube Music InnerTube Engine)
- **Lyrics API:** LRCLIB (Real-time synchronized lyrics)

---

title: Gravity Tune
emoji: 🎵
colorFrom: indigo
colorTo: pink
sdk: statis
app_port: 8000
---