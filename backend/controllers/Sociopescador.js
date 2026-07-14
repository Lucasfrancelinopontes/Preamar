import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioPescador = sequelize.define('SocioPescador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_coleta: {
    type: DataTypes.INTEGER,
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
  }
}, {
  tableName: 'socio_pescadores',
  timestamps: false
});