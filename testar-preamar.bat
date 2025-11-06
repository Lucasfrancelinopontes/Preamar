@echo off
title Preamar - Teste de Funcionamento
echo.
echo =======================================
echo     TESTANDO SISTEMA PREAMAR
echo =======================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao instalado!
    pause
    exit /b 1
)

echo.
echo Verificando estrutura de pastas...
if not exist "backend" (
    echo ERRO: Pasta backend nao encontrada!
    pause
    exit /b 1
)

if not exist "form" (
    echo ERRO: Pasta form nao encontrada!
    pause
    exit /b 1
)

echo ✅ Estrutura OK
echo.

echo Verificando package.json do backend...
if not exist "backend\package.json" (
    echo ERRO: backend\package.json nao encontrado!
    pause
    exit /b 1
)

echo Verificando package.json do frontend...
if not exist "form\package.json" (
    echo ERRO: form\package.json nao encontrado!
    pause
    exit /b 1
)

echo ✅ Arquivos de configuracao OK
echo.

echo Testando comando node no backend...
cd backend
node --version
cd ..

echo.
echo ✅ Tudo pronto para inicializar!
echo.
echo Pressione qualquer tecla para continuar com a inicializacao real...
pause

echo.
echo Executando iniciar-preamar.bat...
call iniciar-preamar.bat