import { Router } from 'express';
import multer from 'multer';
const router = Router();

const uploadImportacao = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Importar controllers
import { gmun, gesp } from './api/funcoes.js';
import {
  criarDesembarque,
  listarDesembarques,
  buscarDesembarque,
  atualizarDesembarque,
  deletarDesembarque,
  estatisticasDesembarques,
  verificarCodigoDesembarque
} from './controllers/desembarqueController.js';
import {
  listarPescadores,
  criarPescador,
  buscarPescador,
  atualizarPescador,
  deletarPescador
} from './controllers/pescadorController.js';
import {
  listarEspecies,
  criarEspecie,
  buscarEspecie,
  atualizarEspecie,
  deletarEspecie
} from './controllers/especieController.js';
import {
  listarEmbarcacoes,
  criarEmbarcacao,
  buscarEmbarcacao,
  atualizarEmbarcacao,
  deletarEmbarcacao,
  prepararImportacaoEmbarcacoes,
  confirmarImportacaoEmbarcacoes
} from './controllers/embarcacaoController.js';
import {
  login,
  register,
  obterPerfil,
  alterarSenha
} from './controllers/authController.js';
import {
  listarUsuarios,
  rankingGamificacaoUsuarios,
  criarUsuario,
  buscarUsuario,
  atualizarUsuario,
  deletarUsuario
} from './controllers/usuarioController.js';
import {
  listarPeixarias,
  buscarPeixaria,
  criarPeixaria,
  atualizarPeixaria,
  deletarPeixaria,
  gerarCodigoPeixariaEndpoint,
  verificarCodigoPeixaria
} from './controllers/peixariaController.js';

// Socio
import {
  criar as criarSocioPescador,
  listar as listarSocioPescadores,
  buscar as buscarSocioPescador,
  atualizar as atualizarSocioPescador,
  remover as removerSocioPescador
} from './controllers/SociopescadorController.js';

// Debug
import { populateSpecies, checkDb } from './controllers/debugController.js';
import { updateIndividuosSchema } from './controllers/schemaController.js';

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
router.get('/desembarques/verificar-codigo/:codigo', verificarAutenticacao, verificarCodigoDesembarque);
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

// Rotas de Cadastro Socioeconômico (protegidas)
router.post('/socio-pescadores', verificarAutenticacao, criarSocioPescador);
router.get('/socio-pescadores', verificarAutenticacao, listarSocioPescadores);
router.get('/socio-pescadores/:id', verificarAutenticacao, buscarSocioPescador);
router.put('/socio-pescadores/:id', verificarAutenticacao, atualizarSocioPescador);
router.delete('/socio-pescadores/:id', verificarAutenticacao, removerSocioPescador);

// Rotas do módulo Peixaria (protegidas)
router.post('/peixarias', verificarAutenticacao, criarPeixaria);
router.get('/peixarias/gerar-codigo', verificarAutenticacao, gerarCodigoPeixariaEndpoint);
router.get('/peixarias/verificar-codigo/:codigo', verificarAutenticacao, verificarCodigoPeixaria);
router.get('/peixarias', verificarAutenticacao, listarPeixarias);
router.get('/peixarias/:id', verificarAutenticacao, buscarPeixaria);
router.put('/peixarias/:id', verificarAutenticacao, atualizarPeixaria);
router.delete('/peixarias/:id', verificarAutenticacao, deletarPeixaria);

// Rotas de Embarcações (protegidas)
router.get('/embarcacoes', verificarAutenticacao, listarEmbarcacoes);
router.post('/embarcacoes', verificarAutenticacao, criarEmbarcacao);
router.post('/embarcacoes/importar', verificarAutenticacao, verificarAdmin, uploadImportacao.single('arquivo'), prepararImportacaoEmbarcacoes);
router.post('/embarcacoes/importar/confirmar', verificarAutenticacao, verificarAdmin, confirmarImportacaoEmbarcacoes);
router.get('/embarcacoes/:id', verificarAutenticacao, buscarEmbarcacao);
router.put('/embarcacoes/:id', verificarAutenticacao, atualizarEmbarcacao);
router.delete('/embarcacoes/:id', verificarAutenticacao, deletarEmbarcacao);

// ========================================
// ROTAS ADMINISTRATIVAS (apenas Administradores)
// ========================================

// Gestão de Usuários
router.get('/usuarios', verificarAutenticacao, verificarAdmin, listarUsuarios);
router.get('/usuarios/ranking/gamificacao', verificarAutenticacao, verificarAdmin, rankingGamificacaoUsuarios);
router.post('/usuarios', verificarAutenticacao, verificarAdmin, criarUsuario);
router.get('/usuarios/:id', verificarAutenticacao, verificarAdmin, buscarUsuario);
router.put('/usuarios/:id', verificarAutenticacao, verificarAdmin, atualizarUsuario);
router.delete('/usuarios/:id', verificarAutenticacao, verificarAdmin, deletarUsuario);

// Gestão de Espécies (apenas Admin) - nota: /especies GET é público acima
router.get('/admin/especies', verificarAutenticacao, verificarAdmin, listarEspecies);
router.post('/especies', verificarAutenticacao, verificarAdmin, criarEspecie);
router.get('/especies/:id', verificarAutenticacao, verificarAdmin, buscarEspecie);
router.put('/especies/:id', verificarAutenticacao, verificarAdmin, atualizarEspecie);
router.delete('/especies/:id', verificarAutenticacao, verificarAdmin, deletarEspecie);

// Rotas de Debug (remover em produção se necessário)
router.get('/debug/populate', populateSpecies);
router.get('/debug/check', checkDb);
router.get('/debug/update-schema', updateIndividuosSchema);

export default router;