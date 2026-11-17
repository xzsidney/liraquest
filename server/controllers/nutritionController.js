import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import {
  FamilyMealSchedule,
  FamilyMeal,
  FamilyMealItem,
  FamilyMealCheckin,
  FamilyShoppingItem,
  Family,
  FamilyMember,
  FamilyUser,
  Character,
  CharacterClass,
  UserProgress,
} from '../models/index.js';
import { findOrCreateUserFamily } from './userProgressController.js';

// Função auxiliar para obter a data local no formato YYYY-MM-DD
function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.toISOString().split('T')[0];
}

// Configurações padrão de horários para famílias recém-criadas
const DEFAULT_SCHEDULES = [
  { meal_type: 'cafe', scheduled_time: '07:30', routine_mode: 'certinho', alert_minutes_before: 15 },
  { meal_type: 'almoco', scheduled_time: '12:00', routine_mode: 'certinho', alert_minutes_before: 20 },
  { meal_type: 'lanche', scheduled_time: '16:00', routine_mode: 'certinho', alert_minutes_before: 15 },
  { meal_type: 'jantar', scheduled_time: '19:30', routine_mode: 'certinho', alert_minutes_before: 20 },
  { meal_type: 'ceia', scheduled_time: '21:30', routine_mode: 'certinho', alert_minutes_before: 10 },
];

// Refeições padrão iniciais
const DEFAULT_MEALS_SEED = [
  {
    meal_type: 'cafe',
    title: 'Ovos Mexidos Dourados com Aveia & Fruta',
    cooking_notes: 'Fogo baixo, sem óleo. Polvilhar canela na fruta.',
    routine_mode: 'certinho',
    items: [
      { name: 'Ovos Caipiras', quantity_grams: '2 unidades', category: 'proteina', health_tags: 'energia,vesicula_segura' },
      { name: 'Aveia em Flocos Finos', quantity_grams: '30g', category: 'carboidrato', health_tags: 'fibras,baixo_indice_glicemico' },
      { name: 'Banana Prata', quantity_grams: '1 unidade', category: 'fruta', health_tags: 'potassio' },
    ],
  },
  {
    meal_type: 'almoco',
    title: 'Patinho Moído com Cenoura Invisível & Arroz',
    cooking_notes: 'Zero óleo. Cebola e alho batidos no mixer. Cenoura ralada ultrafina cozida no vapor que se desmancha no molho.',
    routine_mode: 'certinho',
    items: [
      { name: 'Patinho Bovino Moído', quantity_grams: '150g', category: 'proteina', health_tags: 'ferro,vesicula_segura' },
      { name: 'Arroz Integral Cozido', quantity_grams: '80g', category: 'carboidrato', health_tags: 'baixo_indice_glicemico' },
      { name: 'Cenoura Invisível no Molho', quantity_grams: '60g', category: 'legume', health_tags: 'vitaminas' },
      { name: 'Salada Verde Refrescante', quantity_grams: 'À vontade', category: 'salada', health_tags: 'antioxidante' },
    ],
  },
  {
    meal_type: 'lanche',
    title: 'Iogurte Natural com Maçã & Canela',
    cooking_notes: 'Maçã em cubinhos finos com canela em pó para adoçar naturalmente.',
    routine_mode: 'certinho',
    items: [
      { name: 'Iogurte Natural Desnatado', quantity_grams: '170g', category: 'proteina', health_tags: 'probioticos,leve' },
      { name: 'Maçã Vermelha Picadinha', quantity_grams: '1 unidade', category: 'fruta', health_tags: 'fibras' },
    ],
  },
  {
    meal_type: 'jantar',
    title: 'Peito de Frango Grelhado com Purê Dourado e Brócolis',
    cooking_notes: 'Frango marinado no limão e ervas finas. Purê de mandioquinha sem leite gorduroso e brócolis no vapor.',
    routine_mode: 'certinho',
    items: [
      { name: 'Filé de Peito de Frango', quantity_grams: '140g', category: 'proteina', health_tags: 'pre_operatorio,vesicula_segura' },
      { name: 'Purê de Mandioquinha Leve', quantity_grams: '100g', category: 'carboidrato', health_tags: 'digestao_facil' },
      { name: 'Brócolis Ninja no Vapor', quantity_grams: '80g', category: 'legume', health_tags: 'antiinflamatorio' },
    ],
  },
  {
    meal_type: 'ceia',
    title: 'Chá de Ervas Nobres & Mix de Castanhas',
    cooking_notes: 'Água fervente infusão de 5 minutos. Servir morno para acalmar.',
    routine_mode: 'certinho',
    items: [
      { name: 'Chá de Camomila & Erva Doce', quantity_grams: '200ml', category: 'bebida', health_tags: 'sono_reparador' },
      { name: 'Castanhas do Pará', quantity_grams: '15g', category: 'oleaginosa', health_tags: 'selenio' },
    ],
  },
];

// Lista de compras padrão inicial
const DEFAULT_SHOPPING_SEED = [
  // Abastecimento do Mês
  { name: 'Patinho Bovino Moído Fresco', quantity: '2 kg', category: 'mensal_abastecimento' },
  { name: 'Filé de Peito de Frango', quantity: '3 kg', category: 'mensal_abastecimento' },
  { name: 'Ovos Caipiras Grandes', quantity: '2 cartelas (60 un)', category: 'mensal_abastecimento' },
  { name: 'Arroz Integral Agulhinha', quantity: '5 kg', category: 'mensal_abastecimento' },
  { name: 'Aveia em Flocos Finos', quantity: '1 kg', category: 'mensal_abastecimento' },
  { name: 'Azeite de Oliva Extra Virgem', quantity: '500 ml', category: 'mensal_abastecimento' },

  // Feira da Semana
  { name: 'Cenouras Frescas Crocantes', quantity: '1 kg', category: 'semanal_feira' },
  { name: 'Brócolis Ninja Orgânico', quantity: '2 maços', category: 'semanal_feira' },
  { name: 'Banana Prata Madura', quantity: '1 dúzia', category: 'semanal_feira' },
  { name: 'Maçãs Gala Vermelhas', quantity: '1 kg', category: 'semanal_feira' },
  { name: 'Alface Americana Hidropônica', quantity: '2 pés', category: 'semanal_feira' },
  { name: 'Limão Taiti para Marinadas', quantity: '1 kg', category: 'semanal_feira' },
  { name: 'Mandioquinha / Batata Baroa', quantity: '1 kg', category: 'semanal_feira' },
];

/**
 * Garante horários cadastrados para a família
 */
async function ensureFamilySchedules(familyId) {
  let schedules = await FamilyMealSchedule.findAll({
    where: { family_id: familyId },
    order: [['scheduled_time', 'ASC']],
  });

  if (!schedules || schedules.length === 0) {
    const toCreate = DEFAULT_SCHEDULES.map((s) => ({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      ...s,
    }));
    schedules = await FamilyMealSchedule.bulkCreate(toCreate);
  }

  return schedules;
}

/**
 * Garante pratos do dia para a família
 */
async function ensureTodayMeals(familyId, dateStr) {
  let meals = await FamilyMeal.findAll({
    where: { family_id: familyId, meal_date: dateStr },
    include: [{ model: FamilyMealItem, as: 'items' }],
    order: [['created_at', 'ASC']],
  });

  if (!meals || meals.length === 0) {
    for (const d of DEFAULT_MEALS_SEED) {
      const meal = await FamilyMeal.create({
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        meal_date: dateStr,
        meal_type: d.meal_type,
        title: d.title,
        cooking_notes: d.cooking_notes,
        routine_mode: d.routine_mode,
      });

      if (d.items && d.items.length > 0) {
        const itemsToCreate = d.items.map((it) => ({
          id: randomUUID().toLowerCase(),
          meal_id: meal.id,
          name: it.name,
          quantity_grams: it.quantity_grams,
          category: it.category,
          health_tags: it.health_tags,
        }));
        await FamilyMealItem.bulkCreate(itemsToCreate);
      }
    }

    meals = await FamilyMeal.findAll({
      where: { family_id: familyId, meal_date: dateStr },
      include: [{ model: FamilyMealItem, as: 'items' }],
      order: [['created_at', 'ASC']],
    });
  }

  return meals;
}

/**
 * Garante lista de compras padrão para a família
 */
async function ensureFamilyShopping(familyId) {
  let items = await FamilyShoppingItem.findAll({
    where: { family_id: familyId },
    order: [['created_at', 'ASC']],
  });

  if (!items || items.length === 0) {
    const toCreate = DEFAULT_SHOPPING_SEED.map((it) => ({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      ...it,
      is_purchased: false,
    }));
    items = await FamilyShoppingItem.bulkCreate(toCreate);
  }

  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/nutrition/today
// ─────────────────────────────────────────────────────────────────────────────
export const getTodayMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma família encontrada para o usuário.',
      });
    }

    const familyId = membership.family_id;
    const todayStr = req.query.date || getLocalDateString();

    // 1. Horários
    const schedules = await ensureFamilySchedules(familyId);

    // 2. Modo de rotina predominante
    const routineMode = schedules.some((s) => s.routine_mode === 'flexivel') ? 'flexivel' : 'certinho';

    // 3. Refeições de hoje com itens
    const meals = await ensureTodayMeals(familyId, todayStr);

    // 4. Membros e heróis dos filhos da família
    const familyMembers = await FamilyMember.findAll({
      where: { family_id: familyId },
      include: [
        {
          model: FamilyUser,
          as: 'user',
          attributes: ['id', 'name', 'role', 'profile_photo_url'],
          include: [{ model: Character, as: 'character' }],
        },
      ],
    });

    const children = familyMembers
      .map((m) => m.user)
      .filter((u) => u && (u.role === 'CHILD' || u.role === 'MEMBER' || u.character));

    // 5. Check-ins de hoje
    const checkins = await FamilyMealCheckin.findAll({
      where: { family_id: familyId, meal_date: todayStr },
      include: [
        { model: FamilyUser, as: 'user', attributes: ['id', 'name', 'role'] },
        { model: Character, as: 'character', attributes: ['id', 'name', 'avatar_value', 'gold'] },
      ],
    });

    return res.json({
      success: true,
      today: todayStr,
      routine_mode: routineMode,
      schedules,
      meals,
      children,
      checkins,
    });
  } catch (error) {
    console.error('❌ Erro em getTodayMenu:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar cardápio do dia.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/nutrition/week
// ─────────────────────────────────────────────────────────────────────────────
export const getWeekMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma família encontrada para o usuário.',
      });
    }

    const familyId = membership.family_id;

    // Calcular Segunda a Domingo da semana atual
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d.toISOString().split('T')[0]);
    }

    const startDate = weekDays[0];
    const endDate = weekDays[6];

    // Buscar todas as refeições cadastradas no intervalo
    const meals = await FamilyMeal.findAll({
      where: {
        family_id: familyId,
        meal_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: FamilyMealItem, as: 'items' }],
      order: [['meal_date', 'ASC'], ['created_at', 'ASC']],
    });

    // Se o dia de hoje estiver nessa semana e não tiver refeição, garantir as refeições de hoje
    const todayStr = getLocalDateString();
    if (weekDays.includes(todayStr) && !meals.some((m) => m.meal_date === todayStr)) {
      await ensureTodayMeals(familyId, todayStr);
    }

    // Recarregar refeições completas
    const fullWeekMeals = await FamilyMeal.findAll({
      where: {
        family_id: familyId,
        meal_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: FamilyMealItem, as: 'items' }],
      order: [['meal_date', 'ASC'], ['created_at', 'ASC']],
    });

    const schedules = await ensureFamilySchedules(familyId);

    return res.json({
      success: true,
      startDate,
      endDate,
      weekDays,
      schedules,
      meals: fullWeekMeals,
    });
  } catch (error) {
    console.error('❌ Erro em getWeekMenu:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar cardápio da semana.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/nutrition/meal (Salva ou edita prato e ingredientes)
// ─────────────────────────────────────────────────────────────────────────────
export const saveMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma família encontrada para o usuário.',
      });
    }

    const familyId = membership.family_id;
    const { id, meal_date, meal_type, title, cooking_notes, routine_mode, items } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'O nome do prato é obrigatório.',
      });
    }

    const targetDate = meal_date || getLocalDateString();
    const targetType = meal_type || 'almoco';

    let meal;
    if (id) {
      meal = await FamilyMeal.findOne({ where: { id, family_id: familyId } });
      if (!meal) {
        return res.status(404).json({ success: false, message: 'Prato não encontrado para edição.' });
      }
      await meal.update({
        title: title.trim(),
        cooking_notes: cooking_notes || '',
        routine_mode: routine_mode || 'certinho',
        meal_date: targetDate,
        meal_type: targetType,
      });

      // Atualizar itens: remover antigos e reinserir
      await FamilyMealItem.destroy({ where: { meal_id: meal.id } });
    } else {
      meal = await FamilyMeal.create({
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        meal_date: targetDate,
        meal_type: targetType,
        title: title.trim(),
        cooking_notes: cooking_notes || '',
        routine_mode: routine_mode || 'certinho',
      });
    }

    // Inserir itens
    if (Array.isArray(items) && items.length > 0) {
      const itemsToCreate = items
        .filter((it) => it && it.name && it.name.trim().length > 0)
        .map((it) => ({
          id: randomUUID().toLowerCase(),
          meal_id: meal.id,
          name: it.name.trim(),
          quantity_grams: it.quantity_grams || '100g',
          category: it.category || 'proteina',
          health_tags: it.health_tags || '',
        }));

      if (itemsToCreate.length > 0) {
        await FamilyMealItem.bulkCreate(itemsToCreate);
      }
    }

    const updatedMeal = await FamilyMeal.findByPk(meal.id, {
      include: [{ model: FamilyMealItem, as: 'items' }],
    });

    return res.status(201).json({
      success: true,
      message: 'Prato e ingredientes salvos com sucesso no cardápio!',
      meal: updatedMeal,
    });
  } catch (error) {
    console.error('❌ Erro em saveMeal:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao salvar refeição.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. DELETE /api/nutrition/meal/:mealId
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealId } = req.params;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const meal = await FamilyMeal.findOne({ where: { id: mealId, family_id: membership.family_id } });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Prato não encontrado.' });
    }

    await FamilyMealItem.destroy({ where: { meal_id: meal.id } });
    await meal.destroy();

    return res.json({
      success: true,
      message: 'Prato removido do cardápio com sucesso!',
    });
  } catch (error) {
    console.error('❌ Erro em deleteMeal:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao remover prato.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST /api/nutrition/checkin (Mecânica do Paulinho & Validação dos Pais)
// ─────────────────────────────────────────────────────────────────────────────
export const checkinMeal = async (req, res) => {
  try {
    const validatorId = req.user.id;
    const {
      user_id,
      character_id,
      meal_id,
      meal_date,
      meal_type,
      status, // 'no_horario', 'atrasado', 'faltou'
      penalty_note,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'O identificador do filho/herói é obrigatório.',
      });
    }

    if (!['no_horario', 'atrasado', 'faltou'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status de check-in inválido. Use no_horario, atrasado ou faltou.',
      });
    }

    const membership = await findOrCreateUserFamily(validatorId);
    const familyId = membership?.family_id;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const targetDate = meal_date || getLocalDateString();
    const targetType = meal_type || 'almoco';

    // Determinar bonificação
    let xpAward = 0;
    let goldAward = 0;
    let energyBonus = 0;
    let feedbackMsg = '';

    if (status === 'no_horario') {
      xpAward = 30;
      goldAward = 10;
      energyBonus = 100; // Enche a energia de aventura do herói!
      feedbackMsg = '⭐ Excelente pontualidade! +30 XP, +10 Moedas de Ouro e Energia de Aventura Restaurada!';
    } else if (status === 'atrasado') {
      xpAward = 10;
      goldAward = 0;
      feedbackMsg = '⚠️ Chegou atrasado à mesa: Bonificação reduzida para +10 XP.';
    } else {
      // faltou
      xpAward = 0;
      goldAward = 0;
      feedbackMsg = `❌ Falta registrada: Penalidade/Advertência gravada no histórico do herói (${penalty_note || 'Não compareceu à refeição'}).`;
    }

    // Buscar ou vincular herói
    let hero = null;
    if (character_id) {
      hero = await Character.findByPk(character_id);
    } else {
      hero = await Character.findOne({ where: { user_id } });
    }

    let leveledUp = false;
    let newLevel = 1;

    // Se houver herói e bonificação, credita XP e Ouro
    if (hero) {
      if (goldAward > 0) {
        await hero.update({ gold: (hero.gold || 0) + goldAward });
      }

      if (xpAward > 0 && hero.current_class_id) {
        const classProgress = await CharacterClass.findOne({
          where: { character_id: hero.id, class_id: hero.current_class_id },
        });

        if (classProgress) {
          let currentXP = classProgress.xp + xpAward;
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

    // Atualizar UserProgress (encher energia e streak)
    let progress = await UserProgress.findOne({ where: { user_id } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id,
        adventure_energy: 100,
        family_tokens: 0,
      });
    } else if (status === 'no_horario') {
      await progress.update({
        adventure_energy: Math.max(100, progress.adventure_energy + 25),
      });
    }

    // Registrar ou atualizar Checkin no banco
    let checkin = await FamilyMealCheckin.findOne({
      where: {
        family_id: familyId,
        user_id,
        meal_date: targetDate,
        meal_type: targetType,
      },
    });

    if (checkin) {
      await checkin.update({
        meal_id: meal_id || checkin.meal_id,
        character_id: hero ? hero.id : checkin.character_id,
        status,
        xp_awarded: xpAward,
        gold_awarded: goldAward,
        penalty_note: penalty_note || (status === 'faltou' ? 'Falta à mesa' : null),
        validated_by: validatorId,
      });
    } else {
      checkin = await FamilyMealCheckin.create({
        id: randomUUID().toLowerCase(),
        family_id: familyId,
        meal_id: meal_id || null,
        user_id,
        character_id: hero ? hero.id : null,
        meal_date: targetDate,
        meal_type: targetType,
        status,
        xp_awarded: xpAward,
        gold_awarded: goldAward,
        penalty_note: penalty_note || (status === 'faltou' ? 'Falta à mesa' : null),
        validated_by: validatorId,
      });
    }

    return res.json({
      success: true,
      message: feedbackMsg,
      checkin,
      rewards: {
        xp: xpAward,
        gold: goldAward,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      },
    });
  } catch (error) {
    console.error('❌ Erro em checkinMeal:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao validar presença na refeição.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /api/nutrition/shopping & POST /api/nutrition/shopping/toggle
// ─────────────────────────────────────────────────────────────────────────────
export const getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;
    const items = await ensureFamilyShopping(familyId);

    const mensal = items.filter((it) => it.category === 'mensal_abastecimento');
    const feira = items.filter((it) => it.category === 'semanal_feira');

    return res.json({
      success: true,
      mensal,
      feira,
      totalCount: items.length,
      purchasedCount: items.filter((it) => it.is_purchased).length,
    });
  } catch (error) {
    console.error('❌ Erro em getShoppingList:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar lista de compras.',
      error: error.message,
    });
  }
};

export const toggleShoppingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, is_purchased } = req.body;

    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const item = await FamilyShoppingItem.findOne({
      where: { id: itemId, family_id: membership.family_id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item de compra não encontrado.' });
    }

    const newStatus = typeof is_purchased === 'boolean' ? is_purchased : !item.is_purchased;
    await item.update({ is_purchased: newStatus });

    return res.json({
      success: true,
      message: newStatus ? 'Item marcado como comprado! 🛒' : 'Item desmarcado.',
      item,
    });
  } catch (error) {
    console.error('❌ Erro em toggleShoppingItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao alterar item de compra.',
      error: error.message,
    });
  }
};

export const addShoppingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, quantity, category } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'O nome do item é obrigatório.' });
    }

    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const validCategory = ['mensal_abastecimento', 'semanal_feira'].includes(category)
      ? category
      : 'semanal_feira';

    const newItem = await FamilyShoppingItem.create({
      id: randomUUID().toLowerCase(),
      family_id: membership.family_id,
      name: name.trim(),
      quantity: quantity || '1 un',
      category: validCategory,
      is_purchased: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Item adicionado à lista de compras com sucesso!',
      item: newItem,
    });
  } catch (error) {
    console.error('❌ Erro em addShoppingItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao adicionar item de compras.',
      error: error.message,
    });
  }
};

export const deleteShoppingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const item = await FamilyShoppingItem.findOne({
      where: { id: itemId, family_id: membership.family_id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item não encontrado.' });
    }

    await item.destroy();

    return res.json({
      success: true,
      message: 'Item removido da lista de compras com sucesso!',
    });
  } catch (error) {
    console.error('❌ Erro em deleteShoppingItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao excluir item de compras.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/nutrition/schedule & PUT /api/nutrition/schedule
// ─────────────────────────────────────────────────────────────────────────────
export const getSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const schedules = await ensureFamilySchedules(membership.family_id);
    const routineMode = schedules.some((s) => s.routine_mode === 'flexivel') ? 'flexivel' : 'certinho';

    return res.json({
      success: true,
      routine_mode: routineMode,
      schedules,
    });
  } catch (error) {
    console.error('❌ Erro em getSchedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar horários.',
      error: error.message,
    });
  }
};

export const updateSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routine_mode, schedules } = req.body;

    const membership = await findOrCreateUserFamily(userId);
    if (!membership || !membership.family_id) {
      return res.status(400).json({ success: false, message: 'Família não encontrada.' });
    }

    const familyId = membership.family_id;

    // Atualizar modo global de rotina caso enviado
    if (routine_mode && ['certinho', 'flexivel'].includes(routine_mode)) {
      await FamilyMealSchedule.update(
        { routine_mode },
        { where: { family_id: familyId } }
      );
      await FamilyMeal.update(
        { routine_mode },
        { where: { family_id: familyId, meal_date: getLocalDateString() } }
      );
    }

    // Se vier array de horários customizados, atualizar cada um
    if (Array.isArray(schedules)) {
      for (const s of schedules) {
        if (s.id) {
          await FamilyMealSchedule.update(
            {
              scheduled_time: s.scheduled_time,
              alert_minutes_before: s.alert_minutes_before,
              is_active: typeof s.is_active === 'boolean' ? s.is_active : true,
              routine_mode: s.routine_mode || routine_mode || 'certinho',
            },
            { where: { id: s.id, family_id: familyId } }
          );
        }
      }
    }

    const updatedSchedules = await FamilyMealSchedule.findAll({
      where: { family_id: familyId },
      order: [['scheduled_time', 'ASC']],
    });

    return res.json({
      success: true,
      message: `Configuração de horários e modo ${routine_mode || 'atual'} atualizados com sucesso!`,
      schedules: updatedSchedules,
      routine_mode: routine_mode || 'certinho',
    });
  } catch (error) {
    console.error('❌ Erro em updateSchedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar horários.',
      error: error.message,
    });
  }
};
