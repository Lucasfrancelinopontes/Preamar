import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Embarcacao = sequelize.define('Embarcacao', {
  ID_embarcacao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_embarcacao: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo_embarcacao: {
    type: DataTypes.STRING(50),
    unique: true
  },
  proprietario: {
    type: DataTypes.STRING(255)
  },
  rgp: {
    type: DataTypes.STRING(50)
  },
  comprimento: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Comprimento em metros'
  },
  capacidade: {
    type: DataTypes.DECIMAL(8, 2),
    comment: 'Capacidade de estocagem em kg'
  },
  hp: {
    type: DataTypes.INTEGER,
    comment: 'Força do motor em HP'
  },
  tipo: {
    type: DataTypes.ENUM('catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro'),
    allowNull: false
  },
  tipo_outro: {
    type: DataTypes.STRING(100)
  },
  possui: {
    type: DataTypes.ENUM('urna', 'caixaTermica', 'pescadoInNatura')
  },
  localidade: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'embarcacoes',
  timestamps: false
});