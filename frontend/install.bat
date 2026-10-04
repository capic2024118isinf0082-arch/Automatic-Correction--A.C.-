@echo off
title Automatic Correction - Instalador
echo ========================================
echo   INSTALANDO AUTOMATIC CORRECTION
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Baixe em: https://nodejs.org/
    echo Instale a versao LTS e reinicie o computador.
    echo.
    pause
    exit
)
echo Node.js instalado!
echo.

echo [2/5] Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo AVISO: MySQL nao encontrado no PATH!
    echo Certifique-se de que o MySQL esta rodando.
)

echo [3/5] Criando estrutura de pastas...
mkdir backend\src\config 2>nul
mkdir backend\src\controllers 2>nul
mkdir backend\src\models 2>nul
mkdir backend\src\routes 2>nul
mkdir backend\src\middleware 2>nul
mkdir backend\database 2>nul
mkdir frontend 2>nul
echo.

echo [4/5] Instalando dependencias do backend...
cd backend
call npm install express cors dotenv mysql2 bcryptjs jsonwebtoken
echo.

echo [5/5] Instalando dependencias de desenvolvimento...
call npm install -D nodemon
echo.

echo ========================================
echo   INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Proximo passo: Edite o arquivo backend/.env
echo com suas credenciais do MySQL.
echo.
echo Depois execute: start.bat
echo.
pause