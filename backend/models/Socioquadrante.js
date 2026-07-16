import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioQuadrante = sequelize.define('SocioQuadrante', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  id_pescador: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'socio_pescadores',
      key: 'id'
    }
  },
  quadrante: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'socio_quadrantes',
  timestamps: false
});