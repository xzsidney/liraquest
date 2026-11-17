import cron from 'node-cron';
import { FamilyMealSchedule, FamilyMeal } from '../models/index.js';

let cronTask = null;

// Map para evitar spam de alertas no mesmo minuto
const triggeredAlerts = new Set();

/**
 * Retorna o horário local no formato HH:MM e adiciona minutos se necessário
 */
function getFormattedTime(date = new Date(), addMinutes = 0) {
  const d = new Date(date.getTime() + addMinutes * 60000);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const MEAL_LABELS = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço dos Heróis',
  lanche: 'Lanche da Tarde',
  jantar: 'Jantar do Clã',
  ceia: 'Ceia / Chá da Noite',
};

/**
 * Inicializa o serviço cron de monitoramento de horários e alarmes de refeição
 */
export function initNutritionCron(io) {
  if (cronTask) {
    console.log('⚠️ [NutritionCron] Serviço de alarme já está em execução.');
    return;
  }

  console.log('⏰ [NutritionCron] Inicializando serviço de alarme e monitoramento de refeições (node-cron)...');

  // Executa a cada minuto
  cronTask = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTimeStr = getFormattedTime(now);

      // Limpar cache de alertas disparados no início de cada hora
      if (now.getMinutes() === 0) {
        triggeredAlerts.clear();
      }

      // Buscar todos os horários ativos
      const activeSchedules = await FamilyMealSchedule.findAll({
        where: { is_active: true },
      });

      if (!activeSchedules || activeSchedules.length === 0) return;

      for (const schedule of activeSchedules) {
        const scheduledTime = schedule.scheduled_time; // ex: "12:00"
        const alertMinutes = schedule.alert_minutes_before || 15;
        const advanceTimeStr = getFormattedTime(now, alertMinutes); // ex: se agora for 11:45 e alert=15 -> "12:00"

        const mealLabel = MEAL_LABELS[schedule.meal_type] || schedule.meal_type;

        // 1. Alarme de Antecedência (Preparar a mesa / A refeição está chegando)
        if (advanceTimeStr === scheduledTime) {
          const alertKey = `${schedule.family_id}-${schedule.meal_type}-pre-${scheduledTime}`;
          if (!triggeredAlerts.has(alertKey)) {
            triggeredAlerts.add(alertKey);

            const alertData = {
              family_id: schedule.family_id,
              meal_type: schedule.meal_type,
              meal_label: mealLabel,
              scheduled_time: scheduledTime,
              minutes_left: alertMinutes,
              type: 'PRE_ALERT',
              title: `🔔 Mesa em ${alertMinutes} min!`,
              message: `Atenção família! Faltam ${alertMinutes} minutos para o ${mealLabel} (${scheduledTime}). Hora de lavar as mãos e arrumar a mesa!`,
              timestamp: new Date().toISOString(),
            };

            console.log(`\n📢 [LiraQuest Alarme Pré-Refeição] ${alertData.title} -> ${alertData.message}`);

            if (io) {
              io.emit('nutrition:meal_alert', alertData);
            }

            // [WhatsApp Dispatch Ready] Preparado para conectar no bot do WhatsApp
            logWhatsAppDispatchReady(alertData);
          }
        }

        // 2. Alarme de Hora Exata (Mesa Servida / Início do Check-in dos Filhos)
        if (currentTimeStr === scheduledTime) {
          const alarmKey = `${schedule.family_id}-${schedule.meal_type}-now-${scheduledTime}`;
          if (!triggeredAlerts.has(alarmKey)) {
            triggeredAlerts.add(alarmKey);

            const alarmData = {
              family_id: schedule.family_id,
              meal_type: schedule.meal_type,
              meal_label: mealLabel,
              scheduled_time: scheduledTime,
              minutes_left: 0,
              type: 'MEAL_NOW',
              title: `🍽️ O ${mealLabel} está servido!`,
              message: `Chegou a hora! Todos os heróis à mesa para o ${mealLabel}! Check-in de presença ativo com +30 XP e +10 Ouro.`,
              timestamp: new Date().toISOString(),
            };

            console.log(`\n👑 [LiraQuest Alarme Refeição Servida] ${alarmData.title} -> ${alarmData.message}`);

            if (io) {
              io.emit('nutrition:meal_alert', alarmData);
            }

            logWhatsAppDispatchReady(alarmData);
          }
        }
      }
    } catch (err) {
      console.error('❌ Erro no ciclo do NutritionCron:', err.message);
    }
  });

  console.log('✅ [NutritionCron] Serviço ativo e monitorando horários a cada 60s.');
}

/**
 * Função mock / ponte de preparação para envio via WhatsApp API
 */
function logWhatsAppDispatchReady(payload) {
  // Pronto para conectar a bibliotecas como Baileys, Evolution API ou Z-API
  console.log(`📱 [WhatsApp API Handler Ready] Destino: Família ${payload.family_id} | Mensagem: "${payload.message}"`);
}
