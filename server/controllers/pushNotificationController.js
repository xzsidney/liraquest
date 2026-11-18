import {
  getVapidPublicKey,
  registerSubscription,
  unregisterSubscription,
  sendPushToUser,
  sendPushToFamily,
  PUSH_TEMPLATES,
} from '../services/pushNotificationService.js';
import { FamilyPushSubscription, FamilyMember } from '../models/index.js';
import { findOrCreateUserFamily } from './userProgressController.js';

async function resolveFamilyId(user) {
  if (user?.family_id) return user.family_id;
  const membership = await findOrCreateUserFamily(user.id);
  return membership?.family_id || null;
}

/**
 * Retorna a chave pública VAPID necessária para o navegador registrar a subscrição
 */
export async function getPublicKey(req, res) {
  try {
    const key = getVapidPublicKey();
    return res.json({ success: true, publicKey: key });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao obter chave pública VAPID.', error: err.message });
  }
}

/**
 * Registra a subscrição enviada pelo navegador do usuário
 */
export async function subscribe(req, res) {
  try {
    const userId = req.user?.id;
    const familyId = await resolveFamilyId(req.user);

    if (!userId || !familyId) {
      return res.status(400).json({ success: false, message: 'Família não encontrada para este usuário.' });
    }

    const { subscription, userAgent } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Objeto de inscrição do navegador ausente.' });
    }

    const saved = await registerSubscription({
      userId,
      familyId,
      subscription,
      userAgent: userAgent || req.headers['user-agent'] || '',
    });

    // Envia uma notificação inicial de boas-vindas para confirmar o funcionamento
    sendPushToUser(userId, {
      title: '👑 Notificações do Clã Ativadas!',
      body: 'Seu celular está conectado ao LiraQuest! Você receberá os avisos da família mesmo com a tela bloqueada.',
      tag: 'welcome-push',
      url: '/#saude',
    }).catch((e) => console.log('Push de boas-vindas não entregue:', e.message));

    return res.json({
      success: true,
      message: 'Aparelho cadastrado com sucesso para Notificações do Clã!',
      subscriptionId: saved.id,
    });
  } catch (err) {
    console.error('Erro ao registrar Push Subscription:', err);
    return res.status(500).json({ success: false, message: 'Falha ao registrar notificação no dispositivo.', error: err.message });
  }
}

/**
 * Cancela a inscrição de um aparelho
 */
export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'Endpoint ausente.' });
    }

    const result = await unregisterSubscription(endpoint);
    return res.json({ success: true, message: result ? 'Notificações desativadas para este aparelho.' : 'Aparelho não encontrado.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao desativar notificações.', error: err.message });
  }
}

/**
 * Retorna o status de inscrições ativas da família
 */
export async function getStatus(req, res) {
  try {
    const userId = req.user?.id;
    const familyId = await resolveFamilyId(req.user);

    if (!familyId) {
      return res.json({ success: true, totalDevices: 0, myDevices: 0, membersWithDevices: 0, hasActiveSubscription: false });
    }

    const allSubs = await FamilyPushSubscription.findAll({
      where: { family_id: familyId, is_active: true },
    });

    const mySubs = allSubs.filter((s) => s.user_id === userId);
    const uniqueUsers = new Set(allSubs.map((s) => s.user_id));

    return res.json({
      success: true,
      totalDevices: allSubs.length,
      myDevices: mySubs.length,
      membersWithDevices: uniqueUsers.size,
      hasActiveSubscription: mySubs.length > 0,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao consultar status do Web Push.', error: err.message });
  }
}

/**
 * Envia notificação de teste imediata para o próprio usuário
 */
export async function testPush(req, res) {
  try {
    const userId = req.user?.id;
    const result = await sendPushToUser(userId, {
      title: '⚔️ Teste do LiraQuest Nobre!',
      body: 'Seu celular recebeu a transmissão com sucesso! A conexão com o Reino está perfeita.',
      tag: 'test-push',
      url: '/#saude',
    });

    return res.json({
      success: true,
      message: result.sent > 0 ? 'Notificação de teste enviada para o seu celular!' : 'Nenhum celular ativo encontrado. Ative as notificações no botão abaixo.',
      details: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao disparar teste.', error: err.message });
  }
}

/**
 * Disparo para a família inteira (Pais e Guardiões)
 */
export async function broadcastFamily(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { template_code, custom_text } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não encontrada para este usuário.' });
    }

    let payload = null;

    if (template_code && PUSH_TEMPLATES[template_code]) {
      payload = { ...PUSH_TEMPLATES[template_code] };
    } else if (custom_text && custom_text.trim().length > 0) {
      payload = {
        title: `📢 Comunicado do Guardião (${req.user?.name || 'Pai'})`,
        body: custom_text.trim(),
        tag: 'custom-broadcast',
        url: '/#saude',
      };
    } else {
      return res.status(400).json({ success: false, message: 'Informe um template válido ou uma mensagem de texto.' });
    }

    const result = await sendPushToFamily(familyId, payload);

    return res.json({
      success: true,
      message: result.sent > 0 ? `Mensagem disparada com sucesso para ${result.sent} aparelho(s) da família!` : 'Nenhum aparelho ativo na família recebeu a mensagem.',
      details: result,
      payload,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao disparar comunicado para a família.', error: err.message });
  }
}
