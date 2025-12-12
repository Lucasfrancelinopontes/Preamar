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
    comment: 'Comprimento padrão em cm (máx: 9.999,99cm ~ 100 metros)',
    validate: {
      min: 0,
      max: 9999.99
    }
  },
  comprimento_total_cm: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Comprimento total em cm',
    validate: {
      min: 0,
      max: 9999.99
    }
  },
  comprimento_forquilha_cm: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Comprimento furcal/forquilha em cm',
    validate: {
      min: 0,
      max: 9999.99
    }
  },
  peso_g: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Peso em gramas (máx: 99.999.999,99g ~ 100 toneladas)',
    validate: {
      min: 0,
      max: 99999999.99
    }
  },
  sexo: {
    type: DataTypes.STRING(20),
    comment: 'Sexo do indivíduo (Macho, Fêmea, Indeterminado)'
  },
  estadio_gonadal: {
    type: DataTypes.STRING(50),
    comment: 'Estágio de maturação gonadal'
  },
  numero_individuo: {
    type: DataTypes.INTEGER,
    comment: 'Número sequencial do indivíduo na amostra'
  }
}, {
  tableName: 'individuos',
  timestamps: false
});