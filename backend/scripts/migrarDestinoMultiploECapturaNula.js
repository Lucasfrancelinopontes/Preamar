import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';

const migrar = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();

    console.log('🔄 Migrando schema para destino múltiplo e captura sem peso...');

    // 1) destino_pescado: ENUM -> TEXT (para permitir múltiplos valores em CSV)
    await sequelize.query(`
      ALTER TABLE desembarques
      MODIFY COLUMN destino_pescado TEXT NULL
    `);

    // 2) destino_apelido: pode crescer com múltiplos apelidos
    await sequelize.query(`
      ALTER TABLE desembarques
      MODIFY COLUMN destino_apelido TEXT NULL
    `);

    // 3) capturas.peso_kg: permitir NULL
    await sequelize.query(`
      ALTER TABLE capturas
      MODIFY COLUMN peso_kg DECIMAL(10,2) NULL
    `);

    console.log('✅ Migração concluída com sucesso!');
    console.log('   - desembarques.destino_pescado: TEXT NULL');
    console.log('   - desembarques.destino_apelido: TEXT NULL');
    console.log('   - capturas.peso_kg: DECIMAL(10,2) NULL');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

migrar();
