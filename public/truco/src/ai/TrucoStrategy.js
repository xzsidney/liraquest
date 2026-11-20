// =============================================================================
// TRUCOSTRATEGY.JS - ROTEADOR DE RISCO/RECOMPENSA E APOSTAS POR RODADAS
// Strategy Pattern: delega decisões de Truco, Retruco e Blefe por rodada
// =============================================================================

import { Round1Strategy } from './rounds/Round1Strategy.js';
import { Round2Strategy } from './rounds/Round2Strategy.js';
import { Round3Strategy } from './rounds/Round3Strategy.js';

export class TrucoStrategy {
  constructor(difficultyConfig = null) {
    this.diffConfig = difficultyConfig;
  }

  setDifficultyConfig(cfg) {
    this.diffConfig = cfg;
  }

  /**
   * Avalia se um bot deve pedir Truco (ou aumentar) delegando para a rodada certa
   * @param {Object} ctx 
   * @returns {boolean}
   */
  shouldTruco(ctx) {
    const {
      botTeam, availableCards, previousPlays, isMaoDe11,
      isMaoDeFerro, isGameOver, betState, lastBettorTeam, nextBetValue
    } = ctx;

    // Regras básicas de bloqueio
    if (isMaoDe11 || isMaoDeFerro || isGameOver || betState !== 'none') return false;
    if (lastBettorTeam === botTeam) return false;
    if (!nextBetValue) return false;
    if (botTeam === 'us') return false; // Parceiro não truca sozinho

    // Maior poder na mesa da vaza atual
    let maxPower = -1;
    let topPlayTeam = null;
    previousPlays.forEach(p => {
      const pwr = p.card.covered ? 0 : p.card.power;
      if (pwr > maxPower) {
        maxPower = pwr;
        topPlayTeam = ctx.getPlayerTeam ? ctx.getPlayerTeam(p.playerId) : null;
      }
    });

    // Filtro anti-suicídio: não trucar se o adversário já jogou o Zap
    if (maxPower === 104 && topPlayTeam !== botTeam) {
      return false;
    }
    // Não trucar se o oponente jogou manilha e não temos carta para matar
    if (topPlayTeam !== botTeam && maxPower >= 100 && !availableCards.some(c => c.power > maxPower)) {
      return false;
    }

    const round = ctx.roundNumber;

    if (round === 1) {
      return Round1Strategy.shouldTruco(ctx, this.diffConfig);
    }

    if (round === 2) {
      return Round2Strategy.shouldTruco(ctx, this.diffConfig);
    }

    if (round === 3) {
      return Round3Strategy.shouldTruco(ctx, this.diffConfig);
    }

    return false;
  }

  /**
   * Avalia a resposta ao Truco ou Aumento delegando para a rodada certa
   * @param {Object} ctx 
   * @returns {{ action: 'accept'|'raise'|'refuse', raiseVal?: number }}
   */
  respondToTruco(ctx) {
    const round = ctx.roundNumber;

    if (round === 1) {
      return Round1Strategy.respondToTruco(ctx);
    }

    if (round === 2) {
      return Round2Strategy.respondToTruco(ctx);
    }

    if (round === 3) {
      return Round3Strategy.respondToTruco(ctx);
    }

    return { action: 'refuse' };
  }

  /**
   * Avalia a Mão de 11 para a dupla de bots
   */
  evaluateMao11(combinedCards, scoreDiff, role) {
    const manilhas = combinedCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const threeCount = combinedCards.filter(c => !c.isManilha && c.power === 10).length;
    const twoCount = combinedCards.filter(c => !c.isManilha && c.power === 9).length;
    const aceCount = combinedCards.filter(c => !c.isManilha && c.power === 8).length;

    if (manilhas.length >= 1 && threeCount >= 1) return true;
    if (threeCount >= 2 && (twoCount >= 1 || aceCount >= 1)) return true;
    if (hasZap && twoCount >= 2) return true;
    if (manilhas.length >= 2) return true;
    if (scoreDiff >= 6 && hasZap) return true;

    return false;
  }

  /**
   * Conselho honesto e tático do Tião para o jogador humano
   */
  getPartnerAdvice(partnerCards) {
    const manilhas = partnerCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const threeCards = partnerCards.filter(c => !c.isManilha && c.power === 10);
    const twoOrAce = partnerCards.filter(c => !c.isManilha && (c.power === 9 || c.power === 8));

    if (hasZap) {
      return "Parceiro, tô com o ZAP engatilhado! Aceita com gosto!";
    }
    if (hasCopeta || manilhas.length >= 2) {
      return "Tô com manilha armada, parceiro! Essa eu garanto!";
    }
    if (manilhas.length === 1) {
      return "Eu garanto uma vaza, parceiro!";
    }
    if (threeCards.length > 0) {
      return "Eu tenho uma forcinha, parceiro! Dou uma cutucada!";
    }
    if (twoOrAce.length > 0) {
      return "Vixi parceiro, tô fraquinho... tô pequeno, você que decide!";
    }
    return "Parceiro, só veio lixo pra mim... se não tiver bicho grande, corre!";
  }
}
