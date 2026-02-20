import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Pescador = sequelize.define('Pescador', {
  ID_pescador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  apelido: {
    type: DataTypes.STRING(100)
  },
  cpf: {
    type: DataTypes.STRING(14),
    unique: true,
    allowNull: true
  },
  nascimento: {
    type: DataTypes.DATEONLY
  },
  municipio: {
    type: DataTypes.STRING(50) 
  }
}, {
  tableName: 'pescadores',
  timestamps: false
});