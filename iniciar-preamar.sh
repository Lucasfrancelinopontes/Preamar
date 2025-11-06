#!/bin/bash

# Script de inicialização do Sistema Preamar
# Roda backend e frontend automaticamente

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}   SISTEMA PREAMAR - INICIALIZAÇÃO${NC}"
echo -e "${BLUE}====================================${NC}"
echo

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${YELLOW}[1/4]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado! Instale o Node.js primeiro.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

echo
echo -e "${YELLOW}[2/4]${NC} Verificando Backend..."
cd "$SCRIPT_DIR/backend"

# Verificar se porta 3001 está em uso
if check_port 3001; then
    echo -e "${YELLOW}⚠️  Porta 3001 já está em uso. Backend pode já estar rodando.${NC}"
else
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Instalando dependências do backend...${NC}"
        npm install
    fi

    # Popular espécies se necessário
    echo -e "${BLUE}📡 Verificando banco de dados...${NC}"
    node scripts/popularEspecies.js > /dev/null 2>&1

    # Iniciar backend em background
    echo -e "${BLUE}🚀 Iniciando backend...${NC}"
    nohup node server.js > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    # Aguardar backend iniciar
    sleep 3
    
    if check_port 3001; then
        echo -e "${GREEN}✅ Backend iniciado na porta 3001 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}❌ Erro ao iniciar backend. Verifique backend.log${NC}"
        exit 1
    fi
fi

echo
echo -e "${YELLOW}[3/4]${NC} Verificando Frontend..."
cd "$SCRIPT_DIR/form"

# Verificar se porta 3000 está em uso
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso. Frontend pode já estar rodando.${NC}"
else
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Instalando dependências do frontend...${NC}"
        npm install
    fi

    # Iniciar frontend em background
    echo -e "${BLUE}🚀 Iniciando frontend...${NC}"
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    # Aguardar frontend iniciar
    sleep 5
    
    if check_port 3000; then
        echo -e "${GREEN}✅ Frontend iniciado na porta 3000 (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}❌ Erro ao iniciar frontend. Verifique frontend.log${NC}"
        exit 1
    fi
fi

echo
echo -e "${YELLOW}[4/4]${NC} Verificação final..."
sleep 2

echo
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           PREAMAR INICIADO COM SUCESSO!    ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║   🌐 Frontend: http://localhost:3000      ║${NC}"
echo -e "${GREEN}║   📡 Backend:  http://localhost:3001      ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║   Para parar: execute ./parar-preamar.sh  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo

echo -e "${BLUE}🚀 Aplicação está rodando!${NC}"
echo -e "${BLUE}📄 Logs disponíveis em:${NC}"
echo -e "   Backend:  $SCRIPT_DIR/backend/backend.log"
echo -e "   Frontend: $SCRIPT_DIR/form/frontend.log"
echo

# Tentar abrir no navegador (Linux)
if command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo aplicação no navegador...${NC}"
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    # macOS
    echo -e "${BLUE}🌐 Abrindo aplicação no navegador...${NC}"
    open http://localhost:3000 &
fi

echo -e "${YELLOW}💡 Dica: Use 'tail -f backend/backend.log' para acompanhar logs do backend${NC}"
echo -e "${YELLOW}💡 Dica: Use 'tail -f form/frontend.log' para acompanhar logs do frontend${NC}"