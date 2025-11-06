import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Função para gerar token JWT
export const gerarToken = (usuario) => {
  return jwt.sign(
    { 
      ID_usuario: usuario.ID_usuario,
      nome: usuario.nome,
      email: usuario.email,
      funcao: usuario.funcao
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Middleware de autenticação básica
// Middleware para verificar se o usuário é admin
export const verificarAdmin = async (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado e tem função de admin
    if (!req.usuario || req.usuario.funcao !== 'Administrador') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Requer privilégios de administrador.'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar privilégios de administrador',
      error: error.message
    });
  }
};

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

    // Extrair o token do header
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário
    const usuario = await Usuario.findByPk(decoded.ID_usuario);
    
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
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação',
      error: error.message
    });
  }
}