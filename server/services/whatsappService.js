/**
 * LiraQuest - Central de Mensageria & Integração com WhatsApp
 * Suporte Duplo: Baileys (WhatsApp Web Conexão Direta via QR Code sem CNPJ)
 * e Meta Cloud API (WhatsApp Business Graph API).
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { FamilyWhatsappConfig, FamilyMember, FamilyUser } from '../models/index.js';

let ioInstance = null;

// Mapa de sessões ativas de WhatsApp em memória por família
// familyId -> { sock, qrCode, isConnected, reconnectAttempts }
const waSessions = new Map();

const SESSIONS_BASE_DIR = path.join(process.cwd(), 'server', 'sessions');
if (!fs.existsSync(SESSIONS_BASE_DIR)) {
  fs.mkdirSync(SESSIONS_BASE_DIR, { recursive: true });
}

export function setWhatsAppSocketIO(io) {
  ioInstance = io;
}

/**
 * Inicia ou recupera a sessão do WhatsApp (Baileys) para a família
 */
export async function initBaileysSession(familyId) {
  if (!familyId) return null;

  let session = waSessions.get(familyId);
  if (session && session.isConnected && session.sock) {
    return { is_connected: true, qr_code: null };
  }

  if (session && session.qrCode) {
    return { is_connected: false, qr_code: session.qrCode };
  }

  const authDir = path.join(SESSIONS_BASE_DIR, `auth_${familyId}`);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    console.log(`📱 [WhatsApp Baileys] Inicializando sessão para a família ${familyId}...`);

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['LiraQuest Reino Familiar', 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    session = {
      sock,
      qrCode: null,
      isConnected: false,
      reconnectAttempts: 0,
    };
    waSessions.set(familyId, session);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(`📸 [WhatsApp Baileys] Novo QR Code gerado para a família ${familyId}!`);
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
          session.qrCode = qrDataUrl;

          if (ioInstance) {
            ioInstance.emit('whatsapp:qr_generated', {
              family_id: familyId,
              qr_code: qrDataUrl,
            });
          }
        } catch (qrErr) {
          console.error('Erro ao converter QR Code para base64:', qrErr);
        }
      }

      if (connection === 'open') {
        console.log(`🟢 [WhatsApp Baileys] Família ${familyId} CONECTADA com sucesso!`);
        session.isConnected = true;
        session.qrCode = null;
        session.reconnectAttempts = 0;

        await FamilyWhatsappConfig.update(
          { is_connected: true },
          { where: { family_id: familyId } }
        ).catch(() => null);

        if (ioInstance) {
          ioInstance.emit('whatsapp:status', {
            family_id: familyId,
            is_connected: true,
          });
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`⚪ [WhatsApp Baileys] Conexão encerrada para ${familyId}. Reconectar: ${shouldReconnect} (Status: ${statusCode})`);
        session.isConnected = false;

        if (shouldReconnect && session.reconnectAttempts < 5) {
          session.reconnectAttempts += 1;
          console.log(`🔄 [WhatsApp Baileys] Tentativa de reconexão ${session.reconnectAttempts}/5 em 4 segundos...`);
          setTimeout(() => initBaileysSession(familyId), 4000);
        } else {
          waSessions.delete(familyId);
          await FamilyWhatsappConfig.update(
            { is_connected: false },
            { where: { family_id: familyId } }
          ).catch(() => null);

          if (ioInstance) {
            ioInstance.emit('whatsapp:status', {
              family_id: familyId,
              is_connected: false,
            });
          }
        }
      }
    });

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (session.qrCode || session.isConnected) {
          clearInterval(checkInterval);
          resolve({
            is_connected: session.isConnected,
            qr_code: session.qrCode,
          });
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve({
          is_connected: session.isConnected,
          qr_code: session.qrCode,
        });
      }, 7000);
    });
  } catch (err) {
    console.error('❌ [WhatsApp Baileys] Erro ao criar socket:', err);
    return null;
  }
}

/**
 * Desconecta a sessão de WhatsApp da família e limpa os arquivos de autenticação
 */
export async function disconnectBaileysSession(familyId) {
  const session = waSessions.get(familyId);
  if (session?.sock) {
    try {
      await session.sock.logout();
    } catch (e) {
      try { session.sock.end(); } catch (err) {}
    }
  }

  waSessions.delete(familyId);

  const authDir = path.join(SESSIONS_BASE_DIR, `auth_${familyId}`);
  if (fs.existsSync(authDir)) {
    try {
      fs.rmSync(authDir, { recursive: true, force: true });
    } catch (e) {}
  }

  await FamilyWhatsappConfig.update(
    { is_connected: false },
    { where: { family_id: familyId } }
  ).catch(() => null);

  if (ioInstance) {
    ioInstance.emit('whatsapp:status', {
      family_id: familyId,
      is_connected: false,
    });
  }

  return { success: true };
}

/**
 * Retorna credenciais ativas da Meta Cloud API (se configuradas)
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
 * Obtém configuração do WhatsApp da família
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

  const session = waSessions.get(familyId);
  const isBaileysConnected = Boolean(session?.isConnected);
  const members = await getFamilyMemberPhones(familyId);
  const metaCreds = getMetaCredentials(config);

  return {
    id: config.id,
    family_id: config.family_id,
    group_id_or_phone: config.group_id_or_phone,
    is_connected: isBaileysConnected || Boolean(config.is_connected),
    notify_meals: config.notify_meals,
    notify_hydration: config.notify_hydration,
    meta_configured: metaCreds.isConfigured,
    meta_phone_number_id: metaCreds.phoneNumberId || '',
    qr_code_data_url: session?.qrCode || null,
    members,
    updated_at: config.updated_at,
  };
}

/**
 * Atualiza configurações de destino e preferências
 */
export async function updateFamilyConfig(familyId, { group_id_or_phone, notify_meals, notify_hydration, meta_phone_number_id, meta_access_token }) {
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

    if (meta_phone_number_id || meta_access_token) {
      let currentSession = {};
      try {
        if (config.session_data) currentSession = JSON.parse(config.session_data);
      } catch (e) {}

      if (meta_phone_number_id && !meta_phone_number_id.includes('...')) {
        currentSession.meta_phone_number_id = meta_phone_number_id.trim();
      }
      if (meta_access_token && !meta_access_token.includes('•') && !meta_access_token.includes('*')) {
        currentSession.meta_access_token = meta_access_token.trim();
      }

      config.session_data = JSON.stringify(currentSession);
    }

    await config.save();
  }

  return config;
}

/**
 * Atualiza o telefone de um membro da família no cadastro
 */
export async function updateMemberPhone(userId, rawPhone) {
  const user = await FamilyUser.findByPk(userId);
  if (!user) return null;

  user.phone = rawPhone ? rawPhone.trim() : null;
  await user.save();
  return user;
}

/**
 * Envia mensagem real via Meta Cloud API Oficial (se configurada)
 */
export async function sendMetaCloudMessage({ phoneNumberId, accessToken, toPhone, messageBody }) {
  try {
    const cleanPhone = toPhone.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

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
 * Dispara mensagem para toda a família (via Baileys WhatsApp Web, Meta Cloud API e WebSockets)
 */
export async function sendClanMessage(familyId, { text, title, type = 'ALERT', phoneOverride }) {
  const config = await FamilyWhatsappConfig.findOne({
    where: { family_id: familyId },
  });

  const members = await getFamilyMemberPhones(familyId);
  const session = waSessions.get(familyId);
  const isBaileysActive = Boolean(session?.isConnected && session?.sock);

  // Montar lista de telefones de destino
  const targetPhones = new Set();

  if (phoneOverride) {
    const clean = phoneOverride.replace(/\D/g, '');
    if (clean) targetPhones.add(clean.startsWith('55') ? clean : `55${clean}`);
  } else {
    for (const m of members) {
      if (m.phone) targetPhones.add(m.phone);
    }
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
  console.log(`Baileys Conectado:`, isBaileysActive);
  console.log(formattedMessage);
  console.log(`====================================================\n`);

  const dispatchResults = [];

  // 1. Envio Direto via Baileys (WhatsApp Web Conectado)
  if (isBaileysActive && targetPhones.size > 0) {
    for (const phone of targetPhones) {
      try {
        const jid = phone.includes('@g.us') ? phone : `${phone}@s.whatsapp.net`;
        console.log(`🚀 [Baileys Dispatch] Enviando para ${jid}...`);
        const sentMsg = await session.sock.sendMessage(jid, { text: formattedMessage });
        console.log(`✅ [Baileys Dispatch Sucesso] Entregue para ${jid}! ID:`, sentMsg?.key?.id);
        dispatchResults.push({ success: true, phone, id: sentMsg?.key?.id });
      } catch (bErr) {
        console.error(`❌ [Baileys Erro] Falha ao enviar para ${phone}:`, bErr.message);
        dispatchResults.push({ success: false, phone, error: bErr.message });
      }
    }
  }

  // 2. Envio Secundário via Meta Cloud API (se configurada e Baileys não ativo)
  const metaCreds = getMetaCredentials(config);
  if (!isBaileysActive && metaCreds.isConfigured && targetPhones.size > 0) {
    for (const phone of targetPhones) {
      const res = await sendMetaCloudMessage({
        phoneNumberId: metaCreds.phoneNumberId,
        accessToken: metaCreds.accessToken,
        toPhone: phone,
        messageBody: formattedMessage,
      });
      dispatchResults.push(res);
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
      baileys_active: isBaileysActive,
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
    baileys_active: isBaileysActive,
    results: dispatchResults,
    delivered_at: new Date().toISOString(),
  };
}

export default {
  setWhatsAppSocketIO,
  initBaileysSession,
  disconnectBaileysSession,
  getFamilyConfig,
  updateFamilyConfig,
  getFamilyMemberPhones,
  updateMemberPhone,
  sendMetaCloudMessage,
  sendClanMessage,
};
