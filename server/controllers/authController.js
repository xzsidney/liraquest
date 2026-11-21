import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { FamilyMember } from '../models/FamilyMember.js';
import { Family } from '../models/Family.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Gera um código de convite único com no máximo 10 caracteres (ex: TEST-4821)
 */
async function generateUniqueInviteCode(clanName) {
  const cleanLetters = (clanName || 'CLAN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  const prefix = (cleanLetters.substring(0, 4) || 'CLAN').padEnd(4, 'X');

  let attempts = 0;
  while (attempts < 10) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${num}`.substring(0, 10);
    const exists = await Family.findOne({ where: { invite_code: code } });
    if (!exists) return code;
    attempts++;
  }
  return `LIRA-${Math.floor(1000 + Math.random() * 9000)}`;
}
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

      // Se passou código da família, filtra pela família correspondente
      if (family_code) {
        const family = await Family.findOne({ where: { invite_code: String(family_code).toUpperCase().trim() } });
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
 * 2. GET /api/auth/me (Perfil Unificado)
 * Retorna todos os dados do membro (O Usuário É o Herói)
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
 * 3. POST /api/auth/register-family & /api/auth/register
 * Permite cadastrar a família e o Guardião, com suporte a cadastro simplificado (apenas Nome, E-mail, Senha)
 */
export const registerFamily = async (req, res) => {
  try {
    const {
      family_name,
      familyName,
      name,
      email,
      password,
      hero_nickname,
      heroNickname,
      class_code,
      invite_code,
      inviteCode,
      role,
    } = req.body;

    const guardianName = (name || '').trim();
    const guardianEmail = (email || '').toLowerCase().trim();
    const heroNick = (hero_nickname || heroNickname || guardianName).trim();

    if (!guardianName || !guardianEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios: Nome Completo, E-mail e Senha.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres.',
      });
    }

    // Verificar se já existe membro com este e-mail
    const existingMember = await FamilyMember.findOne({ where: { email: guardianEmail } });
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um membro cadastrado com este e-mail.',
      });
    }

    // Verificar se passou código de convite para ingressar em família existente
    const cleanInvite = (invite_code || inviteCode || '').toUpperCase().trim();
    let family = null;

    if (cleanInvite) {
      family = await Family.findOne({ where: { invite_code: cleanInvite } });
      if (!family) {
        return res.status(404).json({
          success: false,
          message: `Código de convite "${cleanInvite}" não encontrado.`,
        });
      }
    }

    // Se não tem família existente, cria uma nova família
    if (!family) {
      let clanName = (family_name || familyName || '').trim();
      if (!clanName) {
        const firstName = guardianName.split(' ')[0];
        clanName = `Clã ${firstName}`;
      }

      const generatedCode = await generateUniqueInviteCode(clanName);

      family = await Family.create({
        name: clanName,
        invite_code: generatedCode,
      });
    }

    // Hash da senha com bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Papel: se criou a família é ADMIN/PARENT, se entrou por código respeita role ou assume PARENT
    const memberRole = role && ['ADMIN', 'PARENT', 'CHILD'].includes(role) ? role : 'PARENT';

    // Criar o Membro
    const newMember = await FamilyMember.create({
      family_id: family.id,
      name: guardianName,
      email: guardianEmail,
      password: hashedPassword,
      role: memberRole,
      hero_nickname: heroNick,
      class_code: class_code || 'guardiao_do_lar',
      skin_code: 'default',
      level: 1,
      xp: 0,
      adventure_energy: 10,
      family_tokens: 0,
      gold: 50,
      streak_days: 1,
      str: 10,
      agi: 10,
      con: 10,
      int: 10,
      cha: 10,
      luk: 10,
      is_active: true,
    });

    // Se a família ainda não tinha criador, define este membro como criador
    if (!family.created_by) {
      await family.update({ created_by: newMember.id });
    }

    // Gerar JWT Token
    const token = generateToken(newMember);
    const formatted = formatMemberResponse(newMember);

    return res.status(201).json({
      success: true,
      message: `Conta criada com sucesso! Bem-vindo ao ${family.name}! 🎉`,
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
    console.error('❌ Erro no cadastro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao realizar cadastro.',
      error: error.message,
    });
  }
};

/**
 * Função utilitária para formatar a resposta do membro sem expor senhas
 */
function formatMemberResponse(member) {
  return {
    id: member.id,
    family_id: member.family_id,
    name: member.name,
    email: member.email,
    role: member.role,
    hero_nickname: member.hero_nickname,
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
    created_at: member.created_at,
    updated_at: member.updated_at,
  };
}
