import express from 'express';
import { uploadMiddleware, uploadProfilePhoto } from '../controllers/uploadController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para upload da foto de perfil do usuário logado
router.post('/profile-photo', authMiddleware, (req, res, next) => {
  uploadMiddleware.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Erro no upload do arquivo.' });
    }
    next();
  });
}, uploadProfilePhoto);

export default router;
