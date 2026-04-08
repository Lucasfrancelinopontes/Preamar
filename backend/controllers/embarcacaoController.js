import { Embarcacao, Desembarque } from '../models/index.js';
import { Op } from 'sequelize';

const TIPOS_PERMITIDOS = new Set(['catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro']);
const POSSUI_PERMITIDOS = new Set(['urna', 'caixaTermica', 'pescadoInNatura']);

const TIPO_ALIAS = {
  bote: 'boteLancha',
  outros: 'outro',
  traineira: 'outro',
  chalana: 'outro'
};

const POSSUI_ALIAS = {
  caixa: 'caixaTermica',
  in_natura: 'pescadoInNatura',
  gelo: null,
  sem: null
};

const normalizarTexto = (value) => {
  if (value === null || value === undefined) return null;
  const texto = String(value).trim();
  return texto || null;
};

const normalizarCodigoEmbarcacao = (value) => {
  if (value === null || value === undefined) return null;
  const codigo = String(value).trim();
  return codigo || null;
};

const normalizarTipoEmbarcacao = (value) => {
  const tipo = normalizarTexto(value);
  if (!tipo) return null;
  return TIPO_ALIAS[tipo] || tipo;
};

const normalizarPossui = (value) => {
  const possui = normalizarTexto(value);
  if (!possui) return null;
  if (Object.prototype.hasOwnProperty.call(POSSUI_ALIAS, possui)) {
    return POSSUI_ALIAS[possui];
  }
  return possui;
};

const sanitizarEmbarcacao = (payload = {}) => {
  const dados = { ...payload };

  if (Object.prototype.hasOwnProperty.call(dados, 'nome_embarcacao')) dados.nome_embarcacao = normalizarTexto(dados.nome_embarcacao);
  if (Object.prototype.hasOwnProperty.call(dados, 'codigo_embarcacao')) dados.codigo_embarcacao = normalizarCodigoEmbarcacao(dados.codigo_embarcacao);
  if (Object.prototype.hasOwnProperty.call(dados, 'proprietario')) dados.proprietario = normalizarTexto(dados.proprietario);
  if (Object.prototype.hasOwnProperty.call(dados, 'apelido_propietario')) dados.apelido_propietario = normalizarTexto(dados.apelido_propietario);
  if (Object.prototype.hasOwnProperty.call(dados, 'cpf_proprietario')) dados.cpf_proprietario = normalizarTexto(dados.cpf_proprietario);
  if (Object.prototype.hasOwnProperty.call(dados, 'municipio')) dados.municipio = normalizarTexto(dados.municipio);
  if (Object.prototype.hasOwnProperty.call(dados, 'localidade')) dados.localidade = normalizarTexto(dados.localidade);
  if (Object.prototype.hasOwnProperty.call(dados, 'tipo_outro')) dados.tipo_outro = normalizarTexto(dados.tipo_outro);
  if (Object.prototype.hasOwnProperty.call(dados, 'tipo')) dados.tipo = normalizarTipoEmbarcacao(dados.tipo);
  if (Object.prototype.hasOwnProperty.call(dados, 'possui')) dados.possui = normalizarPossui(dados.possui);

  return dados;
};

export const listarEmbarcacoes = async (req, res) => {
  try {
    const { 
      nome, 
      codigo,
      tipo,
      municipio,
      page = 1, 
      limit = 50 
    } = req.query;

    const where = {};
    if (nome) where.nome_embarcacao = { [Op.like]: `%${nome}%` };
    if (codigo) where.codigo_embarcacao = codigo;
    if (tipo) where.tipo = tipo;
    if (municipio) where.municipio = municipio;

    const { count, rows } = await Embarcacao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['nome_embarcacao', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar embarcações',
      error: error.message
    });
  }
};

export const criarEmbarcacao = async (req, res) => {
  try {
    const dados = sanitizarEmbarcacao(req.body || {});

    // Validar dados obrigatórios
    if (!dados.nome_embarcacao) {
      return res.status(400).json({
        success: false,
        message: 'Nome da embarcação é obrigatório'
      });
    }

    if (!dados.tipo) {
      return res.status(400).json({
        success: false,
        message: 'Tipo da embarcação é obrigatório'
      });
    }

    if (!TIPOS_PERMITIDOS.has(dados.tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de embarcação inválido. Use: catraia, caico, jangada, boteLancha, canoa, barco ou outro'
      });
    }

    if (dados.possui && !POSSUI_PERMITIDOS.has(dados.possui)) {
      return res.status(400).json({
        success: false,
        message: 'Armazenamento inválido. Use: urna, caixaTermica ou pescadoInNatura'
      });
    }

    if (dados.codigo_embarcacao) {
      // Verificar se já existe embarcação com este código
      const embarcacaoExistente = await Embarcacao.findOne({
        where: { codigo_embarcacao: dados.codigo_embarcacao }
      });

      if (embarcacaoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma embarcação cadastrada com este código'
        });
      }
    }

    const embarcacao = await Embarcacao.create(dados);
    
    res.status(201).json({
      success: true,
      message: 'Embarcação criada com sucesso',
      data: embarcacao
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar embarcação',
      error: error.message
    });
  }
};

// Atualizar embarcação
export const atualizarEmbarcacao = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = sanitizarEmbarcacao(req.body || {});

    const embarcacao = await Embarcacao.findByPk(id);
    if (!embarcacao) {
      return res.status(404).json({
        success: false,
        message: 'Embarcação não encontrada'
      });
    }

    if (Object.prototype.hasOwnProperty.call(dados, 'nome_embarcacao') && !dados.nome_embarcacao) {
      return res.status(400).json({
        success: false,
        message: 'Nome da embarcação é obrigatório'
      });
    }

    if (Object.prototype.hasOwnProperty.call(dados, 'tipo')) {
      if (!dados.tipo) {
        return res.status(400).json({
          success: false,
          message: 'Tipo da embarcação é obrigatório'
        });
      }

      if (!TIPOS_PERMITIDOS.has(dados.tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de embarcação inválido. Use: catraia, caico, jangada, boteLancha, canoa, barco ou outro'
        });
      }
    }

    if (Object.prototype.hasOwnProperty.call(dados, 'possui') && dados.possui && !POSSUI_PERMITIDOS.has(dados.possui)) {
      return res.status(400).json({
        success: false,
        message: 'Armazenamento inválido. Use: urna, caixaTermica ou pescadoInNatura'
      });
    }

    // Validar código único se estiver sendo atualizado
    if (dados.codigo_embarcacao && dados.codigo_embarcacao !== embarcacao.codigo_embarcacao) {
      const embarcacaoExistente = await Embarcacao.findOne({
        where: { 
          codigo_embarcacao: dados.codigo_embarcacao,
          ID_embarcacao: { [Op.ne]: id }
        }
      });

      if (embarcacaoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma embarcação cadastrada com este código'
        });
      }
    }

    await embarcacao.update(dados);

    res.json({
      success: true,
      message: 'Embarcação atualizada com sucesso',
      data: embarcacao
    });

  } catch (error) {
    console.error('Erro ao atualizar embarcação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar embarcação',
      error: error.message
    });
  }
};

// Deletar embarcação
export const deletarEmbarcacao = async (req, res) => {
  try {
    const { id } = req.params;

    const embarcacao = await Embarcacao.findByPk(id);
    if (!embarcacao) {
      return res.status(404).json({
        success: false,
        message: 'Embarcação não encontrada'
      });
    }

    // Verificar se existem desembarques vinculados
    const desembarquesVinculados = await Desembarque.count({
      where: { ID_embarcacao: id }
    });

    if (desembarquesVinculados > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir a embarcação pois existem desembarques vinculados'
      });
    }

    await embarcacao.destroy();

    res.json({
      success: true,
      message: 'Embarcação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar embarcação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar embarcação',
      error: error.message
    });
  }
};

export const buscarEmbarcacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    const embarcacao = await Embarcacao.findByPk(id, {
      include: [{
        model: Desembarque,
        as: 'desembarques',
        limit: 10,
        order: [['data_coleta', 'DESC']]
      }]
    });

    if (!embarcacao) {
      return res.status(404).json({
        success: false,
        message: 'Embarcação não encontrada'
      });
    }

    res.json({
      success: true,
      data: embarcacao
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar embarcação',
      error: error.message
    });
  }
};