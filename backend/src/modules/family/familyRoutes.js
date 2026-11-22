import { Router } from 'express';
import {
  login,
  getMe,
  getMembers,
  getChildren,
  register,
  joinClan,
} from './familyController.js';
import { authMiddleware } from '../../core/authMiddleware.js';
import { sequelize } from '../../config/database.js';

const router = Router();

// ==========================================
// Rotas de Autenticação (/api/auth)
// ==========================================
router.post('/auth/login', login);
router.post('/login', login);

router.get('/auth/me', authMiddleware, getMe);
router.get('/me', authMiddleware, getMe);

router.post('/auth/register', register);
router.post('/register', register);

router.get('/auth/children', authMiddleware, getChildren);
router.get('/children', authMiddleware, getChildren);

// ==========================================
// Rotas da Família (/api/family)
// ==========================================
router.get('/family/me', authMiddleware, getMe);
router.get('/family/members', authMiddleware, getMembers);
router.get('/family/children', authMiddleware, getChildren);
router.post('/family/join', authMiddleware, joinClan);
router.post('/family/join-clan', authMiddleware, joinClan);

// ==========================================
// Diagnóstico do Banco (/api/testeBD)
// ==========================================
router.get(['/testeBD', '/status'], async (req, res) => {
  const startTime = Date.now();
  try {
    await sequelize.authenticate();
    const responseTimeMs = Date.now() - startTime;
    return res.json({
      success: true,
      status: 'Conectado com sucesso! 🎉',
      message: '✅ Conexão entre o Node.js e o banco MySQL da Hostinger 100% operacional!',
      responseTimeMs: `${responseTimeMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'Falha na conexão',
      message: error.message,
    });
  }
});

export default router;
