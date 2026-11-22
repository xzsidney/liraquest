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
 * 1. POST /api/auth/login (Login Híbrido)
 * - Pais: email + password (bcrypt)
 * - Filhos: hero_nickname (ou name) + pin (4 dígitos)
 */
export const login = async (req, res) => {
  try {
    const { email, password, hero_nickname, nickname, name, pin, family_code } = req.body;

    // Cenário A: Login de Pais / Guardiões (Email + Senha)
    if (email && password) {
      const cleanEmail = String(email).toLowerCase().trim();
      const member = await FamilyMember.findOne({
        where: {
          email: cleanEmail,
          is_active: true,
        },
        include: [{ model: Family, as: 'family' }],
      });

      if (!member || !member.password) {
        return res.status(401).json({
          success: false,
          message: 'E-mail ou senha incorretos.',
        });
      }

      const isMatch = await bcrypt.compare(password, member.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'E-mail ou senha incorretos.',
        });
      }

      const token = generateToken(member);
      const formatted = formatMemberResponse(member);

      return res.status(200).json({
        success: true,
        message: `Bem-vindo de volta, Guardião ${member.name}!`,
        token,
        user: formatted,
        member: formatted,
      });
    }

    // Cenário B: Login de Heróis / Filhos (Apelido/Nome + PIN)
    const targetNickname = (hero_nickname || nickname || name || '').trim();
    if (targetNickname && pin) {
      const cleanPin = String(pin).trim();

      const whereClause = {
        [Op.or]: [
          { hero_nickname: targetNickname },
          { name: targetNickname },
        ],
        is_active: true,
      };

      if (family_code) {
        const family = await Family.findOne({
          where: { invite_code: String(family_code).toUpperCase().trim() },
        });
        if (family) {
          whereClause.family_id = family.id;
        }
      }

      const member = await FamilyMember.findOne({
        where: whereClause,
        include: [{ model: Family, as: 'family' }],
      });

      if (!member) {
        return res.status(401).json({
          success: false,
          message: `Herói "${targetNickname}" não encontrado ou inativo.`,
        });
      }

      if (member.pin !== cleanPin) {
        return res.status(401).json({
          success: false,
          message: 'PIN de acesso incorreto.',
        });
      }

      const token = generateToken(member);
      const formatted = formatMemberResponse(member);

      return res.status(200).json({
        success: true,
        message: `Avante para a aventura, ${member.hero_nickname}!`,
        token,
        user: formatted,
        member: formatted,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Credenciais inválidas. Forneça [email + password] para Pais ou [hero_nickname + pin] para Heróis.',
    });
  } catch (error) {
    console.error('❌ Erro no login híbrido:', error);
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
 * Retorna os heróis crianças públicos para exibição dos cards de login
 */
export const getChildren = async (req, res) => {
  try {
    const children = await FamilyMember.findAll({
      where: {
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
      pin,
      invite_code,
      inviteCode,
      class_code,
      classCode,
      email,
      password,
    } = req.body;

    const childName = (name || '').trim();
    const heroNick = (hero_nickname || heroNickname || childName).trim();
    const childPin = pin ? String(pin).trim() : '1234';
    const chosenClass = class_code || classCode || 'rastreador_veloz';
    const cleanInvite = (invite_code || inviteCode || 'LIRA-2026').toUpperCase().trim();

    if (!childName) {
      return res.status(400).json({
        success: false,
        message: 'O nome da criança/herói é obrigatório.',
      });
    }

    if (!childPin || childPin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'O PIN de acesso deve ter exatamente 4 números.',
      });
    }

    // 1. Localizar o Clã pelo código de convite dos pais
    let family = await Family.findOne({ where: { invite_code: cleanInvite } });
    if (!family) {
      // Fallback para o Clã Lira padrão se o código for LIRA-2026 ou se não encontrar
      family = await Family.findOne({ where: { invite_code: 'LIRA-2026' } });
      if (!family) {
        family = await Family.findOne();
      }
      if (!family) {
        return res.status(404).json({
          success: false,
          message: `Código de Clã "${cleanInvite}" não encontrado. Solicite o código correto aos seus pais!`,
        });
      }
    }

    // 2. Verificar se já existe herói com esse apelido no mesmo clã
    const existingNick = await FamilyMember.findOne({
      where: {
        family_id: family.id,
        hero_nickname: heroNick,
        is_active: true,
      },
    });

    if (existingNick) {
      return res.status(409).json({
        success: false,
        message: `Já existe um herói chamado "${heroNick}" no ${family.name}. Escolha outro apelido!`,
      });
    }

    // 3. E-mail e senha opcionais (se o jovem tiver e-mail próprio)
    let cleanEmail = null;
    let hashedPassword = null;
    if (email && email.trim()) {
      cleanEmail = email.toLowerCase().trim();
      const existingEmail = await FamilyMember.findOne({ where: { email: cleanEmail } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um membro cadastrado com este e-mail.',
        });
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
    }

    // 4. Atributos base conforme arquétipo
    let stats = { str: 10, agi: 10, con: 10, int: 10, cha: 10, luk: 10 };
    if (chosenClass === 'rastreador_veloz') {
      stats = { str: 12, con: 11, agi: 16, int: 10, cha: 10, luk: 14 };
    } else if (chosenClass === 'artifice_criativo') {
      stats = { str: 14, con: 12, agi: 11, int: 16, cha: 11, luk: 10 };
    } else if (chosenClass === 'guardiao_do_lar') {
      stats = { str: 16, con: 15, agi: 10, int: 10, cha: 12, luk: 10 };
    }

    // 5. REGRA OFICIAL: Cadastro público é SEMPRE do tipo FILHO (CHILD)
    const newMember = await FamilyMember.create({
      family_id: family.id,
      name: childName,
      hero_nickname: heroNick,
      email: cleanEmail,
      password: hashedPassword,
      pin: childPin,
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

    return res.status(201).json({
      success: true,
      message: `Avante para a aventura, ${newMember.hero_nickname}! Bem-vindo ao ${family.name}! 🎉`,
      token,
      user: formatted,
      member: formatted,
      family: {
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
      },
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
