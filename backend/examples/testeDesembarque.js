// Teste para verificar criação de desembarque com espécie ID 8

import {
  Pescador,
  Embarcacao,
  Desembarque,
  DesembarqueArte,
  Captura
} from '../models/index.js';
import { connectDB } from '../db.js';

async function testarDesembarque() {
  try {
    console.log('📦 Conectando ao banco de dados...');
    await connectDB();
    
    // Buscar primeiro pescador e embarcação disponível
    const pescador = await Pescador.findOne();
    const embarcacao = await Embarcacao.findOne();
    
    if (!pescador || !embarcacao) {
      throw new Error('Nenhum pescador ou embarcação encontrado. Execute primeiro o populaBancoDados.js');
    }
    
    console.log(`👤 Usando pescador: ${pescador.nome} (ID: ${pescador.ID_pescador})`);
    console.log(`⛵ Usando embarcação: ${embarcacao.nome_embarcacao} (ID: ${embarcacao.ID_embarcacao})`);
    
    const dataHoje = new Date().toISOString().split('T')[0];
    
    console.log('🎣 Criando desembarque de teste...');
    const desembarque = await Desembarque.create({
      cod_desembarque: `TEST-${Date.now()}`,
      municipio: "JP",
      localidade: "TU",
      data_coleta: dataHoje,
      consecutivo: 999,
      ID_pescador: pescador.ID_pescador,
      ID_embarcacao: embarcacao.ID_embarcacao,
      data_saida: dataHoje,
      hora_saida: "06:00:00",
      data_chegada: dataHoje,
      hora_desembarque: "15:00:00",
      numero_tripulantes: 2,
      pesqueiros: "Banco de Teste",
      coletor: "Teste Automático",
      data_coletor: dataHoje
    });
    
    console.log(`✅ Desembarque criado com ID: ${desembarque.ID_desembarque}`);
    
    console.log('🎯 Criando captura com espécie ID 8 (Xaréu)...');
    const captura = await Captura.create({
      ID_desembarque: desembarque.ID_desembarque,
      ID_especie: 8, // Xaréu - Caranx latus
      peso_kg: 12,
      preco_kg: 12,
      preco_total: 144,
      comprimento_cm: 12
    });
    
    console.log(`✅ Captura criada com ID: ${captura.ID_captura}`);
    console.log('🎉 Teste bem-sucedido! O erro de foreign key foi corrigido.');
    console.log('');
    console.log('📊 Dados da captura criada:');
    console.log(`   - Desembarque: ${captura.ID_desembarque}`);
    console.log(`   - Espécie: ${captura.ID_especie} (Xaréu)`);
    console.log(`   - Peso: ${captura.peso_kg}kg`);
    console.log(`   - Preço/kg: R$ ${captura.preco_kg}`);
    console.log(`   - Total: R$ ${captura.preco_total}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

// Executar
testarDesembarque();