#!/usr/bin/env node
/**
 * Script para testar busca de desembarque por ID
 * Uso: node testarBuscarDesembarque.js [ID_desembarque]
 */

import 'dotenv/config';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function buscarDesembarque(id) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}🔍 Testando busca de desembarque #${id}${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  try {
    console.log(`📡 Endpoint: GET ${API_URL}/desembarques/${id}`);
    console.log(`⏳ Enviando requisição...\n`);

    const response = await fetch(`${API_URL}/desembarques/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    const data = await response.json();

    if (response.ok) {
      console.log(`\n${colors.green}✅ SUCESSO!${colors.reset}\n`);
      console.log(`${colors.green}Dados recebidos:${colors.reset}`);
      console.log(JSON.stringify(data, null, 2));

      if (data.data) {
        console.log(`\n${colors.blue}📊 Resumo:${colors.reset}`);
        console.log(`   Código: ${data.data.cod_desembarque || 'N/A'}`);
        console.log(`   Pescador: ${data.data.pescador?.nome || 'N/A'}`);
        console.log(`   Embarcação: ${data.data.embarcacao?.nome_embarcacao || 'N/A'}`);
        console.log(`   Capturas: ${data.data.capturas?.length || 0}`);
        console.log(`   Indivíduos: ${data.data.individuos?.length || 0}`);
        console.log(`   Artes: ${data.data.artes?.length || 0}`);
        
        if (data.data.estatisticas) {
          console.log(`\n${colors.blue}📈 Estatísticas:${colors.reset}`);
          console.log(`   Espécies: ${data.data.estatisticas.total_especies}`);
          console.log(`   Peso Total: ${data.data.estatisticas.peso_total_kg} kg`);
          console.log(`   Valor Total: R$ ${data.data.estatisticas.valor_total}`);
          console.log(`   Indivíduos Medidos: ${data.data.estatisticas.total_individuos_medidos}`);
        }
      }
    } else {
      console.log(`\n${colors.red}❌ ERRO!${colors.reset}\n`);
      console.log(`${colors.red}Resposta:${colors.reset}`);
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log(`\n${colors.red}❌ ERRO NA REQUISIÇÃO!${colors.reset}\n`);
    console.error(error);
  }
}

// Executar
const id = process.argv[2];

if (!id) {
  console.log(`${colors.yellow}❓ Uso: node testarBuscarDesembarque.js [ID_desembarque]${colors.reset}`);
  console.log(`${colors.yellow}💡 Exemplo: node testarBuscarDesembarque.js 1${colors.reset}\n`);
  process.exit(1);
}

buscarDesembarque(id)
  .then(() => {
    console.log(`\n${colors.cyan}========================================${colors.reset}\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`\n${colors.red}Erro fatal:${colors.reset}`, err);
    process.exit(1);
  });
