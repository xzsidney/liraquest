import jwt from 'jsonwebtoken';
import { FamilyUser } from '../models/FamilyUser.js';
import { recordUserActivity } from '../utils/userPresence.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';

/**
 * Middleware para verificar e autenticar o token JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token ausente ou inválido.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await FamilyUser.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário associado ao token não foi encontrado.',
      });
    }

    // Registrar presença em tempo real
    recordUserActivity(user.id);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sua sessão expirou. Por favor, faça login novamente.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token de autenticação inválido.',
    });
  }
};

/**
 * Middleware para autorização baseada em Perfis (RBAC)
 * @param  {...string} allowedRoles - Perfis autorizados (ex: 'ADMIN', 'PARENT', 'CHILD')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Seu perfil (${req.user.role}) não tem permissão para acessar este recurso.`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
};
