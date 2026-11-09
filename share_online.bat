@echo off
title GravityTune - Share Online (Cloudflare Tunnel)
echo =======================================================
echo     Starting GravityTune Public Online Tunnel...
echo =======================================================
echo.
echo Make sure the main server is running first!
echo Generating a secure, worldwide HTTPS link for you...
echo.
cd /d "%~dp0"
cloudflared.exe tunnel --url http://localhost:3000
pause
