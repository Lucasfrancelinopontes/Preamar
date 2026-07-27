import { DataTypes } from 'sequelize';

const columnsByTable = {
  peixarias: {
    observacoes_especies: { type: DataTypes.TEXT, allowNull: true },
    descricao_processo_comercio: { type: DataTypes.TEXT, allowNull: true }
  },
  peixaria_despesas: {
    nome_outros: { type: DataTypes.STRING(255), allowNull: true }
  }
};

const addMissingColumns = async (sequelizeInstance, tableName, columns) => {
  const queryInterface = sequelizeInstance.getQueryInterface();

  let description;
  try {
    description = await queryInterface.describeTable(tableName);
  } catch (error) {
    return;
  }

  for (const [columnName, definition] of Object.entries(columns)) {
    if (description[columnName]) continue;
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

export const ensurePeixariaSchema = async (sequelizeInstance) => {
  for (const [tableName, columns] of Object.entries(columnsByTable)) {
    await addMissingColumns(sequelizeInstance, tableName, columns);
  }
};