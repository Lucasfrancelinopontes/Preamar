import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Especie = sequelize.define('Especie', {
  ID_especie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  familia: {
    type: DataTypes.STRING(100)
  },
  nome_cientifico: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nome_popular: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  genero: {
    type: DataTypes.STRING(100)
  },
  habitat: {
    type: DataTypes.STRING(100)
  },
  grau_ameaca: {
    type: DataTypes.STRING(10)
  },
  nivel_trofico: {
    type: DataTypes.DECIMAL(3, 1)
  },
  valor_comercial: {
    type: DataTypes.INTEGER
  },
  mercado: {
    type: DataTypes.INTEGER
  },
  comprimento_max_cm: {
    type: DataTypes.DECIMAL(6, 2)
  },
  inicio_maturacao_cm: {
    type: DataTypes.DECIMAL(6, 2)
  },
  pesca: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'especies',
  timestamps: false
});