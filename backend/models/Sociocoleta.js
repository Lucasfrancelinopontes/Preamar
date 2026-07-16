import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioColeta = sequelize.define('SocioColeta', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_coleta: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  codigo_foto: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ID_municipio: {
    type: DataTypes.INTEGER,   // sem UNSIGNED — igual à PK da tabela municipios
    allowNull: true,
    references: {
      model: 'municipios',
      key: 'ID_municipio'
    }
  },
  localidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  coletor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  digitador: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  data_coleta: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_digitacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'socio_coletas',
  timestamps: true
});