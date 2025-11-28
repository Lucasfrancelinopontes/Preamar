/**
 * Script de Atualização de Schema - Usando Driver Nativo MariaDB
 * 
 * Este script adiciona as novas colunas de coordenadas usando o driver MariaDB diretamente,
 * evitando bugs do Sequelize com consultas específicas.
 * 
 * Uso: node backend/scripts/atualizarSchemaNativo.js
 */

import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_NAME = process.env.DB_NAME || 'preamar';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';

const atualizarSchemaNativo = async () => {
  let conn;

  console.log('\n🔄 ===== ATUALIZAÇÃO DE SCHEMA - DRIVER NATIVO =====\n');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('🗄️  Banco de dados:', DB_NAME);
  console.log('🖥️  Host:', DB_HOST);
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

    // Passo 2: Verificar colunas existentes
    console.log('🔍 Passo 2: Verificando colunas existentes na tabela desembarques...');
    const colunasExistentes = await conn.query("SHOW COLUMNS FROM desembarques");
    const nomesColunas = colunasExistentes.map(col => col.Field);
    console.log(`   Total de colunas: ${nomesColunas.length}\n`);

    // Passo 3: Adicionar novas colunas
    console.log('🔧 Passo 3: Adicionando novas colunas de coordenadas...\n');

    const colunasParaAdicionar = [
      {
        nome: 'lat_ida',
        sql: "ALTER TABLE desembarques ADD COLUMN lat_ida DECIMAL(10, 8) NULL COMMENT 'Latitude do ponto de ida (decimal)'",
        descricao: 'Latitude do ponto de ida (formato decimal)'
      },
      {
        nome: 'long_ida',
        sql: "ALTER TABLE desembarques ADD COLUMN long_ida DECIMAL(11, 8) NULL COMMENT 'Longitude do ponto de ida (decimal)'",
        descricao: 'Longitude do ponto de ida (formato decimal)'
      },
      {
        nome: 'lat_volta',
        sql: "ALTER TABLE desembarques ADD COLUMN lat_volta DECIMAL(10, 8) NULL COMMENT 'Latitude do ponto de volta (decimal)'",
        descricao: 'Latitude do ponto de volta (formato decimal)'
      },
      {
        nome: 'long_volta',
        sql: "ALTER TABLE desembarques ADD COLUMN long_volta DECIMAL(11, 8) NULL COMMENT 'Longitude do ponto de volta (decimal)'",
        descricao: 'Longitude do ponto de volta (formato decimal)'
      }
    ];

    let adicionadas = 0;
    let jaExistiam = 0;
    let erros = 0;

    for (const coluna of colunasParaAdicionar) {
      if (nomesColunas.includes(coluna.nome)) {
        console.log(`   ⏭️  ${coluna.nome.padEnd(12)} - Já existe, pulando...`);
        jaExistiam++;
      } else {
        try {
          await conn.query(coluna.sql);
          console.log(`   ✅ ${coluna.nome.padEnd(12)} - Adicionada! (${coluna.descricao})`);
          adicionadas++;
        } catch (error) {
          console.error(`   ❌ ${coluna.nome.padEnd(12)} - Erro:`, error.message);
          erros++;
        }
      }
    }

    console.log('\n📊 Resumo da Atualização:');
    console.log(`   ✅ Colunas adicionadas: ${adicionadas}`);
    console.log(`   ⏭️  Colunas que já existiam: ${jaExistiam}`);
    if (erros > 0) {
      console.log(`   ❌ Erros: ${erros}`);
    }

    // Passo 4: Verificar estrutura final
    console.log('\n🔍 Passo 4: Verificando estrutura final...');
    const colunasFinais = await conn.query(
      "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT " +
      "FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'desembarques' " +
      "AND COLUMN_NAME IN ('lat_ida', 'long_ida', 'lat_volta', 'long_volta') " +
      "ORDER BY COLUMN_NAME",
      [DB_NAME]
    );

    if (colunasFinais.length === 4) {
      console.log('✅ Todas as 4 colunas de coordenadas estão presentes:\n');
      colunasFinais.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`   📍 ${col.COLUMN_NAME}`);
        console.log(`      Tipo: ${col.COLUMN_TYPE} ${nullable}`);
        console.log(`      Comentário: ${col.COLUMN_COMMENT || '(sem comentário)'}\n`);
      });
    } else {
      console.log(`⚠️  Atenção: Esperadas 4 colunas, encontradas ${colunasFinais.length}`);
    }

    // Passo 5: Verificar colunas antigas
    console.log('📋 Passo 5: Verificando colunas antigas de coordenadas DMS...');
    const colunasAntigas = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'desembarques' " +
      "AND (COLUMN_NAME LIKE '%deg%' OR COLUMN_NAME LIKE '%min%' OR COLUMN_NAME LIKE '%sec%') " +
      "ORDER BY COLUMN_NAME",
      [DB_NAME]
    );

    if (colunasAntigas.length > 0) {
      console.log(`\nℹ️  Encontradas ${colunasAntigas.length} colunas antigas no formato DMS:`);
      const grupos = {
        ida: colunasAntigas.filter(c => c.COLUMN_NAME.match(/1$/)),
        volta: colunasAntigas.filter(c => c.COLUMN_NAME.match(/2$/))
      };
      
      if (grupos.ida.length > 0) {
        console.log('\n   🚢 Ponto de IDA:');
        grupos.ida.forEach(col => console.log(`      - ${col.COLUMN_NAME}`));
      }
      
      if (grupos.volta.length > 0) {
        console.log('\n   🏠 Ponto de VOLTA:');
        grupos.volta.forEach(col => console.log(`      - ${col.COLUMN_NAME}`));
      }

      console.log('\n💡 Próximas ações recomendadas:');
      console.log('   1. Migre os dados antigos: node scripts/migrarCoordenadas.js');
      console.log('   2. Após validar os dados, remova as colunas antigas:\n');
      
      const dropCommands = colunasAntigas.map(col => col.COLUMN_NAME).join(', DROP COLUMN ');
      console.log(`      ALTER TABLE desembarques DROP COLUMN ${dropCommands};\n`);
    } else {
      console.log('✅ Nenhuma coluna antiga encontrada. Estrutura limpa!\n');
    }

    // Passo 6: Estatísticas da tabela
    console.log('📈 Passo 6: Estatísticas da tabela desembarques...');
    const [stats] = await conn.query(
      "SELECT COUNT(*) as total_registros FROM desembarques"
    );
    console.log(`   Total de registros: ${stats.total_registros}`);

    if (stats.total_registros > 0) {
      const [coordenadas] = await conn.query(
        "SELECT " +
        "  COUNT(CASE WHEN lat_ida IS NOT NULL THEN 1 END) as com_lat_ida, " +
        "  COUNT(CASE WHEN long_ida IS NOT NULL THEN 1 END) as com_long_ida, " +
        "  COUNT(CASE WHEN lat_volta IS NOT NULL THEN 1 END) as com_lat_volta, " +
        "  COUNT(CASE WHEN long_volta IS NOT NULL THEN 1 END) as com_long_volta " +
        "FROM desembarques"
      );

      console.log('\n   Registros com coordenadas preenchidas:');
      console.log(`      - lat_ida: ${coordenadas.com_lat_ida}`);
      console.log(`      - long_ida: ${coordenadas.com_long_ida}`);
      console.log(`      - lat_volta: ${coordenadas.com_lat_volta}`);
      console.log(`      - long_volta: ${coordenadas.com_long_volta}`);
    }

    console.log('\n✨ ===== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! =====\n');
    console.log('🎯 Resumo Final:');
    console.log(`   ✅ ${adicionadas} nova(s) coluna(s) criada(s)`);
    console.log(`   ⏭️  ${jaExistiam} coluna(s) já existia(m)`);
    console.log(`   📊 ${stats.total_registros} registro(s) na tabela\n`);

    console.log('📝 Próximos passos:');
    console.log('   1. ✅ Estrutura atualizada - pode usar a API normalmente');
    console.log('   2. 🧪 Teste criando um novo desembarque com coordenadas decimais');
    console.log('   3. 📦 Se tiver dados antigos, execute: node scripts/migrarCoordenadas.js\n');

  } catch (error) {
    console.error('\n❌ ===== ERRO NA ATUALIZAÇÃO =====\n');
    console.error('Tipo:', error.name);
    console.error('Mensagem:', error.message);
    
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    
    if (error.errno) {
      console.error('Errno:', error.errno);
    }

    console.error('\n📋 Stack trace:');
    console.error(error.stack);

    console.error('\n💡 Dicas:');
    console.error('   - Verifique se o banco de dados está rodando');
    console.error('   - Confirme as credenciais no arquivo .env');
    console.error('   - Verifique se a tabela "desembarques" existe');
    console.error('   - Verifique permissões de ALTER TABLE\n');

  } finally {
    if (conn) {
      await conn.end();
      console.log('🔌 Conexão fechada.\n');
    }
    process.exit(0);
  }
};

// Executar
atualizarSchemaNativo();
