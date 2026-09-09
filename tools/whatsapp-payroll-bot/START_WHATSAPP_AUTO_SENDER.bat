@echo off
title Shree RR Trading - WhatsApp Salary Slip Auto-Dispatcher
color 0A

echo ======================================================================
echo           SHREE RR TRADING COMPANY - WHATSAPP AUTO DISPATCHER
echo ======================================================================
echo.

cd /d "%~dp0"

if exist "bin\node.exe" (
    set "NODE_EXEC=bin\node.exe"
) else (
    set "NODE_EXEC=node"
)

echo Starting WhatsApp Dispatch Engine on port 3300...
start "" http://localhost:3300
%NODE_EXEC% server.js

pause
