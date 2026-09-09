@echo off
title Shree RR Trading - WhatsApp Salary Slip Auto-Dispatcher
if exist "%~dp0start-bot.bat" (
    cd /d "%~dp0"
    call start-bot.bat
) else if exist "%~dp0tools\whatsapp-payroll-bot\start-bot.bat" (
    cd /d "%~dp0tools\whatsapp-payroll-bot"
    call start-bot.bat
) else (
    echo Error: start-bot.bat not found.
    pause
)
