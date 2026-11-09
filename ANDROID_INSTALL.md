# 📱 Cara Install GravityTune di Android (sebagai Aplikasi Native)

> GravityTune dibuat sebagai **PWA (Progressive Web App)** yang bisa diinstal langsung di Android seperti aplikasi normal, tanpa perlu Play Store.

---

## 🚀 Langkah Instalasi di HP Android

### **Cara 1: Install lewat Chrome (Android) — Paling Mudah**

1. **Pastikan server GravityTune menyala** di komputer Anda (jalankan `start.bat`)
2. Pastikan HP Android dan komputer terhubung ke **WiFi yang sama**
3. Cari IP address komputer Anda:
   - Buka Command Prompt → ketik `ipconfig`
   - Catat **IPv4 Address** (contoh: `192.168.1.5`)
4. Buka **Chrome** di HP Android
5. Ketik alamat: `http://192.168.1.5:3000`
6. Di pojok kanan Chrome, ketuk **⋮ (menu titik tiga)**
7. Pilih **"Add to Home screen"** atau **"Install App"**
8. Konfirmasi → GravityTune akan muncul di layar utama HP seperti aplikasi biasa!

### **Cara 2: Gunakan Cloudflare Tunnel (Akses dari Mana Saja)**
Jika ingin diakses dari luar WiFi rumah (dan oleh orang lain):
```bash
# Install Cloudflare Tunnel (gratis)
# Download dari: https://github.com/cloudflare/cloudflared/releases
cloudflared tunnel --url http://localhost:3000
```
Cloudflare akan memberikan URL publik seperti `https://xyz.trycloudflare.com` yang bisa dibuka siapa saja.

---

## 🎨 Tampilan Setelah Diinstal
- Ikon GravityTune akan muncul di layar utama HP
- Membuka aplikasi → tampilan **fullscreen tanpa browser bar** (seperti aplikasi native)
- Mendukung kontrol media di **notification bar Android** (play/pause/skip)
- Lirik tersinkronisasi tetap berfungsi seperti di desktop

---

## 📦 Build APK Native (Opsional - Untuk Distribusi)

Jika ingin membuat file `.apk` yang bisa dibagikan ke orang lain:

### Prasyarat
- Install **Android Studio** dari https://developer.android.com/studio
- Install **JDK 17+**

### Langkah Build APK
```bash
cd D:\Gravity-Tune

# 1. Build web app
npm run build

# 2. Inisialisasi Capacitor (sudah terinstal)
npx cap init "GravityTune" "app.gravitytune.music" --web-dir=out

# 3. Add Android platform
npx cap add android

# 4. Sync build ke Android
npx cap sync android

# 5. Buka di Android Studio untuk build APK
npx cap open android
```
Di Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

---

> **Catatan:** PWA sudah cukup untuk penggunaan pribadi. APK dibutuhkan hanya jika ingin mendistribusikan ke teman/publik tanpa server.
