// Script para popular tabela de espécies com dados do JSON

import { Especie } from '../models/Especie.js';
import { connectDB } from '../db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function popularEspecies() {
  try {
    console.log('📦 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('📂 Carregando dados de espécies do JSON...');
    const jsonPath = join(__dirname, '../api/especies.json');
    const especiesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📋 Encontradas ${especiesData.length} espécies no JSON`);
    
    // Converter dados do JSON para formato do banco
    const especiesFormatadas = especiesData.map(especie => ({
      ID_especie: especie.ID,
      familia: especie.Familia,
      nome_cientifico: especie.Nome_cientifico,
      nome_popular: especie.Nome_popular,
      genero: null, // Não presente no JSON
      habitat: especie.Habitat,
      grau_ameaca: especie.Grau_de_ameaca,
      nivel_trofico: especie.Nivel_trofico,
      valor_comercial: especie.Valor_comercial,
      mercado: especie.Mercado,
      comprimento_max_cm: especie.Comprimento_max_cm,
      inicio_maturacao_cm: especie.Inicio_maturacao_cm,
      pesca: especie.Pesca
    }));
    
    console.log('🐟 Inserindo espécies no banco...');
    
    // Limpar tabela antes de inserir (opcional)
    await Especie.destroy({ where: {} });
    console.log('🗑️  Tabela especies limpa');
    
    // Inserir em lotes para melhor performance
    const batchSize = 100;
    let totalInseridas = 0;
    
    for (let i = 0; i < especiesFormatadas.length; i += batchSize) {
      const batch = especiesFormatadas.slice(i, i + batchSize);
      await Especie.bulkCreate(batch, { 
        ignoreDuplicates: true,
        validate: true
      });
      totalInseridas += batch.length;
      console.log(`✅ Inseridas ${totalInseridas}/${especiesFormatadas.length} espécies`);
    }
    
    // Verificar se inserção foi bem-sucedida
    const count = await Especie.count();
    console.log('');
    console.log('🎉 População de espécies concluída!');
    console.log(`📊 Total de espécies no banco: ${count}`);
    
    // Mostrar algumas espécies para verificação
    console.log('');
    console.log('🔍 Primeiras 5 espécies inseridas:');
    const primeirasCinco = await Especie.findAll({ 
      limit: 5,
      attributes: ['ID_especie', 'nome_popular', 'nome_cientifico']
    });
    
    primeirasCinco.forEach(especie => {
      console.log(`   ID: ${especie.ID_especie} - ${especie.nome_popular} (${especie.nome_cientifico})`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao popular espécies:', error);
    process.exit(1);
  }
}

// Executar
popularEspecies();