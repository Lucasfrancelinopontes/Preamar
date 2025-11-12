import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Desembarque = sequelize.define('Desembarque', {
  ID_desembarque: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cod_desembarque: {
    type: DataTypes.STRING(100), // Expandido de 50 para 100 chars
    unique: true,
    allowNull: false
  },
  cod_foto: {
    type: DataTypes.STRING(50)
  },
  municipio: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  municipio_code: {
    type: DataTypes.STRING(10),
    comment: 'Código do município para geração do cod_desembarque'
  },
  localidade: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  localidade_code: {
    type: DataTypes.STRING(10),
    comment: 'Código da localidade para geração do cod_desembarque'
  },
  data_coleta: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  consecutivo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ID_pescador: {
    type: DataTypes.INTEGER,
    references: {
      model: 'pescadores',
      key: 'ID_pescador'
    }
  },
  ID_embarcacao: {
    type: DataTypes.INTEGER,
    references: {
      model: 'embarcacoes',
      key: 'ID_embarcacao'
    }
  },
  data_saida: {
    type: DataTypes.DATE,
    comment: 'Data e hora de saída da embarcação'
  },
  hora_saida: {
    type: DataTypes.TIME
  },
  data_chegada: {
    type: DataTypes.DATE,
    comment: 'Data e hora de chegada da embarcação'
  },
  hora_desembarque: {
    type: DataTypes.TIME
  },
  numero_tripulantes: {
    type: DataTypes.INTEGER
  },
  pesqueiros: {
    type: DataTypes.STRING(255),
    comment: 'Pesqueiros ou locais de pesca'
  },
  // Coordenadas
  lat_deg1: {
    type: DataTypes.INTEGER
  },
  lat_min1: {
    type: DataTypes.INTEGER
  },
  lat_sec1: {
    type: DataTypes.DECIMAL(5, 2)
  },
  lat_deg2: {
    type: DataTypes.INTEGER
  },
  lat_min2: {
    type: DataTypes.INTEGER
  },
  lat_sec2: {
    type: DataTypes.DECIMAL(5, 2)
  },
  long_deg1: {
    type: DataTypes.INTEGER
  },
  long_min1: {
    type: DataTypes.INTEGER
  },
  long_sec1: {
    type: DataTypes.DECIMAL(5, 2)
  },
  long_deg2: {
    type: DataTypes.INTEGER
  },
  long_min2: {
    type: DataTypes.INTEGER
  },
  long_sec2: {
    type: DataTypes.DECIMAL(5, 2)
  },
  quadrante1: {
    type: DataTypes.STRING(50)
  },
  quadrante2: {
    type: DataTypes.STRING(50)
  },
  quadrante3: {
    type: DataTypes.STRING(50)
  },
  // Proprietário e despesas
  proprietario: {
    type: DataTypes.STRING(255)
  },
  apelido_proprietario: {
    type: DataTypes.STRING(100)
  },
  atuou_pesca: {
    type: DataTypes.ENUM('S', 'N')
  },
  origem: {
    type: DataTypes.STRING(100)
  },
  desp_diesel: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  desp_gasolina: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  litros: {
    type: DataTypes.DECIMAL(8, 2)
  },
  gelo_kg: {
    type: DataTypes.DECIMAL(8, 2)
  },
  rancho_valor: {
    type: DataTypes.DECIMAL(10, 2)
  },
  // Destino do pescado
  destino_pescado: {
    type: DataTypes.ENUM('atravessador', 'armador', 'consumidor', 'diretoConsumidor', 'outros')
  },
  destino_apelido: {
    type: DataTypes.STRING(100)
  },
  destino_outros_qual: {
    type: DataTypes.STRING(255)
  },
  // Observações de arte
  arte_obs: {
    type: DataTypes.TEXT
  },
  // Controle de coleta
  coletor: {
    type: DataTypes.STRING(255)
  },
  data_coletor: {
    type: DataTypes.DATEONLY
  },
  revisor: {
    type: DataTypes.STRING(255)
  },
  data_revisor: {
    type: DataTypes.DATEONLY
  },
  digitador: {
    type: DataTypes.STRING(255)
  },
  data_digitador: {
    type: DataTypes.DATEONLY
  },
  total_desembarque: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'desembarques',
  timestamps: true
});