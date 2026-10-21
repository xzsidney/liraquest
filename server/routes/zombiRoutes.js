import { Router } from 'express';
import {
  getActiveCampaign,
  saveCampaignState,
  resetCampaignState,
  listMzCharacters,
  getMzCharacterByCode,
} from '../controllers/zombiController.js';

const router = Router();

// ==========================================
// Módulo de Campanha Investigativa (Carmen Sandiego)
// ==========================================
// GET /api/zombi/campaign (Retorna a campanha completa de 5 capítulos e seus tokens)
router.get('/campaign', getActiveCampaign);

// POST /api/zombi/state (Salva o estado de investigação, flags, modo e capítulo atual)
router.post('/state', saveCampaignState);

// POST /api/zombi/reset (Reinicia o progresso de uma missão ou da campanha inteira)
router.post('/reset', resetCampaignState);

// ==========================================
// Módulo de Catálogo & Dashboard de Personagens
// ==========================================
// GET /api/zombi/characters (Lista os 82 personagens com suporte a filtros por caixa, modo e busca)
router.get('/characters', listMzCharacters);

// GET /api/zombi/characters/:code (Retorna a ficha completa do herói com perfis, ataques e habilidades)
router.get('/characters/:code', getMzCharacterByCode);

export default router;
