import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Petrecho = sequelize.define('Petrecho', {
  ID_petrecho: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  petrecho: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'petrechos',
  timestamps: false
});