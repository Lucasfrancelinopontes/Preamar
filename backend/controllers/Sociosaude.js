import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioSaude = sequelize.define('SocioSaude', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_pescador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'socio_pescadores',
      key: 'id'
    }
  },
  vista: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pele: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  coluna: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ginecologico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  outros: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'socio_saude',
  timestamps: false
});