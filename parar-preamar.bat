@echo off
title Sistema Preamar - Parada
echo.
echo ====================================
echo      PARANDO SISTEMA PREAMAR
echo ====================================
echo.

echo [1/2] Parando Backend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo 🛑 Finalizando processo backend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Processo backend nao encontrado ou ja finalizado
    ) else (
        echo ✅ Backend finalizado com sucesso
    )
)

echo.
echo [2/2] Parando Frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 🛑 Finalizando processo frontend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Processo frontend nao encontrado ou ja finalizado
    ) else (
        echo ✅ Frontend finalizado com sucesso
    )
)

echo.
echo Aguardando processos terminarem...
timeout /t 2 >nul

echo.
echo ╔════════════════════════════════════════════╗
echo ║         PREAMAR PARADO COM SUCESSO!        ║
echo ║                                            ║
echo ║   Todos os servicos foram finalizados     ║
echo ║                                            ║
echo ║   Para reiniciar: iniciar-preamar.bat     ║
echo ╚════════════════════════════════════════════╝
echo.

echo Pressione qualquer tecla para sair...
pause >nul