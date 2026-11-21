import { Router } from 'express';
import { login, getMe, registerFamily } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// ==========================================
// Rotas Públicas de Autenticação
// ==========================================

// 1. POST /api/auth/login (Login Híbrido: Pais via Email+Senha, Crianças via Apelido+PIN)
router.post('/login', login);

// 3. POST /api/auth/register-family (Onboarding Multi-Família)
router.post('/register-family', registerFamily);
router.post('/register', registerFamily); // Alias de compatibilidade

// ==========================================
// Rotas Protegidas (Requer Token JWT)
// ==========================================

// 2. GET /api/auth/me (Perfil Unificado do Herói)
router.get('/me', authenticateToken, getMe);

export default router;
