import { randomUUID } from 'node:crypto';
import {
  UserProgress,
  FamilyUser,
  Family,
  Task,
  TaskSubmission,
  FamilyMember,
  DefinitionTask,
} from '../models/index.js';
import { Op } from 'sequelize';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna a data de hoje no formato 'YYYY-MM-DD' (sem horário)
 */
function todayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retorna a data de ontem no formato 'YYYY-MM-DD'
 */
function yesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Popula as 42 tarefas padrão de definition_tasks para a família se a tabela tasks estiver vazia
 */
export async function ensureFamilyHasTasks(familyId, creatorId) {
  try {
    if (!familyId) return;
    const existingCount = await Task.count({ where: { family_id: familyId } });
    if (existingCount > 0) return;

    const defaultDefs = await DefinitionTask.findAll();
    if (!defaultDefs || defaultDefs.length === 0) return;

    const newTasks = defaultDefs.map((d) => ({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      created_by: creatorId || familyId,
      assigned_to: null,
      title: d.name,
      description: d.description,
      category: d.category,
      difficulty: d.difficulty || 'MEDIUM',
      allowed_profile: d.allowed_profile || 'ALL',
      xp_reward: d.reward_xp || 50,
      gold_reward: d.reward_gold || 10,
      energy_reward: d.reward_energy || (d.difficulty === 'EASY' ? 1 : d.difficulty === 'HARD' ? 4 : 2),
      token_reward: d.difficulty === 'EASY' ? 5 : d.difficulty === 'HARD' ? 30 : 15,
      estimated_time: d.estimated_time || '15-20 min',
      requires_proof: d.requires_proof !== false,
      is_active: true,
    }));

    await Task.bulkCreate(newTasks);
    console.log(`✅ [LiraQuest] ${newTasks.length} missões padrão geradas automaticamente para a família ${familyId}!`);
  } catch (err) {
    console.error('❌ Erro ao inicializar missões padrão da família:', err);
  }
}

/**
 * Garante que o usuário possua uma família válida no banco para não quebrar Foreign Keys
 */
export async function findOrCreateUserFamily(userId) {
  try {
    let membership = await FamilyMember.findOne({
      where: { user_id: userId },
      include: [{ model: Family, as: 'family' }],
    });

    if (membership && membership.family_id) {
      await ensureFamilyHasTasks(membership.family_id, membership.family?.created_by || userId);
      return membership;
    }

    const user = await FamilyUser.findByPk(userId);
    if (!user) return null;

    const inviteCode = 'LIRA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const family = await Family.create({
      id: randomUUID().toLowerCase(),
      name: `Clã ${user.name || 'Lira'}`,
      invite_code: inviteCode,
      created_by: userId,
    });

    membership = await FamilyMember.create({
      id: randomUUID().toLowerCase(),
      family_id: family.id,
      user_id: userId,
      role_in_family: user.role === 'PARENT' ? 'GUARDIAN' : 'MEMBER',
    });

    membership.family = family;
    await ensureFamilyHasTasks(family.id, userId);
    return membership;
  } catch (err) {
    console.error('❌ Erro em findOrCreateUserFamily:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Função reutilizável: encontra ou cria o progress do usuário
// ─────────────────────────────────────────────────────────────────────────────
export async function findOrCreateProgress(userId) {
  const [progress] = await UserProgress.findOrCreate({
    where: { user_id: userId },
    defaults: {
      id: randomUUID().toLowerCase(),
      user_id: userId,
      adventure_energy: 0,
      family_tokens: 0,
      tasks_done_total: 0,
      tasks_done_today: 0,
      streak_days: 0,
      best_streak_days: 0,
      last_active_date: null,
    },
  });
  return progress;
}

// ─────────────────────────────────────────────────────────────────────────────
// Função central: Creditar recompensas reais ao aprovar uma tarefa
// Chamada pelo taskController quando o pai aprova uma submissão
// ─────────────────────────────────────────────────────────────────────────────
export async function creditTaskRewards(userId, task) {
  const progress = await findOrCreateProgress(userId);

  const today = todayDateString();
  const yesterday = yesterdayDateString();
  const lastDate = progress.last_active_date;

  const tasksToday = lastDate === today ? progress.tasks_done_today + 1 : 1;

  let newStreak;
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate === today) {
    newStreak = progress.streak_days;
  } else if (lastDate === yesterday) {
    newStreak = progress.streak_days + 1;
  } else {
    newStreak = 1;
  }

  const newBestStreak = Math.max(progress.best_streak_days, newStreak);

  await progress.update({
    adventure_energy: progress.adventure_energy + (task.energy_reward || 0),
    family_tokens: progress.family_tokens + (task.token_reward || 0),
    tasks_done_total: progress.tasks_done_total + 1,
    tasks_done_today: tasksToday,
    streak_days: newStreak,
    best_streak_days: newBestStreak,
    last_active_date: today,
  });

  return progress;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/progress/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await findOrCreateProgress(userId);

    return res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar progresso do usuário.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/progress/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Progress do usuário
    const progress = await findOrCreateProgress(userId);

    const today = todayDateString();
    const todayStart = new Date(today + 'T00:00:00.000Z');
    const todayEnd = new Date(today + 'T23:59:59.999Z');

    // 2. Garantir ou buscar família válida do usuário
    const membership = await findOrCreateUserFamily(userId);
    const familyId = membership ? membership.family_id : null;

    let pendingTasks = [];
    let approvedToday = [];
    let history = [];

    // Submissões do usuário
    const mySubmissions = await TaskSubmission.findAll({
      where: { user_id: userId },
      include: [
        { model: Task, as: 'task' },
        { model: FamilyUser, as: 'reviewer', attributes: ['name', 'role'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const submittedTaskIds = mySubmissions
      .filter((s) => s.status === 'PENDING' || s.status === 'APPROVED')
      .map((s) => s.task_id);

    // Aprovadas hoje
    approvedToday = mySubmissions
      .filter((s) => s.status === 'APPROVED' && s.reviewed_at && new Date(s.reviewed_at) >= todayStart && new Date(s.reviewed_at) <= todayEnd)
      .map((s) => ({
        id: s.id,
        task_id: s.task_id,
        task_title: s.task?.title || 'Missão Concluída',
        category: s.task?.category || 'GERAL',
        xp_reward: s.task?.xp_reward || 0,
        gold_reward: s.task?.gold_reward || 0,
        energy_reward: s.task?.energy_reward || 1,
        token_reward: s.task?.token_reward || 0,
        approved_at: s.reviewed_at,
      }));

    // Histórico geral
    history = mySubmissions.slice(0, 15).map((s) => ({
      id: s.id,
      task_id: s.task_id,
      task_title: s.task?.title || 'Missão',
      category: s.task?.category || 'GERAL',
      status: s.status,
      proof_text: s.proof_text,
      proof_photo_url: s.proof_photo_url,
      feedback: s.feedback,
      reviewer_name: s.reviewer?.name || 'Guardião',
      xp_reward: s.task?.xp_reward || 0,
      gold_reward: s.task?.gold_reward || 0,
      energy_reward: s.task?.energy_reward || 1,
      token_reward: s.task?.token_reward || 0,
      created_at: s.created_at,
      reviewed_at: s.reviewed_at,
    }));

    if (familyId) {
      // Buscar tarefas ativas da família
      const familyTasks = await Task.findAll({
        where: {
          family_id: familyId,
          is_active: true,
          ...(submittedTaskIds.length > 0 ? { id: { [Op.notIn]: submittedTaskIds } } : {}),
          allowed_profile: {
            [Op.in]:
              req.user.role === 'PARENT' || req.user.role === 'ADMIN'
                ? ['ALL', 'ADULT_ONLY']
                : ['ALL', 'CHILD_ONLY'],
          },
        },
        include: [
          {
            model: TaskSubmission,
            as: 'submissions',
            where: { user_id: userId },
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
      });

      pendingTasks = familyTasks.map((t) => {
        const userSubs = t.submissions || [];
        const latestSub = userSubs[0] || null;
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          difficulty: t.difficulty || 'MEDIUM',
          xp_reward: t.xp_reward,
          gold_reward: t.gold_reward,
          energy_reward: t.energy_reward || (t.difficulty === 'EASY' ? 1 : t.difficulty === 'HARD' ? 4 : 2),
          token_reward: t.token_reward || (t.difficulty === 'EASY' ? 5 : t.difficulty === 'HARD' ? 30 : 15),
          estimated_time: t.estimated_time || '15-20 min',
          requires_proof: t.requires_proof !== false,
          submission_status: latestSub ? latestSub.status : null,
          submission_feedback: latestSub ? latestSub.feedback : null,
        };
      });
    }

    return res.json({
      success: true,
      hasFamily: true,
      family: membership ? membership.family : null,
      progress,
      tasks: {
        pending: pendingTasks,
        approved_today: approvedToday,
        history,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao montar dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao montar o dashboard do usuário.',
    });
  }
};

/**
 * Retorna os dados consolidados do "Painel do Herói" (Progresso Real do Usuário)
 * Sem nenhuma informação do avatar virtual de combate
 */
export const getMyHeroDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await findOrCreateProgress(userId);

    // Buscar todas as submissões do usuário
    const [approvedSubs, totalSubsCount] = await Promise.all([
      TaskSubmission.findAll({
        where: { user_id: userId, status: 'APPROVED' },
        include: [{ model: Task, as: 'task' }],
      }),
      TaskSubmission.count({ where: { user_id: userId } }),
    ]);

    // Calcular XP Real e Ouro acumulados por tarefas reais
    const totalXp = approvedSubs.reduce((acc, s) => acc + (s.task?.xp_reward || 50), 0);
    const totalGoldEarned = approvedSubs.reduce((acc, s) => acc + (s.task?.gold_reward || 10), 0);

    // Cálculo do Level Real do Usuário (Curva progressiva: Nv 1 = 200xp, Nv 2 = 300xp, etc.)
    let level = 1;
    let xpRemaining = totalXp;
    let xpNeededForNext = 200;

    while (xpRemaining >= xpNeededForNext) {
      xpRemaining -= xpNeededForNext;
      level += 1;
      xpNeededForNext = Math.round(200 + (level - 1) * 75);
    }

    const currentLevelXp = xpRemaining;
    const nextLevelXp = xpNeededForNext;
    const xpProgressPct = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

    // Patente / Rank do Usuário no Mundo Real
    let rankTitle = '🌱 Recruta do Lar';
    let rankBadge = 'Iniciante';
    if (level >= 10) {
      rankTitle = '🌟 Campeão Lendário da Família';
      rankBadge = 'Mestre';
    } else if (level >= 7) {
      rankTitle = '👑 Cavaleiro de Elite';
      rankBadge = 'Veterano';
    } else if (level >= 4) {
      rankTitle = '🛡️ Guardião Exemplar';
      rankBadge = 'Avançado';
    } else if (level >= 2) {
      rankTitle = '⚔️ Herói Dedicado';
      rankBadge = 'Intermediário';
    }

    const approvalRate = totalSubsCount > 0 
      ? Math.round((approvedSubs.length / totalSubsCount) * 100) 
      : 100;

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profile_photo_url: req.user.profile_photo_url,
      },
      heroProgress: {
        level,
        totalXp,
        currentLevelXp,
        nextLevelXp,
        xpProgressPct,
        rankTitle,
        rankBadge,
        token_balance: progress.family_tokens || progress.token_balance || 0,
        energy_balance: progress.adventure_energy || progress.energy_balance || 0,
        totalGoldEarned,
        current_streak: progress.streak_days || progress.current_streak || 0,
        longest_streak: progress.best_streak_days || progress.longest_streak || 0,
        tasks_completed_today: progress.tasks_done_today || progress.tasks_completed_today || 0,
        tasks_completed_total: approvedSubs.length,
        approvalRate,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar dados do Painel do Herói:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar painel do herói.',
    });
  }
};

