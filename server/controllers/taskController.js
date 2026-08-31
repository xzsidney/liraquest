import { randomUUID } from 'node:crypto';
import {
  Task,
  TaskSubmission,
  Family,
  FamilyMember,
  FamilyUser,
  Character,
  CharacterClass,
} from '../models/index.js';

/**
 * Cria uma nova missão da vida real (exclusivo para PARENT ou ADMIN)
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, xp_reward, gold_reward, category, assigned_to } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'O título da missão é obrigatório (mínimo de 2 caracteres).',
      });
    }

    // Buscar família do pai
    const membership = await FamilyMember.findOne({ where: { user_id: userId } });
    if (!membership) {
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
      category: category || 'GERAL',
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
 * Lista todas as missões ativas da família do usuário
 */
export const listFamilyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await FamilyMember.findOne({ where: { user_id: userId } });

    if (!membership) {
      return res.json({
        success: true,
        tasks: [],
        message: 'Usuário não vinculado a uma família.',
      });
    }

    const tasks = await Task.findAll({
      where: { family_id: membership.family_id, is_active: true },
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
      order: [['created_at', 'DESC']],
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

    const task = await Task.findByPk(taskId);
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
    const membership = await FamilyMember.findOne({ where: { user_id: userId } });

    if (!membership) {
      return res.json({ success: true, count: 0, submissions: [] });
    }

    const submissions = await TaskSubmission.findAll({
      where: { status: 'PENDING' },
      include: [
        {
          model: Task,
          as: 'task',
          where: { family_id: membership.family_id },
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

    // Se aprovada, creditar XP e Ouro automaticamente
    if (status === 'APPROVED' && submission.character_id) {
      const hero = await Character.findByPk(submission.character_id);
      if (hero) {
        // Creditar ouro
        const goldGain = submission.task.gold_reward || 0;
        await hero.update({ gold: hero.gold + goldGain });

        // Creditar XP na classe ativa
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

          await classProgress.update({
            xp: currentXP,
            level: currentLevel,
          });

          newLevel = currentLevel;
        }
      }
    }

    // Atualizar submissão
    await submission.update({
      status,
      feedback: feedback ? feedback.trim() : null,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
    });

    return res.json({
      success: true,
      message: status === 'APPROVED'
        ? `🎉 Missão aprovada! ${submission.task.xp_reward} XP e ${submission.task.gold_reward} Ouro creditados ao herói!`
        : 'Missão rejeitada com feedback para o herói.',
      leveledUp,
      newLevel,
      submission,
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
