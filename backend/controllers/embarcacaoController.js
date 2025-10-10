import { Embarcacao, Desembarque } from '../models/index.js';
import { Op } from 'sequelize';

export const listarEmbarcacoes = async (req, res) => {
  try {
    const { 
      nome, 
      codigo,
      tipo,
      page = 1, 
      limit = 50 
    } = req.query;

    const where = {};
    if (nome) where.nome_embarcacao = { [Op.iLike]: `%${nome}%` };
    if (codigo) where.codigo_embarcacao = codigo;
    if (tipo) where.tipo = tipo;

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
    const dados = req.body;

    // Validar dados obrigatórios
    if (!dados.nome_embarcacao || !dados.codigo_embarcacao) {
      return res.status(400).json({
        success: false,
        message: 'Nome e código da embarcação são obrigatórios'
      });
    }

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
    const dados = req.body;

    const embarcacao = await Embarcacao.findByPk(id);
    if (!embarcacao) {
      return res.status(404).json({
        success: false,
        message: 'Embarcação não encontrada'
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