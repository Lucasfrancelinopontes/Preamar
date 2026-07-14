import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioPescadorEspecie = sequelize.define('SocioPescadorEspecie', {
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
  id_especie: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'especies',
      key: 'ID_especie'
    }
  },
  inicio_safra: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mês de início da safra (ex: janeiro)'
  },
  fim_safra: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mês de fim da safra (ex: junho)'
  }
}, {
  tableName: 'socio_pescador_especies',
  timestamps: false
});