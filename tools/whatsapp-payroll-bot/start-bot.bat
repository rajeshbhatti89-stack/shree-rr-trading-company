@echo off
title Shree RR Trading - WhatsApp Salary Slip Auto-Dispatcher
color 0A

echo ======================================================================
echo           SHREE RR TRADING COMPANY - WHATSAPP AUTO DISPATCHER
echo ======================================================================
echo.
echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)

echo [2/3] Starting Local Anti-Ban WhatsApp Service on port 3300...
cd /d "%~dp0"

start "" http://localhost:3300

echo [3/3] Server is live! Opening Web Dashboard in browser...
node server.js

pause
