import { Router } from 'express';
import { getTrucoProfile, finishTrucoMatch } from '../controllers/trucoController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/truco/profile (Obtém perfil do herói e saldo para o módulo de Truco)
router.get('/profile', authenticateToken, getTrucoProfile);

// POST /api/truco/finish (Registra desfecho da partida e credita Ouro e XP)
router.post('/finish', authenticateToken, finishTrucoMatch);

export default router;
