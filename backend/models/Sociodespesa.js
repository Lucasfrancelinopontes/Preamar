import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioDespesa = sequelize.define('SocioDespesa', {
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
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ex: combustivel, gelo, rancho, manutencao, outros'
  },
  item: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  unidade: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Ex: kg, litros, R$'
  },
  outros: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  frequencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'socio_despesas',
  timestamps: false
});