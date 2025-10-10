import { Embarcacao, Desembarque } from '../models/index.js';

export const listarEmbarcacoes = async (req, res) => {
  try {
    const embarcacoes = await Embarcacao.findAll({
      order: [['nome_embarcacao', 'ASC']]
    });

    res.json({
      success: true,
      data: embarcacoes
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
    const embarcacao = await Embarcacao.create(req.body);
    
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