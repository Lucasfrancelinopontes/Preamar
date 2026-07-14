import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioEmbarcacao = sequelize.define('SocioEmbarcacao', {
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
  pesca_embarcada: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  embarcacao_propria: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  status_financeiro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nome_proprietario: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  apelido_proprietario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  porto_origem: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  porto_desembarque: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nome_embarcacao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  comprimento_m: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  hp: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  capacidade_tripulacao: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo_embarcacao: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'socio_embarcacoes',
  timestamps: false
});