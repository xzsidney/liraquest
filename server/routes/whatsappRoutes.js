/**
 * LiraQuest - Rotas da Central de WhatsApp (Meta Cloud API & Notificações Familiares)
 */

import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  getConfig,
  saveConfig,
  updatePhone,
  sendTemplate,
  sendTestMessage,
  triggerAlarmTest,
} from '../controllers/whatsappController.js';

const router = express.Router();

// Todas as rotas exigem autenticação de sessão
router.use(authenticateToken);

// Consulta de configuração e lista de membros
router.get('/config', getConfig);

// Gerenciamento dos Guardiões e Disparos da Família
router.post('/config', authorizeRoles('ADMIN', 'PARENT'), saveConfig);
router.post('/update-phone', authorizeRoles('ADMIN', 'PARENT'), updatePhone);
router.post('/send-template', authorizeRoles('ADMIN', 'PARENT', 'CHILD'), sendTemplate);
router.post('/test', authorizeRoles('ADMIN', 'PARENT', 'CHILD'), sendTestMessage);
router.post('/alarm-test', authorizeRoles('ADMIN', 'PARENT', 'CHILD'), triggerAlarmTest);

export default router;
