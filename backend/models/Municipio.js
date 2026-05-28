import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Municipio = sequelize.define('Municipio', {
  ID_municipio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  municipio: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  municipioCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  localidades: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  tableName: 'municipios',
  timestamps: false
});