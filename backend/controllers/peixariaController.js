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

const buildBasePayload = (body, userId) => ({
  ID_usuario: userId || null,
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
  atividade_comercial: txt(body.atividade_comercial ?? body.atividadeComercial),
  periodo_comercializacao: txt(body.periodo_comercializacao ?? body.periodoComercializacao),
  forma_venda: txt(body.forma_venda ?? body.formaVenda),
  transporte: txt(body.transporte)
});

const buildDespesaRecords = (ID_peixaria, despesas = []) =>
  (Array.isArray(despesas) ? despesas : [])
    .map((item) => ({
      ID_peixaria,
      descricao: txt(item.descricao),
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
      ID_especie: num(item.ID_especie ?? item.id_especie),
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
      throw new Error('Tipo de pescador fornecedor inválido. Use LOCAL ou ENTREGA.');
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
  { model: PeixariaDespesa, as: 'despesas' },
  { model: PeixariaFornecedor, as: 'fornecedores' },
  { model: PeixariaPescadorFornecedor, as: 'pescadores_fornecedores' },
  { model: PeixariaEspecieComercial, as: 'especies_comerciais', include: [{ model: Especie, as: 'especieInfo' }] },
  { model: PeixariaPerda, as: 'perdas' },
  { model: PeixariaPerdaPorEspecie, as: 'perdas_por_especie' },
  { model: PeixariaOrigemPescado, as: 'origens_pescado' },
  { model: PeixariaMercado, as: 'mercados', include: [{ model: PeixariaMercadoLinha, as: 'linhas' }] },
  { model: PeixariaRelacaoTrabalho, as: 'relacoes_trabalho' }
]);

export const listarPeixarias = async (req, res) => {
  try {
    const {
      nome,
      responsavel,
      municipio,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};
    if (nome) where.nome = { [Op.like]: `%${String(nome).trim()}%` };
    if (responsavel) where.responsavel = { [Op.like]: `%${String(responsavel).trim()}%` };
    if (municipio) where.municipio = { [Op.like]: `%${String(municipio).trim()}%` };

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
    return res.status(500).json({
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
    return res.status(500).json({
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
    const peixaria = await Peixaria.create(payload, { transaction });

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
    return res.status(500).json({
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
    await peixaria.update(payload, { transaction });

    await destroyPeixariaDependencias(peixaria.ID_peixaria, transaction);
    await createPeixariaDependencias(peixaria.ID_peixaria, req.body || {}, transaction);

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
    return res.status(500).json({
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

    await peixaria.destroy({ transaction });
    await transaction.commit();

    return res.json({
      success: true,
      message: 'Peixaria deletada com sucesso'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[peixariaController] deletarPeixaria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao deletar peixaria',
      error: error.message
    });
  }
};
