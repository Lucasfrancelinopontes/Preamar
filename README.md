# Sistema Preamar - Sistema de Gestão de Desembarque de Pesca

## 📖 O que é o Preamar?

O Preamar é um sistema completo de gestão de desembarque de pesca, desenvolvido para facilitar o controle e monitoramento de operações pesqueiras. A plataforma integra um backend robusto com um frontend intuitivo, oferecendo uma solução automatizada e eficiente para gerenciamento de dados de pesca.

## 🎯 Objetivo

Proporcionar uma ferramenta modular e escalável que automatize processos essenciais de desembarque, desde a verificação de dependências até o gerenciamento completo de dados e operações no setor pesqueiro.

## 🏗️ Arquitetura

O sistema é construído sobre tecnologias modernas:

- **Backend**: Node.js com Express e Sequelize para API REST robusta
- **Frontend**: Next.js com React para interface responsiva e dinâmica
- **Banco de Dados**: Gerenciamento automático de sincronização e população de dados
- **Automação**: Scripts inteligentes para setup e gerenciamento de processos

## ✨ Características Principais

- Arquitetura modular e escalável
- Sincronização automática de banco de dados
- Gerenciamento inteligente de processos e portas
- Interface web moderna e responsiva
- Sistema de logs detalhado
- Parada segura de serviços

## 📦 Estrutura do Projeto

```
Preamar/
├── backend/          # API Node.js + Express + Sequelize
├── form/             # Frontend Next.js + React
├── scripts/          # Scripts de automação
└── iniciar-preamar.bat # Atalho para Windows
```