import { DataTypes } from 'sequelize';

const columnsByTable = {
  socio_pescadores: {
    cpf: { type: DataTypes.STRING(14), allowNull: true, unique: true },
    local_moradia_sede_municipal: { type: DataTypes.STRING(255), allowNull: true },
    tempo_atividade: { type: DataTypes.INTEGER, allowNull: true },
    horas_dia: { type: DataTypes.INTEGER, allowNull: true },
    fontes_renda: { type: DataTypes.TEXT, allowNull: true },
    observacao_braca: { type: DataTypes.TEXT, allowNull: true },
    petrechos_proprios: { type: DataTypes.TEXT, allowNull: true },
    petrechos_de_quem: { type: DataTypes.TEXT, allowNull: true },
    conservacao_pescado: { type: DataTypes.TEXT, allowNull: true },
    categoria_pesca: { type: DataTypes.STRING(255), allowNull: true },
    principal_pescaria: { type: DataTypes.STRING(255), allowNull: true },
    entrega_atravessador: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    divida_com_atravessador: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
  },
  socio_saude: {
    outros_texto: { type: DataTypes.TEXT, allowNull: true }
  },
  socio_embarcacoes: {
    financiada: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    quitada: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    numero_registro: { type: DataTypes.STRING(100), allowNull: true },
    largura: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    tonelagem_bruta: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    material_casco: { type: DataTypes.STRING(255), allowNull: true },
    ano_construcao: { type: DataTypes.INTEGER, allowNull: true },
    registro_capitania: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    registro_rgp: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    licenciamento_ibama: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    licenciamento_mpa: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    propulsoes: { type: DataTypes.TEXT, allowNull: true }
  },
  socio_producao: {
    producao_media_viagem_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    valor_medio: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    percepcao_pesca_hoje_vs_passado: { type: DataTypes.TEXT, allowNull: true },
    percepcao_tamanho_volume_pescado: { type: DataTypes.TEXT, allowNull: true }
  },
  socio_despesas: {
    item: { type: DataTypes.STRING(100), allowNull: true },
    tipo: { type: DataTypes.STRING(100), allowNull: true },
    quantidade: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    outros: { type: DataTypes.TEXT, allowNull: true },
    frequencia: { type: DataTypes.STRING(100), allowNull: true }
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

export const ensureSocioSchema = async (sequelizeInstance) => {
  for (const [tableName, columns] of Object.entries(columnsByTable)) {
    await addMissingColumns(sequelizeInstance, tableName, columns);
  }
};
