/**
 * LiraQuest - Controller da Central de Conexão com o WhatsApp (Fase 5)
 */

import {
  getFamilyConfig,
  updateFamilyConfig,
  generatePairingQrCode,
  confirmConnection,
  disconnectWhatsApp,
  sendClanMessage,
} from '../services/whatsappService.js';
import { triggerManualAlarm } from '../services/alarmService.js';
import { findOrCreateUserFamily } from './userProgressController.js';

async function resolveFamilyId(user) {
  if (user?.family_id) return user.family_id;
  const membership = await findOrCreateUserFamily(user.id);
  return membership?.family_id || null;
}

export async function getConfig(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const config = await getFamilyConfig(familyId);
    return res.json({ success: true, config });
  } catch (err) {
    console.error('Erro ao buscar configuração do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao carregar configurações do WhatsApp.' });
  }
}

export async function saveConfig(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { group_id_or_phone, notify_meals, notify_hydration } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const updated = await updateFamilyConfig(familyId, {
      group_id_or_phone,
      notify_meals,
      notify_hydration,
    });

    return res.json({
      success: true,
      message: 'Configurações do WhatsApp atualizadas com sucesso!',
      config: updated,
    });
  } catch (err) {
    console.error('Erro ao salvar configuração do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao salvar configuração do WhatsApp.' });
  }
}

export async function generatePairingQr(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const pairingInfo = await generatePairingQrCode(familyId);

    return res.json({
      success: true,
      message: 'QR Code de pareamento gerado com sucesso!',
      qr_code: pairingInfo.qrCodeDataUrl,
      session_id: pairingInfo.sessionId,
      status: pairingInfo.status,
    });
  } catch (err) {
    console.error('Erro ao gerar QR Code do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao gerar QR Code de pareamento.' });
  }
}

export async function confirmPairing(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { device } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const result = await confirmConnection(familyId, {
      device: device || 'WhatsApp Celular Guardião',
      simulated: true,
    });

    return res.json({
      success: true,
      message: 'WhatsApp do Clã pareado e conectado com sucesso!',
      result,
    });
  } catch (err) {
    console.error('Erro ao confirmar pareamento do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao confirmar conexão do WhatsApp.' });
  }
}

export async function sendTestMessage(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { phone_override, custom_message } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const text = custom_message || [
      '🛡️ *TESTE DE TRANSMISSÃO OFICIAL DO CLÃ!*',
      'Este é um sinal de confirmação do LiraQuest para a Família.',
      'Os alarmes de refeição (11h15, 11h45, 16h00 e 19h45) e missões do reino serão despachados por aqui.',
      'Todos os heróis prontos para a aventura! 👑✨',
    ].join('\n');

    const result = await sendClanMessage(familyId, {
      title: '⚔️ Teste de Conexão do Reino',
      text,
      type: 'ALERT',
      phoneOverride: phone_override,
    });

    return res.json({
      success: true,
      message: 'Mensagem de teste disparada com sucesso para o WhatsApp!',
      result,
    });
  } catch (err) {
    console.error('Erro ao enviar mensagem de teste do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Falha no disparo da mensagem de teste.' });
  }
}

export async function disconnect(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const result = await disconnectWhatsApp(familyId);

    return res.json({
      success: true,
      message: 'Sessão do WhatsApp desconectada.',
      result,
    });
  } catch (err) {
    console.error('Erro ao desconectar WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao desconectar WhatsApp.' });
  }
}

export async function triggerAlarmTest(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { alarm_type } = req.body; // 'KITCHEN', 'LUNCH', 'HYDRATION', 'DINNER'

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const result = await triggerManualAlarm(familyId, alarm_type);

    return res.json({
      success: true,
      message: `Alarme ${alarm_type} disparado com sucesso no sistema e WhatsApp!`,
      result,
    });
  } catch (err) {
    console.error('Erro ao disparar teste de alarme:', err);
    return res.status(500).json({ success: false, message: 'Erro ao disparar alarme.' });
  }
}

export default {
  getConfig,
  saveConfig,
  generatePairingQr,
  confirmPairing,
  sendTestMessage,
  disconnect,
  triggerAlarmTest,
};
