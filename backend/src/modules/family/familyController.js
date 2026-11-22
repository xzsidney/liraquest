import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Family } from './Family.js';
import { FamilyMember } from './FamilyMember.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Gera token JWT para a sessão
 */
export const generateToken = (member) => {
  return jwt.sign(
    {
      id: member.id,
      familyId: member.family_id,
      role: member.role,
      heroNickname: member.hero_nickname,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 1. POST /api/auth/login (Login Universal: Usuário/E-mail + Senha)
 * - Pais e Filhos utilizam a mesma autenticação universal:
 * - identifier (e-mail ou apelido do herói) + password (com hash bcrypt)
 */
export const login = async (req, res) => {
  try {
    const {
      identifier,
      email,
      hero_nickname,
      nickname,
      name,
      password,
      family_code,
    } = req.body;

    const target = (identifier || email || hero_nickname || nickname || name || '').trim();
    const rawPassword = password !== undefined && password !== null ? String(password) : '';

    if (!target || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Informe seu e-mail ou apelido de herói e sua senha.',
      });
    }

    const cleanEmail = target.toLowerCase();

    const whereClause = {
      [Op.or]: [
        { email: cleanEmail },
        { hero_nickname: target },
        { name: target },
      ],
      is_active: true,
    };

    if (family_code && String(family_code).trim() !== '') {
      const family = await Family.findOne({
        where: { invite_code: String(family_code).toUpperCase().trim() },
      });
      if (!family) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas. Verifique seu usuário/e-mail, código do clã e senha.',
        });
      }
      whereClause.family_id = family.id;
    }

    const member = await FamilyMember.findOne({
      where: whereClause,
      include: [{ model: Family, as: 'family' }],
    });

    if (!member || !member.password) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu usuário/e-mail e senha.',
      });
    }

    const isMatch = await bcrypt.compare(rawPassword, member.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu usuário/e-mail e senha.',
      });
    }

    const token = generateToken(member);
    const formatted = formatMemberResponse(member);

    return res.status(200).json({
      success: true,
      message: member.role === 'CHILD'
        ? `Avante para a aventura, ${member.hero_nickname}! ⚔️`
        : `Bem-vindo de volta, Guardião ${member.name}! 👑`,
      token,
      user: formatted,
      member: formatted,
    });
  } catch (error) {
    console.error('❌ Erro no login unificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao realizar autenticação.',
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/auth/me & /api/family/me (Perfil Unificado)
 * Retorna todos os dados do membro/herói logado em 1 só JSON.
 */
export const getMe = async (req, res) => {
  try {
    const memberId = req.user.id;
    const member = await FamilyMember.findByPk(memberId, {
      include: [{ model: Family, as: 'family' }],
    });

    if (!member || !member.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Membro não encontrado ou inativo.',
      });
    }

    const formatted = formatMemberResponse(member);

    return res.status(200).json({
      success: true,
      user: formatted,
      member: formatted,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil unificado /me:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter dados do perfil.',
      error: error.message,
    });
  }
};

/**
 * 3. GET /api/family/members (Lista os membros do Clã)
 */
export const getMembers = async (req, res) => {
  try {
    const familyId = req.user.familyId || req.user.family_id;

    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui clã vinculado.',
      });
    }

    const members = await FamilyMember.findAll({
      where: {
        family_id: familyId,
        is_active: true,
      },
      order: [
        ['role', 'ASC'],
        ['name', 'ASC'],
      ],
      attributes: { exclude: ['password'] },
      include: [{ model: Family, as: 'family' }],
    });

    const formattedMembers = members.map(m => formatMemberResponse(m));

    return res.status(200).json({
      success: true,
      count: formattedMembers.length,
      members: formattedMembers,
    });
  } catch (error) {
    console.error('❌ Erro ao listar membros da família:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar membros.',
      error: error.message,
    });
  }
};

/**
 * 4. GET /api/auth/children & /api/family/children
 * Retorna os heróis crianças do clã autenticado
 */
export const getChildren = async (req, res) => {
  try {
    const familyId = req.user?.familyId || req.user?.family_id;

    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui clã vinculado.',
      });
    }

    const children = await FamilyMember.findAll({
      where: {
        family_id: familyId,
        role: 'CHILD',
        is_active: true,
      },
      attributes: ['id', 'name', 'hero_nickname', 'skin_code', 'class_code', 'level'],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      children,
    });
  } catch (error) {
    console.error('❌ Erro ao listar heróis crianças:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar heróis.',
    });
  }
};

/**
 * 5. POST /api/auth/register (Cadastro de Herói - Sempre do Tipo FILHO)
 * Regra do Sistema: Apenas usuários do tipo Pai/Mãe podem criar clãs.
 * O cadastro público é EXCLUSIVAMENTE para Heróis/Filhos ingressando no Clã.
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      hero_nickname,
      heroNickname,
      password,
      pin,
      invite_code,
      inviteCode,
      class_code,
      classCode,
      email,
    } = req.body;

    const childName = (name || '').trim();
    const heroNick = (hero_nickname || heroNickname || childName).trim();
    const rawPassword = (password || pin || '').trim();
    const chosenClass = class_code || classCode || 'rastreador_veloz';
    const rawInvite = invite_code !== undefined ? invite_code : inviteCode;
    const cleanInvite = rawInvite ? String(rawInvite).toUpperCase().trim() : '';

    if (!childName) {
      return res.status(400).json({
        success: false,
        message: 'O nome da criança/herói é obrigatório.',
      });
    }

    if (!rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'A senha de acesso é obrigatória.',
      });
    }

    // 1. Localizar o Clã pelo código de convite (OPCIONAL no cadastro)
    let familyId = null;
    let family = null;

    if (cleanInvite) {
      family = await Family.findOne({ where: { invite_code: cleanInvite } });
      if (!family) {
        return res.status(404).json({
          success: false,
          message: `Código de Clã "${cleanInvite}" não encontrado. Deixe em branco para ingressar depois do login ou solicite aos seus pais!`,
        });
      }
      familyId = family.id;
    }

    // 2. Verificar se já existe herói com esse apelido
    const whereClause = {
      hero_nickname: heroNick,
      is_active: true,
    };
    if (familyId) {
      whereClause.family_id = familyId;
    }

    const existingNick = await FamilyMember.findOne({ where: whereClause });

    if (existingNick) {
      return res.status(409).json({
        success: false,
        message: `Já existe um herói chamado "${heroNick}". Escolha outro apelido heroico!`,
      });
    }

    // 3. E-mail opcional (se o jovem tiver e-mail próprio)
    let cleanEmail = null;
    if (email && email.trim()) {
      cleanEmail = email.toLowerCase().trim();
      const existingEmail = await FamilyMember.findOne({ where: { email: cleanEmail } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um membro cadastrado com este e-mail.',
        });
      }
    }

    // Hash da Senha Universal com Bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 4. REGRA OFICIAL: Todo usuário novo inicia com todos os 6 atributos fundamentais iguais a 10
    const stats = { str: 10, agi: 10, con: 10, int: 10, cha: 10, luk: 10 };

    // 5. REGRA OFICIAL: Cadastro público é SEMPRE do tipo FILHO (CHILD)
    const newMember = await FamilyMember.create({
      family_id: familyId,
      name: childName,
      hero_nickname: heroNick,
      email: cleanEmail,
      password: hashedPassword,
      role: 'CHILD', // REGRA: Sempre tipo FILHO!
      class_code: chosenClass,
      skin_code: chosenClass,
      level: 1,
      xp: 0,
      adventure_energy: 10,
      family_tokens: 0,
      gold: 50,
      streak_days: 1,
      str: stats.str,
      agi: stats.agi,
      con: stats.con,
      int: stats.int,
      cha: stats.cha,
      luk: stats.luk,
      is_active: true,
    });

    const token = generateToken(newMember);
    const formatted = formatMemberResponse(newMember);
    if (family) {
      formatted.family = {
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
      };
    }

    return res.status(201).json({
      success: true,
      message: family 
        ? `Avante para a aventura, ${newMember.hero_nickname}! Bem-vindo ao ${family.name}! 🎉`
        : `Avante para a aventura, ${newMember.hero_nickname}! Herói desperto com sucesso! 🎉`,
      token,
      user: formatted,
      member: formatted,
      family: family ? {
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
      } : null,
    });
  } catch (error) {
    console.error('❌ Erro no cadastro do herói:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao cadastrar herói.',
      error: error.message,
    });
  }
};

/**
 * 6. POST /api/family/join (Ingressar em um Clã pelo código após o login)
 */
export const joinClan = async (req, res) => {
  try {
    const { invite_code, inviteCode } = req.body;
    const cleanInvite = (invite_code || inviteCode || '').toUpperCase().trim();

    if (!cleanInvite) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe o Código do Clã.',
      });
    }

    const family = await Family.findOne({ where: { invite_code: cleanInvite } });
    if (!family) {
      return res.status(404).json({
        success: false,
        message: `Código de Clã "${cleanInvite}" não encontrado. Verifique com seus pais!`,
      });
    }

    const member = await FamilyMember.findByPk(req.user.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Membro não encontrado.',
      });
    }

    await member.update({ family_id: family.id });
    const token = generateToken(member);
    const formatted = formatMemberResponse(member);
    formatted.family = {
      id: family.id,
      name: family.name,
      invite_code: family.invite_code,
    };

    return res.status(200).json({
      success: true,
      message: `🎉 Parabéns! Você agora faz parte do ${family.name}!`,
      token,
      member: formatted,
      user: formatted,
      family: {
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao ingressar no clã:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao ingressar no clã.',
      error: error.message,
    });
  }
};

/**
 * Função utilitária para formatar a resposta do membro sem expor senhas
 */
export function formatMemberResponse(member) {
  return {
    id: member.id,
    family_id: member.family_id,
    familyId: member.family_id,
    name: member.name,
    email: member.email,
    role: member.role,
    hero_nickname: member.hero_nickname,
    heroNickname: member.hero_nickname,
    class_code: member.class_code,
    skin_code: member.skin_code,
    level: member.level,
    xp: member.xp,
    adventure_energy: member.adventure_energy,
    family_tokens: member.family_tokens,
    gold: member.gold,
    streak_days: member.streak_days,
    attributes: {
      str: member.str,
      agi: member.agi,
      con: member.con,
      int: member.int,
      cha: member.cha,
      luk: member.luk,
    },
    str: member.str,
    agi: member.agi,
    con: member.con,
    int: member.int,
    cha: member.cha,
    luk: member.luk,
    xp_str: member.xp_str || 0,
    xp_agi: member.xp_agi || 0,
    xp_con: member.xp_con || 0,
    xp_int: member.xp_int || 0,
    xp_cha: member.xp_cha || 0,
    xp_luk: member.xp_luk || 0,
    is_active: member.is_active,
    family: member.family
      ? {
          id: member.family.id,
          name: member.family.name,
          invite_code: member.family.invite_code,
        }
      : undefined,
    created_at: member.created_at || member.createdAt,
    updated_at: member.updated_at || member.updatedAt,
  };
}
