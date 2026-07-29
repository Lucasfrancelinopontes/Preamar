import sequelize from '../db.js';
import { Op } from 'sequelize';
import {
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
} from '../models/Socio.js';

export const verificarCodigoColeta = async (req, res) => {
  try {
    const codigo = txt(req.params?.codigo);

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código não informado'
      });
    }

    const coleta = await SocioColeta.findOne({
      where: { codigo_coleta: codigo },
      attributes: ['id']
    });

    return res.json({
      success: true,
      existe: !!coleta
    });
  } catch (err) {
    console.error('[socioPescadorController] verificarCodigoColeta:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar código de coleta',
      error: err.message
    });
  }
};

// ─── helpers ────────────────────────────────────────────────────────────────

const txt = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s || null;
};

const num = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const bool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === '1' || v === 1) return true;
  if (v === 'false' || v === '0' || v === 0) return false;
  return false;
};

const hasMeaningfulValues = (payload) => Object.values(payload || {}).some((value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
});

const replaceOneToOneRecord = async (Model, id_pescador, payload, transaction) => {
  await Model.destroy({ where: { id_pescador }, transaction });
  if (!hasMeaningfulValues(payload)) return;
  await Model.create({ id_pescador, ...payload }, { transaction });
};

// ─── criar ──────────────────────────────────────────────────────────────────

/**
 * POST /socio-pescadores
 *
 * Body esperado:
 * {
 *   coleta:    { codigoColeta, codigoFoto, municipio, localidade, coletor,
 *                digitador, dataColeta, dataDigitacao, observacoes, ID_municipio },
 *   pescador:  { nome, apelido, telefone, sexo, dataNascimento, naturalidade,
 *                estadoCivil, escolaridade, atividadePrincipal, atividadeSecundaria,
 *                composicaoFamiliar, localMoradia, localMoradiaOutro,
 *                tipoConstrucao, tipoConstrucaoOutro },
 *   saude:     { vista, pele, coluna, ginecologico, outros },
 *   registro:  { registroINSS, registroColonia, nomeColonia, registroAssociacao,
 *                nomeAssociacao, possuiCarteira, carteiraGrande, carteiraPequena },
 *   embarcacao:{ pescaEmbarcada, embarcacaoPropria, statusFinanceiro,
 *                nomeProprietario, apelidoProprietario, portoOrigem,
 *                portoDesembarque, nomeEmbarcacao, comprimentoM, hp,
 *                capacidadeTripulacao, tipoEmbarcacao },
 *   petrechos: [{ nome, material, tamanhoM, tamanhoBracas, unidades,
 *                 tipoIsca, processo }],
 *   relacoes:  [{ tipo }],          // relação de trabalho
 *   producao:  { mediaDiasEmbarcado, viagensMes, producaoMediaKg,
 *                producaoMediaUnidades, valorPrimeira, valorSegunda,
 *                valorTerceira, rendaMediaMensal, rendaMediaPescaria },
 *   despesas:  [{ categoria, descricao, valor, unidade }],
 *   quadrantes:[{ quadrante }]       // ou array de strings
 *   especies:  [{ id_especie, inicioSafra, fimSafra }]
 * }
 */
export const criar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      coleta    = {},
      pescador  = {},
      saude     = {},
      registro  = {},
      embarcacao= {},
      petrechos = [],
      relacoes  = [],
      producao  = {},
      despesas  = [],
      quadrantes= [],
      especies  = []
    } = req.body;

    // 1. SocioColeta
    const socioColeta = await SocioColeta.create({
      codigo_coleta:  txt(coleta.codigoColeta),
      codigo_foto:    txt(coleta.codigoFoto),
      ID_municipio:   num(coleta.ID_municipio) ?? null,
      localidade:     txt(coleta.localidade),
      coletor:        txt(coleta.coletor),
      digitador:      txt(coleta.digitador),
      data_coleta:    coleta.dataColeta    || null,
      data_digitacao: coleta.dataDigitacao || null,
      observacoes:    txt(coleta.observacoes)
    }, { transaction: t });

    // 2. SocioPescador
    const socioPescador = await SocioPescador.create({
      id_coleta:                num(socioColeta.id),
      cpf:                      txt(pescador.cpf),
      nome:                     txt(pescador.nome),
      apelido:                  txt(pescador.apelido),
      telefone:                 txt(pescador.telefone),
      sexo:                     txt(pescador.sexo),
      data_nascimento:          pescador.dataNascimento || null,
      naturalidade:             txt(pescador.naturalidade),
      estado_civil:             txt(pescador.estadoCivil),
      escolaridade:             txt(pescador.escolaridade),
      motivo_parou_estudar:      txt(pescador.motivoParouEstudar),
      local_moradia_sede_municipal: txt(pescador.localMoradiaSedeMunicipal),
      atividade_principal_renda:txt(pescador.atividadePrincipal),
      atividade_secundaria_renda:txt(pescador.atividadeSecundaria),
      composicao_familiar:      txt(pescador.composicaoFamiliar),
      local_moradia:            txt(pescador.localMoradia),
      local_moradia_outro:      txt(pescador.localMoradiaOutro),
      tipo_construcao:          txt(pescador.tipoConstrucao),
      tipo_construcao_outro:    txt(pescador.tipoConstrucaoOutro),
      tempo_atividade:          num(pescador.tempoAtividade),
      horas_dia:                num(pescador.horasDia),
      fontes_renda:             txt(pescador.fontesRenda),
      observacao_braca:         txt(pescador.observacaoBraca),
      petrechos_proprios:       txt(pescador.petrechosProprios),
      petrechos_de_quem:        txt(pescador.petrechosDeQuem),
      conservacao_pescado:      txt(pescador.conservacaoPescado),
      categoria_pesca:          txt(pescador.categoriaPesca),
      principal_pescaria:       txt(pescador.principalPescaria),
      entrega_atravessador:     bool(pescador.entregaAtravessador),
      divida_com_atravessador:  bool(pescador.dividaComAtravessador)
    }, { transaction: t });

    const id_pescador = socioPescador.id;

    // 3. SocioSaude
    await SocioSaude.create({
      id_pescador,
      vista:        bool(saude.vista),
      pele:         bool(saude.pele),
      coluna:       bool(saude.coluna),
      ginecologico: bool(saude.ginecologico),
      outros:       bool(saude.outros),
      outros_texto: txt(saude.outrosTexto)
    }, { transaction: t });

    // 4. SocioRegistro
    await SocioRegistro.create({
      id_pescador,
      registro_inss:        txt(registro.registroINSS),
      registro_colonia:     txt(registro.registroColonia),
      nome_colonia:         txt(registro.nomeColonia),
      registro_associacao:  txt(registro.registroAssociacao),
      nome_associacao:      txt(registro.nomeAssociacao),
      possui_carteira:      txt(registro.possuiCarteira),
      carteira_grande:      txt(registro.carteiraGrande),
      carteira_pequena:     txt(registro.carteiraPequena)
    }, { transaction: t });

    // 5. SocioEmbarcacao
    await SocioEmbarcacao.create({
      id_pescador,
      pesca_embarcada:      txt(embarcacao.pescaEmbarcada),
      embarcacao_propria:   txt(embarcacao.embarcacaoPropria),
      financiada:           bool(embarcacao.financiada),
      quitada:              bool(embarcacao.quitada),
      status_financeiro:    txt(embarcacao.statusFinanceiro),
      nome_proprietario:    txt(embarcacao.nomeProprietario),
      apelido_proprietario: txt(embarcacao.apelidoProprietario),
      porto_origem:         txt(embarcacao.portoOrigem),
      porto_desembarque:    txt(embarcacao.portoDesembarque),
      nome_embarcacao:      txt(embarcacao.nomeEmbarcacao),
      numero_registro:      txt(embarcacao.numeroRegistro),
      comprimento_m:        num(embarcacao.comprimentoM ?? embarcacao.comprimento),
      largura:              num(embarcacao.largura),
      tonelagem_bruta:      num(embarcacao.tonelagemBruta),
      hp:                   num(embarcacao.hp),
      capacidade_tripulacao:num(embarcacao.capacidadeTripulacao),
      material_casco:       txt(embarcacao.materialCasco),
      ano_construcao:       num(embarcacao.anoConstrucao),
      registro_capitania:   bool(embarcacao.registroCapitania),
      registro_rgp:         bool(embarcacao.registroRGP),
      licenciamento_ibama:  bool(embarcacao.licenciamentoIBAMA),
      licenciamento_mpa:    bool(embarcacao.licenciamentoMPA),
      propulsoes:           JSON.stringify(embarcacao.propulsoes || []),
      tipo_embarcacao:      txt(embarcacao.tipoEmbarcacao)
    }, { transaction: t });

    // 6. SocioPetrecho (array)
    if (petrechos.length > 0) {
      await SocioPetrecho.bulkCreate(
        petrechos.map((p) => ({
          id_pescador,
          nome:           txt(p.nome),
          material:       txt(p.material),
          tamanho_m:      num(p.tamanhoM),
          tamanho_bracas: num(p.tamanhoBracas),
          unidades:       num(p.unidades),
          tipo_isca:      txt(p.tipoIsca),
          processo:       txt(p.processo)
        })),
        { transaction: t }
      );
    }

    // 7. SocioRelacaoTrabalho (array)
    if (relacoes.length > 0) {
      await SocioRelacaoTrabalho.bulkCreate(
        relacoes.map((r) => ({
          id_pescador,
          tipo: txt(typeof r === 'string' ? r : r.tipo)
        })),
        { transaction: t }
      );
    }

    // 8. SocioProducao
    await SocioProducao.create({
      id_pescador,
      media_dias_embarcado:   num(producao.mediaDiasEmbarcado),
      viagens_mes:            num(producao.viagensMes),
      producao_media_kg:      num(producao.producaoMediaKg),
      producao_media_viagem_kg:num(producao.producaoMediaViagemKg),
      producao_media_unidades:num(producao.producaoMediaUnidades),
      valor_medio:            num(producao.valorMedio),
      valor_primeira:         num(producao.valorPrimeira),
      valor_segunda:          num(producao.valorSegunda),
      valor_terceira:         num(producao.valorTerceira),
      renda_media_mensal:     num(producao.rendaMediaMensal),
      renda_media_pescaria:   num(producao.rendaMediaPescaria),
      percepcao_pesca_hoje_vs_passado: txt(producao.percepcaoPescaHojeVsPassado),
      percepcao_tamanho_volume_pescado: txt(producao.percepcaoTamanhoVolumePescado)
    }, { transaction: t });

    // 9. SocioDespesa (array)
    if (despesas.length > 0) {
      await SocioDespesa.bulkCreate(
        despesas.map((d) => ({
          id_pescador,
          categoria:  txt(d.item),
          item:       txt(d.item),
          tipo:       txt(d.tipo),
          descricao:  txt(d.tipo),
          quantidade: num(d.quantidade),
          valor:      num(d.valor),
          unidade:    txt(d.unidade),
          outros:     txt(d.outros),
          frequencia: txt(d.frequencia)
        })),
        { transaction: t }
      );
    }

    // 10. SocioQuadrante (array de strings ou objetos)
    if (quadrantes.length > 0) {
      await SocioQuadrante.bulkCreate(
        quadrantes
          .map((q) => ({
            id_pescador,
            quadrante: txt(typeof q === 'string' ? q : q.quadrante)
          }))
          .filter((q) => q.quadrante !== null),
        { transaction: t }
      );
    }

    // 11. SocioPescadorEspecie (array)
    if (especies.length > 0) {
      await SocioPescadorEspecie.bulkCreate(
        especies.map((e) => ({
          id_pescador,
          id_especie:   num(e.id_especie) ?? num(e.ID_especie),
          inicio_safra: txt(e.inicioSafra),
          fim_safra:    txt(e.fimSafra)
        })),
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(201).json({
      message: 'Cadastro socioeconômico criado com sucesso.',
      id_coleta:   socioColeta.id,
      id_pescador
    });
  } catch (err) {
    await t.rollback();
    console.error('[socioPescadorController] criar:', err);
    return res.status(500).json({ error: 'Erro ao salvar cadastro.', detail: err.message });
  }
};

// ─── listar ─────────────────────────────────────────────────────────────────

/**
 * GET /socio-pescadores
 * Retorna lista paginada. Query params: page, limit, municipio, localidade.
 */
export const listar = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const codigo = txt(req.query.codigo_coleta ?? req.query.codigo ?? req.query.cod);
    const nome = txt(req.query.nome);
    const municipio = txt(req.query.municipio);
    const localidade = txt(req.query.localidade);

    const where = {};
    if (nome) {
      where.nome = { [Op.like]: `%${nome}%` };
    }

    const whereColeta = {};
    if (codigo) {
      whereColeta.codigo_coleta = { [Op.like]: `%${codigo}%` };
    }
    if (municipio) {
      whereColeta.ID_municipio = Number.isFinite(Number(municipio))
        ? Number(municipio)
        : { [Op.like]: `%${municipio}%` };
    }
    if (localidade) {
      whereColeta.localidade = { [Op.like]: `%${localidade}%` };
    }

    const includeColeta = {
      model: SocioColeta,
      as: 'coleta'
    };

    if (Object.keys(whereColeta).length > 0) {
      includeColeta.where = whereColeta;
      includeColeta.required = true;
    }

    const { count, rows } = await SocioPescador.findAndCountAll({
      distinct: true,
      include: [
        includeColeta,
        { model: SocioSaude,           as: 'saude'   },
        { model: SocioRegistro,        as: 'registro' },
        { model: SocioEmbarcacao,      as: 'embarcacao' },
        { model: SocioPetrecho,        as: 'petrechos' },
        { model: SocioRelacaoTrabalho, as: 'relacoes_trabalho' },
        { model: SocioProducao,        as: 'producao' },
        { model: SocioDespesa,         as: 'despesas' },
        { model: SocioQuadrante,       as: 'quadrantes' },
        { model: SocioPescadorEspecie, as: 'pescador_especies' }
      ],
      where,
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    return res.json({
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
      data: rows
    });
  } catch (err) {
    console.error('[socioPescadorController] listar:', err);
    return res.status(500).json({ error: 'Erro ao listar cadastros.', detail: err.message });
  }
};

// ─── buscar ──────────────────────────────────────────────────────────────────

/**
 * GET /socio-pescadores/:id
 */
export const buscar = async (req, res) => {
  try {
    const pescador = await SocioPescador.findByPk(req.params.id, {
      include: [
        { model: SocioColeta,          as: 'coleta'  },
        { model: SocioSaude,           as: 'saude'   },
        { model: SocioRegistro,        as: 'registro' },
        { model: SocioEmbarcacao,      as: 'embarcacao' },
        { model: SocioPetrecho,        as: 'petrechos' },
        { model: SocioRelacaoTrabalho, as: 'relacoes_trabalho' },
        { model: SocioProducao,        as: 'producao' },
        { model: SocioDespesa,         as: 'despesas' },
        { model: SocioQuadrante,       as: 'quadrantes' },
        { model: SocioPescadorEspecie, as: 'pescador_especies' }
      ]
    });

    if (!pescador) {
      return res.status(404).json({ error: 'Pescador não encontrado.' });
    }

    return res.json(pescador);
  } catch (err) {
    console.error('[socioPescadorController] buscar:', err);
    return res.status(500).json({ error: 'Erro ao buscar cadastro.', detail: err.message });
  }
};

// ─── atualizar ───────────────────────────────────────────────────────────────

/**
 * PUT /socio-pescadores/:id
 * Aceita o mesmo formato do POST.  Substitui tabelas 1:N completamente (delete + insert).
 */
export const atualizar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_pescador = parseInt(req.params.id, 10);

    const socioPescador = await SocioPescador.findByPk(id_pescador, { transaction: t });
    if (!socioPescador) {
      await t.rollback();
      return res.status(404).json({ error: 'Pescador não encontrado.' });
    }

    const {
      coleta     = {},
      pescador   = {},
      saude      = {},
      registro   = {},
      embarcacao = {},
      petrechos  = [],
      relacoes   = [],
      producao   = {},
      despesas   = [],
      quadrantes = [],
      especies   = []
    } = req.body;

    // Coleta
    if (socioPescador.id_coleta) {
      await SocioColeta.update({
        codigo_coleta:  txt(coleta.codigoColeta),
        codigo_foto:    txt(coleta.codigoFoto),
        ID_municipio:   num(coleta.ID_municipio),
        localidade:     txt(coleta.localidade),
        coletor:        txt(coleta.coletor),
        digitador:      txt(coleta.digitador),
        data_coleta:    coleta.dataColeta    || null,
        data_digitacao: coleta.dataDigitacao || null,
        observacoes:    txt(coleta.observacoes)
      }, { where: { id: socioPescador.id_coleta }, transaction: t });
    }

    // Pescador principal
    await socioPescador.update({
      cpf:                       txt(pescador.cpf),
      nome:                      txt(pescador.nome),
      apelido:                   txt(pescador.apelido),
      telefone:                  txt(pescador.telefone),
      sexo:                      txt(pescador.sexo),
      data_nascimento:           pescador.dataNascimento || null,
      naturalidade:              txt(pescador.naturalidade),
      estado_civil:              txt(pescador.estadoCivil),
      escolaridade:              txt(pescador.escolaridade),
      motivo_parou_estudar:      txt(pescador.motivoParouEstudar),
      local_moradia_sede_municipal: txt(pescador.localMoradiaSedeMunicipal),
      atividade_principal_renda: txt(pescador.atividadePrincipal),
      atividade_secundaria_renda:txt(pescador.atividadeSecundaria),
      composicao_familiar:       txt(pescador.composicaoFamiliar),
      local_moradia:             txt(pescador.localMoradia),
      local_moradia_outro:       txt(pescador.localMoradiaOutro),
      tipo_construcao:           txt(pescador.tipoConstrucao),
      tipo_construcao_outro:     txt(pescador.tipoConstrucaoOutro),
      tempo_atividade:           num(pescador.tempoAtividade),
      horas_dia:                 num(pescador.horasDia),
      fontes_renda:              txt(pescador.fontesRenda),
      observacao_braca:          txt(pescador.observacaoBraca),
      petrechos_proprios:        txt(pescador.petrechosProprios),
      petrechos_de_quem:         txt(pescador.petrechosDeQuem),
      conservacao_pescado:       txt(pescador.conservacaoPescado),
      categoria_pesca:           txt(pescador.categoriaPesca),
      principal_pescaria:        txt(pescador.principalPescaria),
      entrega_atravessador:      bool(pescador.entregaAtravessador),
      divida_com_atravessador:   bool(pescador.dividaComAtravessador)
    }, { transaction: t });

    // Saúde (replace)
    await replaceOneToOneRecord(SocioSaude, id_pescador, {
      vista:        bool(saude.vista),
      pele:         bool(saude.pele),
      coluna:       bool(saude.coluna),
      ginecologico: bool(saude.ginecologico),
      outros:       bool(saude.outros),
      outros_texto: txt(saude.outrosTexto)
    }, t);

    // Registro (replace)
    await replaceOneToOneRecord(SocioRegistro, id_pescador, {
      registro_inss:       txt(registro.registroINSS),
      registro_colonia:    txt(registro.registroColonia),
      nome_colonia:        txt(registro.nomeColonia),
      registro_associacao: txt(registro.registroAssociacao),
      nome_associacao:     txt(registro.nomeAssociacao),
      possui_carteira:     txt(registro.possuiCarteira),
      carteira_grande:     txt(registro.carteiraGrande),
      carteira_pequena:    txt(registro.carteiraPequena)
    }, t);

    // Embarcação (replace)
    await replaceOneToOneRecord(SocioEmbarcacao, id_pescador, {
      pesca_embarcada:       txt(embarcacao.pescaEmbarcada),
      embarcacao_propria:    txt(embarcacao.embarcacaoPropria),
      financiada:            bool(embarcacao.financiada),
      quitada:               bool(embarcacao.quitada),
      status_financeiro:     txt(embarcacao.statusFinanceiro),
      nome_proprietario:     txt(embarcacao.nomeProprietario),
      apelido_proprietario:  txt(embarcacao.apelidoProprietario),
      porto_origem:          txt(embarcacao.portoOrigem),
      porto_desembarque:     txt(embarcacao.portoDesembarque),
      nome_embarcacao:       txt(embarcacao.nomeEmbarcacao),
      numero_registro:       txt(embarcacao.numeroRegistro),
      comprimento_m:         num(embarcacao.comprimentoM ?? embarcacao.comprimento),
      largura:               num(embarcacao.largura),
      tonelagem_bruta:       num(embarcacao.tonelagemBruta),
      hp:                    num(embarcacao.hp),
      capacidade_tripulacao: num(embarcacao.capacidadeTripulacao),
      material_casco:        txt(embarcacao.materialCasco),
      ano_construcao:        num(embarcacao.anoConstrucao),
      registro_capitania:    bool(embarcacao.registroCapitania),
      registro_rgp:          bool(embarcacao.registroRGP),
      licenciamento_ibama:   bool(embarcacao.licenciamentoIBAMA),
      licenciamento_mpa:     bool(embarcacao.licenciamentoMPA),
      propulsoes:            JSON.stringify(embarcacao.propulsoes || []),
      tipo_embarcacao:       txt(embarcacao.tipoEmbarcacao)
    }, t);

    // Petrechos — substitui tudo
    await SocioPetrecho.destroy({ where: { id_pescador }, transaction: t });
    if (petrechos.length > 0) {
      await SocioPetrecho.bulkCreate(
        petrechos.map((p) => ({
          id_pescador,
          nome:           txt(p.nome),
          material:       txt(p.material),
          tamanho_m:      num(p.tamanhoM),
          tamanho_bracas: num(p.tamanhoBracas),
          unidades:       num(p.unidades),
          tipo_isca:      txt(p.tipoIsca),
          processo:       txt(p.processo)
        })),
        { transaction: t }
      );
    }

    // Relações de trabalho — substitui tudo
    await SocioRelacaoTrabalho.destroy({ where: { id_pescador }, transaction: t });
    if (relacoes.length > 0) {
      await SocioRelacaoTrabalho.bulkCreate(
        relacoes.map((r) => ({
          id_pescador,
          tipo: txt(typeof r === 'string' ? r : r.tipo)
        })),
        { transaction: t }
      );
    }

    // Produção (replace)
    await replaceOneToOneRecord(SocioProducao, id_pescador, {
      media_dias_embarcado:    num(producao.mediaDiasEmbarcado),
      viagens_mes:             num(producao.viagensMes),
      producao_media_kg:       num(producao.producaoMediaKg),
      producao_media_viagem_kg:num(producao.producaoMediaViagemKg),
      producao_media_unidades: num(producao.producaoMediaUnidades),
      valor_medio:             num(producao.valorMedio),
      valor_primeira:          num(producao.valorPrimeira),
      valor_segunda:           num(producao.valorSegunda),
      valor_terceira:          num(producao.valorTerceira),
      renda_media_mensal:      num(producao.rendaMediaMensal),
      renda_media_pescaria:    num(producao.rendaMediaPescaria),
      percepcao_pesca_hoje_vs_passado: txt(producao.percepcaoPescaHojeVsPassado),
      percepcao_tamanho_volume_pescado: txt(producao.percepcaoTamanhoVolumePescado)
    }, t);

    // Despesas — substitui tudo
    await SocioDespesa.destroy({ where: { id_pescador }, transaction: t });
    if (despesas.length > 0) {
      await SocioDespesa.bulkCreate(
        despesas.map((d) => ({
          id_pescador,
          categoria: txt(d.item),
          item:      txt(d.item),
          tipo:      txt(d.tipo),
          descricao: txt(d.tipo),
          quantidade: num(d.quantidade),
          valor:     num(d.valor),
          unidade:   txt(d.unidade),
          outros:    txt(d.outros),
          frequencia: txt(d.frequencia)
        })),
        { transaction: t }
      );
    }

    // Quadrantes — substitui tudo
    await SocioQuadrante.destroy({ where: { id_pescador }, transaction: t });
    if (quadrantes.length > 0) {
      await SocioQuadrante.bulkCreate(
        quadrantes
          .map((q) => ({
            id_pescador,
            quadrante: txt(typeof q === 'string' ? q : q.quadrante)
          }))
          .filter((q) => q.quadrante !== null),
        { transaction: t }
      );
    }

    // Espécies — substitui tudo
    await SocioPescadorEspecie.destroy({ where: { id_pescador }, transaction: t });
    if (especies.length > 0) {
      await SocioPescadorEspecie.bulkCreate(
        especies.map((e) => ({
          id_pescador,
          id_especie:   num(e.id_especie) ?? num(e.ID_especie),
          inicio_safra: txt(e.inicioSafra),
          fim_safra:    txt(e.fimSafra)
        })),
        { transaction: t }
      );
    }

    await t.commit();
    return res.json({ message: 'Cadastro atualizado com sucesso.', id_pescador });
  } catch (err) {
    await t.rollback();
    console.error('[socioPescadorController] atualizar:', err);
    return res.status(500).json({ error: 'Erro ao atualizar cadastro.', detail: err.message });
  }
};

// ─── remover ─────────────────────────────────────────────────────────────────

/**
 * DELETE /socio-pescadores/:id
 * Remove em cascata todas as tabelas dependentes.
 */
export const remover = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_pescador = parseInt(req.params.id, 10);

    const socioPescador = await SocioPescador.findByPk(id_pescador, { transaction: t });
    if (!socioPescador) {
      await t.rollback();
      return res.status(404).json({ error: 'Pescador não encontrado.' });
    }

    // Dependentes
    await SocioSaude.destroy(           { where: { id_pescador }, transaction: t });
    await SocioRegistro.destroy(        { where: { id_pescador }, transaction: t });
    await SocioEmbarcacao.destroy(      { where: { id_pescador }, transaction: t });
    await SocioPetrecho.destroy(        { where: { id_pescador }, transaction: t });
    await SocioRelacaoTrabalho.destroy( { where: { id_pescador }, transaction: t });
    await SocioProducao.destroy(        { where: { id_pescador }, transaction: t });
    await SocioDespesa.destroy(         { where: { id_pescador }, transaction: t });
    await SocioQuadrante.destroy(       { where: { id_pescador }, transaction: t });
    await SocioPescadorEspecie.destroy( { where: { id_pescador }, transaction: t });

    const id_coleta = socioPescador.id_coleta;
    await socioPescador.destroy({ transaction: t });

    // Remove coleta se não houver mais pescadores vinculados
    if (id_coleta) {
      const restantes = await SocioPescador.count({
        where: { id_coleta },
        transaction: t
      });
      if (restantes === 0) {
        await SocioColeta.destroy({ where: { id: id_coleta }, transaction: t });
      }
    }

    await t.commit();
    return res.json({ message: 'Cadastro removido com sucesso.' });
  } catch (err) {
    await t.rollback();
    console.error('[socioPescadorController] remover:', err);
    return res.status(500).json({ error: 'Erro ao remover cadastro.', detail: err.message });
  }
};