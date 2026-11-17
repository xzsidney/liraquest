/**
 * LiraQuest - Serviço de Alarme & Agendamento de Refeições e Hábitos (server/services/alarmService.js)
 * Fase 5: Monitoramento contínuo com node-cron, disparo de alertas com cardápio real,
 * distinção entre Rotina Certinha vs Flexível e despacho automático para o WhatsApp do Clã.
 */

import cron from 'node-cron';
import { FamilyMealSchedule, FamilyMeal, FamilyMealItem, FamilyWhatsappConfig } from '../models/index.js';
import { sendClanMessage } from './whatsappService.js';

let cronTask = null;
let ioInstance = null;

// Cache para evitar envios duplicados no mesmo minuto
const triggeredAlerts = new Set();

/**
 * Retorna o horário local no formato HH:MM (com acréscimo opcional de minutos)
 */
function getFormattedTime(date = new Date(), addMinutes = 0) {
  const d = new Date(date.getTime() + addMinutes * 60000);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MEAL_LABELS = {
  cafe: 'Café da Manhã dos Campeões',
  almoco: 'Almoço dos Heróis',
  lanche: 'Lanche & Poção de Cura',
  jantar: 'Jantar Leve em Família',
  ceia: 'Ceia / Chá Calmante',
};

/**
 * Busca refeição cadastrada para o dia
 */
async function getMealForDay(familyId, mealType) {
  try {
    const todayStr = getTodayDateString();
    const meal = await FamilyMeal.findOne({
      where: {
        family_id: familyId,
        meal_date: todayStr,
        meal_type: mealType,
      },
      include: [
        {
          model: FamilyMealItem,
          as: 'items',
        },
      ],
    });
    return meal;
  } catch (err) {
    console.error('Erro ao buscar refeição para alarme:', err.message);
    return null;
  }
}

/**
 * Determina o modo de rotina ativo para o dia na família
 */
async function getFamilyRoutineMode(familyId) {
  try {
    const todayMeal = await FamilyMeal.findOne({
      where: {
        family_id: familyId,
        meal_date: getTodayDateString(),
      },
      order: [['created_at', 'DESC']],
    });
    return todayMeal?.routine_mode || 'certinho';
  } catch (e) {
    return 'certinho';
  }
}

/**
 * Dispara alarme temático unificado (WebSocket + WhatsApp)
 */
async function dispatchAlarm({ familyId, title, message, type, mealType, scheduledTime, minutesLeft = 0 }) {
  const payload = {
    family_id: familyId,
    title,
    message,
    type,
    meal_type: mealType,
    scheduled_time: scheduledTime,
    minutes_left: minutesLeft,
    timestamp: new Date().toISOString(),
  };

  // 1. Notifica via WebSockets (para quem estiver com o jogo aberto)
  if (ioInstance) {
    ioInstance.emit('nutrition:meal_alert', payload);
    ioInstance.emit('alarm:trigger', payload);
  }

  // 2. Notifica via WhatsApp (se a família tiver WhatsApp conectado e permissão)
  try {
    const config = await FamilyWhatsappConfig.findOne({ where: { family_id: familyId } });
    if (config && config.is_connected) {
      if (type === 'HYDRATION' && !config.notify_hydration) {
        // Ignora se notificações de hidratação estiverem desativadas
        return;
      }
      if (type !== 'HYDRATION' && !config.notify_meals) {
        // Ignora se refeições estiverem desativadas
        return;
      }

      await sendClanMessage(familyId, {
        title,
        text: message,
        type: type === 'HYDRATION' ? 'HYDRATION' : (type === 'KITCHEN' ? 'KITCHEN' : 'MEAL'),
      });
    }
  } catch (err) {
    console.error('Erro ao despachar alarme para WhatsApp:', err.message);
  }
}

/**
 * Inicializa o serviço cron de monitoramento
 */
export function initAlarmService(io) {
  ioInstance = io;

  if (cronTask) {
    console.log('⚠️ [AlarmService] Monitor de alarmes já está ativo.');
    return;
  }

  console.log('⏰ [AlarmService] Inicializando monitor de alarmes com node-cron (a cada 60s)...');

  cronTask = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTimeStr = getFormattedTime(now);

      // Limpar cache de alertas na virada da hora
      if (now.getMinutes() === 0) {
        triggeredAlerts.clear();
      }

      // Buscar programações cadastradas
      const schedules = await FamilyMealSchedule.findAll({
        where: { is_active: true },
      });

      // Mapear famílias únicas com agendamentos
      const familyIds = [...new Set(schedules.map(s => s.family_id))];

      for (const familyId of familyIds) {
        const routineMode = await getFamilyRoutineMode(familyId); // 'certinho' ou 'flexivel'

        // ========================================================
        // 1. ALARMES CENTRAIS DA ROTINA DO LIRAQUEST
        // ========================================================

        // 11h15 (Aviso Cozinha): Cardápio do dia e preparo (ex: patinho moído, cebola batida, zero óleo)
        if (currentTimeStr === '11:15') {
          const alertKey = `${familyId}-kitchen-1115`;
          if (!triggeredAlerts.has(alertKey)) {
            triggeredAlerts.add(alertKey);

            const lunchMeal = await getMealForDay(familyId, 'almoco');
            const dishTitle = lunchMeal?.title || 'Patinho Moído Magro com Legumes ao Vapor';
            const notes = lunchMeal?.cooking_notes || 'Dica do Chef: Cebola batida, alho dourado e preparo sem óleo para manter o prato nutritivo!';
            const itemsList = lunchMeal?.items?.map(it => `• ${it.name} (${it.quantity_grams})`).join('\n') || '• Patinho moído (120g)\n• Arroz integral (100g)\n• Salada colorida';

            await dispatchAlarm({
              familyId,
              title: '👨‍🍳 Aviso Cozinha — Preparar Almoço dos Heróis (11h15)',
              message: `Atenção cozinha do clã! Faltam 30 minutos para o almoço dos heróis.\n\n🍛 *Cardápio de Hoje:* ${dishTitle}\n📝 *Orientações:* ${notes}\n\n*Porções Estimadas:*\n${itemsList}`,
              type: 'KITCHEN',
              mealType: 'almoco',
              scheduledTime: '11:45',
              minutesLeft: 30,
            });
          }
        }

        // 11h45 (Convocação Almoço): Convocação antes de ir para a escola
        if (currentTimeStr === '11:45') {
          const alertKey = `${familyId}-lunch-1145`;
          if (!triggeredAlerts.has(alertKey)) {
            triggeredAlerts.add(alertKey);

            await dispatchAlarm({
              familyId,
              title: '⚔️ Convocação dos Heróis: Mesa do Almoço Servida! (11h45)',
              message: `🛡️ Chamada real! Todos os heróis à mesa antes da jornada escolar!\n\n👑 *Missão Alimentar:* Check-in de presença liberado no painel da família (+30 XP e +10 Ouro).\nLavem as mãos e bom apetite!`,
              type: 'MEAL',
              mealType: 'almoco',
              scheduledTime: '11:45',
              minutesLeft: 0,
            });
          }
        }

        // 16h00 (Lanche & Poção de Cura): Hidratação + 1 fruta/iogurte da tarde
        if (currentTimeStr === '16:00') {
          const alertKey = `${familyId}-snack-1600`;
          if (!triggeredAlerts.has(alertKey)) {
            triggeredAlerts.add(alertKey);

            await dispatchAlarm({
              familyId,
              title: '💧 Lanche da Tarde & Poção de Mana e Cura (16h00)',
              message: `✨ Hora de recarregar a estamina dos heróis!\n\n💧 *Beba 1 copo grande de água fresca* (Poção de Cura +20 Mana).\n🍎 *Lanche recomendado:* 1 Fruta fresca ou iogurte natural com aveia. Mantenham o foco nos estudos e treinos!`,
              type: 'HYDRATION',
              mealType: 'lanche',
              scheduledTime: '16:00',
              minutesLeft: 0,
            });
          }
        }

        // 19h45 (Jantar em Família): Chamada para o jantar leve noturno e descanso dos heróis
        if (currentTimeStr === '19:45') {
          const alertKey = `${familyId}-dinner-1945`;
          if (!triggeredAlerts.has(alertKey)) {
            triggeredAlerts.add(alertKey);

            const dinnerMeal = await getMealForDay(familyId, 'jantar');
            const dinnerTitle = dinnerMeal?.title || 'Grelhado Leve com Legumes Refogados';
            const dinnerNotes = dinnerMeal?.cooking_notes || 'Jantar equilibrado e leve para digestão tranquila.';

            await dispatchAlarm({
              familyId,
              title: '🍲 Jantar do Clã & Descanso dos Heróis (19h45)',
              message: `🌙 O sol se põe no reino! Convocamos toda a família para o jantar leve noturno.\n\n🍲 *Prato da Noite:* ${dinnerTitle}\n✨ *Conselho Real:* ${dinnerNotes}\n\nApós o jantar, check-in no painel e descanso dos heróis para recuperar todas as energias!`,
              type: 'MEAL',
              mealType: 'jantar',
              scheduledTime: '19:45',
              minutesLeft: 0,
            });
          }
        }

        // ========================================================
        // 2. HORÁRIOS CUSTOMIZADOS CADASTRADOS EM family_meal_schedules
        // ========================================================
        const familySchedules = schedules.filter(s => s.family_id === familyId);

        for (const schedule of familySchedules) {
          // Verifica se o agendamento coincide com o modo de rotina atual
          if (schedule.routine_mode && schedule.routine_mode !== routineMode) {
            continue; // Pula se o modo for divergente (ex: rotina certinha vs flexível)
          }

          const scheduledTime = schedule.scheduled_time; // ex: "12:00"
          const alertMinutes = schedule.alert_minutes_before || 15;
          const advanceTimeStr = getFormattedTime(now, alertMinutes);
          const mealLabel = MEAL_LABELS[schedule.meal_type] || schedule.meal_type;

          // 2.1 Alarme de Antecedência
          if (advanceTimeStr === scheduledTime) {
            const preKey = `${familyId}-${schedule.meal_type}-pre-${scheduledTime}`;
            if (!triggeredAlerts.has(preKey)) {
              triggeredAlerts.add(preKey);

              await dispatchAlarm({
                familyId,
                title: `🔔 Mesa do ${mealLabel} em ${alertMinutes} min!`,
                message: `Heróis, preparem-se! Faltam ${alertMinutes} minutos para o ${mealLabel} (${scheduledTime}). Hora de organizar o ambiente e lavar as mãos!`,
                type: 'PRE_ALERT',
                mealType: schedule.meal_type,
                scheduledTime,
                minutesLeft: alertMinutes,
              });
            }
          }

          // 2.2 Alarme de Hora Exata
          if (currentTimeStr === scheduledTime) {
            const exactKey = `${familyId}-${schedule.meal_type}-now-${scheduledTime}`;
            if (!triggeredAlerts.has(exactKey)) {
              triggeredAlerts.add(exactKey);

              await dispatchAlarm({
                familyId,
                title: `🍽️ O ${mealLabel} está servido!`,
                message: `Chegou o momento! Todos os heróis convocados para a mesa do ${mealLabel}. Check-in ativo com +30 XP e +10 Ouro!`,
                type: 'MEAL',
                mealType: schedule.meal_type,
                scheduledTime,
                minutesLeft: 0,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ Erro no ciclo do AlarmService:', err.message);
    }
  });

  console.log('✅ [AlarmService] Monitor de refeições e hábitos ativo e operacional.');
}

/**
 * Função para disparar alarme manual de teste via API / Painel
 */
export async function triggerManualAlarm(familyId, alarmType = 'LUNCH_NOW') {
  let title = '⚔️ Convocação dos Heróis';
  let message = 'Mesa servida para a família! Check-in ativo com +30 XP!';
  let type = 'MEAL';
  let mealType = 'almoco';

  if (alarmType === 'KITCHEN') {
    title = '👨‍🍳 Aviso Cozinha — Preparar Almoço dos Heróis (11h15)';
    message = 'Cardápio do dia: Patinho moído magro com cebola batida e legumes ao vapor!';
    type = 'KITCHEN';
  } else if (alarmType === 'HYDRATION') {
    title = '💧 Lanche da Tarde & Poção de Mana e Cura (16h00)';
    message = 'Beba 1 copo de água pura e consuma uma fruta fresca para restaurar sua mana!';
    type = 'HYDRATION';
    mealType = 'lanche';
  } else if (alarmType === 'DINNER') {
    title = '🍲 Jantar do Clã & Descanso dos Heróis (19h45)';
    message = 'Jantar leve servido! Preparem-se para o descanso merecido dos heróis da casa.';
    mealType = 'jantar';
  }

  await dispatchAlarm({
    familyId,
    title,
    message,
    type,
    mealType,
    scheduledTime: getFormattedTime(new Date()),
    minutesLeft: 0,
  });

  return { success: true, title, message };
}

export default {
  initAlarmService,
  triggerManualAlarm,
};
