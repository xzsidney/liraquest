/**
 * LiraQuest - Central de Mensageria & Integração com WhatsApp (Meta Cloud API Oficial & Automática)
 * Disparo automático para todos os membros cadastrados da família sem necessidade de QR Code.
 */

import { FamilyWhatsappConfig, Family, FamilyMember, FamilyUser } from '../models/index.js';

let ioInstance = null;

export function setWhatsAppSocketIO(io) {
  ioInstance = io;
}

/**
 * Retorna credenciais ativas da Meta Cloud API (do .env ou de session_data da família)
 */
export function getMetaCredentials(config) {
  let sessionData = {};
  try {
    if (config?.session_data) {
      sessionData = JSON.parse(config.session_data);
    }
  } catch (e) {}

  const phoneNumberId = sessionData.meta_phone_number_id || process.env.META_WA_PHONE_NUMBER_ID || '';
  const accessToken = sessionData.meta_access_token || process.env.META_WA_ACCESS_TOKEN || '';

  return {
    phoneNumberId,
    accessToken,
    isConfigured: Boolean(phoneNumberId && accessToken),
  };
}

/**
 * Busca todos os telefones válidos dos membros da família cadastrados no banco
 */
export async function getFamilyMemberPhones(familyId) {
  const members = await FamilyMember.findAll({
    where: { family_id: familyId },
    include: [
      {
        model: FamilyUser,
        as: 'user',
        attributes: ['id', 'name', 'phone', 'role'],
      },
    ],
  });

  const recipients = [];
  for (const m of members) {
    if (m.user) {
      const rawPhone = m.user.phone || '';
      const clean = rawPhone.replace(/\D/g, '');
      const formatted = clean.length >= 10 ? (clean.startsWith('55') ? clean : `55${clean}`) : null;

      recipients.push({
        user_id: m.user.id,
        name: m.user.name,
        role: m.user.role,
        raw_phone: rawPhone,
        phone: formatted,
        has_phone: Boolean(formatted),
      });
    }
  }

  return recipients;
}

/**
 * Envia mensagem real via Meta Cloud API Oficial (WhatsApp Business Graph API)
 */
export async function sendMetaCloudMessage({ phoneNumberId, accessToken, toPhone, messageBody }) {
  try {
    const cleanPhone = toPhone.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    console.log(`🌐 [Meta Cloud API Dispatch] Enviando para ${cleanPhone}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`❌ [Meta Cloud API Erro] Falha no envio para ${cleanPhone}:`, data);
      return { success: false, phone: cleanPhone, error: data };
    }

    console.log(`✅ [Meta Cloud API Sucesso] Mensagem entregue para ${cleanPhone}! ID:`, data.messages?.[0]?.id);
    return { success: true, phone: cleanPhone, data };
  } catch (err) {
    console.error(`❌ [Meta Cloud API Exception]:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Obtém configuração do WhatsApp da família com a lista de membros e seus telefones
 */
export async function getFamilyConfig(familyId) {
  let config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (!config) {
    config = await FamilyWhatsappConfig.create({
      family_id: familyId,
      group_id_or_phone: '',
      is_connected: true, // No modo Meta API Oficial, o sistema já opera conectado por padrão
      notify_meals: true,
      notify_hydration: true,
      session_data: null,
    });
  }

  const metaCreds = getMetaCredentials(config);
  const members = await getFamilyMemberPhones(familyId);

  return {
    id: config.id,
    family_id: config.family_id,
    group_id_or_phone: config.group_id_or_phone,
    is_connected: config.is_connected || metaCreds.isConfigured,
    notify_meals: config.notify_meals,
    notify_hydration: config.notify_hydration,
    meta_configured: metaCreds.isConfigured,
    meta_phone_number_id: metaCreds.phoneNumberId ? `${metaCreds.phoneNumberId.substring(0, 4)}...${metaCreds.phoneNumberId.slice(-4)}` : '',
    members,
    updated_at: config.updated_at,
  };
}

/**
 * Atualiza configurações de destino e notificações da família
 */
export async function updateFamilyConfig(familyId, { group_id_or_phone, notify_meals, notify_hydration, meta_phone_number_id, meta_access_token }) {
  let config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (!config) {
    config = await FamilyWhatsappConfig.create({
      family_id: familyId,
      group_id_or_phone: group_id_or_phone || '',
      is_connected: true,
      notify_meals: notify_meals !== undefined ? notify_meals : true,
      notify_hydration: notify_hydration !== undefined ? notify_hydration : true,
    });
  } else {
    if (group_id_or_phone !== undefined) config.group_id_or_phone = group_id_or_phone;
    if (notify_meals !== undefined) config.notify_meals = notify_meals;
    if (notify_hydration !== undefined) config.notify_hydration = notify_hydration;
    config.is_connected = true;

    // Se foram fornecidas credenciais da Meta
    if (meta_phone_number_id || meta_access_token) {
      let currentSession = {};
      try {
        if (config.session_data) currentSession = JSON.parse(config.session_data);
      } catch (e) {}

      if (meta_phone_number_id) currentSession.meta_phone_number_id = meta_phone_number_id.trim();
      if (meta_access_token) currentSession.meta_access_token = meta_access_token.trim();

      config.session_data = JSON.stringify(currentSession);
    }

    await config.save();
  }

  return config;
}

/**
 * Atualiza o telefone de um membro da família no cadastro de usuários
 */
export async function updateMemberPhone(userId, rawPhone) {
  const user = await FamilyUser.findByPk(userId);
  if (!user) return null;

  user.phone = rawPhone ? rawPhone.trim() : null;
  await user.save();
  return user;
}

/**
 * Dispara mensagem para toda a família (via Meta Cloud API e WebSockets)
 */
export async function sendClanMessage(familyId, { text, title, type = 'ALERT', phoneOverride }) {
  const config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  const metaCreds = getMetaCredentials(config);
  const members = await getFamilyMemberPhones(familyId);

  // Montar lista de telefones de destino
  const targetPhones = new Set();

  if (phoneOverride) {
    const clean = phoneOverride.replace(/\D/g, '');
    if (clean) targetPhones.add(clean.startsWith('55') ? clean : `55${clean}`);
  } else {
    // 1. Telefones de todos os membros cadastrados na família
    for (const m of members) {
      if (m.phone) targetPhones.add(m.phone);
    }
    // 2. Telefone/Grupo adicional cadastrado na configuração
    if (config?.group_id_or_phone) {
      const clean = config.group_id_or_phone.replace(/\D/g, '');
      if (clean) targetPhones.add(clean.startsWith('55') ? clean : `55${clean}`);
    }
  }

  // Montar texto com layout oficial épico
  const headerIcon = type === 'MEAL' ? '🍽️' : (type === 'HYDRATION' ? '💧' : (type === 'KITCHEN' ? '👨‍🍳' : '📢'));
  const formattedMessage = [
    `🏰 *LIRAQUEST — O REINO FAMILIAR* 🏰`,
    `----------------------------------------`,
    `${headerIcon} *${title || 'Comunicado dos Guardiões'}*`,
    `----------------------------------------`,
    text,
    `----------------------------------------`,
    `⚔️ _Mantenha a honra do clã e acumule XP!_ 🛡️`,
  ].join('\n');

  console.log(`\n====================================================`);
  console.log(`📱 [WhatsApp Clã Dispatch] Total Destinatários: ${targetPhones.size}`);
  console.log(`Destinos:`, [...targetPhones]);
  console.log(formattedMessage);
  console.log(`====================================================\n`);

  // Disparo real via Meta Cloud API Oficial (se configurada)
  const metaDispatchResults = [];
  if (metaCreds.isConfigured && targetPhones.size > 0) {
    for (const phone of targetPhones) {
      const res = await sendMetaCloudMessage({
        phoneNumberId: metaCreds.phoneNumberId,
        accessToken: metaCreds.accessToken,
        toPhone: phone,
        messageBody: formattedMessage,
      });
      metaDispatchResults.push(res);
    }
  }

  // Link de fallback para abertura direta
  const primaryPhone = [...targetPhones][0] || '';
  const whatsappUrl = primaryPhone 
    ? `https://api.whatsapp.com/send?phone=${primaryPhone}&text=${encodeURIComponent(formattedMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;

  // Notificar frontend via Socket.IO
  if (ioInstance) {
    ioInstance.emit('whatsapp:message_sent', {
      family_id: familyId,
      recipients: [...targetPhones],
      title,
      type,
      formattedMessage,
      whatsapp_url: whatsappUrl,
      meta_dispatched: metaCreds.isConfigured,
      timestamp: new Date().toISOString(),
      delivered: true,
    });
  }

  return {
    success: true,
    recipients: [...targetPhones],
    type,
    formatted_message: formattedMessage,
    whatsapp_url: whatsappUrl,
    meta_configured: metaCreds.isConfigured,
    meta_results: metaDispatchResults,
    delivered_at: new Date().toISOString(),
  };
}

export default {
  setWhatsAppSocketIO,
  getFamilyConfig,
  updateFamilyConfig,
  getFamilyMemberPhones,
  updateMemberPhone,
  sendMetaCloudMessage,
  sendClanMessage,
};
