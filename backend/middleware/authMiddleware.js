import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Função para gerar token JWT (inclui ID_usuario para compatibilidade com controllers)
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

// Middleware de autenticação: valida JWT e anexa `req.usuario` (instância do modelo)
export const verificarAutenticacao = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Suportar tokens que contenham `ID_usuario` (padão atual)
    const userId = decoded.ID_usuario || decoded.id || decoded.ID || null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token inválido (falta identificador do usuário)' });
    }

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }
    if (!usuario.ativo) {
      return res.status(401).json({ success: false, message: 'Usuário inativo' });
    }

    // Garantir campos úteis para controllers
    req.usuario = usuario;
    req.usuarioId = usuario.ID_usuario;
    req.usuarioFuncao = usuario.funcao;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ success: false, message: 'Erro ao verificar autenticação' });
  }
};

// Middleware gerador para verificar funções/roles (ex: 'Administrador')
export const verificarFuncao = (...funcoesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    if (!funcoesPermitidas.includes(req.usuario.funcao)) {
      return res.status(403).json({ success: false, message: 'Acesso negado. Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
};

// Conveniência: verificarAdmin baseada em verificarFuncao
export const verificarAdmin = verificarFuncao('Administrador');

export default {
  gerarToken,
  verificarAutenticacao,
  verificarFuncao,
  verificarAdmin
};