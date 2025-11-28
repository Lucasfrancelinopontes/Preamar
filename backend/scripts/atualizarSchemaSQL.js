/**
 * Script Alternativo de Atualização de Schema - SQL Direto
 * 
 * Este script adiciona as novas colunas de coordenadas usando SQL direto,
 * evitando problemas com o Sequelize ao tentar remover colunas antigas.
 * 
 * Uso: node backend/scripts/atualizarSchemaSQL.js
 */

import { sequelize } from '../db.js';

const atualizarSchemaSQL = async () => {
  console.log('\n🔄 ===== ATUALIZAÇÃO DE SCHEMA - MÉTODO SQL DIRETO =====\n');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('🗄️  Banco de dados:', process.env.DB_NAME || 'preamar');
  console.log('\n');

  try {
    // Passo 1: Conectar
    console.log('🔌 Passo 1: Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!\n');

    // Passo 2: Verificar quais colunas já existem
    console.log('🔍 Passo 2: Verificando colunas existentes...');
    const [colunasExistentes] = await sequelize.query(
      "SHOW COLUMNS FROM desembarques"
    );

    const nomesColunas = colunasExistentes.map(col => col.Field);
    console.log(`   Total de colunas: ${nomesColunas.length}\n`);

    // Passo 3: Adicionar colunas que não existem
    console.log('🔧 Passo 3: Adicionando novas colunas de coordenadas...\n');

    const colunasParaAdicionar = [
      {
        nome: 'lat_ida',
        sql: "ALTER TABLE desembarques ADD COLUMN lat_ida DECIMAL(10, 8) NULL COMMENT 'Latitude do ponto de ida (decimal)'",
        descricao: 'Latitude do ponto de ida'
      },
      {
        nome: 'long_ida',
        sql: "ALTER TABLE desembarques ADD COLUMN long_ida DECIMAL(11, 8) NULL COMMENT 'Longitude do ponto de ida (decimal)'",
        descricao: 'Longitude do ponto de ida'
      },
      {
        nome: 'lat_volta',
        sql: "ALTER TABLE desembarques ADD COLUMN lat_volta DECIMAL(10, 8) NULL COMMENT 'Latitude do ponto de volta (decimal)'",
        descricao: 'Latitude do ponto de volta'
      },
      {
        nome: 'long_volta',
        sql: "ALTER TABLE desembarques ADD COLUMN long_volta DECIMAL(11, 8) NULL COMMENT 'Longitude do ponto de volta (decimal)'",
        descricao: 'Longitude do ponto de volta'
      }
    ];

    let adicionadas = 0;
    let jaExistiam = 0;

    for (const coluna of colunasParaAdicionar) {
      if (nomesColunas.includes(coluna.nome)) {
        console.log(`   ⏭️  ${coluna.nome} - Já existe, pulando...`);
        jaExistiam++;
      } else {
        try {
          await sequelize.query(coluna.sql);
          console.log(`   ✅ ${coluna.nome} - Adicionada com sucesso! (${coluna.descricao})`);
          adicionadas++;
        } catch (error) {
          console.error(`   ❌ ${coluna.nome} - Erro ao adicionar:`, error.message);
        }
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`   ✅ Colunas adicionadas: ${adicionadas}`);
    console.log(`   ⏭️  Colunas que já existiam: ${jaExistiam}`);

    // Passo 4: Verificar estrutura final
    console.log('\n🔍 Passo 4: Verificando estrutura final da tabela...');
    const [colunasFinais] = await sequelize.query(
      "SHOW COLUMNS FROM desembarques WHERE Field IN ('lat_ida', 'long_ida', 'lat_volta', 'long_volta')"
    );

    if (colunasFinais.length === 4) {
      console.log('✅ Todas as 4 colunas de coordenadas estão presentes:');
      colunasFinais.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log(`⚠️  Atenção: Esperadas 4 colunas, encontradas ${colunasFinais.length}`);
    }

    // Passo 5: Informações sobre colunas antigas
    console.log('\n📋 Passo 5: Verificando colunas antigas de coordenadas DMS...');
    const [colunasAntigas] = await sequelize.query(
      "SHOW COLUMNS FROM desembarques WHERE Field LIKE '%deg%' OR Field LIKE '%min%' OR Field LIKE '%sec%'"
    );

    if (colunasAntigas.length > 0) {
      console.log(`ℹ️  Encontradas ${colunasAntigas.length} colunas antigas (DMS):`);
      colunasAntigas.forEach(col => {
        console.log(`   - ${col.Field}`);
      });
      console.log('\n💡 Dica: Você pode migrar os dados antigos usando:');
      console.log('   node scripts/migrarCoordenadas.js\n');
      console.log('💡 Após migrar, você pode remover as colunas antigas com:');
      console.log('   ALTER TABLE desembarques DROP COLUMN lat_deg1, DROP COLUMN lat_min1, ...\n');
    } else {
      console.log('✅ Nenhuma coluna antiga encontrada. Estrutura limpa!\n');
    }

    console.log('✨ ===== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! =====\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Teste a API: http://localhost:5000/api/desembarques');
    console.log('   2. Se houver dados nas colunas antigas, execute: node scripts/migrarCoordenadas.js');
    console.log('   3. Atualize o código do formulário para usar lat_ida/long_ida\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ===== ERRO NA ATUALIZAÇÃO =====\n');
    console.error('Mensagem:', error.message);
    
    if (error.original) {
      console.error('\nErro SQL:');
      console.error('  Código:', error.original.code);
      console.error('  SQL:', error.original.sql);
    }

    console.error('\n📋 Stack trace:');
    console.error(error.stack);
    console.error('\n');

    process.exit(1);
  }
};

// Executar
atualizarSchemaSQL();
