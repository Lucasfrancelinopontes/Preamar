import { Pescador } from './Pescador.js';
import { Embarcacao } from './Embarcacao.js';
import { Especie } from './Especie.js';
import { Petrecho } from './Petrecho.js';
import { Municipio } from './Municipio.js';
import { Desembarque } from './Desembarque.js';
import { DesembarqueArte } from './DesembarqueArte.js';
import { Captura } from './Captura.js';
import { Individuo } from './Individuo.js';
import { Usuario } from './Usuario.js';
import sequelize from '../db.js';

// Importar models e associações do módulo socioeconômico
import {
  defineSocioAssociations,
  SocioColeta,
  SocioPescador,
  SocioSaude,
  SocioRegistro,
  SocioEmbarcacao,
  SocioPetrecho,
  SocioRelacaoTrabalho,
  SocioProducao,
  SocioDespesa,
  SocioQuadrante,
  SocioPescadorEspecie
} from './Socio.js';

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

  // Embarcacao pertence a Municipio (local-1)
  Embarcacao.belongsTo(Municipio, {
    foreignKey: 'ID_municipio',
    as: 'municipioInfo'
  });
  Municipio.hasMany(Embarcacao, {
    foreignKey: 'ID_municipio',
    as: 'embarcacoes'
  });

  // Desembarque pertence a Usuario (autor do envio)
  Desembarque.belongsTo(Usuario, {
    foreignKey: 'ID_usuario',
    as: 'usuario'
  });
  Usuario.hasMany(Desembarque, {
    foreignKey: 'ID_usuario',
    as: 'desembarques'
  });

  // Usuarios responsaveis por etapa do desembarque
  Desembarque.belongsTo(Usuario, {
    foreignKey: 'ID_coletor',
    as: 'coletorUsuario'
  });
  Usuario.hasMany(Desembarque, {
    foreignKey: 'ID_coletor',
    as: 'desembarques_coletados'
  });

  Desembarque.belongsTo(Usuario, {
    foreignKey: 'ID_revisor',
    as: 'revisorUsuario'
  });
  Usuario.hasMany(Desembarque, {
    foreignKey: 'ID_revisor',
    as: 'desembarques_revisados'
  });

  Desembarque.belongsTo(Usuario, {
    foreignKey: 'ID_digitador',
    as: 'digitadorUsuario'
  });
  Usuario.hasMany(Desembarque, {
    foreignKey: 'ID_digitador',
    as: 'desembarques_digitados'
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

  // ── Associações do módulo socioeconômico ─────────────────────────────────
  defineSocioAssociations();
};

// Exportar todos os modelos
export {
  Pescador,
  Embarcacao,
  Especie,
  Petrecho,
  Municipio,
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo,
  Usuario,
  sequelize,
  // Socio
  SocioColeta,
  SocioPescador,
  SocioSaude,
  SocioRegistro,
  SocioEmbarcacao,
  SocioPetrecho,
  SocioRelacaoTrabalho,
  SocioProducao,
  SocioDespesa,
  SocioQuadrante,
  SocioPescadorEspecie
};