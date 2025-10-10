import { validarCPF, validarDesembarque } from '../utils/validators.js';

// Middleware para validar CPF
export const validarCPFMiddleware = (req, res, next) => {
  const { cpf } = req.body.pescador || req.body;
  
  if (cpf && !validarCPF(cpf)) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido',
      errors: ['O CPF fornecido não é válido']
    });
  }
  
  next();
};

// Middleware para validar desembarque
export const validarDesembarqueMiddleware = (req, res, next) => {
  const { desembarque } = req.body;
  
  if (!desembarque) {
    return res.status(400).json({
      success: false,
      message: 'Dados do desembarque são obrigatórios'
    });
  }
  
  const { valido, erros } = validarDesembarque(desembarque);
  
  if (!valido) {
    return res.status(400).json({
      success: false,
      message: 'Dados de desembarque inválidos',
      errors: erros
    });
  }
  
  next();
};

// Middleware para tratamento de erros
export const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erros do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Registro duplicado',
      errors: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida',
      error: 'ID referenciado não existe'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};