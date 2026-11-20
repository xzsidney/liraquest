// =============================================================================
// TRUCOSTRATEGY.JS - MOTOR DE RISCO/RECOMPENSA, TRUCO, RETRUCO E BLEFES
// Implementa filtros anti-suicídio, blefes de boteco e cálculo da Mão de 11
// =============================================================================

export class TrucoStrategy {
  constructor(difficultyConfig = null) {
    this.diffConfig = difficultyConfig;
  }

  setDifficultyConfig(cfg) {
    this.diffConfig = cfg;
  }

  /**
   * Avalia se um bot deve pedir Truco (ou aumentar)
   * @param {Object} ctx 
   * @returns {boolean}
   */
  shouldTruco(ctx) {
    const {
      botId, botTeam, role, roundNumber, availableCards, previousPlays,
      tricksHistory, scoreDiff, isMaoDe11, isMaoDeFerro, isGameOver,
      betState, lastBettorTeam, nextBetValue, playerFoldsCount, camaDeGato
    } = ctx;

    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const isPe = (role === 'Pé');

    const firstTrick = tricksHistory[0];
    const firstWon = firstTrick && firstTrick.winnerTeam === botTeam;
    const firstDraw = firstTrick && firstTrick.winnerTeam === 'draw';

    // Regras básicas de bloqueio
    if (isMaoDe11 || isMaoDeFerro || isGameOver || betState !== 'none') return false;
    if (lastBettorTeam === botTeam) return false;
    if (!nextBetValue) return false;

    // Se o bot for parceiro do humano ('us'), ele não truca sozinho
    if (botTeam === 'us') return false;

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

    // -------------------------------------------------------------------------
    // FILTRO ANTI-SUICÍDIO DO MESTRE:
    // -------------------------------------------------------------------------
    if (maxPower === 104 && topPlayTeam !== botTeam) {
      return false; // Adversário jogou Zap
    }
    if (topPlayTeam !== botTeam && maxPower >= 100 && !availableCards.some(c => c.power > maxPower)) {
      return false; // Não tem carta para matar a manilha adversária
    }

    const bluffBase = this.diffConfig?.bluffChance ?? 0.14;
    const aggressiveness = this.diffConfig?.trucoAggressiveness ?? 0.65;

    // -------------------------------------------------------------------------
    // REGRA DE OURO DO ZAP NA RODADA 3:
    // -------------------------------------------------------------------------
    if (roundNumber === 3 && hasZap) {
      return true;
    }

    // -------------------------------------------------------------------------
    // 1. FECHAMENTO DA CAMA DE GATO (VAZAS 2 E 3)
    // -------------------------------------------------------------------------
    if (camaDeGato?.them && camaDeGato.armador === botId && camaDeGato.baitPlayed && roundNumber >= 2) {
      if (hasZap || hasCopeta) {
        if (Math.random() < (this.diffConfig?.camaDeGatoChance ?? 0.75)) {
          return true;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. PÓS-CANGA NA RODADA 2 (1ª rodada empatou):
    // -------------------------------------------------------------------------
    if (roundNumber === 2 && firstDraw) {
      if (manilhas.length > 0) {
        return Math.random() < (aggressiveness + 0.15);
      }
    }

    // -------------------------------------------------------------------------
    // 3. O FECHA DA RODADA 2 COM MANILHA NO PÉ:
    // -------------------------------------------------------------------------
    if (roundNumber === 2 && firstWon && isPe) {
      if (availableCards.some(c => c.isManilha && c.power > maxPower)) {
        return Math.random() < aggressiveness;
      }
    }

    // -------------------------------------------------------------------------
    // 4. DUAS MANILHAS OU ZAP NA MÃO:
    // -------------------------------------------------------------------------
    if (manilhas.length >= 2 && roundNumber <= 2) {
      return Math.random() < aggressiveness;
    }

    // -------------------------------------------------------------------------
    // 5. BLEFE NA 3ª VAZA (JOGO 1 A 1):
    // -------------------------------------------------------------------------
    if (roundNumber === 3) {
      const t1 = tricksHistory[0]?.winnerTeam;
      const t2 = tricksHistory[1]?.winnerTeam;
      const isOneAndOne = (t1 === 'them' && t2 === 'us') || (t1 === 'us' && t2 === 'them');

      if (isOneAndOne && availableCards.length === 1) {
        const lastCard = availableCards[0];
        if (!lastCard.isManilha && lastCard.power <= 5) {
          const foldsModifier = (playerFoldsCount || 0) * 0.10;
          const dynamicBluff = Math.min(0.65, bluffBase + foldsModifier);
          if (Math.random() < dynamicBluff) {
            ctx.setBluffActive && ctx.setBluffActive(botId);
            return true;
          }
        }
      }
    }

    // 6. BLEFE CONTEXTUAL
    if (Math.random() < (bluffBase * 0.5)) {
      return true;
    }

    return false;
  }

  /**
   * Avalia a resposta ao Truco ou Aumento
   * @param {Object} ctx 
   * @returns {{ action: 'accept'|'raise'|'refuse', raiseVal?: number }}
   */
  respondToTruco(ctx) {
    const { requestedValue, botTeam, role, roundNumber, availableCards, tricksHistory, camaDeGato } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const hasEspadilha = manilhas.some(c => c.manilhaRank === 2);

    const firstTrick = tricksHistory[0];
    const firstWon = firstTrick && firstTrick.winnerTeam === botTeam;
    const firstDraw = firstTrick && firstTrick.winnerTeam === 'draw';

    const isCasalMaior = (hasZap && hasCopeta);
    const isCasalPretoPe = (hasZap && hasEspadilha && role === 'Pé');

    const canRaise = (requestedValue < 12);
    const raiseVal = canRaise ? (requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12)) : null;

    // Cama de gato armada e adversário trucou
    if (camaDeGato?.them && camaDeGato.baitPlayed) {
      if (canRaise && Math.random() < (this.diffConfig?.camaDeGatoChance ?? 0.6)) {
        return { action: 'raise', raiseVal };
      }
      return { action: 'accept' };
    }

    // Retruco com mão de ouro
    if (canRaise) {
      const authZapWin = (firstWon && hasZap);
      const zapInRound3 = (roundNumber === 3 && hasZap);
      if (isCasalMaior || isCasalPretoPe || authZapWin || zapInRound3) {
        return { action: 'raise', raiseVal };
      }
    }

    // Zap na 3ª vaza nunca corre
    if (roundNumber === 3 && hasZap) {
      return { action: 'accept' };
    }

    // Critério de cartas boas (3 ou manilha)
    const cardsToEvaluate = (ctx.teamCards && ctx.teamCards.length > 0) ? ctx.teamCards : availableCards;
    const goodCards = cardsToEvaluate.filter(c => c.isManilha || (!c.isManilha && c.power === 10));
    const numGoodCards = goodCards.length;
    const highestOnTable = (ctx.highestPower !== undefined && ctx.highestPower > 0) ? ctx.highestPower : 0;
    const canKillTrick = (highestOnTable === 0) || cardsToEvaluate.some(c => c.power > highestOnTable);

    // 1. PRIMEIRA RODADA:
    if (roundNumber === 1) {
      if (numGoodCards >= 2) {
        return { action: 'accept' };
      }
      return { action: 'refuse' };
    }

    // 2. SEGUNDA RODADA:
    if (roundNumber === 2) {
      if (numGoodCards >= 2 && canKillTrick) {
        return { action: 'accept' };
      }
      if (firstDraw && requestedValue >= 6 && (hasZap || hasCopeta)) {
        return { action: 'accept' };
      }
      return { action: 'refuse' };
    }

    // 3. TERCEIRA RODADA:
    if (roundNumber === 3) {
      if (numGoodCards >= 1 && canKillTrick) {
        return { action: 'accept' };
      }
      return { action: 'refuse' };
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
