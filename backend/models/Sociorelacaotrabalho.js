import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioRelacaoTrabalho = sequelize.define('SocioRelacaoTrabalho', {
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
  tipo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ex: autonomo, empregado, meeiro, parceiro'
  }
}, {
  tableName: 'socio_relacao_trabalho',
  timestamps: false
});