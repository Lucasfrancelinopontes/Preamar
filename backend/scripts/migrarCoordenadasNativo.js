/**
 * Script de Migração de Coordenadas DMS para Decimal - Driver Nativo
 * 
 * Converte coordenadas DMS (Graus, Minutos, Segundos) para formato Decimal
 * 
 * Uso: node backend/scripts/migrarCoordenadasNativo.js
 */

import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_NAME = process.env.DB_NAME || 'preamar';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';

/**
 * Converte coordenadas DMS para formato Decimal
 */
const dmsParaDecimal = (degrees, minutes, seconds) => {
  if (degrees === null || degrees === undefined) return null;
  
  const deg = parseFloat(degrees) || 0;
  const min = parseFloat(minutes) || 0;
  const sec = parseFloat(seconds) || 0;
  
  const decimal = deg + (min / 60) + (sec / 3600);
  
  // Arredondar para 8 casas decimais
  return Math.round(decimal * 100000000) / 100000000;
};

const migrarCoordenadasNativo = async () => {
  let conn;

  console.log('\n🔄 ===== MIGRAÇÃO DE COORDENADAS DMS → DECIMAL =====\n');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('🗄️  Banco: ', DB_NAME);
  console.log('\n');

  try {
    // Passo 1: Conectar
    console.log('🔌 Passo 1: Conectando ao banco de dados...');
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    });
    console.log('✅ Conexão estabelecida!\n');

    // Passo 2: Verificar colunas antigas
    console.log('🔍 Passo 2: Verificando colunas antigas DMS...');
    const colunasAntigas = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'desembarques' " +
      "AND (COLUMN_NAME LIKE '%deg%' OR COLUMN_NAME LIKE '%min%' OR COLUMN_NAME LIKE '%sec%')",
      [DB_NAME]
    );

    if (colunasAntigas.length === 0) {
      console.log('ℹ️  Nenhuma coluna DMS antiga encontrada.');
      console.log('   As colunas antigas já foram removidas. ✅\n');
      return;
    }

    console.log(`✅ Encontradas ${colunasAntigas.length} colunas DMS\n`);

    // Passo 3: Buscar registros
    console.log('📊 Passo 3: Buscando registros com coordenadas DMS...');
    const registros = await conn.query(`
      SELECT 
        ID_desembarque,
        lat_deg1, lat_min1, lat_sec1,
        lat_deg2, lat_min2, lat_sec2,
        long_deg1, long_min1, long_sec1,
        long_deg2, long_min2, long_sec2
      FROM desembarques
      WHERE (lat_deg1 IS NOT NULL OR lat_deg2 IS NOT NULL 
             OR long_deg1 IS NOT NULL OR long_deg2 IS NOT NULL)
    `);

    console.log(`✅ Encontrados ${registros.length} registros para migrar\n`);

    if (registros.length === 0) {
      console.log('ℹ️  Não há dados nas colunas antigas. ✅\n');
      return;
    }

    // Passo 4: Migrar
    console.log('🔧 Passo 4: Convertendo e migrando coordenadas...\n');

    let migrados = 0;
    let comErro = 0;

    // Usar transação para garantir integridade
    await conn.beginTransaction();

    try {
      for (const reg of registros) {
        try {
          // Converter coordenadas de ida
          const lat_ida = dmsParaDecimal(reg.lat_deg1, reg.lat_min1, reg.lat_sec1);
          const long_ida = dmsParaDecimal(reg.long_deg1, reg.long_min1, reg.long_sec1);

          // Converter coordenadas de volta
          const lat_volta = dmsParaDecimal(reg.lat_deg2, reg.lat_min2, reg.lat_sec2);
          const long_volta = dmsParaDecimal(reg.long_deg2, reg.long_min2, reg.long_sec2);

          // Atualizar registro
          await conn.query(
            'UPDATE desembarques SET lat_ida=?, long_ida=?, lat_volta=?, long_volta=? WHERE ID_desembarque=?',
            [lat_ida, long_ida, lat_volta, long_volta, reg.ID_desembarque]
          );

          migrados++;

          // Log de progresso
          if (migrados % 10 === 0 || migrados === registros.length) {
            console.log(`   📍 Processados: ${migrados}/${registros.length}`);
          }

          // Mostrar exemplo dos primeiros 3 registros
          if (migrados <= 3) {
            console.log(`\n   ✅ Registro ${reg.ID_desembarque} convertido:`);
            if (lat_ida !== null || long_ida !== null) {
              console.log(`      IDA:   lat ${reg.lat_deg1}°${reg.lat_min1}'${reg.lat_sec1}" → ${lat_ida}`);
              console.log(`             long ${reg.long_deg1}°${reg.long_min1}'${reg.long_sec1}" → ${long_ida}`);
            }
            if (lat_volta !== null || long_volta !== null) {
              console.log(`      VOLTA: lat ${reg.lat_deg2}°${reg.lat_min2}'${reg.lat_sec2}" → ${lat_volta}`);
              console.log(`             long ${reg.long_deg2}°${reg.long_min2}'${reg.long_sec2}" → ${long_volta}`);
            }
            console.log('');
          }

        } catch (error) {
          console.error(`   ❌ Erro no registro ${reg.ID_desembarque}:`, error.message);
          comErro++;
        }
      }

      // Commit da transação
      await conn.commit();
      console.log('\n✅ Transação confirmada!\n');

    } catch (error) {
      await conn.rollback();
      throw error;
    }

    console.log('📊 Resumo da Migração:');
    console.log(`   ✅ Registros migrados: ${migrados}`);
    if (comErro > 0) {
      console.log(`   ❌ Registros com erro: ${comErro}`);
    }

    // Passo 5: Verificar resultado
    console.log('\n🔍 Passo 5: Verificando dados migrados...');
    const [stats] = await conn.query(
      "SELECT " +
      "  COUNT(*) as total, " +
      "  COUNT(lat_ida) as com_lat_ida, " +
      "  COUNT(long_ida) as com_long_ida, " +
      "  COUNT(lat_volta) as com_lat_volta, " +
      "  COUNT(long_volta) as com_long_volta " +
      "FROM desembarques"
    );

    console.log('\n   Estatísticas pós-migração:');
    console.log(`      Total de registros: ${stats.total}`);
    console.log(`      Com lat_ida: ${stats.com_lat_ida}`);
    console.log(`      Com long_ida: ${stats.com_long_ida}`);
    console.log(`      Com lat_volta: ${stats.com_lat_volta}`);
    console.log(`      Com long_volta: ${stats.com_long_volta}`);

    // Mostrar exemplos
    console.log('\n📋 Passo 6: Exemplos de coordenadas convertidas:');
    const exemplos = await conn.query(
      "SELECT ID_desembarque, lat_ida, long_ida, lat_volta, long_volta " +
      "FROM desembarques " +
      "WHERE lat_ida IS NOT NULL OR long_ida IS NOT NULL " +
      "LIMIT 3"
    );

    exemplos.forEach((ex, i) => {
      console.log(`\n   ${i + 1}. Desembarque ${ex.ID_desembarque}:`);
      if (ex.lat_ida !== null) console.log(`      Ida:   lat=${ex.lat_ida}, long=${ex.long_ida}`);
      if (ex.lat_volta !== null) console.log(`      Volta: lat=${ex.lat_volta}, long=${ex.long_volta}`);
    });

    console.log('\n\n✨ ===== MIGRAÇÃO CONCLUÍDA COM SUCESSO! =====\n');
    console.log('📝 Próximos passos:');
    console.log('   1. ✅ Verifique alguns registros manualmente');
    console.log('   2. 🧪 Teste a API com os novos dados');
    console.log('   3. 🗑️  Após confirmar, remova as colunas antigas:\n');
    
    const dropCols = colunasAntigas.map(c => c.COLUMN_NAME).filter(name => name !== 'consecutivo');
    console.log(`      ALTER TABLE desembarques`);
    dropCols.forEach((col, idx) => {
      const comma = idx < dropCols.length - 1 ? ',' : ';';
      console.log(`        DROP COLUMN ${col}${comma}`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ ===== ERRO NA MIGRAÇÃO =====\n');
    console.error('Tipo:', error.name);
    console.error('Mensagem:', error.message);
    console.error('\n📋 Stack trace:');
    console.error(error.stack);
    console.error('\n');

  } finally {
    if (conn) {
      await conn.end();
      console.log('🔌 Conexão fechada.\n');
    }
    process.exit(0);
  }
};

// Executar
migrarCoordenadasNativo();
