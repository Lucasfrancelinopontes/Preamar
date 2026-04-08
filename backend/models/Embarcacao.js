import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Embarcacao = sequelize.define('Embarcacao', {
  ID_embarcacao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_embarcacao: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo_embarcacao: {
    type: DataTypes.STRING(100), // Expandido de 50 para 100 chars
    allowNull: true,
    unique: true
  },
  proprietario: {
    type: DataTypes.STRING(255)
  },
  apelido_propietario: {
    type: DataTypes.STRING(100)
  },
  cpf_proprietario: {
    type: DataTypes.STRING(14)
  },
  rgp: {
    type: DataTypes.STRING(50)
  },
  comprimento: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Comprimento em metros'
  },
  capacidade: {
    type: DataTypes.DECIMAL(8, 2),
    comment: 'Capacidade de estocagem em kg'
  },
  hp: {
    type: DataTypes.FLOAT,
    comment: 'Força do motor em HP'
  },
  tipo: {
    type: DataTypes.ENUM('catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro'),
    allowNull: false
  },
  tipo_outro: {
    type: DataTypes.STRING(100)
  },
  possui: {
    type: DataTypes.ENUM('urna', 'caixaTermica', 'pescadoInNatura')
  },
  municipio: {
    type: DataTypes.STRING(100)
  },
  localidade: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'embarcacoes',
  timestamps: false
});