/**
 * LiraQuest - Rotas da Central de WhatsApp (Fase 5)
 */

import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  getConfig,
  saveConfig,
  generatePairingQr,
  confirmPairing,
  sendTestMessage,
  disconnect,
  triggerAlarmTest,
} from '../controllers/whatsappController.js';

const router = express.Router();

// Todas as rotas exigem autenticação de sessão
router.use(authenticateToken);

// Consulta de configuração (acessível por todos os membros para status)
router.get('/config', getConfig);

// Gerenciamento e Disparo restritos aos Guardiões (Pai/Mãe/Admin)
router.post('/config', authorizeRoles('ADMIN', 'PARENT'), saveConfig);
router.post('/pair', authorizeRoles('ADMIN', 'PARENT'), generatePairingQr);
router.post('/confirm-pair', authorizeRoles('ADMIN', 'PARENT'), confirmPairing);
router.post('/test', authorizeRoles('ADMIN', 'PARENT'), sendTestMessage);
router.post('/disconnect', authorizeRoles('ADMIN', 'PARENT'), disconnect);
router.post('/alarm-test', authorizeRoles('ADMIN', 'PARENT'), triggerAlarmTest);

export default router;
