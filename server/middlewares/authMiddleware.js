import jwt from 'jsonwebtoken';
import { FamilyMember } from '../models/FamilyMember.js';
import { recordUserActivity } from '../utils/userPresence.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';

/**
 * Middleware para verificar e autenticar o token JWT (V2 Unificada - FamilyMember)
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

    const member = await FamilyMember.findByPk(decoded.id);
    if (!member || !member.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Membro associado ao token não foi encontrado ou está inativo.',
      });
    }

    // Registrar presença em tempo real
    if (typeof recordUserActivity === 'function') {
      recordUserActivity(member.id);
    }

    req.user = member; // Compatibilidade com controllers
    req.member = member;
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

export const requireParent = authorizeRoles('PARENT', 'ADMIN');
export const requireAdmin = authorizeRoles('ADMIN');
