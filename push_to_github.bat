@echo off
title Push Gravity-Tune to GitHub
echo ===================================================
echo     Pushing Gravity-Tune to GitHub (DzuI22)...
echo ===================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
echo ===================================================
echo   Done! Silakan periksa repo GitHub Anda.
echo ===================================================
pause
