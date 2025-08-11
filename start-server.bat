@echo off
title VAT Calculator Pro - Local Server
echo.
echo ======================================
echo   VAT Calculator Pro - Local Server
echo ======================================
echo.
echo Starting server on http://localhost:8000
echo.
echo Your application will be available at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
py -m http.server 8000
pause
