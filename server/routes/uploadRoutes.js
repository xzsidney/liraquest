import express from 'express';
import {
  uploadMiddleware,
  uploadProofMiddleware,
  uploadProfilePhoto,
  uploadTaskProof,
} from '../controllers/uploadController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para upload da foto de perfil do usuário logado
router.post('/profile-photo', authenticateToken, (req, res, next) => {
  uploadMiddleware.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Erro no upload do arquivo.' });
    }
    next();
  });
}, uploadProfilePhoto);

// Rota para upload de foto de comprovação de tarefa da casa
router.post('/task-proof', authenticateToken, (req, res, next) => {
  uploadProofMiddleware.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Erro no upload da foto de comprovação.' });
    }
    next();
  });
}, uploadTaskProof);

export default router;
