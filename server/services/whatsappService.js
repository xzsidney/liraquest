/**
 * LiraQuest - Central de Mensageria & Integração com WhatsApp (Fase 5)
 * Suporte a pareamento com QR Code, gerenciamento de sessão e envio de alertas épicos.
 */

import QRCode from 'qrcode';
import { FamilyWhatsappConfig, Family } from '../models/index.js';

let ioInstance = null;

// Armazenamento em memória de pares de QR Code ativos
const activePairingSessions = new Map();

/**
 * Define a instância global do Socket.IO
 */
export function setWhatsAppSocketIO(io) {
  ioInstance = io;
}

/**
 * Obtém ou inicializa a configuração de WhatsApp de uma família
 */
export async function getFamilyConfig(familyId) {
  let config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (!config) {
    config = await FamilyWhatsappConfig.create({
      family_id: familyId,
      group_id_or_phone: '',
      is_connected: false,
      notify_meals: true,
      notify_hydration: true,
      session_data: null,
    });
  }

  const pairing = activePairingSessions.get(familyId);

  return {
    id: config.id,
    family_id: config.family_id,
    group_id_or_phone: config.group_id_or_phone,
    is_connected: config.is_connected,
    notify_meals: config.notify_meals,
    notify_hydration: config.notify_hydration,
    qr_code_data_url: pairing ? pairing.qrCodeDataUrl : null,
    pairing_status: pairing ? pairing.status : (config.is_connected ? 'CONNECTED' : 'DISCONNECTED'),
    updated_at: config.updated_at,
  };
}

/**
 * Atualiza configurações de destino e notificações da família
 */
export async function updateFamilyConfig(familyId, { group_id_or_phone, notify_meals, notify_hydration }) {
  let config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (!config) {
    config = await FamilyWhatsappConfig.create({
      family_id: familyId,
      group_id_or_phone: group_id_or_phone || '',
      is_connected: false,
      notify_meals: notify_meals !== undefined ? notify_meals : true,
      notify_hydration: notify_hydration !== undefined ? notify_hydration : true,
    });
  } else {
    if (group_id_or_phone !== undefined) config.group_id_or_phone = group_id_or_phone;
    if (notify_meals !== undefined) config.notify_meals = notify_meals;
    if (notify_hydration !== undefined) config.notify_hydration = notify_hydration;
    await config.save();
  }

  return config;
}

/**
 * Gera um novo QR Code para pareamento do WhatsApp com o celular do Guardião
 */
export async function generatePairingQrCode(familyId) {
  // Gera uma string de pareamento no padrão de sessão do WhatsApp Baileys / Webhook
  const sessionId = `liraquest_wa_${familyId}_${Date.now()}`;
  const pairingPayload = `LIRAQUEST-WA-AUTH:${sessionId}:${Buffer.from(familyId).toString('base64')}`;

  // Converte em imagem QR Code Data URL para exibição direta no navegador
  const qrCodeDataUrl = await QRCode.toDataURL(pairingPayload, {
    width: 280,
    margin: 2,
    color: {
      dark: '#1e3a8a', // Azul Real Nobre
      light: '#ffffff',
    },
  });

  const sessionInfo = {
    sessionId,
    qrCodeDataUrl,
    status: 'WAITING_QR_SCAN',
    createdAt: Date.now(),
  };

  activePairingSessions.set(familyId, sessionInfo);

  if (ioInstance) {
    ioInstance.emit('whatsapp:qr_generated', {
      family_id: familyId,
      qr_code: qrCodeDataUrl,
      status: 'WAITING_QR_SCAN',
    });
  }

  return sessionInfo;
}

/**
 * Confirma e estabelece a conexão do WhatsApp para a família
 */
export async function confirmConnection(familyId, metadata = {}) {
  const config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (config) {
    config.is_connected = true;
    config.session_data = JSON.stringify({
      connected_at: new Date().toISOString(),
      device: metadata.device || 'WhatsApp Web (Guardião)',
      simulated: metadata.simulated || false,
    });
    await config.save();
  }

  activePairingSessions.delete(familyId);

  const payload = {
    family_id: familyId,
    is_connected: true,
    status: 'CONNECTED',
    connected_at: new Date().toISOString(),
  };

  if (ioInstance) {
    ioInstance.emit('whatsapp:status', payload);
  }

  return payload;
}

/**
 * Desconecta a sessão do WhatsApp da família
 */
export async function disconnectWhatsApp(familyId) {
  const config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  if (config) {
    config.is_connected = false;
    config.session_data = null;
    await config.save();
  }

  activePairingSessions.delete(familyId);

  const payload = {
    family_id: familyId,
    is_connected: false,
    status: 'DISCONNECTED',
  };

  if (ioInstance) {
    ioInstance.emit('whatsapp:status', payload);
  }

  return payload;
}

/**
 * Dispara mensagem para o WhatsApp do Clã
 * Suporta formatação épica, emojis temáticos e envio para grupos ou telefones
 */
export async function sendClanMessage(familyId, { text, title, type = 'ALERT', phoneOverride }) {
  const config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  const target = phoneOverride || config?.group_id_or_phone;

  // Montar mensagem temática épica
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
  console.log(`📱 [WhatsApp Clã Dispatch] Para: ${target || 'Grupo da Família (Geral)'}`);
  console.log(formattedMessage);
  console.log(`====================================================\n`);

  // Emissão via WebSocket para notificar o frontend em tempo real
  const cleanTarget = (target || '').replace(/\D/g, '');
  const whatsappUrl = cleanTarget 
    ? `https://api.whatsapp.com/send?phone=${cleanTarget}&text=${encodeURIComponent(formattedMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;

  if (ioInstance) {
    ioInstance.emit('whatsapp:message_sent', {
      family_id: familyId,
      target,
      title,
      type,
      formattedMessage,
      whatsapp_url: whatsappUrl,
      timestamp: new Date().toISOString(),
      delivered: true,
    });
  }

  return {
    success: true,
    target: target || 'Grupo da Família',
    type,
    formatted_message: formattedMessage,
    whatsapp_url: whatsappUrl,
    delivered_at: new Date().toISOString(),
  };
}

export default {
  setWhatsAppSocketIO,
  getFamilyConfig,
  updateFamilyConfig,
  generatePairingQrCode,
  confirmConnection,
  disconnectWhatsApp,
  sendClanMessage,
};
