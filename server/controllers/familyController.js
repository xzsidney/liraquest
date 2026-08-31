import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  Family,
  FamilyMember,
  FamilyUser,
  Character,
  Task,
  TaskSubmission,
  UserProgress,
} from '../models/index.js';
import { ensureFamilyHasTasks } from './userProgressController.js';
import { getUserPresence } from '../utils/userPresence.js';

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

/**
 * Retorna as análises completas para o Painel do Clã (Dashboard da Família)
 * - Membros com presença online em tempo real
 * - Top Herói (quem fez mais tarefas)
 * - Herói em Foco (quem precisa de incentivo)
 * - Métricas consolidadas do clã
 */
export const getFamilyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Localizar família do usuário
    const membership = await FamilyMember.findOne({
      where: { user_id: userId },
      include: [{ model: Family, as: 'family' }],
    });

    if (!membership || !membership.family) {
      return res.status(404).json({
        success: false,
        message: 'Você ainda não está vinculado a nenhuma família.',
      });
    }

    const familyId = membership.family.id;

    // Buscar todos os membros com User, Character e Progress
    const familyMembers = await FamilyMember.findAll({
      where: { family_id: familyId },
      include: [
        {
          model: FamilyUser,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'phone', 'school_or_work', 'profile_photo_url'],
          include: [
            { model: Character, as: 'character' },
            { model: UserProgress, as: 'progress' },
          ],
        },
      ],
    });

    // Buscar contagem de tarefas ativas e pendências
    const [totalActiveTasks, pendingSubmissionsCount] = await Promise.all([
      Task.count({ where: { family_id: familyId, is_active: true } }),
      TaskSubmission.count({
        include: [{ model: Task, as: 'task', where: { family_id: familyId }, required: true }],
        where: { status: 'PENDING' },
      }),
    ]);

    // Processar dados de cada membro
    const processedMembers = await Promise.all(
      familyMembers.map(async (m) => {
        const u = m.user;
        if (!u) return null;

        const presence = getUserPresence(u.id);
        const hero = u.character;
        const progress = u.progress;

        // Contar tarefas aprovadas do usuário
        const approvedCount = await TaskSubmission.count({
          where: { user_id: u.id, status: 'APPROVED' },
        });

        // Contar tarefas submetidas hoje
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const submittedTodayCount = await TaskSubmission.count({
          where: {
            user_id: u.id,
            createdAt: { [Op.gte]: todayStart },
          },
        });

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          role_in_family: m.role_in_family,
          profile_photo_url: u.profile_photo_url,
          presence,
          hero: hero
            ? {
                id: hero.id,
                name: hero.name,
                level: hero.level || 1,
                gold: hero.gold || 0,
                avatar_value: hero.avatar_value,
              }
            : null,
          progress: {
            tasks_completed_today: progress?.tasks_completed_today || submittedTodayCount,
            tasks_completed_total: progress?.tasks_completed_total || approvedCount,
            current_streak: progress?.current_streak || 0,
            longest_streak: progress?.longest_streak || 0,
            token_balance: progress?.token_balance || 0,
            energy_balance: progress?.energy_balance || 0,
          },
          total_approved_tasks: approvedCount,
        };
      })
    );

    const validMembers = processedMembers.filter(Boolean);
    const children = validMembers.filter((m) => m.role === 'CHILD');

    // Ordenar filhos por total de tarefas concluídas (decrescente)
    const sortedChildren = [...children].sort(
      (a, b) => (b.total_approved_tasks || 0) - (a.total_approved_tasks || 0)
    );

    const topPerformer = sortedChildren.length > 0 ? sortedChildren[0] : null;
    const needsAttention =
      sortedChildren.length > 1
        ? sortedChildren[sortedChildren.length - 1]
        : sortedChildren.length === 1 && sortedChildren[0].total_approved_tasks === 0
        ? sortedChildren[0]
        : null;

    // Métricas consolidadas do clã
    const totalClanTasks = validMembers.reduce((acc, m) => acc + (m.total_approved_tasks || 0), 0);
    const totalClanGold = validMembers.reduce((acc, m) => acc + (m.hero?.gold || 0), 0);
    const totalClanTokens = validMembers.reduce((acc, m) => acc + (m.progress?.token_balance || 0), 0);
    const maxClanStreak = validMembers.reduce((acc, m) => Math.max(acc, m.progress?.current_streak || 0), 0);

    const onlineMembersCount = validMembers.filter((m) => m.presence.is_online).length;

    return res.json({
      success: true,
      family: {
        id: membership.family.id,
        name: membership.family.name,
        invite_code: membership.family.invite_code,
      },
      clanStats: {
        totalMembers: validMembers.length,
        totalChildren: children.length,
        onlineMembersCount,
        totalClanTasks,
        totalClanGold,
        totalClanTokens,
        maxClanStreak,
        totalActiveTasks,
        pendingSubmissionsCount,
      },
      topPerformer,
      needsAttention,
      members: validMembers,
    });
  } catch (error) {
    console.error('❌ Erro ao calcular análises do clã:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar painel do clã.',
    });
  }
};

