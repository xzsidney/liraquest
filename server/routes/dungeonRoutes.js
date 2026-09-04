import { Router } from 'express';
import {
  getAdventures,
  getAdventureDetail,
  startDungeonRun,
  finishDungeonRun,
} from '../controllers/dungeonController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/dungeon/adventures (Lista todas as masmorras ativas)
router.get('/adventures', getAdventures);

// GET /api/dungeon/adventures/:id (Detalhes completos com cenas e ações)
router.get('/adventures/:id', getAdventureDetail);

// POST /api/dungeon/start (Inicia expedição e consome 5 de Energia)
router.post('/start', authenticateToken, startDungeonRun);

// POST /api/dungeon/finish (Conclui expedição e credita Ouro, XP e Atributo)
router.post('/finish', authenticateToken, finishDungeonRun);

export default router;
