@echo off
cd /d "%~dp0"
echo Starting VALAM backend and frontend...
start "VALAM Backend" cmd /k "npm run dev:backend"
start "VALAM Frontend" cmd /k "npm run dev"
