import express from 'express';
import { authenticateToken, requireParent } from '../middlewares/authMiddleware.js';
import {
  createFamily,
  joinFamily,
  getMyFamily,
  getFamilyAnalytics,
  listFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from '../controllers/familyController.js';

const router = express.Router();

// Todas as rotas exigem usuário autenticado
router.use(authenticateToken);

// ==========================================
// CRUD de Membros do Clã (V2 Unificada - Exclusivo PARENT / ADMIN)
// ==========================================
router.get('/members', requireParent, listFamilyMembers);
router.post('/members', requireParent, addFamilyMember);
router.put('/members/:id', requireParent, updateFamilyMember);
router.delete('/members/:id', requireParent, deleteFamilyMember);

// ==========================================
// Rotas de Gestão de Família
// ==========================================
router.post('/create', requireParent, createFamily);
router.post('/join', joinFamily);
router.get('/my-family', getMyFamily);
router.get('/analytics', requireParent, getFamilyAnalytics);

export default router;
