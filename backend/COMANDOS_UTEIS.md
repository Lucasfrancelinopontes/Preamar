# 📚 Comandos Úteis - Sistema Preamar

## 🚀 Comandos de Desenvolvimento

### Iniciar Servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

### Banco de Dados
```bash
# Sincronizar modelos (primeira vez)
npm run db:sync

# Recriar tabelas (APAGA TUDO!)
npm run db:sync:force

# Atualizar estrutura mantendo dados
npm run db:sync:alter

# Popular com dados de exemplo
npm run db:populate

# Executar consultas de exemplo
npm run db:queries
```

### Testes
```bash
# Testar todos endpoints da API
npm test

# Testar em modo watch (reexecuta ao salvar)
npm run test:watch
```

## 🔧 Comandos MariaDB

### Backup
```bash
# Backup completo
mysqldump -u root -p preamar > backup.sql

# Backup com data
mysqldump -u root -p preamar > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
mysqldump -u root -p --no-data preamar > estrutura.sql

# Backup apenas dados
mysqldump -u root -p --no-create-info preamar > dados.sql
```

### Restore
```bash
# Restaurar backup
mysql -u root -p preamar < backup.sql

# Criar novo banco e restaurar
mysql -u root -p -e "CREATE DATABASE preamar_novo"
mysql -u root -p preamar_novo < backup.sql
```

### Consultas Úteis
```bash
# Conectar ao banco
mysql -u root -p preamar

# Ver tabelas
SHOW TABLES;

# Ver estrutura de tabela
DESCRIBE desembarques;

# Contar registros
SELECT COUNT(*) FROM desembarques;

# Últimos 10 desembarques
SELECT cod_desembarque, data_coleta, municipio 
FROM desembarques 
ORDER BY data_coleta DESC 
LIMIT 10;
```

## 📦 Comandos NPM

```bash
# Instalar dependências
npm install

# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Limpar cache
npm cache clean --force

# Reinstalar tudo
rm -rf node_modules package-lock.json
npm install
```

## 🐳 Comandos Docker (se usar)

```bash
# Build da imagem
docker build -t preamar-api .

# Rodar container
docker run -p 3001:3001 --env-file .env preamar-api

# Rodar com docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar containers
docker-compose down
```

## 🔍 Comandos de Debug

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Verificar porta em uso
lsof -i :3001

# Matar processo na porta
lsof -ti:3001 | xargs kill -9

# Verificar status do MariaDB
systemctl status mariadb

# Reiniciar MariaDB
sudo systemctl restart mariadb
```

## 📊 Comandos Git

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Mensagem do commit"

# Ver status
git status

# Ver histórico
git log --oneline

# Criar branch
git checkout -b feature/nova-funcionalidade

# Merge de branch
git checkout main
git merge feature/nova-funcionalidade
```

## 🌐 Comandos cURL para Testar API

```bash
# Listar municípios
curl http://localhost:3001/api/municipios

# Listar espécies
curl http://localhost:3001/api/especies

# Criar desembarque
curl -X POST http://localhost:3001/api/desembarques \
  -H "Content-Type: application/json" \
  -d @exemplo_desembarque.json

# Listar desembarques
curl http://localhost:3001/api/desembarques

# Buscar desembarque específico
curl http://localhost:3001/api/desembarques/1

# Atualizar desembarque
curl -X PUT http://localhost:3001/api/desembarques/1 \
  -H "Content-Type: application/json" \
  -d '{"numero_tripulantes": 4}'

# Deletar desembarque
curl -X DELETE http://localhost:3001/api/desembarques/1

# Estatísticas
curl "http://localhost:3001/api/desembarques/estatisticas?municipio=JP"
```

## 🔐 Comandos PM2 (Produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name preamar-api

# Listar processos
pm2 list

# Ver logs
pm2 logs preamar-api

# Monitorar
pm2 monit

# Reiniciar
pm2 restart preamar-api

# Parar
pm2 stop preamar-api

# Deletar
pm2 delete preamar-api

# Salvar configuração
pm2 save

# Configurar inicialização automática
pm2 startup
```

## 📈 Comandos de Performance

```bash
# Ver uso de memória Node.js
node --max-old-space-size=4096 server.js

# Profilear aplicação
node --inspect server.js

# Ver processos Node
ps aux | grep node

# Monitorar recursos
htop
```

## 🧹 Comandos de Limpeza

```bash
# Limpar logs antigos
find logs/ -name "*.log" -mtime +30 -delete

# Limpar backups antigos
find backups/ -name "*.sql" -mtime +90 -delete

# Limpar node_modules
rm -rf node_modules

# Limpar cache do npm
npm cache clean --force
```

## 📝 Aliases Úteis (adicionar ao .bashrc ou .zshrc)

```bash
# Adicione ao seu ~/.bashrc ou ~/.zshrc

# Atalhos Preamar
alias preamar-start="cd ~/preamar/backend && npm run dev"
alias preamar-db="mysql -u root -p preamar"
alias preamar-backup="mysqldump -u root -p preamar > ~/backups/preamar_$(date +%Y%m%d).sql"
alias preamar-logs="tail -f ~/preamar/backend/logs/app.log"
alias preamar-test="cd ~/preamar/backend && npm test"
```

## 🎯 Fluxo de Trabalho Diário

```bash
# 1. Atualizar código
git pull origin main

# 2. Instalar dependências (se houver)
npm install

# 3. Iniciar servidor
npm run dev

# 4. Em outro terminal, testar API
npm test

# 5. Fazer alterações e commitar
git add .
git commit -m "Descrição das alterações"
git push origin main
```