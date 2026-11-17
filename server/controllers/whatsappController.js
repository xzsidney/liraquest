/**
 * LiraQuest - Controller da Central de WhatsApp (Meta Cloud API & Notificações Familiares)
 */

import {
  getFamilyConfig,
  updateFamilyConfig,
  updateMemberPhone,
  sendClanMessage,
  initBaileysSession,
  disconnectBaileysSession,
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
    const { group_id_or_phone, notify_meals, notify_hydration, meta_phone_number_id, meta_access_token } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const updated = await updateFamilyConfig(familyId, {
      group_id_or_phone,
      notify_meals,
      notify_hydration,
      meta_phone_number_id,
      meta_access_token,
    });

    const refreshed = await getFamilyConfig(familyId);

    return res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso!',
      config: refreshed,
    });
  } catch (err) {
    console.error('Erro ao salvar configuração do WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao salvar configuração do WhatsApp.' });
  }
}

export async function updatePhone(req, res) {
  try {
    const { user_id, phone } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório.' });
    }

    const updatedUser = await updateMemberPhone(user_id, phone);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    return res.json({
      success: true,
      message: `Telefone de ${updatedUser.name} atualizado para ${updatedUser.phone || 'Removido'}!`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
      },
    });
  } catch (err) {
    console.error('Erro ao atualizar telefone do membro:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar telefone.' });
  }
}

export async function sendTemplate(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { template_code, custom_text } = req.body;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    let title = '📢 Comunicado dos Guardiões';
    let text = custom_text || 'Atenção clã! Nova mensagem dos pais.';
    let type = 'ALERT';

    switch (template_code) {
      case 'BREAKFAST':
        title = '🍳 Café da Manhã dos Campeões';
        text = '☀️ Bom dia, heróis! A mesa do café está posta. Venham se alimentar para começar os estudos e treinos com 100% de energia!';
        type = 'MEAL';
        break;
      case 'KITCHEN':
        title = '👨‍🍳 Aviso Cozinha — Preparar Almoço';
        text = '👨‍🍳 Atenção cozinha do clã! Faltam 30 minutos para o almoço. Cebola batida no mixer, carnes magras e preparo sem óleo!';
        type = 'KITCHEN';
        break;
      case 'LUNCH':
        title = '⚔️ Convocação: Todos à Mesa para o Almoço!';
        text = '🛡️ Chamada real! O almoço dos heróis está servido antes da ida para a escola! Check-in de presença ativo no sistema (+30 XP e +10 Ouro)!';
        type = 'MEAL';
        break;
      case 'SNACK_WATER':
        title = '💧 Hora da Água & Lanche Restaurador';
        text = '✨ Pausa para regenerar a mana dos heróis! Bebam 1 copo grande de água fresca e consumam uma fruta da tarde.';
        type = 'HYDRATION';
        break;
      case 'DINNER':
        title = '🍲 Jantar em Família & Encerramento';
        text = '🌙 O sol se põe no reino! Convocamos todos para o jantar leve e descanso merecido dos heróis da casa.';
        type = 'MEAL';
        break;
      case 'BEDTIME':
        title = '🛏️ Hora do Descanso dos Heróis';
        text = '👑 Todas as missões do dia foram concluídas com honra! Hora de desligar as telas, escovar os dentes e ter um sono reparador.';
        type = 'ALERT';
        break;
      default:
        if (custom_text) {
          title = '👑 Mensagem do Guardião (Pai)';
          text = custom_text;
        }
        break;
    }

    const result = await sendClanMessage(familyId, {
      title,
      text,
      type,
    });

    return res.json({
      success: true,
      message: `Mensagem "${title}" disparada para a família!`,
      result,
    });
  } catch (err) {
    console.error('Erro ao enviar mensagem de template:', err);
    return res.status(500).json({ success: false, message: 'Erro ao disparar mensagem.' });
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
      '🛡️ *TESTE OFICIAL DE CONEXÃO DO CLÃ!*',
      'Este é um sinal de confirmação do LiraQuest via API Oficial.',
      'Os alarmes de refeição (11h15, 11h45, 16h00 e 19h45) e convocações da família serão transmitidos por aqui.',
      'Todos os heróis prontos para a jornada! 👑✨',
    ].join('\n');

    const result = await sendClanMessage(familyId, {
      title: '⚔️ Teste Oficial do Reino',
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

export async function triggerAlarmTest(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    const { alarm_type } = req.body;

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

export async function pairSession(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    const sessionResult = await initBaileysSession(familyId);
    return res.json({
      success: true,
      is_connected: sessionResult?.is_connected || false,
      qr_code: sessionResult?.qr_code || null,
      message: sessionResult?.is_connected 
        ? 'Sessão do WhatsApp já conectada!' 
        : 'QR Code gerado. Aponte a câmera do WhatsApp para parear.',
    });
  } catch (err) {
    console.error('Erro ao parear WhatsApp Baileys:', err);
    return res.status(500).json({ success: false, message: 'Erro ao gerar QR Code do WhatsApp.' });
  }
}

export async function disconnectSession(req, res) {
  try {
    const familyId = await resolveFamilyId(req.user);
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Família não identificada na sessão.' });
    }

    await disconnectBaileysSession(familyId);
    return res.json({ success: true, message: 'WhatsApp desconectado com sucesso.' });
  } catch (err) {
    console.error('Erro ao desconectar WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Erro ao desconectar WhatsApp.' });
  }
}

export default {
  getConfig,
  saveConfig,
  updatePhone,
  sendTemplate,
  sendTestMessage,
  triggerAlarmTest,
  pairSession,
  disconnectSession,
};
