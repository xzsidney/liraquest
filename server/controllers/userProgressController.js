import {
  UserProgress,
  FamilyUser,
  Task,
  TaskSubmission,
  FamilyMember,
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

// ─────────────────────────────────────────────────────────────────────────────
// Função reutilizável: encontra ou cria o progress do usuário
// ─────────────────────────────────────────────────────────────────────────────
export async function findOrCreateProgress(userId) {
  const [progress] = await UserProgress.findOrCreate({
    where: { user_id: userId },
    defaults: {
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
  const lastDate = progress.last_active_date; // formato 'YYYY-MM-DD' ou null

  // ── Calcular tasks_done_today (reseta se mudou o dia) ──
  const tasksToday = lastDate === today ? progress.tasks_done_today + 1 : 1;

  // ── Calcular Streak ──
  let newStreak;
  if (!lastDate) {
    // Primeira tarefa de toda a vida
    newStreak = 1;
  } else if (lastDate === today) {
    // Já fez tarefa hoje — streak não muda
    newStreak = progress.streak_days;
  } else if (lastDate === yesterday) {
    // Fez ontem e fez hoje — streak continua!
    newStreak = progress.streak_days + 1;
  } else {
    // Passou mais de um dia — streak foi zerado
    newStreak = 1;
  }

  const newBestStreak = Math.max(progress.best_streak_days, newStreak);

  // ── Atualizar tudo de uma vez ──
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
// Retorna apenas o registro de progresso do usuário autenticado
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
// Retorna tudo de uma vez: progress + tarefas pendentes + aprovadas hoje + histórico
// Chamada principal ao carregar o Terminal do Usuário
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Progress do usuário
    const progress = await findOrCreateProgress(userId);

    // 2. Buscar família do usuário
    const membership = await FamilyMember.findOne({ where: { user_id: userId } });

    if (!membership) {
      // Usuário sem família — retorna progress mas sem tarefas
      return res.json({
        success: true,
        progress,
        tasks: { pending: [], approved_today: [], history: [] },
        message: 'Usuário ainda não pertence a uma família. Crie ou entre em uma para ver as missões.',
      });
    }

    const familyId = membership.family_id;
    const today = todayDateString();
    const todayStart = new Date(today + 'T00:00:00.000Z');
    const todayEnd = new Date(today + 'T23:59:59.999Z');

    // 3. IDs das tarefas já submetidas pelo usuário (PENDING ou APPROVED)
    const mySubmissions = await TaskSubmission.findAll({
      where: { user_id: userId },
      attributes: ['task_id', 'status'],
    });

    const submittedTaskIds = mySubmissions
      .filter((s) => s.status === 'PENDING' || s.status === 'APPROVED')
      .map((s) => s.task_id);

    // 4. Tarefas pendentes — ativas da família que o usuário AINDA NÃO enviou prova aprovada
    const pendingTasks = await Task.findAll({
      where: {
        family_id: familyId,
        is_active: true,
        ...(submittedTaskIds.length > 0 ? { id: { [Op.notIn]: submittedTaskIds } } : {}),
        // Filtro de perfil: mostrar ALL e CHILD_ONLY para filhos, ALL e ADULT_ONLY para pais
        allowed_profile: {
          [Op.in]:
            req.user.role === 'PARENT' || req.user.role === 'ADMIN'
              ? ['ALL', 'ADULT_ONLY']
              : ['ALL', 'CHILD_ONLY'],
        },
      },
      include: [
        { model: FamilyUser, as: 'creator', attributes: ['id', 'name', 'role'] },
        { model: FamilyUser, as: 'assignee', attributes: ['id', 'name'] },
        // Submissões pendentes dessa tarefa pelo usuário (para exibir status no card)
        {
          model: TaskSubmission,
          as: 'submissions',
          where: { user_id: userId },
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // 5. Tarefas aprovadas hoje
    const approvedToday = await TaskSubmission.findAll({
      where: {
        user_id: userId,
        status: 'APPROVED',
        reviewed_at: { [Op.between]: [todayStart, todayEnd] },
      },
      include: [{ model: Task, as: 'task' }],
      order: [['reviewed_at', 'DESC']],
    });

    // 6. Histórico recente (últimas 15 submissões)
    const history = await TaskSubmission.findAll({
      where: { user_id: userId },
      include: [
        { model: Task, as: 'task' },
        { model: FamilyUser, as: 'reviewer', attributes: ['name', 'role'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 15,
    });

    return res.json({
      success: true,
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
