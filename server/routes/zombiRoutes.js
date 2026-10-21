import { Router } from 'express';
import {
  getActiveCampaign,
  saveCampaignState,
  resetCampaignState,
} from '../controllers/zombiController.js';

const router = Router();

// GET /api/zombi/campaign (Retorna a campanha completa de 5 capítulos e seus tokens)
router.get('/campaign', getActiveCampaign);

// POST /api/zombi/state (Salva o estado de investigação, flags, modo e capítulo atual)
router.post('/state', saveCampaignState);

// POST /api/zombi/reset (Reinicia o progresso de uma missão ou da campanha inteira)
router.post('/reset', resetCampaignState);

export default router;
