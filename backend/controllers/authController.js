import { Usuario } from '../models/Usuario.js';
import { gerarToken } from '../middleware/authMiddleware.js';

// Registro de novo usuário (público)
export const register = async (req, res) => {
  try {
    const { nome, email, senha, telefone, funcao } = req.body;

    // Validar dados obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Validar tamanho mínimo da senha
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verificar se o email já está em uso
    const usuarioExistente = await Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criar novo usuário (função padrão é 'Coletor')
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha,
      telefone: telefone || null,
      funcao: funcao || 'Coletor',
      ativo: true
    });

    // Retornar dados do usuário criado (sem senha)
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: novoUsuario.toSafeObject()
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar dados
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário por email
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const senhaValida = await usuario.compararSenha(senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await usuario.update({ ultimo_login: new Date() });

    // Gerar token
    const token = gerarToken(usuario);

    // Retornar dados do usuário e token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: usuario.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login',
      error: error.message
    });
  }
};

// Obter perfil do usuário logado
export const obterPerfil = async (req, res) => {
  try {
    // O usuário já está disponível em req.usuario pelo middleware
    const usuario = await Usuario.findByPk(req.usuario.ID_usuario);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario.toSafeObject()
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
      error: error.message
    });
  }
};

// Alterar senha
export const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Validar dados
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.ID_usuario);

    // Verificar senha atual
    const senhaValida = await usuario.compararSenha(senhaAtual);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    await usuario.update({ senha: novaSenha });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: error.message
    });
  }
};