import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioPetrecho = sequelize.define('SocioPetrecho', {
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
  nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tamanho_m: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  tamanho_bracas: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  unidades: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo_isca: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  processo: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'socio_petrechos',
  timestamps: false
});