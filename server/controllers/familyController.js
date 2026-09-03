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
  FamilyReward,
  FamilyRewardRedemption,
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

    // 1. Buscar todas as submissões aprovadas do clã com tarefa e autor
    const approvedSubmissions = await TaskSubmission.findAll({
      include: [
        {
          model: Task,
          as: 'task',
          where: { family_id: familyId },
          attributes: ['id', 'title', 'category', 'xp_reward', 'gold_reward', 'token_reward'],
          required: true,
        },
        {
          model: FamilyUser,
          as: 'submitter',
          attributes: ['id', 'name', 'role'],
        },
      ],
      where: { status: 'APPROVED' },
      order: [['createdAt', 'DESC']],
    });

    // 2. Gráfico de Hábitos Semanais (Últimos 7 dias)
    const now = new Date();
    const daysList = [];
    const ptDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = ptDays[d.getDay()];
      daysList.push({ date: dateStr, dayLabel, total: 0, byChild: {} });
    }

    approvedSubmissions.forEach((sub) => {
      const subDate = (sub.reviewed_at || sub.createdAt).toISOString().split('T')[0];
      const dayObj = daysList.find((d) => d.date === subDate);
      if (dayObj) {
        dayObj.total++;
        const childId = sub.user_id;
        const childName = sub.submitter?.name || 'Herói';
        if (!dayObj.byChild[childId]) {
          dayObj.byChild[childId] = { id: childId, name: childName, count: 0 };
        }
        dayObj.byChild[childId].count++;
      }
    });

    const weeklyHabits = daysList.map((d) => ({
      date: d.date,
      dayLabel: d.dayLabel,
      total: d.total,
      children: Object.values(d.byChild),
    }));

    // 3. Distribuição por Categorias
    const categoryMeta = {
      DOMESTIC: { label: 'Organização do Lar', icon: '🧹', color: '#10b981' },
      STUDY: { label: 'Estudos & Leitura', icon: '📚', color: '#3b82f6' },
      HEALTH: { label: 'Saúde & Hábitos', icon: '🏃‍♂️', color: '#f59e0b' },
      CREATIVE: { label: 'Criatividade & Artes', icon: '🎨', color: '#8b5cf6' },
      SOCIAL: { label: 'Família & Social', icon: '🤝', color: '#ec4899' },
      GERAL: { label: 'Missões Gerais', icon: '📌', color: '#94a3b8' },
    };

    const catCounts = {
      DOMESTIC: 0,
      STUDY: 0,
      HEALTH: 0,
      CREATIVE: 0,
      SOCIAL: 0,
      GERAL: 0,
    };
    const catCountsByChild = {};

    approvedSubmissions.forEach((sub) => {
      const cat = sub.task?.category || 'GERAL';
      if (catCounts[cat] !== undefined) catCounts[cat]++;
      else catCounts.GERAL++;

      const childId = sub.user_id;
      if (!catCountsByChild[childId]) {
        catCountsByChild[childId] = { DOMESTIC: 0, STUDY: 0, HEALTH: 0, CREATIVE: 0, SOCIAL: 0, GERAL: 0, total: 0 };
      }
      if (catCountsByChild[childId][cat] !== undefined) catCountsByChild[childId][cat]++;
      else catCountsByChild[childId].GERAL++;
      catCountsByChild[childId].total++;
    });

    const totalSubmissionsCount = approvedSubmissions.length;
    const categoryDistribution = Object.keys(categoryMeta).map((key) => {
      const count = catCounts[key] || 0;
      const percentage = totalSubmissionsCount > 0 ? Math.round((count / totalSubmissionsCount) * 100) : 0;
      return {
        category: key,
        label: categoryMeta[key].label,
        icon: categoryMeta[key].icon,
        color: categoryMeta[key].color,
        count,
        percentage,
      };
    });

    // 4. Extrato do Tesouro Familiar & Resgates
    let totalGoldEarned = 0;
    let totalXpEarned = 0;
    let totalTokensEarned = 0;
    approvedSubmissions.forEach((sub) => {
      totalGoldEarned += sub.task?.gold_reward || 0;
      totalXpEarned += sub.task?.xp_reward || 0;
      totalTokensEarned += sub.task?.token_reward || 0;
    });

    const [totalTokensSpent, recentRedemptions] = await Promise.all([
      FamilyRewardRedemption.sum('token_cost', {
        where: {
          family_id: familyId,
          status: { [Op.in]: ['APPROVED', 'DELIVERED'] },
        },
      }),
      FamilyRewardRedemption.findAll({
        where: { family_id: familyId },
        include: [
          { model: FamilyReward, as: 'reward', attributes: ['id', 'title', 'icon', 'category'] },
          { model: FamilyUser, as: 'user', attributes: ['id', 'name', 'profile_photo_url'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 8,
      }),
    ]);

    const treasuryStatement = {
      totalGoldEarned,
      totalXpEarned,
      totalTokensEarned,
      totalTokensSpent: totalTokensSpent || 0,
      currentVaultGold: totalClanGold,
      currentVaultTokens: totalClanTokens,
      recentRedemptions: recentRedemptions.map((r) => ({
        id: r.id,
        rewardTitle: r.reward?.title || 'Recompensa',
        rewardIcon: r.reward?.icon || '🎁',
        category: r.reward?.category || 'ENTERTAINMENT',
        userName: r.user?.name || 'Membro',
        tokenCost: r.token_cost,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };

    // 5. Conquistas & Insígnias Coletivas do Clã
    const studyCount = catCounts.STUDY || 0;
    const domesticCount = catCounts.DOMESTIC || 0;

    const clanAchievements = [
      {
        id: 'first_steps',
        title: 'Primeiros Passos do Clã',
        description: 'Concluir 10 missões coletivas em família',
        icon: '🛡️',
        current: totalClanTasks,
        target: 10,
        unlocked: totalClanTasks >= 10,
        progressPercentage: Math.min(100, Math.round((totalClanTasks / 10) * 100)),
      },
      {
        id: 'squad_50',
        title: 'Batalhão Imparável',
        description: 'Alcançar 50 missões aprovadas na casa',
        icon: '⚔️',
        current: totalClanTasks,
        target: 50,
        unlocked: totalClanTasks >= 50,
        progressPercentage: Math.min(100, Math.round((totalClanTasks / 50) * 100)),
      },
      {
        id: 'centurions',
        title: 'Centuriões da Família',
        description: 'Alcançar a marca lendária de 100 tarefas',
        icon: '🏰',
        current: totalClanTasks,
        target: 100,
        unlocked: totalClanTasks >= 100,
        progressPercentage: Math.min(100, Math.round((totalClanTasks / 100) * 100)),
      },
      {
        id: 'discipline_streak',
        title: 'Chama da Disciplina',
        description: 'Manter sequência ativa de 7 dias na família',
        icon: '🔥',
        current: maxClanStreak,
        target: 7,
        unlocked: maxClanStreak >= 7,
        progressPercentage: Math.min(100, Math.round((maxClanStreak / 7) * 100)),
      },
      {
        id: 'study_sages',
        title: 'Academia dos Sábios',
        description: 'Completar 20 tarefas na categoria Estudos',
        icon: '📚',
        current: studyCount,
        target: 20,
        unlocked: studyCount >= 20,
        progressPercentage: Math.min(100, Math.round((studyCount / 20) * 100)),
      },
      {
        id: 'clean_citadel',
        title: 'Ordem do Lar Limpo',
        description: 'Completar 20 tarefas de Organização Doméstica',
        icon: '🧹',
        current: domesticCount,
        target: 20,
        unlocked: domesticCount >= 20,
        progressPercentage: Math.min(100, Math.round((domesticCount / 20) * 100)),
      },
      {
        id: 'royal_treasury',
        title: 'Cofre Imperial',
        description: 'Acumular 300 de Ouro entre os heróis da casa',
        icon: '🪙',
        current: totalClanGold,
        target: 300,
        unlocked: totalClanGold >= 300,
        progressPercentage: Math.min(100, Math.round((totalClanGold / 300) * 100)),
      },
    ];

    // 6. Relatório & Dicas Pedagógicas Dinâmicas
    const pedagogicalInsights = [];

    if (topPerformer && (topPerformer.progress?.current_streak || 0) >= 3) {
      pedagogicalInsights.push({
        type: 'PRAISE',
        badge: 'Consistência & Hábito',
        icon: '⭐',
        title: `Elogio ao Herói ${topPerformer.name}`,
        text: `${topPerformer.name} mantém uma sequência notável de ${topPerformer.progress.current_streak} dias ativos! O reconhecimento verbal imediato em família fortalece o senso de competência e autonomia.`,
        color: '#d4af37',
      });
    } else if (topPerformer && topPerformer.total_approved_tasks > 0) {
      pedagogicalInsights.push({
        type: 'PRAISE',
        badge: 'Liderança Produtiva',
        icon: '🏆',
        title: `Destaque para ${topPerformer.name}`,
        text: `${topPerformer.name} lidera as tarefas do clã com ${topPerformer.total_approved_tasks} missões cumpridas. Celebrem essa dedicação juntos!`,
        color: '#d4af37',
      });
    }

    if (needsAttention && needsAttention.id !== topPerformer?.id) {
      pedagogicalInsights.push({
        type: 'OPPORTUNITY',
        badge: 'Apoio & Parceria',
        icon: '🤝',
        title: `Acolhimento para ${needsAttention.name}`,
        text: `Que tal propor uma missão colaborativa rápida hoje com ${needsAttention.name}? Fazer uma tarefa juntos em clima de jogo (como arrumar a mesa ou um desafio de 10 minutos) reduz a resistência e reativa a motivação.`,
        color: '#3b82f6',
      });
    }

    if (domesticCount > 0 && studyCount === 0) {
      pedagogicalInsights.push({
        type: 'BALANCE',
        badge: 'Equilíbrio da Rotina',
        icon: '📚',
        title: 'Incentivo à Leitura e Estudos',
        text: 'O clã tem colaborado com entusiasmo na organização! Experimente introduzir uma missão de 15 minutos de leitura ou estudo com recompensa especial em Fichas do Lar.',
        color: '#8b5cf6',
      });
    } else if (studyCount > 0 && domesticCount === 0) {
      pedagogicalInsights.push({
        type: 'BALANCE',
        badge: 'Responsabilidade Compartilhada',
        icon: '🧹',
        title: 'Prática de Cooperação no Lar',
        text: 'Os estudos estão recebendo muita atenção! Uma missão simples de autocuidado ou organização do próprio espaço ajudará a equilibrar o senso de responsabilidade prática.',
        color: '#10b981',
      });
    } else {
      pedagogicalInsights.push({
        type: 'GENERAL',
        badge: 'Gamificação Positiva',
        icon: '✨',
        title: 'Reforço Positivo & Foco no Esforço',
        text: 'Lembre-se: no RPG pedagógico, o valor principal está na constância do processo, não apenas no resultado perfeito. Validar com carinho as fotos e relatos estimula o hábito duradouro.',
        color: '#f59e0b',
      });
    }

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
      weeklyHabits,
      categoryDistribution,
      catCountsByChild,
      treasuryStatement,
      clanAchievements,
      pedagogicalInsights,
    });
  } catch (error) {
    console.error('❌ Erro ao calcular análises do clã:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar painel do clã.',
    });
  }
};

