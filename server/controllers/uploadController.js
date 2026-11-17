import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { FamilyUser } from '../models/FamilyUser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante que o diretório de perfis existe
const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Garante que o diretório de comprovações de tarefas existe
const proofsDir = path.join(__dirname, '../../public/uploads/proofs');
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

// Configuração de armazenamento com UUID único para perfis
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Configuração de armazenamento para fotos de comprovação de tarefas
const proofsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.mimetype.startsWith('image/') && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Envie apenas imagens (JPG, PNG, WEBP ou GIF).'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

export const uploadProofMiddleware = multer({
  storage: proofsStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB para fotos de câmera
});

/**
 * Controller para upload de foto de perfil do Usuário
 */
export async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo de imagem foi enviado.' });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // Atualiza a URL da foto no perfil do usuário
    const user = await FamilyUser.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    user.profile_photo_url = photoUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso!',
      photo_url: photoUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        school_or_work: user.school_or_work,
        profile_photo_url: user.profile_photo_url,
        family_id: user.family_id,
      },
    });
  } catch (error) {
    console.error('Erro no upload de foto de perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar o upload da imagem.' });
  }
}

/**
 * Controller para upload de foto de comprovação de tarefas da casa
 */
export async function uploadTaskProof(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhuma foto foi enviada.' });
    }

    const photoUrl = `/uploads/proofs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Foto de comprovação carregada com sucesso!',
      photo_url: photoUrl,
    });
  } catch (error) {
    console.error('Erro no upload de foto de comprovação:', error);
    return res.status(500).json({ success: false, message: 'Erro ao processar imagem de comprovação.' });
  }
}
