import { Router } from 'express';
import { getDashboardSummary, getMyProgress } from '../controllers/userProgressController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/progress/dashboard (Painel consolidado do Terminal do Usuário com saldos e tarefas)
router.get('/dashboard', authenticateToken, getDashboardSummary);

// GET /api/progress/me (Apenas os saldos e streak do usuário autenticado)
router.get('/me', authenticateToken, getMyProgress);

export default router;
