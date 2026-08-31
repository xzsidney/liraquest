import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  listFamilyTasks,
  submitTaskProof,
  listPendingSubmissions,
  listReviewedSubmissions,
  reviewSubmission,
  listMySubmissions,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticateToken);

// Missões (CRUD do Guardião & Listagem)
router.post('/', authorizeRoles('ADMIN', 'PARENT'), createTask);
router.put('/:taskId', authorizeRoles('ADMIN', 'PARENT'), updateTask);
router.patch('/:taskId/toggle', authorizeRoles('ADMIN', 'PARENT'), toggleTaskStatus);
router.delete('/:taskId', authorizeRoles('ADMIN', 'PARENT'), deleteTask);
router.get('/', listFamilyTasks);
router.post('/:taskId/submit', submitTaskProof);

// Comprovações e Avaliações
router.get('/submissions/pending', authorizeRoles('ADMIN', 'PARENT'), listPendingSubmissions);
router.get('/submissions/reviewed', authorizeRoles('ADMIN', 'PARENT'), listReviewedSubmissions);
router.post('/submissions/:submissionId/review', authorizeRoles('ADMIN', 'PARENT'), reviewSubmission);
router.get('/submissions/my', listMySubmissions);

export default router;
