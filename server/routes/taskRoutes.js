import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createTask,
  listFamilyTasks,
  submitTaskProof,
  listPendingSubmissions,
  reviewSubmission,
  listMySubmissions,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticateToken);

// Missões
router.post('/', authorizeRoles('ADMIN', 'PARENT'), createTask);
router.get('/', listFamilyTasks);
router.post('/:taskId/submit', submitTaskProof);

// Comprovações e Avaliações
router.get('/submissions/pending', authorizeRoles('ADMIN', 'PARENT'), listPendingSubmissions);
router.post('/submissions/:submissionId/review', authorizeRoles('ADMIN', 'PARENT'), reviewSubmission);
router.get('/submissions/my', listMySubmissions);

export default router;
