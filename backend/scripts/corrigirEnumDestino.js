import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';

const corrigirEnum = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🔄 Corrigindo ENUM da coluna destino_pescado...');
    
    // Modificar a coluna para aceitar 'consumidor'
    await sequelize.query(`
      ALTER TABLE desembarques 
      MODIFY COLUMN destino_pescado 
      ENUM('atravessador', 'armador', 'consumidor', 'diretoConsumidor', 'outros')
    `);
    
    console.log('✅ ENUM atualizado com sucesso!');
    console.log('   Valores aceitos agora:');
    console.log('   - atravessador');
    console.log('   - armador');
    console.log('   - consumidor');
    console.log('   - diretoConsumidor');
    console.log('   - outros');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao corrigir ENUM:', error);
    process.exit(1);
  }
};

corrigirEnum();
