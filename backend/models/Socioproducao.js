import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioProducao = sequelize.define('SocioProducao', {
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
  media_dias_embarcado: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  viagens_mes: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  producao_media_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  producao_media_unidades: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  valor_primeira: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valor_segunda: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valor_terceira: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  renda_media_mensal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  renda_media_pescaria: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'socio_producao',
  timestamps: false
});