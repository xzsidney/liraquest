// =============================================================================
// DECISIONENGINE.JS - ROTEADOR TÁTICO MODULAR DE RODADAS (1ª, 2ª E 3ª VAZAS)
// Clean Architecture & Strategy Pattern: delega cada vaza para sua estratégia
// =============================================================================

import { Round1Strategy } from './rounds/Round1Strategy.js';
import { Round2Strategy } from './rounds/Round2Strategy.js';
import { Round3Strategy } from './rounds/Round3Strategy.js';

export class DecisionEngine {
  constructor(difficultyConfig = null) {
    this.diffConfig = difficultyConfig;
  }

  setDifficultyConfig(cfg) {
    this.diffConfig = cfg;
  }

  /**
   * Roteia a decisão da carta para o especialista da rodada correspondente
   * @param {Object} ctx Contexto completo da jogada
   * @returns {Object} A carta escolhida do array availableCards
   */
  chooseCard(ctx) {
    const round = ctx.roundNumber;

    if (round === 1) {
      return Round1Strategy.chooseCard(ctx, this.diffConfig);
    }

    if (round === 2) {
      return Round2Strategy.chooseCard(ctx, this.diffConfig);
    }

    if (round === 3) {
      return Round3Strategy.chooseCard(ctx, this.diffConfig);
    }

    // Fallback defensivo
    const sorted = [...ctx.availableCards].sort((a, b) => a.power - b.power);
    return sorted[0];
  }
}
