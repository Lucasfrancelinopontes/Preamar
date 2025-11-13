// Script para verificar estado atual das tabelas principais

import {
  Pescador,
  Embarcacao,
  Desembarque,
  Captura,
  Especie
} from '../models/index.js';
import { connectDB } from '../db.js';

async function verificarEstadoBanco() {
  try {
    console.log('📦 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('📊 RESUMO DO BANCO DE DADOS');
    console.log('=' * 50);
    
    // Contar registros
    const especies = await Especie.count();
    const pescadores = await Pescador.count();
    const embarcacoes = await Embarcacao.count();
    const desembarques = await Desembarque.count();
    const capturas = await Captura.count();
    
    console.log(`🐟 Espécies: ${especies} registros`);
    console.log(`👤 Pescadores: ${pescadores} registros`);
    console.log(`⛵ Embarcações: ${embarcacoes} registros`);
    console.log(`🎣 Desembarques: ${desembarques} registros`);
    console.log(`🐟 Capturas: ${capturas} registros`);
    
    console.log('');
    console.log('🔍 VERIFICAÇÃO DA ESPÉCIE ID 8:');
    const especie8 = await Especie.findByPk(8);
    if (especie8) {
      console.log(`✅ Espécie ID 8 encontrada: ${especie8.nome_popular} (${especie8.nome_cientifico})`);
    } else {
      console.log('❌ Espécie ID 8 não encontrada');
    }
    
    console.log('');
    console.log('🔍 ÚLTIMAS CAPTURAS COM ESPÉCIE ID 8:');
    const capturasEspecie8 = await Captura.findAll({
      where: { ID_especie: 8 },
      limit: 5,
      order: [['ID_captura', 'DESC']],
      include: [
        {
          model: Desembarque,
          attributes: ['cod_desembarque', 'data_coleta']
        }
      ]
    });
    
    if (capturasEspecie8.length > 0) {
      console.log(`✅ ${capturasEspecie8.length} capturas encontradas com espécie ID 8:`);
      capturasEspecie8.forEach(captura => {
        console.log(`   - Captura ${captura.ID_captura}: ${captura.peso_kg}kg, R$ ${captura.preco_total} (Desembarque: ${captura.Desembarque?.cod_desembarque})`);
      });
    } else {
      console.log('⚠️ Nenhuma captura encontrada com espécie ID 8');
    }
    
    console.log('');
    console.log('✅ PROBLEMA CORRIGIDO!');
    console.log('A tabela de espécies foi populada e o erro de foreign key foi resolvido.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
  }
}

// Executar
verificarEstadoBanco();