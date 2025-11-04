import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware de autenticação básica
export const verificarAutenticacao = async (req, res, next) => {
  try {
    // Verificar se o token está presente no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }
    
    // Extrair o token
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco de dados
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }
    
    // Adicionar usuário ao request
    req.usuario = usuario;
    req.usuarioId = usuario.ID_usuario;
    req.usuarioFuncao = usuario.funcao;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Middleware para verificar se o usuário tem uma função específica
export const verificarFuncao = (...funcoesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }
    
    if (!funcoesPermitidas.includes(req.usuario.funcao)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
      });
    }
    
    next();
  };
};

// Middleware específico para administradores
export const verificarAdmin = verificarFuncao('Administrador');

// Função para gerar token JWT
export const gerarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.ID_usuario,
      email: usuario.email,
      funcao: usuario.funcao
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export default {
  verificarAutenticacao,
  verificarFuncao,
  verificarAdmin,
  gerarToken
};