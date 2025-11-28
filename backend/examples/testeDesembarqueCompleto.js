/**
 * Script de Teste - Criar Desembarque Completo
 * 
 * Este script testa a criação de um desembarque com todos os relacionamentos.
 * 
 * Uso: node examples/testeDesembarqueCompleto.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

const testarCriacaoDesembarque = async () => {
  log.title('🧪 TESTE: Criar Desembarque Completo');

  try {
    // 1. Carregar dados do exemplo
    log.info('Carregando dados de exemplo...');
    const jsonPath = path.join(__dirname, 'desembarque-completo-exemplo.json');
    const dadosExemplo = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Gerar código único com timestamp
    const timestamp = Date.now();
    dadosExemplo.desembarque.cod_desembarque = `JP-TB-28-11-2025-${timestamp}`;
    dadosExemplo.pescador.cpf = `${timestamp.toString().slice(-11)}`;
    dadosExemplo.embarcacao.codigo_embarcacao = `JP-EST-${timestamp}`;
    
    log.success('Dados carregados e preparados');
    console.log(`  Código: ${dadosExemplo.desembarque.cod_desembarque}`);
    console.log(`  Pescador: ${dadosExemplo.pescador.nome}`);
    console.log(`  Embarcação: ${dadosExemplo.embarcacao.nome_embarcacao}`);
    console.log(`  Espécies: ${dadosExemplo.especies.length}`);
    
    // 2. Criar desembarque
    log.info('\nEnviando requisição para API...');
    console.log(`  URL: ${API_URL}/desembarques`);
    
    const response = await fetch(`${API_URL}/desembarques`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dadosExemplo)
    });
    
    const resultado = await response.json();
    
    // 3. Verificar resposta
    if (response.ok && resultado.success) {
      log.success('\n✨ DESEMBARQUE CRIADO COM SUCESSO!\n');
      
      console.log(`${colors.bright}Dados do Desembarque:${colors.reset}`);
      console.log(`  ID: ${resultado.data.ID_desembarque}`);
      console.log(`  Código: ${resultado.data.cod_desembarque}`);
      console.log(`  Total: R$ ${resultado.data.total_desembarque.toFixed(2)}`);
      
      if (resultado.data.resumo) {
        console.log(`\n${colors.bright}Resumo:${colors.reset}`);
        console.log(`  Capturas: ${resultado.data.resumo.capturas}`);
        console.log(`  Indivíduos: ${resultado.data.resumo.individuos}`);
        console.log(`  Artes: ${resultado.data.resumo.artes}`);
      }
      
      // 4. Buscar desembarque criado
      log.info('\nBuscando desembarque criado...');
      const buscarResponse = await fetch(
        `${API_URL}/desembarques/${resultado.data.ID_desembarque}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      const desembarque = await buscarResponse.json();
      
      if (buscarResponse.ok && desembarque.success) {
        log.success('Desembarque recuperado com sucesso!');
        
        console.log(`\n${colors.bright}Dados Completos:${colors.reset}`);
        console.log(`  Pescador: ${desembarque.data.pescador?.nome || 'N/A'}`);
        console.log(`  Embarcação: ${desembarque.data.embarcacao?.nome_embarcacao || 'N/A'}`);
        console.log(`  Capturas: ${desembarque.data.capturas?.length || 0}`);
        console.log(`  Indivíduos: ${desembarque.data.individuos?.length || 0}`);
        console.log(`  Artes: ${desembarque.data.artes?.length || 0}`);
        
        if (desembarque.data.capturas && desembarque.data.capturas.length > 0) {
          console.log(`\n${colors.bright}Espécies Capturadas:${colors.reset}`);
          desembarque.data.capturas.forEach((captura, index) => {
            console.log(`  ${index + 1}. ${captura.especie?.nome_popular || 'N/A'}`);
            console.log(`     Peso: ${captura.peso_kg}kg`);
            console.log(`     Preço: R$ ${captura.preco_kg}/kg`);
            console.log(`     Total: R$ ${captura.preco_total}`);
          });
        }
        
        if (desembarque.data.individuos && desembarque.data.individuos.length > 0) {
          console.log(`\n${colors.bright}Biometria (primeiros 5):${colors.reset}`);
          desembarque.data.individuos.slice(0, 5).forEach((ind) => {
            console.log(`  #${ind.numero_individuo}: ${ind.especie?.nome_popular || 'N/A'}`);
            console.log(`     Comprimento: ${ind.comprimento_padrao_cm}cm`);
            console.log(`     Peso: ${ind.peso_g}g`);
            console.log(`     Sexo: ${ind.sexo || 'N/A'}`);
          });
        }
        
        log.success(`\n🎯 URL para visualizar: http://localhost:3000/meus-desembarques/${resultado.data.ID_desembarque}`);
        
      } else {
        log.warning('Não foi possível buscar o desembarque criado');
      }
      
    } else {
      log.error('\n❌ ERRO AO CRIAR DESEMBARQUE\n');
      console.log(`Status: ${response.status}`);
      console.log(`Mensagem: ${resultado.message || 'Erro desconhecido'}`);
      
      if (resultado.error) {
        console.log(`\n${colors.red}Detalhes do erro:${colors.reset}`);
        console.log(resultado.error);
      }
      
      if (resultado.details) {
        console.log(`\n${colors.red}Detalhes adicionais:${colors.reset}`);
        console.log(resultado.details);
      }
    }
    
  } catch (error) {
    log.error('\n❌ ERRO FATAL\n');
    console.error(error.message);
    console.error(error.stack);
  }
};

// Executar teste
testarCriacaoDesembarque();
