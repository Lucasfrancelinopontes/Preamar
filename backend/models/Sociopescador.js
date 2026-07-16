import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioPescador = sequelize.define('SocioPescador', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  id_coleta: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'socio_coletas',
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: true
  },
  apelido: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sexo: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  naturalidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado_civil: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  escolaridade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  local_moradia_sede_municipal: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  atividade_principal_renda: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  atividade_secundaria_renda: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  composicao_familiar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  local_moradia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  local_moradia_outro: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tipo_construcao: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo_construcao_outro: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tempo_atividade: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  horas_dia: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fontes_renda: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacao_braca: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  petrechos_proprios: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  petrechos_de_quem: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  conservacao_pescado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria_pesca: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  principal_pescaria: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  entrega_atravessador: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  divida_com_atravessador: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'socio_pescadores',
  timestamps: false
});