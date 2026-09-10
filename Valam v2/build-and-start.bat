@echo off
cd /d "%~dp0"
echo Building VALAM...
npm run build
if errorlevel 1 pause & exit /b 1
echo Starting VALAM on http://localhost:3001
npm start
