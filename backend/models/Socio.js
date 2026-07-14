/**
 * socioIndex.js
 *
 * Importa todos os models socioeconômicos e define suas associações.
 * Adicione este bloco ao models/index.js existente (ou importe-o lá).
 *
 * Uso em models/index.js:
 *   import { defineSocioAssociations, ...socioModels } from './socioIndex.js';
 *   // dentro de defineAssociations():
 *   defineSocioAssociations();
 */

import { SocioColeta }          from './SocioColeta.js';
import { SocioPescador }        from './SocioPescador.js';
import { SocioSaude }           from './SocioSaude.js';
import { SocioRegistro }        from './SocioRegistro.js';
import { SocioEmbarcacao }      from './SocioEmbarcacao.js';
import { SocioPetrecho }        from './SocioPetrecho.js';
import { SocioRelacaoTrabalho } from './SocioRelacaoTrabalho.js';
import { SocioProducao }        from './SocioProducao.js';
import { SocioDespesa }         from './SocioDespesa.js';
import { SocioQuadrante }       from './SocioQuadrante.js';
import { SocioPescadorEspecie } from './SocioPescadorEspecie.js';
import { Especie }              from './Especie.js';

export const defineSocioAssociations = () => {
  // ── SocioColeta → SocioPescador (1:N) ──────────────────────────────────
  SocioColeta.hasMany(SocioPescador, {
    foreignKey: 'id_coleta',
    as: 'pescadores'
  });
  SocioPescador.belongsTo(SocioColeta, {
    foreignKey: 'id_coleta',
    as: 'coleta'
  });

  // ── SocioPescador → SocioSaude (1:1) ───────────────────────────────────
  SocioPescador.hasOne(SocioSaude, {
    foreignKey: 'id_pescador',
    as: 'saude'
  });
  SocioSaude.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioRegistro (1:1) ────────────────────────────────
  SocioPescador.hasOne(SocioRegistro, {
    foreignKey: 'id_pescador',
    as: 'registro'
  });
  SocioRegistro.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioEmbarcacao (1:1) ──────────────────────────────
  SocioPescador.hasOne(SocioEmbarcacao, {
    foreignKey: 'id_pescador',
    as: 'embarcacao'
  });
  SocioEmbarcacao.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioPetrecho (1:N) ────────────────────────────────
  SocioPescador.hasMany(SocioPetrecho, {
    foreignKey: 'id_pescador',
    as: 'petrechos'
  });
  SocioPetrecho.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioRelacaoTrabalho (1:N) ─────────────────────────
  SocioPescador.hasMany(SocioRelacaoTrabalho, {
    foreignKey: 'id_pescador',
    as: 'relacoes_trabalho'
  });
  SocioRelacaoTrabalho.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioProducao (1:1) ────────────────────────────────
  SocioPescador.hasOne(SocioProducao, {
    foreignKey: 'id_pescador',
    as: 'producao'
  });
  SocioProducao.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioDespesa (1:N) ─────────────────────────────────
  SocioPescador.hasMany(SocioDespesa, {
    foreignKey: 'id_pescador',
    as: 'despesas'
  });
  SocioDespesa.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioQuadrante (1:N) ───────────────────────────────
  SocioPescador.hasMany(SocioQuadrante, {
    foreignKey: 'id_pescador',
    as: 'quadrantes'
  });
  SocioQuadrante.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  // ── SocioPescador → SocioPescadorEspecie → Especie (N:M via junction) ──
  SocioPescador.hasMany(SocioPescadorEspecie, {
    foreignKey: 'id_pescador',
    as: 'pescador_especies'
  });
  SocioPescadorEspecie.belongsTo(SocioPescador, {
    foreignKey: 'id_pescador',
    as: 'pescador'
  });

  SocioPescadorEspecie.belongsTo(Especie, {
    foreignKey: 'id_especie',
    as: 'especie'
  });
  Especie.hasMany(SocioPescadorEspecie, {
    foreignKey: 'id_especie',
    as: 'socio_pescadores'
  });
};

export {
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