# 🚀 Tutorial Deploy GravityTune ke Koyeb (Gratis 24/7 Tanpa Kartu Kredit)

Panduan ini akan membuat aplikasi **GravityTune** online 24 jam non-stop di internet, sehingga website tetap aktif meskipun komputer/laptop Anda dimatikan!

---

## 📋 Langkah 1: Upload Proyek ke GitHub

1. Buka browser dan login ke akun [GitHub](https://github.com). (Jika belum punya akun, daftar gratis).
2. Buat repository baru:
   * Buka: https://github.com/new
   * Beri nama repository: **`gravity-tune`**
   * Pilih **Public** atau **Private** (bebas)
   * **Jangan centang** "Add a README file"
   * Klik tombol hijau **Create repository**.
3. Buka **Command Prompt (CMD)** atau **PowerShell** di komputer Anda, lalu jalankan perintah berikut (ganti `USERNAME` dengan username GitHub Anda):

```bash
cd /d D:\Gravity-Tune
git branch -M main
git remote add origin https://github.com/USERNAME/gravity-tune.git
git push -u origin main
```
*(Saat diminta login GitHub, silakan login melalui peramban).*

---

## ☁️ Langkah 2: Daftar di Koyeb

1. Buka situs [Koyeb.com](https://www.koyeb.com).
2. Klik tombol **Sign Up**.
3. Pilih **Sign up with GitHub** (ini paling mudah dan otomatis terhubung).
4. Selesaikan verifikasi email jika diminta.

---

## 🛠️ Langkah 3: Deploy Aplikasi ke Koyeb

1. Di Dashboard Koyeb, klik tombol **Create Service** (atau **Create App**).
2. Pada bagian *Deployment method*, pilih **GitHub**.
3. Pilih repository **`gravity-tune`** yang tadi Anda buat.
4. Pada bagian *Builder*:
   * Koyeb akan otomatis mendeteksi **Dockerfile** yang sudah saya siapkan di dalam proyek.
5. Pada bagian *Instance*:
   * Pilih tipe **Nano (Free Tier)** (512MB RAM, gratis $0.00/bulan).
6. Pada bagian *Ports*:
   * Pastikan port diatur ke **`8000`** (dengan protokol HTTP).
7. Beri nama App Anda, misalnya: **`gravity-tune`**.
8. Klik tombol hijau **Deploy**.

---

## 🎉 Langkah 4: Selesai! Aplikasi Anda Online 24/7

1. Koyeb akan memproses build sekitar 2-3 menit.
2. Setelah status berubah menjadi **Healthy (Hijau)**, Anda akan mendapatkan URL publik permanen dengan HTTPS, contoh:
   👉 **`https://gravity-tune-username.koyeb.app`**
3. **Bisa Dibuka Kapan Saja:**
   * Tautan ini aktif 24 jam sehari, 7 hari seminggu.
   * **Meskipun PC Anda dimatikan, website ini tetap menyala dan bisa diakses oleh siapa saja di seluruh dunia!**
