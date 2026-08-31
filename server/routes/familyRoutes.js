import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createFamily,
  joinFamily,
  getMyFamily,
} from '../controllers/familyController.js';

const router = express.Router();

// Todas as rotas exigem usuário autenticado
router.use(authenticateToken);

router.post('/create', authorizeRoles('ADMIN', 'PARENT'), createFamily);
router.post('/join', joinFamily);
router.get('/my-family', getMyFamily);

export default router;
