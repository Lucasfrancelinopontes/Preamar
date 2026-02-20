import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';

// Script para garantir a coluna `nome` em `desembarque_artes`
// Uso: node backend/scripts/atualizarSchemaArtes.js

const main = async () => {
  await connectDB();

  const qi = sequelize.getQueryInterface();

  const tableName = 'desembarque_artes';
  const columnName = 'nome';

  const table = await qi.describeTable(tableName);

  if (!table[columnName]) {
    console.log(`Adicionando coluna ${tableName}.${columnName}...`);
    await qi.addColumn(tableName, columnName, {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true,
      comment: 'Nome da arte quando arte=outras'
    });
    console.log('✅ Coluna adicionada.');
  } else {
    console.log('ℹ️ Coluna já existe.');
  }

  await sequelize.close();
};

main().catch((err) => {
  console.error('❌ Erro ao atualizar schema de artes:', err);
  process.exit(1);
});
