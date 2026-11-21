import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  FamilyEvent,
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
 * Enquetes de Passeios (Desativadas no V2 Oficial)
 */
async function ensureDefaultPoll(familyId, creatorId) {
  return;
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
  return res.json({ success: true, polls: [] });
};

export const createPoll = async (req, res) => {
  return res.json({ success: true, message: 'Enquetes desativadas na V2 oficial.' });
};

export const votePoll = async (req, res) => {
  return res.json({ success: true, message: 'Enquetes desativadas na V2 oficial.' });
};

export const closePoll = async (req, res) => {
  return res.json({ success: true, message: 'Enquetes desativadas na V2 oficial.' });
};

export const deletePoll = async (req, res) => {
  return res.json({ success: true, message: 'Enquetes desativadas na V2 oficial.' });
};
