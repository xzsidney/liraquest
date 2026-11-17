import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listPolls,
  createPoll,
  votePoll,
  closePoll,
  deletePoll,
} from '../controllers/funController.js';

const router = express.Router();

router.use(authenticateToken);

// 📅 Eventos & Aniversários do Clã
router.get('/events', listEvents);
router.post('/events', authorizeRoles('ADMIN', 'PARENT'), createEvent);
router.put('/events/:eventId', authorizeRoles('ADMIN', 'PARENT'), updateEvent);
router.delete('/events/:eventId', authorizeRoles('ADMIN', 'PARENT'), deleteEvent);

// 🗳️ Votações Familiares de Passeios
router.get('/polls', listPolls);
router.post('/polls', authorizeRoles('ADMIN', 'PARENT'), createPoll);
router.post('/polls/:pollId/vote', votePoll);
router.post('/polls/:pollId/close', authorizeRoles('ADMIN', 'PARENT'), closePoll);
router.delete('/polls/:pollId', authorizeRoles('ADMIN', 'PARENT'), deletePoll);

export default router;
