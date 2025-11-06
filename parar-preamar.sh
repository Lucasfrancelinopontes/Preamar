#!/bin/bash

# Script para parar o Sistema Preamar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}====================================${NC}"
echo -e "${RED}   PARANDO SISTEMA PREAMAR${NC}"
echo -e "${RED}====================================${NC}"
echo

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Parar backend
if [ -f "$SCRIPT_DIR/backend/backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/backend/backend.pid")
    echo -e "${YELLOW}🛑 Parando backend (PID: $BACKEND_PID)...${NC}"
    
    if kill "$BACKEND_PID" 2>/dev/null; then
        echo -e "${GREEN}✅ Backend parado com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend já estava parado${NC}"
    fi
    
    rm -f "$SCRIPT_DIR/backend/backend.pid"
else
    echo -e "${YELLOW}ℹ️  Arquivo PID do backend não encontrado${NC}"
    
    # Tentar matar por porta
    BACKEND_PID=$(lsof -ti:3001)
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}🔍 Encontrado processo na porta 3001 (PID: $BACKEND_PID)${NC}"
        kill "$BACKEND_PID" 2>/dev/null
        echo -e "${GREEN}✅ Processo da porta 3001 finalizado${NC}"
    fi
fi

# Parar frontend
if [ -f "$SCRIPT_DIR/form/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/form/frontend.pid")
    echo -e "${YELLOW}🛑 Parando frontend (PID: $FRONTEND_PID)...${NC}"
    
    if kill "$FRONTEND_PID" 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend parado com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend já estava parado${NC}"
    fi
    
    rm -f "$SCRIPT_DIR/form/frontend.pid"
else
    echo -e "${YELLOW}ℹ️  Arquivo PID do frontend não encontrado${NC}"
    
    # Tentar matar por porta
    FRONTEND_PID=$(lsof -ti:3000)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}🔍 Encontrado processo na porta 3000 (PID: $FRONTEND_PID)${NC}"
        kill "$FRONTEND_PID" 2>/dev/null
        echo -e "${GREEN}✅ Processo da porta 3000 finalizado${NC}"
    fi
fi

# Aguardar processos terminarem
echo -e "${BLUE}⏳ Aguardando processos terminarem...${NC}"
sleep 2

echo
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         PREAMAR PARADO COM SUCESSO!        ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║   Todos os serviços foram finalizados     ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║   Para reiniciar: ./iniciar-preamar.sh    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo