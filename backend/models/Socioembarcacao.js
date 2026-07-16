import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const SocioEmbarcacao = sequelize.define('SocioEmbarcacao', {
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
  pesca_embarcada: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  embarcacao_propria: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  financiada: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  quitada: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
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
  numero_registro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comprimento_m: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  largura: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  tonelagem_bruta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  hp: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  capacidade_tripulacao: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  material_casco: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ano_construcao: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  registro_capitania: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  registro_rgp: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  licenciamento_ibama: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  licenciamento_mpa: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  propulsoes: {
    type: DataTypes.TEXT,
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