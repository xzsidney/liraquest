import { Router } from 'express';
import { Op } from 'sequelize';
import { authMiddleware, requireGuardian } from '../../core/authMiddleware.js';
import { FamilyTask } from './FamilyTask.js';
import { FamilyTaskSubmission } from './FamilyTaskSubmission.js';
import { FamilyMember } from '../family/FamilyMember.js';

const router = Router();

/**
 * GET /api/tasks
 * Lista tarefas ativas da família do membro autenticado
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const familyId = req.user.family_id || req.user.familyId;
    const memberId = req.user.id;

    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: 'Membro não possui clã familiar vinculado.',
      });
    }

    const whereClause = {
      family_id: familyId,
      is_active: true,
    };

    // Se for filho, pode ver tarefas gerais ou atribuídas especificamente a ele
    if (req.user.role === 'CHILD') {
      whereClause[Op.or] = [
        { assigned_to: null },
        { assigned_to: memberId },
      ];
    }

    const tasks = await FamilyTask.findAll({
      where: whereClause,
      order: [['reward_str_xp', 'DESC'], ['title', 'ASC']],
      include: [
        {
          model: FamilyMember,
          as: 'assignee',
          attributes: ['id', 'name', 'hero_nickname'],
        },
      ],
    });

    // Buscar submissões recentes do membro para saber o status do dia
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySubmissions = await FamilyTaskSubmission.findAll({
      where: {
        member_id: memberId,
        created_at: { [Op.gte]: startOfToday },
      },
      order: [['created_at', 'DESC']],
    });

    const tasksWithStatus = tasks.map((t) => {
      const taskJson = t.toJSON();
      const taskSubmissions = todaySubmissions.filter((s) => s.task_id === t.id);
      
      const pendingSub = taskSubmissions.find((s) => s.status === 'PENDING');
      const approvedSub = taskSubmissions.find((s) => s.status === 'APPROVED');

      return {
        ...taskJson,
        today_pending: Boolean(pendingSub),
        today_approved: Boolean(approvedSub),
        latest_submission: taskSubmissions[0] || null,
      };
    });

    return res.json({
      success: true,
      tasks: tasksWithStatus,
    });
  } catch (error) {
    console.error('❌ Erro ao listar tarefas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar missões do lar.',
      error: error.message,
    });
  }
});

/**
 * POST /api/tasks
 * (Somente Pais/Admin) Cria uma nova missão para o clã
 */
router.post('/', authMiddleware, requireGuardian, async (req, res) => {
  try {
    const familyId = req.user.family_id || req.user.familyId;
    const {
      title,
      description,
      category = 'LAR',
      assigned_to = null,
      frequency = 'DAILY',
      reward_str_xp = 25,
      reward_xp = 15,
      reward_gold = 10,
      reward_tokens = 1,
    } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O título da missão é obrigatório.',
      });
    }

    const task = await FamilyTask.create({
      family_id: familyId,
      title: title.trim(),
      description: description?.trim() || null,
      category,
      assigned_to: assigned_to || null,
      frequency,
      reward_str_xp: Number(reward_str_xp) || 25,
      reward_xp: Number(reward_xp) || 15,
      reward_gold: Number(reward_gold) || 10,
      reward_tokens: Number(reward_tokens) || 1,
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Missão criada com sucesso!',
      task,
    });
  } catch (error) {
    console.error('❌ Erro ao criar missão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar missão familiar.',
      error: error.message,
    });
  }
});

/**
 * POST /api/tasks/:id/submit
 * Submete a prova (foto em base64 e comentário opcional da criança)
 */
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const memberId = req.user.id;
    const familyId = req.user.family_id || req.user.familyId;
    const { proof_image, member_notes } = req.body;

    const task = await FamilyTask.findOne({
      where: { id: taskId, family_id: familyId, is_active: true },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Missão não encontrada ou inativa neste clã.',
      });
    }

    // Criar submissão PENDING
    const submission = await FamilyTaskSubmission.create({
      task_id: task.id,
      family_id: familyId,
      member_id: memberId,
      status: 'PENDING',
      proof_image: proof_image || null,
      member_notes: member_notes?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: '📸 Prova enviada com sucesso! Aguardando a bênção do Papai/Mamãe.',
      submission,
    });
  } catch (error) {
    console.error('❌ Erro ao submeter prova:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao submeter prova da tarefa.',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/submissions/pending
 * (Somente Pais/Admin) Lista todas as provas pendentes de aprovação da família
 */
router.get('/submissions/pending', authMiddleware, requireGuardian, async (req, res) => {
  try {
    const familyId = req.user.family_id || req.user.familyId;

    const pendingSubmissions = await FamilyTaskSubmission.findAll({
      where: {
        family_id: familyId,
        status: 'PENDING',
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: FamilyTask,
          as: 'task',
        },
        {
          model: FamilyMember,
          as: 'member',
          attributes: [
            'id',
            'name',
            'hero_nickname',
            'role',
            'class_code',
            'skin_code',
            'level',
            'str',
            'xp_str',
          ],
        },
      ],
    });

    return res.json({
      success: true,
      count: pendingSubmissions.length,
      submissions: pendingSubmissions,
    });
  } catch (error) {
    console.error('❌ Erro ao listar provas pendentes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar provas pendentes.',
      error: error.message,
    });
  }
});

/**
 * POST /api/tasks/submissions/:id/approve
 * (Somente Pais/Admin) Aprova a submissão e credita recompensas (+STR XP, Ouro, Fichas, XP)
 */
router.post('/submissions/:id/approve', authMiddleware, requireGuardian, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const familyId = req.user.family_id || req.user.familyId;
    const reviewerId = req.user.id;

    const submission = await FamilyTaskSubmission.findOne({
      where: { id: submissionId, family_id: familyId },
      include: [{ model: FamilyTask, as: 'task' }],
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submissão de tarefa não encontrada.',
      });
    }

    if (submission.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Esta submissão já foi avaliada anteriormente (${submission.status}).`,
      });
    }

    const member = await FamilyMember.findByPk(submission.member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Herói executor da tarefa não encontrado.',
      });
    }

    const task = submission.task;
    const rewardStrXp = task ? Number(task.reward_str_xp) || 25 : 25;
    const rewardXp = task ? Number(task.reward_xp) || 15 : 15;
    const rewardGold = task ? Number(task.reward_gold) || 10 : 10;
    const rewardTokens = task ? Number(task.reward_tokens) || 1 : 1;

    // 1. Atualizar a submissão
    submission.status = 'APPROVED';
    submission.reviewed_by = reviewerId;
    submission.reviewed_at = new Date();
    await submission.save();

    // 2. Creditar recompensas ao herói
    member.gold = (member.gold || 0) + rewardGold;
    member.family_tokens = (member.family_tokens || 0) + rewardTokens;
    member.xp = (member.xp || 0) + rewardXp;
    member.xp_str = (member.xp_str || 0) + rewardStrXp;

    // 3. Checagem de Nível de Força (STR): A cada 100 xp_str -> +1 STR
    let strLeveledUp = false;
    let oldStr = member.str || 10;
    if (member.xp_str >= 100) {
      strLeveledUp = true;
      while (member.xp_str >= 100) {
        member.str = (member.str || 10) + 1;
        member.xp_str -= 100;
      }
    }

    // 4. Checagem de Nível Geral do Herói
    let generalLeveledUp = false;
    let nextLevelXp = (member.level || 1) * 100;
    while (member.xp >= nextLevelXp) {
      member.xp -= nextLevelXp;
      member.level = (member.level || 1) + 1;
      nextLevelXp = member.level * 100;
      generalLeveledUp = true;
    }

    await member.save();

    console.log(`⚔️ [Tasks] Submissão ${submission.id} aprovada para ${member.hero_nickname}!`);
    console.log(`💪 STR: ${oldStr} -> ${member.str} (xp_str: ${member.xp_str}%)`);

    return res.json({
      success: true,
      message: strLeveledUp
        ? `🎉 Missão Aprovada com Glória! ${member.hero_nickname} alcançou FORÇA ${member.str}!`
        : `✅ Missão Aprovada! +${rewardStrXp} XP de Força, +${rewardGold} Ouro e +${rewardTokens} Ficha!`,
      str_leveled_up: strLeveledUp,
      old_str: oldStr,
      new_str: member.str,
      general_leveled_up: generalLeveledUp,
      new_level: member.level,
      rewards: {
        reward_str_xp: rewardStrXp,
        reward_xp: rewardXp,
        reward_gold: rewardGold,
        reward_tokens: rewardTokens,
      },
      member: {
        id: member.id,
        name: member.name,
        hero_nickname: member.hero_nickname,
        str: member.str,
        xp_str: member.xp_str,
        level: member.level,
        xp: member.xp,
        gold: member.gold,
        family_tokens: member.family_tokens,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao aprovar submissão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao aprovar prova.',
      error: error.message,
    });
  }
});

/**
 * POST /api/tasks/submissions/:id/reject
 * (Somente Pais/Admin) Rejeita com feedback orientativo
 */
router.post('/submissions/:id/reject', authMiddleware, requireGuardian, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const familyId = req.user.family_id || req.user.familyId;
    const reviewerId = req.user.id;
    const feedback = req.body.parent_feedback || req.body.feedback || 'Precisa caprichar mais na organização!';

    const submission = await FamilyTaskSubmission.findOne({
      where: { id: submissionId, family_id: familyId },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submissão de tarefa não encontrada.',
      });
    }

    if (submission.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Esta submissão já foi avaliada anteriormente (${submission.status}).`,
      });
    }

    submission.status = 'REJECTED';
    submission.reviewed_by = reviewerId;
    submission.reviewed_at = new Date();
    submission.parent_feedback = feedback.trim();
    await submission.save();

    return res.json({
      success: true,
      message: 'Submissão retornada ao herói com feedback de melhoria.',
      submission,
    });
  } catch (error) {
    console.error('❌ Erro ao rejeitar submissão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao rejeitar submissão.',
      error: error.message,
    });
  }
});

export default router;
