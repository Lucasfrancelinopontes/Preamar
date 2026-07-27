import sequelize from '../db.js';
import { Op } from 'sequelize';
import {
  Peixaria,
  PeixariaDespesa,
  PeixariaFornecedor,
  PeixariaPescadorFornecedor,
  PeixariaEspecieComercial,
  PeixariaPerda,
  PeixariaPerdaPorEspecie,
  PeixariaOrigemPescado,
  PeixariaMercado,
  PeixariaMercadoLinha,
  PeixariaRelacaoTrabalho,
  Usuario,
  Municipio,
  Especie
} from '../models/index.js';

// ─── GERAÇÃO DE CÓDIGO PE (Peixaria) ──────────────────────────────────────────
// Reutiliza o mesmo padrão utilizado em Desembarques
// Formato: PE00001, PE00002, etc.

const gerarCodigoPeixaria = async (transaction = null) => {
  try {
    const lastPeixaria = await Peixaria.findOne(
      {
        attributes: ['cod_peixaria'],
        order: [['ID_peixaria', 'DESC']],
        raw: true
      },
      { transaction }
    );

    if (!lastPeixaria || !lastPeixaria.cod_peixaria) {
      return 'PE00001';
    }

    const match = lastPeixaria.cod_peixaria.match(/^PE(\d+)$/);
    if (!match) {
      return 'PE00001';
    }

    const numeroAtual = parseInt(match[1], 10);
    const proximoNumero = numeroAtual + 1;
    const codigoGerado = `PE${String(proximoNumero).padStart(5, '0')}`;

    // Verificar se já existe (concorrência)
    const existe = await Peixaria.findOne(
      { where: { cod_peixaria: codigoGerado } },
      { transaction }
    );

    if (existe) {
      // Se existir, tentar próximo (recursão limitada)
      return gerarCodigoPeixaria(transaction);
    }

    return codigoGerado;
  } catch (error) {
    console.error('❌ Erro ao gerar código de peixaria:', error);
    return null;
  }
};

// Endpoint para gerar o próximo código disponível
export const gerarCodigoPeixariaEndpoint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const codigo = await gerarCodigoPeixaria(transaction);

    if (!codigo) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar código de peixaria'
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      codigo
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro ao gerar código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar código de peixaria',
      error: error.message
    });
  }
};

// Verificar se um código já existe
export const verificarCodigoPeixaria = async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código não informado'
      });
    }

    const existe = await Peixaria.findOne(
      { where: { cod_peixaria: codigo } },
      { attributes: ['ID_peixaria'] }
    );

    res.json({
      success: true,
      existe: !!existe
    });
  } catch (error) {
    console.error('❌ Erro ao verificar código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar código',
      error: error.message
    });
  }
};

const txt = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
};

const num = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toValidEspecieId = (value) => {
  const parsed = num(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed <= 2147483647 ? parsed : null;
};

const bool = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'sim') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'nao' || normalized === 'não') return false;
  return null;
};

const parseDecimal = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const isPopulated = (record) => {
  if (!record || typeof record !== 'object') return false;
  return Object.values(record).some((value) => value !== undefined && value !== null && String(value).trim() !== '');
};

const MARKET_TYPES = new Set(['LOCAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL']);
const normalizeMarketType = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  return MARKET_TYPES.has(normalized) ? normalized : null;
};

const normalizeFornecedorTipo = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  return normalized === 'LOCAL' || normalized === 'ENTREGA' ? normalized : null;
};

const ESTABELECIMENTOS_VALIDOS = new Set(['PEIXARIA', 'FEIRA_LIVRE', 'MERCADO']);
const normalizeTipoEstabelecimento = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  return ESTABELECIMENTOS_VALIDOS.has(normalized) ? normalized : null;
};

const buildBasePayload = (body, userId) => ({
  ID_usuario: userId || null,
  cod_peixaria: txt(body.cod_peixaria ?? body.codPeixaria),
  tipo_estabelecimento: normalizeTipoEstabelecimento(body.tipo_estabelecimento ?? body.tipoEstabelecimento),
  ID_municipio: num(body.ID_municipio ?? body.municipioId ?? body.municipio_id),
  responsavel: txt(body.responsavel),
  contato: txt(body.contato),
  municipio: txt(body.municipio),
  localidade: txt(body.localidade),
  nome: txt(body.nome),
  apelido: txt(body.apelido),
  naturalidade: txt(body.naturalidade),
  sexo: txt(body.sexo),
  idade: num(body.idade),
  atividade_principal: txt(body.atividade_principal ?? body.atividadePrincipal),
  atividade_secundaria: txt(body.atividade_secundaria ?? body.atividadeSecundaria),
  total_peixarias: num(body.total_peixarias ?? body.totalPeixarias ?? body.totalPeixariasBoxes),
  quantos_possui: num(body.quantos_possui ?? body.quantosPossui),
  estado_civil: txt(body.estado_civil ?? body.estadoCivil),
  numero_familiares: num(body.numero_familiares ?? body.numeroFamiliares),
  escolaridade: txt(body.escolaridade),
  local_moradia: txt(body.local_moradia ?? body.localMoradia),
  possui_registro_inss: bool(body.possui_registro_inss ?? body.possuiRegistroINSS),
  filiado_colonia: bool(body.filiado_colonia ?? body.filiadoColonia),
  qual_colonia: txt(body.qual_colonia ?? body.qualColonia),
  participa_associacao: bool(body.participa_associacao ?? body.participaAssociacao),
  qual_associacao: txt(body.qual_associacao ?? body.qualAssociacao),
  possui_carteira_pescador: bool(body.possui_carteira_pescador ?? body.possuiCarteiraPescador),
  orgao_emissor_carteira: txt(body.orgao_emissor_carteira ?? body.orgaoEmissorCarteira),
  possui_plano_saude: bool(body.possui_plano_saude ?? body.possuiPlanoSaude),
  plano_saude_especificar: txt(body.plano_saude_especificar ?? body.planoSaudeEspecificar),
  atividades_renda_familia: txt(body.atividades_renda_familia ?? body.atividadesRendaFamilia),
  quem_trabalha_familia: txt(body.quem_trabalha_familia ?? body.quemTrabalhaFamilia),
  tempo_atividade: num(body.tempo_atividade ?? body.tempoAtividade),
  observacoes_especies: txt(body.observacoes_especies ?? body.observacoesEspecies),
  atividade_comercial: txt(body.atividade_comercial ?? body.atividadeComercial),
  periodo_comercializacao: txt(body.periodo_comercializacao ?? body.periodoComercializacao),
  forma_venda: txt(body.forma_venda ?? body.formaVenda),
  descricao_processo_comercio: txt(body.descricao_processo_comercio ?? body.descricaoProcessoComercio),
  transporte: txt(body.transporte)
});

const buildDespesaRecords = (ID_peixaria, despesas = []) =>
  (Array.isArray(despesas) ? despesas : [])
    .map((item) => ({
      ID_peixaria,
      descricao: txt(item.descricao),
      nome_outros: txt(item.nome_outros ?? item.nomeOutros),
      quantidade: parseDecimal(item.quantidade),
      custo: parseDecimal(item.custo),
      frequencia: txt(item.frequencia)
    }))
    .filter(isPopulated);

const buildFornecedorRecords = (ID_peixaria, fornecedores = []) =>
  (Array.isArray(fornecedores) ? fornecedores : [])
    .map((item) => ({
      ID_peixaria,
      nome: txt(item.nome),
      tipo: txt(item.tipo),
      telefone: txt(item.telefone)
    }))
    .filter(isPopulated);

const buildPescadorFornecedorRecords = (ID_peixaria, locais = [], entregas = []) => {
  const rows = [];

  (Array.isArray(locais) ? locais : []).forEach((item) => {
    if (!isPopulated(item)) return;
    rows.push({
      ID_peixaria,
      tipo: 'LOCAL',
      nome: txt(item.nome),
      apelido: txt(item.apelido),
      comunidade: txt(item.comunidade),
      tipo_barco: txt(item.tipo_barco ?? item.tipoBarco),
      numero_pescadores: num(item.numero_pescadores ?? item.numeroPescadores),
      volume: parseDecimal(item.volume),
      volume_medio: parseDecimal(item.volume_medio ?? item.volumeMedio),
      regularidade: txt(item.regularidade)
    });
  });

  (Array.isArray(entregas) ? entregas : []).forEach((item) => {
    if (!isPopulated(item)) return;
    rows.push({
      ID_peixaria,
      tipo: 'ENTREGA',
      nome: txt(item.nome),
      apelido: txt(item.apelido),
      comunidade: txt(item.comunidade),
      tipo_barco: txt(item.tipo_barco ?? item.tipoBarco),
      numero_pescadores: num(item.numero_pescadores ?? item.numeroPescadores),
      volume: parseDecimal(item.volume),
      volume_medio: parseDecimal(item.volume_medio ?? item.volumeMedio),
      regularidade: txt(item.regularidade)
    });
  });

  return rows.filter((row) => row.tipo && isPopulated(row));
};

const buildEspecieComercialRecords = (ID_peixaria, especies = []) =>
  (Array.isArray(especies) ? especies : [])
    .map((item) => ({
      ID_peixaria,
      ID_especie: toValidEspecieId(item.ID_especie ?? item.id_especie),
      especie: txt(item.especie),
      quantidade_fresco: parseDecimal(item.quantidade_fresco ?? item.quantidadeFresco),
      quantidade_congelado: parseDecimal(item.quantidade_congelado ?? item.quantidadeCongelado),
      preco_compra: parseDecimal(item.preco_compra ?? item.precoCompra),
      preco_venda: parseDecimal(item.preco_venda ?? item.precoVenda)
    }))
    .filter(isPopulated);

const buildPerdaRecords = (ID_peixaria, perdas = []) =>
  (Array.isArray(perdas) ? perdas : [])
    .map((item) => ({
      ID_peixaria,
      descricao: txt(item.descricao),
      quantidade: parseDecimal(item.quantidade),
      causa: txt(item.causa)
    }))
    .filter(isPopulated);

const buildPerdaPorEspecieRecords = (ID_peixaria, perdasPorEspecie = []) =>
  (Array.isArray(perdasPorEspecie) ? perdasPorEspecie : [])
    .flatMap((item) => {
      const titulo = txt(item.titulo);
      const linhas = Array.isArray(item.linhas) ? item.linhas : [];
      return linhas
        .map((linha) => ({
          ID_peixaria,
          titulo,
          causa: txt(linha.causa),
          estimativa: num(linha.estimativa),
          destino: txt(linha.destino)
        }))
        .filter(isPopulated);
    });

const buildOrigemPescadoRecords = (ID_peixaria, origens = []) =>
  (Array.isArray(origens) ? origens : [])
    .map((item) => ({
      ID_peixaria,
      tipo: txt(item.tipo),
      pescadores_locais: txt(item.pescadores_locais ?? item.pescadoresLocais),
      outras_localidades_pb: txt(item.outras_localidades_pb ?? item.outrasLocalidadesPB),
      outros_estados: txt(item.outros_estados ?? item.outrosEstados),
      outro: txt(item.outro)
    }))
    .filter(isPopulated);

const buildRelacaoTrabalhoRecords = (ID_peixaria, relacoes = []) =>
  (Array.isArray(relacoes) ? relacoes : [])
    .map((item) => ({
      ID_peixaria,
      tipo: txt(typeof item === 'string' ? item : item.tipo)
    }))
    .filter(isPopulated);

const buildMercadoRecords = (ID_peixaria, mercadoData = {}, tipo) => {
  const tipoMercado = normalizeMarketType(tipo);
  if (!tipoMercado) return [];

  const rows = [];
  const mercadoBase = {
    ID_peixaria,
    tipo_mercado: tipoMercado,
    volume: parseDecimal(mercadoData.volume),
    valor: parseDecimal(mercadoData.valor),
    observacoes: txt(mercadoData.observacoes)
  };

  const linhas = Array.isArray(mercadoData.linhas) ? mercadoData.linhas : [];
  const linhasValidas = linhas
    .map((linha) => ({
      especie: txt(linha.especie),
      forma_comercializacao: txt(linha.forma_comercializacao ?? linha.formaComercializacao),
      destino: txt(linha.destino),
      volume_medio: parseDecimal(linha.volume_medio ?? linha.volumeMedio),
      preco_venda: parseDecimal(linha.preco_venda ?? linha.precoVenda)
    }))
    .filter(isPopulated);

  if (!isPopulated(mercadoBase) && !linhasValidas.length) return [];

  rows.push({
    ...mercadoBase,
    linhas: linhasValidas
  });

  return rows;
};

const destroyPeixariaDependencias = async (ID_peixaria, transaction) => {
  const mercados = await PeixariaMercado.findAll({
    where: { ID_peixaria },
    transaction,
    attributes: ['ID_mercado']
  });
  const mercadoIds = mercados.map((m) => m.ID_mercado).filter((id) => id != null);

  if (mercadoIds.length) {
    await PeixariaMercadoLinha.destroy({ where: { ID_mercado: mercadoIds }, transaction });
  }

  await PeixariaMercado.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaPerdaPorEspecie.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaPerda.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaEspecieComercial.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaPescadorFornecedor.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaFornecedor.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaDespesa.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaOrigemPescado.destroy({ where: { ID_peixaria }, transaction });
  await PeixariaRelacaoTrabalho.destroy({ where: { ID_peixaria }, transaction });
};

const createPeixariaDependencias = async (ID_peixaria, body, transaction) => {
  const despesas = buildDespesaRecords(ID_peixaria, body.despesas);
  if (despesas.length) await PeixariaDespesa.bulkCreate(despesas, { transaction });

  const fornecedores = buildFornecedorRecords(ID_peixaria, body.fornecedores);
  if (fornecedores.length) await PeixariaFornecedor.bulkCreate(fornecedores, { transaction });

  const pescadoresFornecedores = buildPescadorFornecedorRecords(
    ID_peixaria,
    body.pescadores_locais ?? body.pescadoresLocais,
    body.pescadores_entregam ?? body.pescadoresEntregam
  );
  if (pescadoresFornecedores.length) {
    const invalid = pescadoresFornecedores.some((item) => !normalizeFornecedorTipo(item.tipo));
    if (invalid) {
      const err = new Error('Tipo de pescador fornecedor inválido. Use LOCAL ou ENTREGA.');
      err.statusCode = 400;
      throw err;
    }
    await PeixariaPescadorFornecedor.bulkCreate(pescadoresFornecedores, { transaction });
  }

  const especiesComerciais = buildEspecieComercialRecords(ID_peixaria, body.especies_comerciais ?? body.especiesComerciais);
  if (especiesComerciais.length) await PeixariaEspecieComercial.bulkCreate(especiesComerciais, { transaction });

  const perdas = buildPerdaRecords(ID_peixaria, body.perdas);
  if (perdas.length) await PeixariaPerda.bulkCreate(perdas, { transaction });

  const perdasPorEspecie = buildPerdaPorEspecieRecords(ID_peixaria, body.perdas_por_especie ?? body.perdasPorEspecie);
  if (perdasPorEspecie.length) await PeixariaPerdaPorEspecie.bulkCreate(perdasPorEspecie, { transaction });

  const origensPescado = buildOrigemPescadoRecords(ID_peixaria, body.origem_pescado ?? body.origemPescado);
  if (origensPescado.length) await PeixariaOrigemPescado.bulkCreate(origensPescado, { transaction });

  const relacoesTrabalho = buildRelacaoTrabalhoRecords(ID_peixaria, body.relacoes_trabalho ?? body.relacoesTrabalho);
  if (relacoesTrabalho.length) await PeixariaRelacaoTrabalho.bulkCreate(relacoesTrabalho, { transaction });

  const mercados = [
    ...buildMercadoRecords(ID_peixaria, body.mercado_local ?? body.mercadoLocal ?? {}, 'LOCAL'),
    ...buildMercadoRecords(ID_peixaria, body.mercado_estadual ?? body.mercadoEstadual ?? {}, 'ESTADUAL'),
    ...buildMercadoRecords(ID_peixaria, body.mercado_nacional ?? body.mercadoNacional ?? {}, 'NACIONAL'),
    ...buildMercadoRecords(ID_peixaria, body.mercado_internacional ?? body.mercadoInternacional ?? {}, 'INTERNACIONAL')
  ];

  for (const mercado of mercados) {
    const linhas = mercado.linhas ?? [];
    const { linhas: _linhas, ...mercadoData } = mercado;
    const mercadoDb = await PeixariaMercado.create(mercadoData, { transaction });
    if (linhas.length) {
      await PeixariaMercadoLinha.bulkCreate(
        linhas.map((linha) => ({
          ID_mercado: mercadoDb.ID_mercado,
          especie: txt(linha.especie),
          forma_comercializacao: txt(linha.forma_comercializacao),
          destino: txt(linha.destino),
          volume_medio: parseDecimal(linha.volume_medio),
          preco_venda: parseDecimal(linha.preco_venda)
        }))
        .filter(isPopulated),
        { transaction }
      );
    }
  }
};

const getPeixariaIncludes = () => ([
  { model: Usuario, as: 'usuario' },
  { model: Municipio, as: 'municipioInfo' },
  { model: PeixariaDespesa, as: 'despesas', separate: true, order: [['ID_despesa', 'ASC']] },
  { model: PeixariaFornecedor, as: 'fornecedores', separate: true, order: [['ID_fornecedor', 'ASC']] },
  { model: PeixariaPescadorFornecedor, as: 'pescadores_fornecedores', separate: true, order: [['ID_pescador_fornecedor', 'ASC']] },
  { model: PeixariaEspecieComercial, as: 'especies_comerciais', separate: true, include: [{ model: Especie, as: 'especieInfo' }], order: [['ID_especie_comercial', 'ASC']] },
  { model: PeixariaPerda, as: 'perdas', separate: true, order: [['ID_perda', 'ASC']] },
  { model: PeixariaPerdaPorEspecie, as: 'perdas_por_especie', separate: true, order: [['ID_perda_por_especie', 'ASC']] },
  { model: PeixariaOrigemPescado, as: 'origens_pescado', separate: true, order: [['ID_origem_pescado', 'ASC']] },
  { model: PeixariaMercado, as: 'mercados', separate: true, include: [{ model: PeixariaMercadoLinha, as: 'linhas', separate: true, order: [['ID_mercado_linha', 'ASC']] }], order: [['ID_mercado', 'ASC']] },
  { model: PeixariaRelacaoTrabalho, as: 'relacoes_trabalho', separate: true, order: [['ID_relacao_trabalho', 'ASC']] }
]);

export const listarPeixarias = async (req, res) => {
  try {
    const {
      nome,
      responsavel,
      municipio,
      cod_peixaria,
      codigo,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};
    if (nome) where.nome = { [Op.like]: `%${String(nome).trim()}%` };
    if (responsavel) where.responsavel = { [Op.like]: `%${String(responsavel).trim()}%` };
    if (municipio) where.municipio = { [Op.like]: `%${String(municipio).trim()}%` };
    if (cod_peixaria || codigo) {
      const termoCodigo = String(cod_peixaria || codigo).trim();
      where.cod_peixaria = { [Op.like]: `%${termoCodigo}%` };
    }

    const { count, rows } = await Peixaria.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      order: [['nome', 'ASC']]
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(count / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('[peixariaController] listarPeixarias:', error);
    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erro ao listar peixarias',
      error: error.message
    });
  }
};

export const buscarPeixaria = async (req, res) => {
  try {
    const { id } = req.params;
    const peixaria = await Peixaria.findByPk(id, {
      include: getPeixariaIncludes()
    });

    if (!peixaria) {
      return res.status(404).json({
        success: false,
        message: 'Peixaria não encontrada'
      });
    }

    return res.json({
      success: true,
      data: peixaria
    });
  } catch (error) {
    console.error('[peixariaController] buscarPeixaria:', error);
    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erro ao buscar peixaria',
      error: error.message
    });
  }
};

export const criarPeixaria = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const payload = buildBasePayload(req.body || {}, req.usuario?.ID_usuario);

    // Gerar código de peixaria automaticamente (padrão: PE00001, PE00002, etc.)
    // Segue o mesmo padrão utilizado em Desembarques
    if (!payload.cod_peixaria) {
      const codigoGerado = await gerarCodigoPeixaria(transaction);
      if (codigoGerado) {
        payload.cod_peixaria = codigoGerado;
      }
    }

    const peixaria = await Peixaria.create(payload, { transaction });

    console.log('✅ Peixaria criada:', peixaria.cod_peixaria, `(ID: ${peixaria.ID_peixaria})`);

    await createPeixariaDependencias(peixaria.ID_peixaria, req.body || {}, transaction);

    await transaction.commit();

    const created = await Peixaria.findByPk(peixaria.ID_peixaria, {
      include: getPeixariaIncludes()
    });

    return res.status(201).json({
      success: true,
      message: 'Peixaria criada com sucesso',
      data: created
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[peixariaController] criarPeixaria:', error);
    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erro ao criar peixaria',
      error: error.message
    });
  }
};

export const atualizarPeixaria = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const peixaria = await Peixaria.findByPk(id, { transaction });
    if (!peixaria) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Peixaria não encontrada'
      });
    }

    const payload = buildBasePayload(req.body || {}, req.usuario?.ID_usuario || peixaria.ID_usuario);

    // Durante edição: NÃO gerar novo código, manter o existente
    // Segue o padrão de Desembarques: nunca altera o código após criação
    if (peixaria.cod_peixaria) {
      payload.cod_peixaria = peixaria.cod_peixaria;
    }

    await peixaria.update(payload, { transaction });

    // Upsert dependências: atualizar existentes, inserir novos, remover excluídos
    const upsertSimple = async (Model, pkField, buildRecordsFn, incomingArray) => {
      const existing = await Model.findAll({ where: { ID_peixaria: peixaria.ID_peixaria }, transaction });
      const existingById = new Map(existing.map((r) => [r[pkField], r]));

      const incoming = Array.isArray(incomingArray) ? incomingArray : [];
      const toKeepIds = new Set();

      for (const item of incoming) {
        const incomingId = item[pkField] || item.id || item[pkField.toLowerCase()] || null;
        if (incomingId) {
          const existingRow = existingById.get(incomingId);
          if (!existingRow) {
            const err = new Error(`Registro com ID ${incomingId} não encontrado para ${Model.name}`);
            err.statusCode = 400;
            throw err;
          }
          // Update existing
          await existingRow.update(buildRecordsFn(peixaria.ID_peixaria, [item])[0], { transaction });
          toKeepIds.add(incomingId);
        } else {
          // Create new
          const createdRows = buildRecordsFn(peixaria.ID_peixaria, [item]);
          if (createdRows.length) {
            await Model.create(createdRows[0], { transaction });
          }
        }
      }

      // Delete rows not present in incoming
      const idsToDelete = existing
        .map((r) => r[pkField])
        .filter((id) => id != null && !toKeepIds.has(id));
      if (idsToDelete.length) await Model.destroy({ where: { [pkField]: idsToDelete }, transaction });
    };

    // despesas
    await upsertSimple(PeixariaDespesa, 'ID_despesa', (ID_peixaria, items) => buildDespesaRecords(ID_peixaria, items), req.body.despesas);

    // fornecedores
    await upsertSimple(PeixariaFornecedor, 'ID_fornecedor', (ID_peixaria, items) => buildFornecedorRecords(ID_peixaria, items), req.body.fornecedores);

    // pescadores_fornecedores (complex: may have tipo LOCAL/ENTREGA but same model)
    // We'll reuse buildPescadorFornecedorRecords by splitting incoming arrays
    const incomingLocais = req.body.pescadores_locais ?? req.body.pescadoresLocais ?? [];
    const incomingEntregas = req.body.pescadores_entregam ?? req.body.pescadoresEntregam ?? [];
    const incomingPescadores = [];
    (Array.isArray(incomingLocais) ? incomingLocais : []).forEach((it) => incomingPescadores.push({ ...it, tipo: 'LOCAL' }));
    (Array.isArray(incomingEntregas) ? incomingEntregas : []).forEach((it) => incomingPescadores.push({ ...it, tipo: 'ENTREGA' }));

    await upsertSimple(PeixariaPescadorFornecedor, 'ID_pescador_fornecedor', (ID_peixaria, items) => {
      // buildPescadorFornecedorRecords expects separate arrays but can process combined
      return buildPescadorFornecedorRecords(ID_peixaria, items.filter((i) => i.tipo === 'LOCAL'), items.filter((i) => i.tipo === 'ENTREGA'));
    }, incomingPescadores);

    // especies comerciais
    await upsertSimple(PeixariaEspecieComercial, 'ID_especie_comercial', (ID_peixaria, items) => buildEspecieComercialRecords(ID_peixaria, items), req.body.especies_comerciais ?? req.body.especiesComerciais);

    // perdas
    await upsertSimple(PeixariaPerda, 'ID_perda', (ID_peixaria, items) => buildPerdaRecords(ID_peixaria, items), req.body.perdas);

    // perdas por especie (these are grouped by titulo with linhas array; our buildPerdaPorEspecieRecords flattens to rows without original sub-ids)
    // For per-species losses we will delete all and recreate because original structure flattens and doesn't preserve IDs reliably
    await PeixariaPerdaPorEspecie.destroy({ where: { ID_peixaria: peixaria.ID_peixaria }, transaction });
    const perdasPorEspecieRows = buildPerdaPorEspecieRecords(peixaria.ID_peixaria, req.body.perdas_por_especie ?? req.body.perdasPorEspecie);
    if (perdasPorEspecieRows.length) await PeixariaPerdaPorEspecie.bulkCreate(perdasPorEspecieRows, { transaction });

    // origens pescado
    await upsertSimple(PeixariaOrigemPescado, 'ID_origem_pescado', (ID_peixaria, items) => buildOrigemPescadoRecords(ID_peixaria, items), req.body.origem_pescado ?? req.body.origemPescado);

    // relacoes trabalho (simple strings/objects)
    await upsertSimple(PeixariaRelacaoTrabalho, 'ID_relacao_trabalho', (ID_peixaria, items) => buildRelacaoTrabalhoRecords(ID_peixaria, items), req.body.relacoes_trabalho ?? req.body.relacoesTrabalho);

    // mercados + linhas: handle per-mercado upsert
    const incomingMercados = [
      ...(Array.isArray(req.body.mercado_local ?? req.body.mercadoLocal) ? (req.body.mercado_local ?? req.body.mercadoLocal) : []),
      ...(Array.isArray(req.body.mercado_estadual ?? req.body.mercadoEstadual) ? (req.body.mercado_estadual ?? req.body.mercadoEstadual) : []),
      ...(Array.isArray(req.body.mercado_nacional ?? req.body.mercadoNacional) ? (req.body.mercado_nacional ?? req.body.mercadoNacional) : []),
      ...(Array.isArray(req.body.mercado_internacional ?? req.body.mercadoInternacional) ? (req.body.mercado_internacional ?? req.body.mercadoInternacional) : [])
    ].map((m) => ({ ...m }));

    // For mercados we expect each mercado object to include tipo_mercado or we'll compute from its group
    const existingMercados = await PeixariaMercado.findAll({ where: { ID_peixaria: peixaria.ID_peixaria }, transaction });
    const existingMercById = new Map(existingMercados.map((m) => [m.ID_mercado, m]));
    const keepMercIds = new Set();

    for (const mercadoIncoming of incomingMercados) {
      const mercId = mercadoIncoming.ID_mercado || mercadoIncoming.id || null;
      const tipo = normalizeMarketType(mercadoIncoming.tipo_mercado ?? mercadoIncoming.tipo ?? mercadoIncoming.type);
      const mercadoData = {
        ID_peixaria: peixaria.ID_peixaria,
        tipo_mercado: tipo,
        volume: parseDecimal(mercadoIncoming.volume),
        valor: parseDecimal(mercadoIncoming.valor),
        observacoes: txt(mercadoIncoming.observacoes)
      };

      const linhas = Array.isArray(mercadoIncoming.linhas) ? mercadoIncoming.linhas : [];

      if (mercId) {
        const existingMerc = existingMercById.get(mercId);
        if (!existingMerc) {
          const err = new Error(`Mercado com ID ${mercId} não encontrado para esta peixaria`);
          err.statusCode = 400;
          throw err;
        }
        await existingMerc.update(mercadoData, { transaction });
        keepMercIds.add(mercId);

        // Upsert linhas
        const existingLinhas = await PeixariaMercadoLinha.findAll({ where: { ID_mercado: mercId }, transaction });
        const existingLinhasById = new Map(existingLinhas.map((l) => [l.ID_mercado_linha, l]));
        const keepLinhaIds = new Set();

        for (const linha of linhas) {
          const linhaId = linha.ID_mercado_linha || linha.id || null;
          const linhaData = {
            ID_mercado: mercId,
            especie: txt(linha.especie),
            forma_comercializacao: txt(linha.forma_comercializacao ?? linha.formaComercializacao),
            destino: txt(linha.destino),
            volume_medio: parseDecimal(linha.volume_medio ?? linha.volumeMedio),
            preco_venda: parseDecimal(linha.preco_venda ?? linha.precoVenda)
          };
          if (linhaId) {
            const existingLinha = existingLinhasById.get(linhaId);
            if (!existingLinha) {
              const err = new Error(`Linha de mercado com ID ${linhaId} não encontrada para mercado ${mercId}`);
              err.statusCode = 400;
              throw err;
            }
            await existingLinha.update(linhaData, { transaction });
            keepLinhaIds.add(linhaId);
          } else {
            await PeixariaMercadoLinha.create(linhaData, { transaction });
          }
        }

        const idsLinhaToDelete = existingLinhas
          .map((l) => l.ID_mercado_linha)
          .filter((id) => id != null && !keepLinhaIds.has(id));
        if (idsLinhaToDelete.length) await PeixariaMercadoLinha.destroy({ where: { ID_mercado_linha: idsLinhaToDelete }, transaction });
      } else {
        // Create mercado and linhas
        const createdMerc = await PeixariaMercado.create(mercadoData, { transaction });
        if (linhas.length) {
          await PeixariaMercadoLinha.bulkCreate(
            linhas.map((linha) => ({
              ID_mercado: createdMerc.ID_mercado,
              especie: txt(linha.especie),
              forma_comercializacao: txt(linha.forma_comercializacao ?? linha.formaComercializacao),
              destino: txt(linha.destino),
              volume_medio: parseDecimal(linha.volume_medio ?? linha.volumeMedio),
              preco_venda: parseDecimal(linha.preco_venda ?? linha.precoVenda)
            })).filter(isPopulated),
            { transaction }
          );
        }
      }
    }

    // Remove mercados not in incoming
    const mercIdsToDelete = existingMercados.map((m) => m.ID_mercado).filter((id) => id != null && !keepMercIds.has(id));
    if (mercIdsToDelete.length) {
      // cascades will remove linhas due to associations
      await PeixariaMercado.destroy({ where: { ID_mercado: mercIdsToDelete }, transaction });
    }

    await transaction.commit();

    const updated = await Peixaria.findByPk(peixaria.ID_peixaria, {
      include: getPeixariaIncludes()
    });

    return res.json({
      success: true,
      message: 'Peixaria atualizada com sucesso',
      data: updated
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[peixariaController] atualizarPeixaria:', error);
    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erro ao atualizar peixaria',
      error: error.message
    });
  }
};

export const deletarPeixaria = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const peixaria = await Peixaria.findByPk(id, { transaction });
    if (!peixaria) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Peixaria não encontrada'
      });
    }

    // Remover dependências explicitamente para evitar registros órfãos
    await destroyPeixariaDependencias(peixaria.ID_peixaria, transaction);

    // Remover registro principal
    await peixaria.destroy({ transaction });
    await transaction.commit();

    return res.json({
      success: true,
      message: 'Peixaria deletada com sucesso'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[peixariaController] deletarPeixaria:', error);
    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erro ao deletar peixaria',
      error: error.message
    });
  }
};