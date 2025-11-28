/**
 * Script de Migração de Coordenadas DMS para Decimal
 * 
 * Este script converte coordenadas no formato DMS (Graus, Minutos, Segundos)
 * das colunas antigas para o formato decimal nas novas colunas.
 * 
 * Uso: node backend/scripts/migrarCoordenadas.js
 * 
 * ⚠️ Execute este script APENAS se você tiver dados nas colunas antigas:
 * - lat_deg1, lat_min1, lat_sec1 (ponto de ida)
 * - lat_deg2, lat_min2, lat_sec2 (ponto de volta)
 * - long_deg1, long_min1, long_sec1 (ponto de ida)
 * - long_deg2, long_min2, long_sec2 (ponto de volta)
 */

import { sequelize } from '../db.js';
import { Desembarque } from '../models/Desembarque.js';

/**
 * Converte coordenadas DMS (Graus, Minutos, Segundos) para formato Decimal
 * @param {number} degrees - Graus
 * @param {number} minutes - Minutos
 * @param {number} seconds - Segundos
 * @returns {number} - Coordenada em formato decimal
 */
const dmsParaDecimal = (degrees, minutes, seconds) => {
  if (degrees === null || degrees === undefined) return null;
  
  const deg = parseFloat(degrees) || 0;
  const min = parseFloat(minutes) || 0;
  const sec = parseFloat(seconds) || 0;
  
  const decimal = deg + (min / 60) + (sec / 3600);
  
  // Arredondar para 8 casas decimais (precisão suficiente para GPS)
  return Math.round(decimal * 100000000) / 100000000;
};

const migrarCoordenadas = async () => {
  console.log('\n🔄 ===== INICIANDO MIGRAÇÃO DE COORDENADAS =====\n');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('\n');

  try {
    // Passo 1: Conectar ao banco
    console.log('🔌 Passo 1: Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!\n');

    // Passo 2: Verificar se as colunas antigas existem
    console.log('🔍 Passo 2: Verificando existência das colunas antigas...');
    const [oldColumns] = await sequelize.query(
      "SHOW COLUMNS FROM desembarques WHERE Field LIKE '%deg%' OR Field LIKE '%min%' OR Field LIKE '%sec%'"
    );

    if (oldColumns.length === 0) {
      console.log('ℹ️  Nenhuma coluna DMS antiga encontrada.');
      console.log('   As colunas antigas (lat_deg1, lat_min1, etc.) não existem mais.');
      console.log('   Nada a migrar. ✅\n');
      process.exit(0);
    }

    console.log(`✅ Encontradas ${oldColumns.length} colunas DMS antigas\n`);

    // Passo 3: Buscar registros com coordenadas DMS
    console.log('📊 Passo 3: Buscando registros com coordenadas DMS...');
    const [registros] = await sequelize.query(`
      SELECT 
        ID_desembarque,
        lat_deg1, lat_min1, lat_sec1,
        lat_deg2, lat_min2, lat_sec2,
        long_deg1, long_min1, long_sec1,
        long_deg2, long_min2, long_sec2
      FROM desembarques
      WHERE (lat_deg1 IS NOT NULL OR lat_deg2 IS NOT NULL OR long_deg1 IS NOT NULL OR long_deg2 IS NOT NULL)
    `);

    console.log(`✅ Encontrados ${registros.length} registros para migrar\n`);

    if (registros.length === 0) {
      console.log('ℹ️  Não há dados nas colunas antigas para migrar. ✅\n');
      process.exit(0);
    }

    // Passo 4: Migrar os dados
    console.log('🔧 Passo 4: Convertendo e migrando coordenadas...');
    let migrados = 0;
    let erros = 0;

    for (const registro of registros) {
      try {
        // Converter coordenadas de ida
        const lat_ida = dmsParaDecimal(
          registro.lat_deg1,
          registro.lat_min1,
          registro.lat_sec1
        );

        const long_ida = dmsParaDecimal(
          registro.long_deg1,
          registro.long_min1,
          registro.long_sec1
        );

        // Converter coordenadas de volta
        const lat_volta = dmsParaDecimal(
          registro.lat_deg2,
          registro.lat_min2,
          registro.lat_sec2
        );

        const long_volta = dmsParaDecimal(
          registro.long_deg2,
          registro.long_min2,
          registro.long_sec2
        );

        // Atualizar registro
        await sequelize.query(`
          UPDATE desembarques 
          SET 
            lat_ida = ?,
            long_ida = ?,
            lat_volta = ?,
            long_volta = ?
          WHERE ID_desembarque = ?
        `, {
          replacements: [lat_ida, long_ida, lat_volta, long_volta, registro.ID_desembarque]
        });

        migrados++;

        if (migrados % 10 === 0) {
          console.log(`   Processados: ${migrados}/${registros.length}`);
        }

      } catch (error) {
        console.error(`   ❌ Erro ao migrar registro ${registro.ID_desembarque}:`, error.message);
        erros++;
      }
    }

    console.log(`\n✅ Migração concluída!`);
    console.log(`   ✓ Registros migrados com sucesso: ${migrados}`);
    if (erros > 0) {
      console.log(`   ⚠️  Registros com erro: ${erros}`);
    }

    // Passo 5: Mostrar exemplo de conversão
    console.log('\n📋 Passo 5: Exemplo de dados convertidos:');
    const [exemplo] = await sequelize.query(`
      SELECT 
        ID_desembarque,
        lat_ida, long_ida,
        lat_volta, long_volta
      FROM desembarques
      WHERE lat_ida IS NOT NULL OR long_ida IS NOT NULL
      LIMIT 3
    `);

    exemplo.forEach((reg, index) => {
      console.log(`\n   Registro ${index + 1} (ID: ${reg.ID_desembarque}):`);
      console.log(`      Ida:   lat=${reg.lat_ida}, long=${reg.long_ida}`);
      console.log(`      Volta: lat=${reg.lat_volta}, long=${reg.long_volta}`);
    });

    console.log('\n✨ ===== MIGRAÇÃO CONCLUÍDA COM SUCESSO! =====\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Verifique alguns registros manualmente para confirmar a conversão');
    console.log('   2. Após confirmar, você pode remover as colunas antigas (opcional):');
    console.log('      ALTER TABLE desembarques DROP COLUMN lat_deg1, DROP COLUMN lat_min1, ...\n');
    console.log('   3. Teste a API para garantir que tudo está funcionando\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ===== ERRO NA MIGRAÇÃO =====\n');
    console.error('Mensagem:', error.message);
    console.error('\n📋 Stack trace:');
    console.error(error.stack);
    console.error('\n');
    process.exit(1);
  }
};

// Executar o script
migrarCoordenadas();
