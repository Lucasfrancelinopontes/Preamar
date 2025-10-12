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

// Rotas existentes (JSON estáticos)
router.get('/municipios', gmun);
router.get('/especies', gesp);

// Rotas de Desembarques
router.post('/desembarques', criarDesembarque);
router.get('/desembarques/estatisticas', estatisticasDesembarques); // ANTES do :id
router.get('/desembarques', listarDesembarques);
router.get('/desembarques/:id', buscarDesembarque);
router.put('/desembarques/:id', atualizarDesembarque);
router.delete('/desembarques/:id', deletarDesembarque);

// Rotas de Pescadores
router.get('/pescadores', listarPescadores);
router.post('/pescadores', criarPescador);
router.get('/pescadores/:id', buscarPescador);
router.put('/pescadores/:id', atualizarPescador);
router.delete('/pescadores/:id', deletarPescador);

// Rotas de Embarcações
router.get('/embarcacoes', listarEmbarcacoes);
router.post('/embarcacoes', criarEmbarcacao);
router.get('/embarcacoes/:id', buscarEmbarcacao);
router.put('/embarcacoes/:id', atualizarEmbarcacao);
router.delete('/embarcacoes/:id', deletarEmbarcacao);

export default router;