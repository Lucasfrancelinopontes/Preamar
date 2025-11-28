/**
 * Script de Atualização de Schema do Banco de Dados
 * 
 * Este script atualiza a estrutura das tabelas no banco de dados
 * para corresponder aos modelos Sequelize atualizados, sem perder dados existentes.
 * 
 * Uso: node backend/scripts/atualizarSchema.js
 * 
 * ⚠️ IMPORTANTE:
 * - Este script usa { alter: true } que MODIFICA as tabelas existentes
 * - Novas colunas são adicionadas automaticamente
 * - Colunas antigas que não existem mais no modelo são PRESERVADAS (não são removidas)
 * - Sempre faça backup do banco antes de executar em produção!
 */

import { sequelize } from '../db.js';
import { defineAssociations } from '../models/index.js';

// Importar todos os modelos para garantir que estão registrados
import { Pescador } from '../models/Pescador.js';
import { Embarcacao } from '../models/Embarcacao.js';
import { Especie } from '../models/Especie.js';
import { Petrecho } from '../models/Petrecho.js';
import { Desembarque } from '../models/Desembarque.js';
import { DesembarqueArte } from '../models/DesembarqueArte.js';
import { Captura } from '../models/Captura.js';
import { Individuo } from '../models/Individuo.js';
import { Usuario } from '../models/Usuario.js';

const atualizarSchema = async () => {
  console.log('\n🔄 ===== INICIANDO ATUALIZAÇÃO DO SCHEMA =====\n');
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
  console.log('🗄️  Banco de dados:', process.env.DB_NAME || 'preamar');
  console.log('🖥️  Host:', process.env.DB_HOST || 'localhost');
  console.log('\n');

  try {
    // Passo 1: Testar conexão
    console.log('🔌 Passo 1: Testando conexão com o banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Passo 2: Definir associações
    console.log('🔗 Passo 2: Definindo associações entre modelos...');
    defineAssociations();
    console.log('✅ Associações definidas!\n');

    // Passo 3: Verificar modelos carregados
    console.log('📋 Passo 3: Modelos carregados:');
    const models = Object.keys(sequelize.models);
    models.forEach(model => {
      console.log(`   - ${model}`);
    });
    console.log(`   Total: ${models.length} modelos\n`);

    // Passo 4: Executar sincronização com alter: true
    console.log('🔧 Passo 4: Sincronizando modelos com o banco de dados...');
    console.log('⚠️  Usando { alter: true } - modificando estrutura das tabelas existentes');
    console.log('   (Novas colunas serão adicionadas, dados existentes serão preservados)\n');

    await sequelize.sync({ alter: true });

    console.log('✅ Sincronização concluída com sucesso!\n');

    // Passo 5: Verificar colunas específicas do Desembarque
    console.log('🔍 Passo 5: Verificando colunas da tabela desembarques...');
    const [results] = await sequelize.query(
      "SHOW COLUMNS FROM desembarques WHERE Field IN ('lat_ida', 'long_ida', 'lat_volta', 'long_volta')"
    );

    if (results.length === 4) {
      console.log('✅ Colunas de coordenadas encontradas:');
      results.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('⚠️  Atenção: Algumas colunas de coordenadas podem não ter sido criadas.');
      console.log(`   Encontradas: ${results.length}/4 colunas`);
    }

    console.log('\n✨ ===== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! =====\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Verifique se todas as colunas foram criadas corretamente');
    console.log('   2. Teste a API para garantir que os endpoints estão funcionando');
    console.log('   3. Se houver dados antigos nas colunas DMS (lat_deg1, lat_min1, etc.),');
    console.log('      você pode criar um script para migrar esses dados para as novas colunas decimais\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ===== ERRO NA ATUALIZAÇÃO DO SCHEMA =====\n');
    console.error('Tipo do erro:', error.name);
    console.error('Mensagem:', error.message);
    
    if (error.original) {
      console.error('\nErro original do banco de dados:');
      console.error('  Código:', error.original.code);
      console.error('  Mensagem:', error.original.sqlMessage || error.original.message);
    }

    console.error('\n📋 Stack trace completo:');
    console.error(error.stack);

    console.error('\n💡 Dicas para resolver:');
    console.error('   1. Verifique se o arquivo .env está configurado corretamente');
    console.error('   2. Confirme que o banco de dados está rodando');
    console.error('   3. Verifique as credenciais de acesso (DB_USER, DB_PASS)');
    console.error('   4. Se o erro for de sintaxe SQL, pode ser necessário ajustar manualmente\n');

    process.exit(1);
  }
};

// Executar o script
atualizarSchema();
