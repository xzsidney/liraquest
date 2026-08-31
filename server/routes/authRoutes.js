import { Router } from 'express';
import { register, login, getMe, listAllUsers } from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas Públicas
router.post('/register', register);
router.post('/login', login);

// Rotas Protegidas (Requer Token JWT)
router.get('/me', authenticateToken, getMe);

// Rotas Exclusivas do Administrador
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), listAllUsers);

export default router;
