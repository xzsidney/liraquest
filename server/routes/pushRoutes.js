import { Router } from 'express';
import { authenticateToken, requireParent } from '../middlewares/authMiddleware.js';
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  getStatus,
  testPush,
  broadcastFamily,
} from '../controllers/pushNotificationController.js';

const router = Router();

// Obter chave pública VAPID (acessível autenticado)
router.get('/public-key', authenticateToken, getPublicKey);

// Registrar / Cancelar inscrição do dispositivo
router.post('/subscribe', authenticateToken, subscribe);
router.post('/unsubscribe', authenticateToken, unsubscribe);

// Status das notificações do usuário e família
router.get('/status', authenticateToken, getStatus);

// Enviar notificação de teste para o próprio usuário
router.post('/test', authenticateToken, testPush);

// Disparar comunicado ou alarme para a família inteira (Exclusivo Pais/Guardiões)
router.post('/broadcast', authenticateToken, requireParent, broadcastFamily);

export default router;
