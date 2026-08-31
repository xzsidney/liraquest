import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  getMyCharacter,
  createCharacter,
  updateRealProfile,
  changeHeroClass,
} from '../controllers/characterController.js';
import { getMyHeroDashboard } from '../controllers/userProgressController.js';

const router = express.Router();

// Todas as rotas de personagem exigem autenticação
router.use(authenticateToken);

router.get('/me', getMyCharacter);
router.get('/hero-dashboard', getMyHeroDashboard);
router.post('/create', createCharacter);
router.put('/update-profile', updateRealProfile);
router.post('/change-class', changeHeroClass);

export default router;
