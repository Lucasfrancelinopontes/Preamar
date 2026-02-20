import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const DesembarqueArte = sequelize.define('DesembarqueArte', {
  ID: {
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
  arte: {
    type: DataTypes.ENUM(
      'rede_boirea',
      'espinhel_mergulho',
      'rede_fundeio',
      'linha_mao',
      'rede_cacoaria',
      'covo',
      'outras'
    ),
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nome da arte quando arte=outras'
  },
  tamanho: {
    type: DataTypes.STRING(50)
  },
  unidade: {
    type: DataTypes.ENUM('m', 'No'),
    comment: 'metros ou número'
  }
}, {
  tableName: 'desembarque_artes',
  timestamps: false
});