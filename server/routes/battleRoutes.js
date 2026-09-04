import { Router } from 'express';
import { startBattle, finishBattle } from '../controllers/battleController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/battle/start (Inicia a batalha 2D consumindo 5 de energia)
router.post('/start', authenticateToken, startBattle);

// POST /api/battle/finish (Registra resultado, XP e Ouro)
router.post('/finish', authenticateToken, finishBattle);

export default router;
