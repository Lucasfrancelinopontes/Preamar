import { Pescador, Desembarque } from '../models/index.js';

export const listarPescadores = async (req, res) => {
  try {
    const pescadores = await Pescador.findAll({
      order: [['nome', 'ASC']]
    });

    res.json({
      success: true,
      data: pescadores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar pescadores',
      error: error.message
    });
  }
};

export const criarPescador = async (req, res) => {
  try {
    const pescador = await Pescador.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Pescador criado com sucesso',
      data: pescador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pescador',
      error: error.message
    });
  }
};

export const buscarPescador = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pescador = await Pescador.findByPk(id, {
      include: [{
        model: Desembarque,
        as: 'desembarques',
        limit: 10,
        order: [['data_coleta', 'DESC']]
      }]
    });

    if (!pescador) {
      return res.status(404).json({
        success: false,
        message: 'Pescador não encontrado'
      });
    }

    res.json({
      success: true,
      data: pescador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pescador',
      error: error.message
    });
  }
};