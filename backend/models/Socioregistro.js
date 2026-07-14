import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioRegistro = sequelize.define('SocioRegistro', {
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
  registro_inss: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  registro_colonia: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  nome_colonia: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  registro_associacao: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  nome_associacao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  possui_carteira: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  carteira_grande: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  carteira_pequena: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'socio_registros',
  timestamps: false
});