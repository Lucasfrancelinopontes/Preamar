import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Individuo = sequelize.define('Individuo', {
  ID_individuo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_desembarque: {
    type: DataTypes.INTEGER,
    references: {
      model: 'desembarques',
      key: 'ID_desembarque'
    }
  },
  ID_especie: {
    type: DataTypes.INTEGER,
    references: {
      model: 'especies',
      key: 'ID_especie'
    }
  },
  comprimento_padrao_cm: {
    type: DataTypes.DECIMAL(6, 2),
    comment: 'Comprimento padrão em cm'
  },
  peso_g: {
    type: DataTypes.DECIMAL(8, 2),
    comment: 'Peso em gramas'
  },
  numero_individuo: {
    type: DataTypes.INTEGER,
    comment: 'Número sequencial do indivíduo na amostra'
  }
}, {
  tableName: 'individuos',
  timestamps: false
});