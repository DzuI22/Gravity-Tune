@echo off
title GravityTune - Audiophile Music Player
echo ==============================================
echo        Starting GravityTune Server...
echo ==============================================
cd /d "%~dp0"
call npm.cmd run dev
pause
