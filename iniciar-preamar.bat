@echo off
title Sistema Preamar - Inicializacao
echo.
echo ==========================================
echo         SISTEMA PREAMAR - LAUNCHER
echo ==========================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: Node.js nao encontrado!
    echo 📦 Baixe e instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/5] Verificando dependencias do backend...
if not exist "backend\node_modules" (
    echo 📦 Instalando dependencias do backend...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependencias do backend
        pause
        exit /b 1
    )
    cd ..
)
echo ✅ Backend pronto

echo.
echo [3/5] Verificando dependencias do frontend...
if not exist "form\node_modules" (
    echo 📦 Instalando dependencias do frontend...
    cd form
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependencias do frontend
        pause
        exit /b 1
    )
    cd ..
)
echo ✅ Frontend pronto

echo.
echo [4/5] Populando especies no banco...
cd backend
node scripts/popularEspecies.js >nul 2>&1
cd ..
echo ✅ Especies verificadas

echo.
echo [5/5] Iniciando Sistema Preamar...
echo.
echo Backend estara disponivel em: http://localhost:3001
echo Frontend estara disponivel em: http://localhost:3000
echo.
echo Para parar o sistema, pressione Ctrl+C ou feche os terminais
echo.

start "Preamar Backend" cmd /k "cd /d %SCRIPT_DIR%backend && echo ===== PREAMAR BACKEND ===== && node server.js"

timeout /t 5 /nobreak >nul

start "Preamar Frontend" cmd /k "cd /d %SCRIPT_DIR%form && echo ===== PREAMAR FRONTEND ===== && npm run dev"

timeout /t 8 /nobreak >nul

echo ✅ Sistema iniciado!
echo 🌐 Abrindo navegador...
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════╗
echo ║           PREAMAR INICIADO COM SUCESSO!    ║
echo ║                                            ║
echo ║   🌐 Frontend: http://localhost:3000      ║
echo ║   📡 Backend:  http://localhost:3001      ║
echo ║                                            ║
echo ║   Para parar: Feche os terminais abertos  ║
echo ╚════════════════════════════════════════════╝
echo.

echo Sistema rodando. Pressione qualquer tecla para sair...
pause >nul