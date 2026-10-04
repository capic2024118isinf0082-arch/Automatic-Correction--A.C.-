@echo off
title Automatic Correction - Servidor
echo ========================================
echo   INICIANDO AUTOMATIC CORRECTION
echo ========================================
echo.

cd backend
echo Servidor iniciando...
echo Acesse: http://localhost:3000
echo Pressione CTRL+C para parar
echo.

node server.js

pause