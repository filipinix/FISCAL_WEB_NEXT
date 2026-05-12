@echo off
TITLE Fiscal Web Next - Instalador e Inicializador
echo ====================================================
echo      FISCAL WEB NEXT - SETUP LOCAL
echo ====================================================
echo.

:: Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b
)

echo [1/3] Instalando dependencias do projeto...
call npm install

echo [2/3] Compilando o sistema...
call npm run build

echo.
echo [3/3] Iniciando o Servidor Central (Hub)...
echo O sistema estara disponivel em: http://localhost:3000
echo.
echo Pressione CTRL+C para encerrar.
echo.

call npm start

pause
