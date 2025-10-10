import { Pescador } from './Pescador.js';
import { Embarcacao } from './Embarcacao.js';
import { Especie } from './Especie.js';
import { Petrecho } from './Petrecho.js';
import { Desembarque } from './Desembarque.js';
import { DesembarqueArte } from './DesembarqueArte.js';
import { Captura } from './Captura.js';
import { Individuo } from './Individuo.js';
import sequelize from '../db.js';

// Definir associações
export const defineAssociations = () => {
  // Desembarque pertence a Pescador
  Desembarque.belongsTo(Pescador, {
    foreignKey: 'ID_pescador',
    as: 'pescador'
  });
  Pescador.hasMany(Desembarque, {
    foreignKey: 'ID_pescador',
    as: 'desembarques'
  });

  // Desembarque pertence a Embarcacao
  Desembarque.belongsTo(Embarcacao, {
    foreignKey: 'ID_embarcacao',
    as: 'embarcacao'
  });
  Embarcacao.hasMany(Desembarque, {
    foreignKey: 'ID_embarcacao',
    as: 'desembarques'
  });

  // Desembarque tem muitas Artes
  Desembarque.hasMany(DesembarqueArte, {
    foreignKey: 'ID_desembarque',
    as: 'artes'
  });
  DesembarqueArte.belongsTo(Desembarque, {
    foreignKey: 'ID_desembarque',
    as: 'desembarque'
  });

  // Desembarque tem muitas Capturas
  Desembarque.hasMany(Captura, {
    foreignKey: 'ID_desembarque',
    as: 'capturas'
  });
  Captura.belongsTo(Desembarque, {
    foreignKey: 'ID_desembarque',
    as: 'desembarque'
  });

  // Captura pertence a Especie
  Captura.belongsTo(Especie, {
    foreignKey: 'ID_especie',
    as: 'especie'
  });
  Especie.hasMany(Captura, {
    foreignKey: 'ID_especie',
    as: 'capturas'
  });

  // Desembarque tem muitos Individuos
  Desembarque.hasMany(Individuo, {
    foreignKey: 'ID_desembarque',
    as: 'individuos'
  });
  Individuo.belongsTo(Desembarque, {
    foreignKey: 'ID_desembarque',
    as: 'desembarque'
  });

  // Individuo pertence a Especie
  Individuo.belongsTo(Especie, {
    foreignKey: 'ID_especie',
    as: 'especie'
  });
  Especie.hasMany(Individuo, {
    foreignKey: 'ID_especie',
    as: 'individuos'
  });
};

// Exportar todos os modelos
export {
  Pescador,
  Embarcacao,
  Especie,
  Petrecho,
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo,
  sequelize
};