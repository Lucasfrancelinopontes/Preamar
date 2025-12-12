import { Usuario } from '../models/Usuario.js';
import { Op } from 'sequelize';

// Listar todos os usuários (apenas para Administradores)
export const listarUsuarios = async (req, res) => {
  try {
    const { nome, email, funcao, page = 1, limit = 50 } = req.query;

    const where = {};
    if (nome) where.nome = { [Op.like]: `%${nome}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (funcao) where.funcao = funcao;

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['senha'] }, // Não retornar senha
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
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao listar usuários: ${error.message}`,
      error: error.message
    });
  }
};

// Criar novo usuário (apenas para Administradores)
export const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, funcao } = req.body;

    // Validar dados obrigatórios
    if (!nome || !email || !senha || !funcao) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e função são obrigatórios'
      });
    }

    // Verificar se o email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um usuário cadastrado com este email'
      });
    }

    // Criar usuário
    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      funcao
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: usuario.toSafeObject()
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

// Buscar usuário por ID
export const buscarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['senha'] }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// Atualizar usuário
export const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, funcao, ativo } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar email único se estiver sendo atualizado
    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({
        where: {
          email,
          ID_usuario: { [Op.ne]: id }
        }
      });

      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um usuário cadastrado com este email'
        });
      }
    }

    // Atualizar dados
    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (funcao) dadosAtualizacao.funcao = funcao;
    if (ativo !== undefined) dadosAtualizacao.ativo = ativo;

    await usuario.update(dadosAtualizacao);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuario.toSafeObject()
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// Deletar usuário
export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Impedir que o usuário delete a si mesmo
    if (parseInt(id) === req.usuario.ID_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
};