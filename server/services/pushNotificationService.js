import { createRequire } from 'module';
import { FamilyPushSubscription, FamilyUser, FamilyMember } from '../models/index.js';

const require = createRequire(import.meta.url);
const webPush = require('web-push');

// Chaves VAPID oficiais do LiraQuest (com fallback para produção)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BH7NwlaSsMYnc2zfBEsrGAWVYMLPgAMnZ4LnRKxX-F1vjUXnvzFvFfg-GYSfk4fN83251GbZ3Ex8RnmX6yRO830';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '0VoOTqIiI_DO_wttKwU8KfaJZugy7uMzmId6hYFw3oc';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contato@liraquest.com.br';

try {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('🔔 [WebPush] VAPID configurado com sucesso para Web Push Notifications.');
} catch (err) {
  console.error('⚠️ [WebPush] Erro ao configurar chaves VAPID:', err.message);
}

// Templates nobres de mensagens da família
export const PUSH_TEMPLATES = {
  BREAKFAST: {
    title: '🍳 Mesa Posta: Café da Manhã!',
    body: 'O desjejum real está servido! Energia e preparo matinal para os heróis do clã.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'meal-breakfast',
    url: '/#saude',
  },
  KITCHEN: {
    title: '👨‍🍳 Aviso da Cozinha (11h15)',
    body: 'Faltam 30 min para o almoço! Cebola batida no mixer, sem óleo e carnes magras.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'kitchen-prep',
    url: '/#saude',
  },
  LUNCH: {
    title: '⚔️ Convocação: Almoço dos Heróis! (11h45)',
    body: 'Mesa posta antes da escola! Faça seu check-in e fature +30 XP e +10 Ouro!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'meal-lunch',
    url: '/#saude',
  },
  SNACK_WATER: {
    title: '💧 Poção de Cura & Lanche (16h00)',
    body: 'Pausa de regeneração de mana: beba 1 copo grande de água pura e coma uma fruta fresca!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'hydration-snack',
    url: '/#saude',
  },
  DINNER: {
    title: '🍲 Jantar do Clã Servido! (19h45)',
    body: 'Reunião familiar para o jantar leve noturno, convívio e descanso merecido.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'meal-dinner',
    url: '/#saude',
  },
  BEDTIME: {
    title: '🛏️ Descanso dos Heróis (21h30)',
    body: 'Missões cumpridas com honra! Desligar telas, escovar os dentes e sono restaurador.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'sleep-routine',
    url: '/#saude',
  },
};

/**
 * Retorna a chave pública para o frontend
 */
export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

/**
 * Registra ou atualiza a inscrição do dispositivo do usuário
 */
export async function registerSubscription({ userId, familyId, subscription, userAgent = '' }) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error('Inscrição de Push inválida ou incompleta.');
  }

  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys.p256dh;
  const auth = subscription.keys.auth;

  // Verifica se já existe esse endpoint cadastrado
  let sub = await FamilyPushSubscription.findOne({ where: { endpoint } });

  if (sub) {
    sub.user_id = userId;
    sub.family_id = familyId;
    sub.p256dh = p256dh;
    sub.auth = auth;
    sub.user_agent = userAgent;
    sub.is_active = true;
    await sub.save();
  } else {
    sub = await FamilyPushSubscription.create({
      user_id: userId,
      family_id: familyId,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent,
      is_active: true,
    });
  }

  return sub;
}

/**
 * Cancela a inscrição de um endpoint
 */
export async function unregisterSubscription(endpoint) {
  if (!endpoint) return false;
  const sub = await FamilyPushSubscription.findOne({ where: { endpoint } });
  if (sub) {
    sub.is_active = false;
    await sub.save();
    return true;
  }
  return false;
}

/**
 * Envia notificação Web Push para uma inscrição específica
 */
async function sendToSingleSubscription(sub, payload) {
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const payloadString = JSON.stringify({
    title: payload.title || '🔔 Alerta LiraQuest',
    body: payload.body || 'Nova notificação da sua família!',
    icon: payload.icon || '/assets/favicon.ico',
    badge: payload.badge || '/assets/favicon.ico',
    tag: payload.tag || 'liraquest-notification',
    url: payload.url || '/#saude',
    data: payload.data || {},
  });

  try {
    await webPush.sendNotification(pushSubscription, payloadString);
    return { success: true, endpoint: sub.endpoint };
  } catch (err) {
    // 404 ou 410 significa que o usuário revogou a permissão no navegador ou a chave expirou
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log(`🗑️ [WebPush] Inscrição expirada ou revogada (${err.statusCode}). Desativando endpoint...`);
      sub.is_active = false;
      await sub.save();
    } else {
      console.error(`❌ [WebPush] Erro ao enviar push para endpoint:`, err.message);
    }
    return { success: false, endpoint: sub.endpoint, error: err.message };
  }
}

/**
 * Envia notificação Web Push para um usuário específico em todos os seus aparelhos
 */
export async function sendPushToUser(userId, payload) {
  const subs = await FamilyPushSubscription.findAll({
    where: { user_id: userId, is_active: true },
  });

  if (!subs || subs.length === 0) {
    return { total: 0, sent: 0, message: 'Nenhum dispositivo ativo encontrado para este usuário.' };
  }

  const results = await Promise.all(subs.map((s) => sendToSingleSubscription(s, payload)));
  const successful = results.filter((r) => r.success).length;

  return { total: subs.length, sent: successful, results };
}

/**
 * Envia notificação Web Push para todos os membros de uma família
 */
export async function sendPushToFamily(familyId, payload, excludeUserId = null) {
  const whereClause = { family_id: familyId, is_active: true };

  const subs = await FamilyPushSubscription.findAll({
    where: whereClause,
  });

  const filteredSubs = excludeUserId ? subs.filter((s) => s.user_id !== excludeUserId) : subs;

  if (filteredSubs.length === 0) {
    return { total: 0, sent: 0, message: 'Nenhum dispositivo registrado na família no momento.' };
  }

  const results = await Promise.all(filteredSubs.map((s) => sendToSingleSubscription(s, payload)));
  const successful = results.filter((r) => r.success).length;

  return { total: filteredSubs.length, sent: successful, results };
}
