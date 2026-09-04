import { Router } from 'express';
import {
  getRandomQuestions,
  startQuizSession,
  finishQuizSession,
} from '../controllers/quizController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/quiz/questions/random?stage=fundamental_1&discipline=matematica&limit=10
router.get('/questions/random', getRandomQuestions);

// POST /api/quiz/start (Consome 4 de Energia de Aventura)
router.post('/start', authenticateToken, startQuizSession);

// POST /api/quiz/finish (Credita Ouro, XP e aprimora INT)
router.post('/finish', authenticateToken, finishQuizSession);

export default router;
