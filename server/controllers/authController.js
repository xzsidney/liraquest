import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FamilyUser } from '../models/FamilyUser.js';
import { UserProgress } from '../models/UserProgress.js';


const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Registra um novo usuário no LiraQuest
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Senha).',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.',
      });
    }

    // Verificar se e-mail já existe
    const existingUser = await FamilyUser.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma conta cadastrada com este e-mail.',
      });
    }

    // Hash da senha com bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validação do perfil
    const validRoles = ['ADMIN', 'PARENT', 'CHILD'];
    const userRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'CHILD';

    // Criação no banco MySQL da Hostinger
    const newUser = await FamilyUser.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
    });

    // Criar automaticamente o registro de progresso do Terminal do Usuário (1:1)
    await UserProgress.create({ user_id: newUser.id });


    // Geração do token JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('❌ Erro no registro de usuário:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor ao criar conta.',
    });
  }
};

/**
 * Autentica o usuário e gera o token JWT
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça o e-mail e a senha.',
      });
    }

    // Buscar usuário pelo e-mail
    const user = await FamilyUser.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos.',
      });
    }

    // Verificar hash da senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos.',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: `Bem-vindo de volta, ${user.name}!`,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('❌ Erro no login de usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao autenticar.',
    });
  }
};

/**
 * Retorna os dados do usuário autenticado atual
 */
export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil.',
    });
  }
};

/**
 * Lista todos os usuários cadastrados (Exclusivo para ADMIN)
 */
export const listAllUsers = async (req, res) => {
  try {
    const users = await FamilyUser.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar lista de usuários.',
    });
  }
};
