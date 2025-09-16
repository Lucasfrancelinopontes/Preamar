import { Router } from 'express'
const router = Router()
import {gmun} from './api/funcoes.js'

router.get('/municipios', gmun)

export default router;