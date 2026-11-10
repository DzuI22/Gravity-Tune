@echo off
title Push Gravity-Tune to GitHub
echo ========================================================
echo     Pushing Gravity-Tune to GitHub (DzuI22)...
echo ========================================================
echo.
cd /d "%~dp0"
git config http.version HTTP/1.1
git config http.sslBackend openssl
git config http.postBuffer 524288000
echo Mengunggah file proyek ke GitHub...
git push -u origin main --force
echo.
echo ========================================================
echo   SELESAI! Silakan refresh halaman repo GitHub Anda:
echo   https://github.com/DzuI22/Gravity-Tune
echo ========================================================
pause
