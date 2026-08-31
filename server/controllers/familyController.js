import { randomUUID } from 'node:crypto';
import {
  Family,
  FamilyMember,
  FamilyUser,
  Character,
} from '../models/index.js';
import { ensureFamilyHasTasks } from './userProgressController.js';

/**
 * Gera um código de convite amigável e único (ex: LIRA-7842)
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LIRA-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Cria uma nova família / clã (exclusivo para PARENT ou ADMIN)
 */
export const createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'O nome da família deve ter pelo menos 2 caracteres.',
      });
    }

    // Verificar se usuário já criou uma família
    const existingFamily = await Family.findOne({ where: { created_by: userId } });
    if (existingFamily) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui uma família cadastrada como Guardião.',
        family: existingFamily,
      });
    }

    const inviteCode = generateInviteCode();
    const family = await Family.create({
      id: randomUUID().toLowerCase(),
      name: name.trim(),
      invite_code: inviteCode,
      created_by: userId,
    });

    // Associar criador como GUARDIAN
    await FamilyMember.create({
      id: randomUUID().toLowerCase(),
      family_id: family.id,
      user_id: userId,
      role_in_family: 'GUARDIAN',
    });

    // Inicializar tarefas padrão para a nova família
    await ensureFamilyHasTasks(family.id, userId);

    return res.status(201).json({
      success: true,
      message: `Família "${family.name}" criada com sucesso!`,
      family,
    });
  } catch (error) {
    console.error('❌ Erro ao criar família:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao criar família.',
    });
  }
};

/**
 * Entra em uma família existente utilizando o código de convite
 */
export const joinFamily = async (req, res) => {
  try {
    const { invite_code } = req.body;
    const userId = req.user.id;

    if (!invite_code || invite_code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe o código de convite da família.',
      });
    }

    const cleanCode = invite_code.trim().toUpperCase();
    const family = await Family.findOne({
      where: { invite_code: cleanCode },
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Código de convite inválido ou família não encontrada.',
      });
    }

    // Verificar se já possui algum vínculo familiar
    let membership = await FamilyMember.findOne({
      where: { user_id: userId },
    });

    const memberRole = req.user.role === 'PARENT' ? 'GUARDIAN' : 'MEMBER';

    if (membership) {
      if (membership.family_id === family.id) {
        return res.status(400).json({
          success: false,
          message: 'Você já é membro desta família!',
          family,
        });
      }
      // Atualizar para a nova família
      await membership.update({
        family_id: family.id,
        role_in_family: memberRole,
      });
    } else {
      membership = await FamilyMember.create({
        id: randomUUID().toLowerCase(),
        family_id: family.id,
        user_id: userId,
        role_in_family: memberRole,
      });
    }

    // Migrar tarefas criadas pelo usuário para a nova família
    await Task.update({ family_id: family.id }, { where: { created_by: userId } });

    return res.json({
      success: true,
      message: `Você ingressou na família "${family.name}" com sucesso!`,
      family,
      membership,
    });
  } catch (error) {
    console.error('❌ Erro ao entrar na família:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao ingressar na família.',
    });
  }
};

/**
 * Retorna os dados da família do usuário atual, incluindo membros e heróis
 */
export const getMyFamily = async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await FamilyMember.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Family,
          as: 'family',
          include: [
            {
              model: FamilyMember,
              as: 'members',
              include: [
                {
                  model: FamilyUser,
                  as: 'user',
                  attributes: ['id', 'name', 'email', 'role', 'phone', 'school_or_work', 'profile_photo_url'],
                  include: [{ model: Character, as: 'character' }],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!membership || !membership.family) {
      return res.json({
        success: true,
        hasFamily: false,
        message: 'Usuário ainda não está vinculado a nenhuma família.',
      });
    }

    return res.json({
      success: true,
      hasFamily: true,
      family: membership.family,
      myRoleInFamily: membership.role_in_family,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar dados da família:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar dados da família.',
    });
  }
};
