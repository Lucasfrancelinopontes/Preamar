import { Router } from 'express'
const router = Router()
import { gmun, gesp } from './api/funcoes.js'

router.get('/municipios', gmun)
router.get('/especies', gesp)

export default router;