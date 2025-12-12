import { Pescador, Desembarque } from '../models/index.js';
import { Op } from 'sequelize';
import { validarCPF } from '../utils/validators.js';

export const listarPescadores = async (req, res) => {
  try {
    const { 
      nome, 
      cpf,
      page = 1, 
      limit = 50 
    } = req.query;

    const where = {};
    if (nome) where.nome = { [Op.like]: `%${nome}%` };
    if (cpf) where.cpf = cpf;

    const { count, rows } = await Pescador.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['nome', 'ASC']]
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
      message: 'Erro ao listar pescadores',
      error: error.message
    });
  }
};

export const criarPescador = async (req, res) => {
  try {
    const dados = req.body;

    // Validar CPF
    if (!dados.cpf || !validarCPF(dados.cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Verificar se já existe pescador com este CPF
    const pescadorExistente = await Pescador.findOne({
      where: { cpf: dados.cpf }
    });

    if (pescadorExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um pescador cadastrado com este CPF'
      });
    }

    const pescador = await Pescador.create(dados);
    
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

// Atualizar pescador
export const atualizarPescador = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const pescador = await Pescador.findByPk(id);
    if (!pescador) {
      return res.status(404).json({
        success: false,
        message: 'Pescador não encontrado'
      });
    }

    // Validar CPF se estiver sendo atualizado
    if (dados.cpf && dados.cpf !== pescador.cpf) {
      if (!validarCPF(dados.cpf)) {
        return res.status(400).json({
          success: false,
          message: 'CPF inválido'
        });
      }

      // Verificar se já existe outro pescador com este CPF
      const pescadorExistente = await Pescador.findOne({
        where: { 
          cpf: dados.cpf,
          ID_pescador: { [Op.ne]: id }
        }
      });

      if (pescadorExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um pescador cadastrado com este CPF'
        });
      }
    }

    await pescador.update(dados);

    res.json({
      success: true,
      message: 'Pescador atualizado com sucesso',
      data: pescador
    });

  } catch (error) {
    console.error('Erro ao atualizar pescador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar pescador',
      error: error.message
    });
  }
};

// Deletar pescador
export const deletarPescador = async (req, res) => {
  try {
    const { id } = req.params;

    const pescador = await Pescador.findByPk(id);
    if (!pescador) {
      return res.status(404).json({
        success: false,
        message: 'Pescador não encontrado'
      });
    }

    // Verificar se existem desembarques vinculados
    const desembarquesVinculados = await Desembarque.count({
      where: { ID_pescador: id }
    });

    if (desembarquesVinculados > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir o pescador pois existem desembarques vinculados'
      });
    }

    await pescador.destroy();

    res.json({
      success: true,
      message: 'Pescador deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar pescador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar pescador',
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