import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';

/**
 * Middleware para autenticação via Bearer Token JWT
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido ou formato inválido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
      error: error.message,
    });
  }
};

/**
 * Middleware exclusivo para Pais / Guardiões (PARENT ou ADMIN)
 */
export const requireGuardian = (req, res, next) => {
  if (!req.user || (req.user.role !== 'PARENT' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito aos Pais e Mestres Guardiões da família.',
    });
  }
  next();
};

export default authMiddleware;
