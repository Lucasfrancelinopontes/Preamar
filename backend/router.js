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
  buscarPescador
} from './controllers/pescadorController.js';
import {
  listarEmbarcacoes,
  criarEmbarcacao,
  buscarEmbarcacao
} from './controllers/embarcacaoController.js';

// Rotas existentes (JSON estáticos)
router.get('/municipios', gmun);
router.get('/especies', gesp);

// Rotas de Desembarques
router.post('/desembarques', criarDesembarque);
router.get('/desembarques', listarDesembarques);
router.get('/desembarques/estatisticas', estatisticasDesembarques);
router.get('/desembarques/:id', buscarDesembarque);
router.put('/desembarques/:id', atualizarDesembarque);
router.delete('/desembarques/:id', deletarDesembarque);

// Rotas de Pescadores
router.get('/pescadores', listarPescadores);
router.post('/pescadores', criarPescador);
router.get('/pescadores/:id', buscarPescador);

// Rotas de Embarcações
router.get('/embarcacoes', listarEmbarcacoes);
router.post('/embarcacoes', criarEmbarcacao);
router.get('/embarcacoes/:id', buscarEmbarcacao);

export default router;