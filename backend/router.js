import { Router } from 'express';
const router = Router();

// Importar controllers
import { gmun, gesp } from './api/funcoes.js';
import {
  criarDesembarque,
  listarDesembarques,
  buscarDesembarque,
  atualizarDesembarque,
  deletarDesembarque,
  estatisticasDesembarques
} from './controllers/desembarqueController.js';
import {
  listarPescadores,
  criarPescador,
  buscarPescador,
  atualizarPescador,
  deletarPescador
} from './controllers/pescadorController.js';
import {
  listarEmbarcacoes,
  criarEmbarcacao,
  buscarEmbarcacao,
  atualizarEmbarcacao,
  deletarEmbarcacao
} from './controllers/embarcacaoController.js';
import {
  login,
  register,
  obterPerfil,
  alterarSenha
} from './controllers/authController.js';
import {
  listarUsuarios,
  criarUsuario,
  buscarUsuario,
  atualizarUsuario,
  deletarUsuario
} from './controllers/usuarioController.js';

// Importar middlewares
import {
  verificarAutenticacao,
  verificarAdmin
} from './middleware/authMiddleware.js';

// ========================================
// ROTAS PÚBLICAS (sem autenticação)
// ========================================

// Autenticação
router.post('/login', login);
router.post('/register', register);

// Rotas existentes (JSON estáticos) - podem permanecer públicas
router.get('/municipios', gmun);
router.get('/especies', gesp);

// ========================================
// ROTAS PROTEGIDAS (requerem autenticação)
// ========================================

// Perfil do usuário logado
router.get('/auth/perfil', verificarAutenticacao, obterPerfil);
router.put('/auth/senha', verificarAutenticacao, alterarSenha);

// Rotas de Desembarques (protegidas)
router.post('/desembarques', verificarAutenticacao, criarDesembarque);
router.get('/desembarques/estatisticas', verificarAutenticacao, estatisticasDesembarques);
router.get('/desembarques', verificarAutenticacao, listarDesembarques);
router.get('/desembarques/:id', verificarAutenticacao, buscarDesembarque);
router.put('/desembarques/:id', verificarAutenticacao, atualizarDesembarque);
router.delete('/desembarques/:id', verificarAutenticacao, deletarDesembarque);

// Rotas de Pescadores (protegidas)
router.get('/pescadores', verificarAutenticacao, listarPescadores);
router.post('/pescadores', verificarAutenticacao, criarPescador);
router.get('/pescadores/:id', verificarAutenticacao, buscarPescador);
router.put('/pescadores/:id', verificarAutenticacao, atualizarPescador);
router.delete('/pescadores/:id', verificarAutenticacao, deletarPescador);

// Rotas de Embarcações (protegidas)
router.get('/embarcacoes', verificarAutenticacao, listarEmbarcacoes);
router.post('/embarcacoes', verificarAutenticacao, criarEmbarcacao);
router.get('/embarcacoes/:id', verificarAutenticacao, buscarEmbarcacao);
router.put('/embarcacoes/:id', verificarAutenticacao, atualizarEmbarcacao);
router.delete('/embarcacoes/:id', verificarAutenticacao, deletarEmbarcacao);

// ========================================
// ROTAS ADMINISTRATIVAS (apenas Administradores)
// ========================================

router.get('/usuarios', verificarAutenticacao, verificarAdmin, listarUsuarios);
router.post('/usuarios', verificarAutenticacao, verificarAdmin, criarUsuario);
router.get('/usuarios/:id', verificarAutenticacao, verificarAdmin, buscarUsuario);
router.put('/usuarios/:id', verificarAutenticacao, verificarAdmin, atualizarUsuario);
router.delete('/usuarios/:id', verificarAutenticacao, verificarAdmin, deletarUsuario);

export default router;