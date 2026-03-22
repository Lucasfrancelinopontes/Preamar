import { connectDB } from '../db.js';
import { sequelize, defineAssociations } from '../models/index.js';

// Definir associações antes de sincronizar
defineAssociations();

const atualizarBanco = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🔄 Sincronizando modelos com alter: true...');
    console.log('   Isso irá adicionar/modificar colunas sem deletar dados existentes.');
    
    // Usar alter: true para modificar tabelas existentes
    await sequelize.sync({ alter: true });
    
    console.log('✅ Banco de dados atualizado com sucesso!');
    console.log('   Novos campos adicionados:');
    console.log('   - Desembarque.municipio_code');
    console.log('   - Desembarque.localidade_code');
    console.log('   - Captura.comprimento_cm');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    process.exit(1);
  }
};

atualizarBanco();
