import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  FamilyEvent,
  FamilyPoll,
  FamilyPollVote,
  FamilyUser,
  FamilyMember,
} from '../models/index.js';
import { findOrCreateUserFamily } from './userProgressController.js';

/**
 * Popula eventos padrão caso a família não possua nenhum
 */
async function ensureDefaultEvents(familyId, creatorId) {
  try {
    const count = await FamilyEvent.count({ where: { family_id: familyId } });
    if (count > 0) return;

    const today = new Date();
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + ((7 - today.getDay() + 7) % 7 || 7));
    const birthday = new Date(today);
    birthday.setDate(today.getDate() + 20);

    const defaultEvents = [
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🍕🎲 Noite da Pizza & Jogos do Clã',
        description: 'Rodízio caseiro e partidas no Salão de Jogos com toda a família reunida.',
        event_date: friday.toISOString().split('T')[0],
        event_time: '20:00',
        category: 'FAMILY_OUTING',
        icon: '🍕',
        color: '#ec4899',
        is_recurring_yearly: false,
        is_active: true,
      },
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🌳🚴‍♂️ Passeio no Parque & Piquenique',
        description: 'Manhã ao ar livre, caminhada, pedalada e lanche especial sob a sombra das árvores.',
        event_date: sunday.toISOString().split('T')[0],
        event_time: '09:30',
        category: 'FAMILY_OUTING',
        icon: '🌳',
        color: '#10b981',
        is_recurring_yearly: false,
        is_active: true,
      },
      {
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        created_by: creatorId,
        title: '🎂 Aniversário Real da Casa',
        description: 'Celebração com bolo, salgadinhos e entrega de bênçãos e presentes reais.',
        event_date: birthday.toISOString().split('T')[0],
        event_time: '18:00',
        category: 'BIRTHDAY',
        icon: '🎂',
        color: '#f59e0b',
        is_recurring_yearly: true,
        is_active: true,
      },
    ];

    await FamilyEvent.bulkCreate(defaultEvents);
  } catch (err) {
    console.error('Erro ao popular eventos padrão:', err);
  }
}

/**
 * Popula enquete padrão de passeios se a família não possuir nenhuma
 */
async function ensureDefaultPoll(familyId, creatorId) {
  try {
    const count = await FamilyPoll.count({ where: { family_id: familyId } });
    if (count > 0) return;

    const closesAt = new Date();
    closesAt.setDate(closesAt.getDate() + 5);

    await FamilyPoll.create({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      created_by: creatorId,
      title: 'Qual será o grande passeio da família neste fim de semana?',
      description: 'Votação aberta para todos os heróis e guardiões do clã escolherem a melhor aventura.',
      status: 'OPEN',
      closes_at: closesAt,
      options: [
        {
          id: 'opt_1',
          title: 'Parque Ecológico & Piquenique',
          description: 'Trilha verde, ar puro, patinete e lanche ao ar livre',
          icon: '🌳',
        },
        {
          id: 'opt_2',
          title: 'Cinema & Sessão Pipoca',
          description: 'Filme novo em tela gigante com balde de pipoca e refrigerante',
          icon: '🍿',
        },
        {
          id: 'opt_3',
          title: 'Pizzaria ou Hamburgueria Artesanal',
          description: 'Noite saborosa com rodízio e direito à sobremesa nobre',
          icon: '🍕',
        },
      ],
    });
  } catch (err) {
    console.error('Erro ao popular enquete padrão:', err);
  }
}

// ========================================================
// 1. EVENTOS DO CLÃ (AGENDA & ANIVERSÁRIOS)
// ========================================================

export const listEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    await ensureDefaultEvents(familyId, userId);

    const events = await FamilyEvent.findAll({
      where: { family_id: familyId, is_active: true },
      order: [
        ['event_date', 'ASC'],
        ['event_time', 'ASC'],
      ],
    });

    return res.json({
      success: true,
      events,
    });
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar eventos do clã.' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const { title, description, event_date, event_time, category, icon, color, is_recurring_yearly } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ success: false, message: 'Título e data do evento são obrigatórios.' });
    }

    const event = await FamilyEvent.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      event_date,
      event_time: event_time || '12:00',
      category: category || 'FAMILY_OUTING',
      icon: icon || '📅',
      color: color || '#f59e0b',
      is_recurring_yearly: Boolean(is_recurring_yearly),
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Evento cadastrado com sucesso!',
      event,
    });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao salvar evento.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const event = await FamilyEvent.findOne({
      where: { id: eventId, family_id: membership.family_id },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }

    const { title, description, event_date, event_time, category, icon, color, is_recurring_yearly } = req.body;
    await event.update({
      title: title !== undefined ? title.trim() : event.title,
      description: description !== undefined ? description.trim() : event.description,
      event_date: event_date || event.event_date,
      event_time: event_time !== undefined ? event_time : event.event_time,
      category: category || event.category,
      icon: icon || event.icon,
      color: color || event.color,
      is_recurring_yearly: is_recurring_yearly !== undefined ? Boolean(is_recurring_yearly) : event.is_recurring_yearly,
    });

    return res.json({
      success: true,
      message: 'Evento atualizado com sucesso!',
      event,
    });
  } catch (err) {
    console.error('Erro ao atualizar evento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar evento.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const event = await FamilyEvent.findOne({
      where: { id: eventId, family_id: membership.family_id },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }

    await event.destroy();

    return res.json({
      success: true,
      message: 'Evento removido com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao excluir evento:', err);
    return res.status(500).json({ success: false, message: 'Erro ao excluir evento.' });
  }
};

// ========================================================
// 2. VOTAÇÃO FAMILIAR DE PASSEIOS (ENQUETES & VOTOS)
// ========================================================

export const listPolls = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    await ensureDefaultPoll(familyId, userId);

    const polls = await FamilyPoll.findAll({
      where: { family_id: familyId },
      include: [
        {
          model: FamilyPollVote,
          as: 'votes',
          include: [{ model: FamilyUser, as: 'voter', attributes: ['id', 'name', 'role'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Formatar enquetes com contadores de votos por opção e indicação do voto do usuário
    const formattedPolls = polls.map((p) => {
      const votes = p.votes || [];
      const totalVotes = votes.length;
      const myVote = votes.find((v) => v.user_id === userId)?.option_id || null;

      const optionsWithCounts = (p.options || []).map((opt) => {
        const optionVotes = votes.filter((v) => v.option_id === opt.id);
        const count = optionVotes.length;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          ...opt,
          votes_count: count,
          percentage,
          voters: optionVotes.map((v) => v.voter?.name).filter(Boolean),
        };
      });

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        closes_at: p.closes_at,
        winner_option_id: p.winner_option_id,
        total_votes: totalVotes,
        my_vote: myVote,
        options: optionsWithCounts,
        created_at: p.created_at,
      };
    });

    return res.json({
      success: true,
      polls: formattedPolls,
    });
  } catch (err) {
    console.error('Erro ao listar votações:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar enquetes.' });
  }
};

export const createPoll = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const { title, description, options, closes_at } = req.body;
    if (!title || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Título e pelo menos 2 opções de passeio são obrigatórios.',
      });
    }

    // Formatar opções com IDs únicos
    const formattedOptions = options.map((opt, idx) => ({
      id: opt.id || `opt_${idx + 1}_${Date.now().toString(36)}`,
      title: (opt.title || `Opção ${idx + 1}`).trim(),
      description: opt.description ? opt.description.trim() : '',
      icon: opt.icon || '🎯',
    }));

    const poll = await FamilyPoll.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      created_by: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      options: formattedOptions,
      status: 'OPEN',
      closes_at: closes_at ? new Date(closes_at) : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Votação de passeio criada com sucesso!',
      poll,
    });
  } catch (err) {
    console.error('Erro ao criar enquete:', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao criar votação.' });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { option_id } = req.body;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    if (!option_id) {
      return res.status(400).json({ success: false, message: 'ID da opção escolhida é obrigatório.' });
    }

    const poll = await FamilyPoll.findOne({
      where: { id: pollId, family_id: membership.family_id },
    });

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
    }

    if (poll.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Esta votação já foi encerrada.' });
    }

    // Verificar se a opção existe
    const optionExists = (poll.options || []).some((o) => o.id === option_id);
    if (!optionExists) {
      return res.status(400).json({ success: false, message: 'Opção inválida para esta enquete.' });
    }

    // Registrar ou atualizar voto (Upsert)
    const existingVote = await FamilyPollVote.findOne({
      where: { poll_id: pollId, user_id: userId },
    });

    if (existingVote) {
      await existingVote.update({ option_id });
    } else {
      await FamilyPollVote.create({
        id: randomUUID().toLowerCase(),
        poll_id: pollId,
        user_id: userId,
        option_id,
      });
    }

    return res.json({
      success: true,
      message: 'Voto registrado com sucesso! 🎉',
      voted_option_id: option_id,
    });
  } catch (err) {
    console.error('Erro ao registrar voto:', err);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar voto.' });
  }
};

export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const poll = await FamilyPoll.findOne({
      where: { id: pollId, family_id: membership.family_id },
      include: [{ model: FamilyPollVote, as: 'votes' }],
    });

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
    }

    // Contabilizar vencedor
    const counts = {};
    (poll.votes || []).forEach((v) => {
      counts[v.option_id] = (counts[v.option_id] || 0) + 1;
    });

    let winnerId = null;
    let maxVotes = -1;
    for (const [optId, cnt] of Object.entries(counts)) {
      if (cnt > maxVotes) {
        maxVotes = cnt;
        winnerId = optId;
      }
    }

    await poll.update({
      status: 'CLOSED',
      winner_option_id: winnerId,
    });

    return res.json({
      success: true,
      message: 'Votação encerrada com sucesso!',
      winner_option_id: winnerId,
      poll,
    });
  } catch (err) {
    console.error('Erro ao encerrar votação:', err);
    return res.status(500).json({ success: false, message: 'Erro ao encerrar enquete.' });
  }
};

export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);

    const poll = await FamilyPoll.findOne({
      where: { id: pollId, family_id: membership.family_id },
    });

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Votação não encontrada.' });
    }

    await poll.destroy();

    return res.json({
      success: true,
      message: 'Votação excluída com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao excluir votação:', err);
    return res.status(500).json({ success: false, message: 'Erro ao excluir enquete.' });
  }
};
