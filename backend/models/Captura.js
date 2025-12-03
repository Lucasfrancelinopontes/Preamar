import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Captura = sequelize.define('Captura', {
  ID_captura: {
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
  peso_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  preco_kg: {
    type: DataTypes.DECIMAL(10, 2)
  },
  preco_total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  comprimento_cm: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Comprimento do pescado em centímetros'
  },
  com_tripa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica se o pescado foi pesado com tripa'
  }
}, {
  tableName: 'capturas',
  timestamps: false
});