import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  Task,
  TaskSubmission,
  Family,
  FamilyMember,
  FamilyUser,
  Character,
  CharacterClass,
  DefinitionTask,
} from '../models/index.js';
import {
  creditTaskRewards,
  ensureFamilyHasTasks,
  findOrCreateUserFamily,
} from './userProgressController.js';


/**
 * Cria uma nova missão da vida real (exclusivo para PARENT ou ADMIN)
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      xp_reward,
      gold_reward,
      energy_reward,
      token_reward,
      category,
      difficulty,
      estimated_time,
      requires_proof,
      assigned_to,
    } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'O título da missão é obrigatório (mínimo de 2 caracteres).',
      });
    }

    // Buscar ou garantir família do pai
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({
        success: false,
        message: 'Você precisa criar ou pertencer a uma família para lançar missões.',
      });
    }

    const task = await Task.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      assigned_to: assigned_to || null,
      title: title.trim(),
      description: description ? description.trim() : null,
      xp_reward: Number(xp_reward) || 50,
      gold_reward: Number(gold_reward) || 15,
      energy_reward: Number(energy_reward) || 1,
      token_reward: Number(token_reward) || 10,
      category: category || 'DOMESTIC',
      difficulty: difficulty || 'MEDIUM',
      estimated_time: estimated_time || '15-20 min',
      requires_proof: requires_proof !== false,
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: `Missão "${task.title}" lançada no mural da família!`,
      task,
    });
  } catch (error) {
    console.error('❌ Erro ao criar missão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao criar missão.',
    });
  }
};

/**
 * Atualiza uma missão existente (exclusivo para PARENT ou ADMIN)
 */
export const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const {
      title,
      description,
      xp_reward,
      gold_reward,
      energy_reward,
      token_reward,
      category,
      difficulty,
      estimated_time,
      requires_proof,
      assigned_to,
      is_active,
    } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Missão não encontrada.',
      });
    }

    // Verificar se o usuário pertence à mesma família ou é ADMIN
    const membership = await findOrCreateUserFamily(userId);
    if (req.user.role !== 'ADMIN' && (!membership || task.family_id !== membership.family_id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: Você não tem permissão para editar missões desta família.',
      });
    }

    await task.update({
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
      ...(xp_reward !== undefined ? { xp_reward: Number(xp_reward) } : {}),
      ...(gold_reward !== undefined ? { gold_reward: Number(gold_reward) } : {}),
      ...(energy_reward !== undefined ? { energy_reward: Number(energy_reward) } : {}),
      ...(token_reward !== undefined ? { token_reward: Number(token_reward) } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(estimated_time !== undefined ? { estimated_time } : {}),
      ...(requires_proof !== undefined ? { requires_proof: Boolean(requires_proof) } : {}),
      ...(assigned_to !== undefined ? { assigned_to: assigned_to || null } : {}),
      ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
    });

    return res.json({
      success: true,
      message: `Missão "${task.title}" atualizada com sucesso!`,
      task,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar missão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar missão.',
    });
  }
};

/**
 * Alterna status ativo/pausado de uma missão (exclusivo para PARENT ou ADMIN)
 */
export const toggleTaskStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Missão não encontrada.',
      });
    }

    const membership = await findOrCreateUserFamily(userId);
    if (req.user.role !== 'ADMIN' && (!membership || task.family_id !== membership.family_id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para alterar esta missão.',
      });
    }

    const newStatus = !task.is_active;
    await task.update({ is_active: newStatus });

    return res.json({
      success: true,
      message: `Missão "${task.title}" ${newStatus ? 'ativada' : 'pausada'} com sucesso!`,
      task,
    });
  } catch (error) {
    console.error('❌ Erro ao alternar status da missão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao alternar status da missão.',
    });
  }
};

/**
 * Exclui ou desativa uma missão da família (exclusivo para PARENT ou ADMIN)
 */
export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Missão não encontrada.',
      });
    }

    const membership = await findOrCreateUserFamily(userId);
    if (req.user.role !== 'ADMIN' && (!membership || task.family_id !== membership.family_id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para excluir esta missão.',
      });
    }

    // Verificar se já possui submissões atreladas
    const subCount = await TaskSubmission.count({ where: { task_id: taskId } });
    if (subCount > 0) {
      // Desativa suavemente para manter histórico e integridade
      await task.update({ is_active: false });
      return res.json({
        success: true,
        message: `Missão "${task.title}" possui histórico e foi desativada do mural.`,
      });
    }

    await task.destroy();
    return res.json({
      success: true,
      message: `Missão "${task.title}" excluída com sucesso!`,
    });
  } catch (error) {
    console.error('❌ Erro ao excluir missão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir missão.',
    });
  }
};

/**
 * Lista todas as missões da família (com suporte a filtro de ativas/todas)
 */
export const listFamilyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { include_inactive } = req.query;
    const membership = await findOrCreateUserFamily(userId);

    if (!membership || !membership.family_id) {
      const defTasks = await DefinitionTask.findAll({
        where: {
          allowed_profile: {
            [Op.in]:
              req.user.role === 'PARENT' || req.user.role === 'ADMIN'
                ? ['ALL', 'ADULT_ONLY']
                : ['ALL', 'CHILD_ONLY'],
          },
        },
        order: [['difficulty', 'ASC'], ['created_at', 'ASC']],
      });

      return res.json({
        success: true,
        count: defTasks.length,
        tasks: defTasks.map((d) => ({
          id: d.id,
          title: d.name,
          description: d.description,
          category: d.category,
          difficulty: d.difficulty || 'MEDIUM',
          xp_reward: d.reward_xp || 50,
          gold_reward: d.reward_gold || 10,
          energy_reward: d.reward_energy || (d.difficulty === 'EASY' ? 1 : d.difficulty === 'HARD' ? 4 : 2),
          token_reward: d.difficulty === 'EASY' ? 5 : d.difficulty === 'HARD' ? 30 : 15,
          estimated_time: d.estimated_time || '15-20 min',
          requires_proof: d.requires_proof !== false,
          is_active: true,
          submissions: [],
        })),
        message: 'Missões do catálogo global LiraQuest.',
      });
    }

    const familyId = membership.family_id;
    const creatorId = membership.family?.created_by || userId;

    await ensureFamilyHasTasks(familyId, creatorId);

    const whereClause = { family_id: familyId };
    if (!include_inactive || include_inactive !== 'true') {
      whereClause.is_active = true;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: FamilyUser, as: 'creator', attributes: ['id', 'name', 'role'] },
        { model: FamilyUser, as: 'assignee', attributes: ['id', 'name'] },
        {
          model: TaskSubmission,
          as: 'submissions',
          where: { user_id: userId },
          required: false,
        },
      ],
      order: [['is_active', 'DESC'], ['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('❌ Erro ao listar missões:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao listar missões.',
    });
  }
};

/**
 * Filho envia a prova (foto + texto) da conclusão da missão
 */
export const submitTaskProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { proof_text, proof_photo_url } = req.body;

    if (!proof_text && !proof_photo_url) {
      return res.status(400).json({
        success: false,
        message: 'Forneça ao menos um relato em texto ou uma foto como comprovação.',
      });
    }

    let task = await Task.findByPk(taskId);

    // Se não encontrou em Task, verificar se o taskId é do DefinitionTask
    if (!task) {
      const defTask = await DefinitionTask.findByPk(taskId);
      if (defTask) {
        // Garantir família com registro real no banco
        const membership = await findOrCreateUserFamily(userId);
        const familyId = membership ? membership.family_id : null;

        if (!familyId) {
          return res.status(400).json({
            success: false,
            message: 'Erro ao identificar família para submissão da missão.',
          });
        }

        task = await Task.create({
          id: randomUUID().toLowerCase(),
          family_id: familyId,
          created_by: userId,
          assigned_to: userId,
          title: defTask.name,
          description: defTask.description,
          category: defTask.category,
          difficulty: defTask.difficulty || 'MEDIUM',
          xp_reward: defTask.reward_xp || 50,
          gold_reward: defTask.reward_gold || 10,
          energy_reward: defTask.reward_energy || (defTask.difficulty === 'EASY' ? 1 : defTask.difficulty === 'HARD' ? 4 : 2),
          token_reward: defTask.difficulty === 'EASY' ? 5 : defTask.difficulty === 'HARD' ? 30 : 15,
          estimated_time: defTask.estimated_time || '15-20 min',
          requires_proof: defTask.requires_proof !== false,
          is_active: true,
        });
      }
    }

    if (!task || !task.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Missão não encontrada ou já encerrada.',
      });
    }

    // Buscar herói do filho
    const hero = await Character.findOne({ where: { user_id: userId } });

    // Criar submissão com status PENDING
    const submission = await TaskSubmission.create({
      id: randomUUID().toLowerCase(),
      task_id: task.id,
      user_id: userId,
      character_id: hero ? hero.id : null,
      proof_text: proof_text ? proof_text.trim() : null,
      proof_photo_url: proof_photo_url ? proof_photo_url.trim() : null,
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      message: '📸 Comprovação enviada com sucesso! Aguarde a aprovação dos seus pais para receber o XP e Ouro.',
      submission,
    });
  } catch (error) {
    console.error('❌ Erro ao enviar comprovação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao enviar comprovação.',
    });
  }
};

/**
 * Pais listam comprovações pendentes de avaliação no clã
 */
export const listPendingSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const membership = await findOrCreateUserFamily(userId);

    let submissionWhere = { status: 'PENDING' };

    if (userRole !== 'ADMIN' && membership && membership.family_id) {
      const familyMembers = await FamilyMember.findAll({
        where: { family_id: membership.family_id },
        attributes: ['user_id'],
      });
      const memberUserIds = familyMembers.map((m) => m.user_id);

      submissionWhere = {
        status: 'PENDING',
        [Op.or]: [
          { user_id: { [Op.in]: memberUserIds } },
          { '$task.family_id$': membership.family_id },
        ],
      };
    }

    const submissions = await TaskSubmission.findAll({
      where: submissionWhere,
      include: [
        {
          model: Task,
          as: 'task',
          required: false,
        },
        {
          model: FamilyUser,
          as: 'submitter',
          attributes: ['id', 'name', 'email', 'profile_photo_url'],
        },
        {
          model: Character,
          as: 'character',
          attributes: ['id', 'name', 'avatar_value', 'gold'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('❌ Erro ao listar comprovações pendentes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar comprovações pendentes.',
    });
  }
};

/**
 * Pais avaliam e aprovam/rejeitam a prova enviada, creditando XP e Ouro
 */
export const reviewSubmission = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { submissionId } = req.params;
    const { status, feedback } = req.body; // 'APPROVED' ou 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status de avaliação inválido (deve ser APPROVED ou REJECTED).',
      });
    }

    const submission = await TaskSubmission.findByPk(submissionId, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Comprovação não encontrada.',
      });
    }

    if (submission.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Esta comprovação já foi avaliada anteriormente.',
      });
    }

    let leveledUp = false;
    let newLevel = 1;
    let updatedProgress = null;

    // Se aprovada, creditar XP e Ouro no herói E recompensas reais no user_progress
    if (status === 'APPROVED') {
      // ── 1. Recompensas do Mundo Virtual (Herói RPG) ──
      if (submission.character_id) {
        const hero = await Character.findByPk(submission.character_id);
        if (hero) {
          // Creditar Ouro do Reino
          const goldGain = submission.task.gold_reward || 0;
          await hero.update({ gold: hero.gold + goldGain });

          // Creditar XP na classe ativa + calcular Level Up
          const xpGain = submission.task.xp_reward || 0;
          let classProgress = await CharacterClass.findOne({
            where: { character_id: hero.id, class_id: hero.current_class_id },
          });

          if (classProgress) {
            let currentXP = classProgress.xp + xpGain;
            let currentLevel = classProgress.level;
            let reqXP = currentLevel * 100;

            while (currentXP >= reqXP) {
              currentXP -= reqXP;
              currentLevel += 1;
              leveledUp = true;
              reqXP = currentLevel * 100;
            }

            await classProgress.update({ xp: currentXP, level: currentLevel });
            newLevel = currentLevel;
          }
        }
      }

      // ── 2. Recompensas do Mundo Real (Terminal do Usuário) ──
      // Credita: Energia de Aventura, Fichas do Lar, Streak, Contadores
      try {
        updatedProgress = await creditTaskRewards(submission.user_id, submission.task);
      } catch (progressError) {
        // Não falha a aprovação se o progress der erro — apenas loga
        console.error('⚠️ Erro ao creditar recompensas no user_progress:', progressError);
      }
    }

    // Atualizar submissão com resultado da avaliação
    await submission.update({
      status,
      feedback: feedback ? feedback.trim() : null,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
    });

    const energyCredited = submission.task.energy_reward || 0;
    const tokensCredited = submission.task.token_reward || 0;

    return res.json({
      success: true,
      message:
        status === 'APPROVED'
          ? `🎉 Missão aprovada! ${submission.task.xp_reward} XP, ${submission.task.gold_reward} Ouro, ${energyCredited} ⚡ Energia e ${tokensCredited} 🏠 Fichas creditados!`
          : 'Missão rejeitada com feedback para o herói.',
      leveledUp,
      newLevel,
      submission,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('❌ Erro ao avaliar comprovação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao avaliar comprovação.',
    });
  }
};

/**
 * Retorna o histórico de envios do usuário autenticado
 */
export const listMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await TaskSubmission.findAll({
      where: { user_id: userId },
      include: [
        { model: Task, as: 'task' },
        { model: FamilyUser, as: 'reviewer', attributes: ['name', 'role'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('❌ Erro ao listar envios:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar histórico de envios.',
    });
  }
};

/**
 * Retorna as últimas comprovações avaliadas (APPROVED / REJECTED) no clã
 */
export const listReviewedSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const membership = await findOrCreateUserFamily(userId);

    let submissionWhere = {
      status: { [Op.in]: ['APPROVED', 'REJECTED'] },
    };

    if (userRole !== 'ADMIN' && membership && membership.family_id) {
      const familyMembers = await FamilyMember.findAll({
        where: { family_id: membership.family_id },
        attributes: ['user_id'],
      });
      const memberUserIds = familyMembers.map((m) => m.user_id);

      submissionWhere = {
        status: { [Op.in]: ['APPROVED', 'REJECTED'] },
        [Op.or]: [
          { user_id: { [Op.in]: memberUserIds } },
          { '$task.family_id$': membership.family_id },
        ],
      };
    }

    const submissions = await TaskSubmission.findAll({
      where: submissionWhere,
      include: [
        {
          model: Task,
          as: 'task',
          required: false,
        },
        {
          model: FamilyUser,
          as: 'submitter',
          attributes: ['id', 'name', 'email', 'profile_photo_url'],
        },
        {
          model: FamilyUser,
          as: 'reviewer',
          attributes: ['id', 'name', 'role'],
        },
        {
          model: Character,
          as: 'character',
          attributes: ['id', 'name', 'avatar_value'],
        },
      ],
      order: [['reviewed_at', 'DESC']],
      limit: 20,
    });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('❌ Erro ao listar histórico de avaliações:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar histórico de avaliações.',
    });
  }
};

