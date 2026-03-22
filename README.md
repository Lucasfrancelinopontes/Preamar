# Sistema Preamar - Sistema de Gestão de Desembarque de Pesca

## 🚀 Como Usar (Super Simples)

### Iniciar o Sistema
```bash
# No Windows
iniciar-preamar.bat

# Ou usando npm
npm start
```

### Parar o Sistema
```bash
# No Windows
parar-preamar.bat

# Ou usando npm
npm run stop
```

### Verificar Status
```bash
npm run status
```

## 📋 O que o Sistema Faz

O sistema vai **automaticamente**:
1. ✅ Verificar se o Node.js está instalado
2. ✅ Instalar todas as dependências necessárias
3. ✅ Iniciar o backend na porta 3001
4. ✅ Iniciar o frontend na porta 3000
5. ✅ Abrir o navegador automaticamente
6. ✅ Gerenciar os processos e portas

## 🌐 Acessos

- **Aplicação Web**: http://localhost:3000
- **API Backend**: http://localhost:3001

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia todo o sistema |
| `npm run stop` | Para todo o sistema |
| `npm run status` | Verifica se está rodando |
| `npm run dev` | Modo desenvolvimento |
| `npm run logs` | Visualiza logs em tempo real |

## 🛠️ Estrutura do Sistema

```
Preamar/
├── backend/          # API Node.js + Express + Sequelize
├── form/             # Frontend Next.js + React
├── scripts/          # Scripts de automação
└── iniciar-preamar.bat # Atalho para Windows
```

## 🔧 Funcionalidades Automáticas

- **Verificação de Dependências**: Instala automaticamente tudo que precisar
- **Gerenciamento de Portas**: Detecta conflitos e resolve automaticamente
- **Sincronização de Banco**: Popula dados essenciais (espécies) automaticamente
- **Abertura de Navegador**: Abre a aplicação automaticamente
- **Logs Inteligentes**: Mostra o status de cada serviço
- **Parada Segura**: Para todos os processos corretamente

## 💡 Dicas

1. **Primeira execução**: Pode demorar alguns minutos para instalar dependências
2. **Portas ocupadas**: O sistema detecta e resolve automaticamente
3. **Erro no banco**: O sistema recria e popula automaticamente
4. **Múltiplas execuções**: Use `npm run status` para verificar se já está rodando

## 🐛 Resolução de Problemas

### Sistema não inicia?
```bash
npm run stop  # Para tudo
npm start     # Reinicia
```

### Portas ocupadas?
```bash
npm run stop  # Libera as portas automaticamente
```

### Verificar o que está rodando?
```bash
npm run status  # Mostra status completo
```

## 📞 Sistema Funcionando

Quando tudo estiver ok, você verá:
- ✅ Backend rodando na porta 3001
- ✅ Frontend rodando na porta 3000
- ✅ Navegador abre automaticamente
- ✅ Sistema pronto para uso!

---

**Dica**: Basta executar `iniciar-preamar.bat` e tudo funciona automaticamente! 🎉