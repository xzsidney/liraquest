// =============================================================================
// ROUND1STRATEGY.JS - REGRAS EXCLUSIVAS DA 1ª RODADA (A BATALHA DA PRIMEIRA)
// Foco: Abertura tática, Sangria do Para-Pé, Proteção de Zap e Canga no Pé
// =============================================================================

export class Round1Strategy {
  /**
   * Escolhe a carta ideal para jogar na 1ª Vaza
   * @param {Object} ctx Contexto da partida
   * @param {Object} diffConfig Configuração de dificuldade
   * @returns {Object} Carta selecionada
   */
  static chooseCard(ctx, diffConfig) {
    const { botId, role, availableCards, previousPlays, handSignals, camaDeGato } = ctx;
    const sorted = [...availableCards].sort((a, b) => a.power - b.power);
    const manilhas = sorted.filter(c => c.isManilha);
    const commons = sorted.filter(c => !c.isManilha);
    const zapCard = manilhas.find(c => c.manilhaRank === 4);
    const hasZap = Boolean(zapCard);
    const nonZapCards = sorted.filter(c => !(c.isManilha && c.manilhaRank === 4));
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const hasEspadilha = manilhas.some(c => c.manilhaRank === 2);

    const isMao = (role === 'Mão');
    const isMeio = (role === 'Meio');
    const isParaPe = (role === 'Para-Pé');
    const isPe = (role === 'Pé');

    // 1. Armadilha da Cama de Gato: joga isca (menor descarte)
    if (camaDeGato?.them && camaDeGato.armador === botId && !camaDeGato.baitPlayed) {
      return sorted[0];
    }

    // Identifica o maior poder na mesa
    let maxPower = -1;
    let topPlaysList = [];
    previousPlays.forEach(p => {
      const pwr = p.card.covered ? 0 : p.card.power;
      if (pwr > maxPower) {
        maxPower = pwr;
        topPlaysList = [p];
      } else if (pwr === maxPower && pwr > 0) {
        topPlaysList.push(p);
      }
    });
    const highestPower = maxPower;

    const getTeam = (id) => (ctx.getPlayerTeam ? ctx.getPlayerTeam(id) : (id === 'player' || id === 'bot_partner' ? 'us' : 'them'));
    const isPartnerLeadingAlone = (topPlaysList.length === 1 && getTeam(topPlaysList[0].playerId) === ctx.botTeam);
    const isEnemyLeadingOrTied = topPlaysList.some(p => getTeam(p.playerId) !== ctx.botTeam);

    const winningCards = sorted.filter(c => c.power > highestPower);
    const tieCards = sorted.filter(c => c.power === highestPower);

    const isCasalMaior = (hasZap && hasCopeta);
    const isCasalPreto = (hasZap && hasEspadilha);
    const isCasalSemZap = (!hasZap && manilhas.length >= 2);
    const partnerSignal = handSignals ? handSignals[ctx.partnerId] : null;

    // -------------------------------------------------------------------------
    // REGRA DE OURO DO ZAP (RODADA 1):
    // Validar se está vindo um 3, ou outra manilha de adversário.
    // Se estiver, DEVE MATAR. Caso contrário, NÃO queimar o Zap!
    // -------------------------------------------------------------------------
    if (hasZap) {
      const isEnemyThreat = isEnemyLeadingOrTied && (highestPower === 10 || highestPower >= 101);
      if (isEnemyThreat && winningCards.length > 0) {
        return winningCards[0];
      }
      if (isMao) {
        const threeCard = nonZapCards.find(c => c.power === 10);
        if (threeCard) return threeCard; // Chama sangue com o 3
      }
      return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
    }

    // -------------------------------------------------------------------------
    // 1. O MÃO (1º a jogar da rodada)
    // -------------------------------------------------------------------------
    if (isMao) {
      // A) Casal Maior (Zap + Copeta): Deixa passar para virar Pé na 2ª
      if (isCasalMaior) {
        return commons.length > 0 ? commons[0] : manilhas[0];
      }

      // B) Casal sem Zap: Desce a maior manilha de cara
      if (isCasalSemZap) {
        return manilhas[manilhas.length - 1];
      }

      // C) Casal Preto: Poupa manilha se tiver lixo
      if (isCasalPreto) {
        if (commons.length > 0) return commons[0];
        return hasEspadilha ? manilhas.find(c => c.manilhaRank === 2) : manilhas[0];
      }

      // D) Par Dobrado (Dois 3, Dois 2): Descarte tático se parceiro sinalizou
      const pairs = this.findHighPairs(commons);
      if (pairs.length > 0 && partnerSignal) {
        return pairs[0];
      }

      // E) Parceiro avisou mão podre: Assume a bronca
      if (partnerSignal === 'lixo') {
        if (manilhas.length > 0 && !hasZap) return manilhas[manilhas.length - 1];
        const strongCom = commons.filter(c => c.power >= 9);
        if (strongCom.length > 0) return strongCom[strongCom.length - 1];
        if (hasZap && commons.length > 0) return commons[commons.length - 1];
      }

      // F) Apenas Zap + Lixo: Sai com 3 ou menor lixo
      if (hasZap && manilhas.length === 1) {
        const threeCard = commons.find(c => c.power === 10);
        if (threeCard) return threeCard;
        return commons[0];
      }

      // G) 1 manilha média + 3: Chamar sangue com o 3
      const threeCard = commons.find(c => c.power === 10);
      if (threeCard && manilhas.length === 1) {
        return threeCard;
      }

      if (commons.length > 0) return commons[0];
      return sorted[0];
    }

    // -------------------------------------------------------------------------
    // 2. O MEIO (2º) ou O PARA-PÉ (3º a jogar)
    // -------------------------------------------------------------------------
    if (isMeio || isParaPe) {
      if (isPartnerLeadingAlone) {
        return sorted[0]; // Poupa munição absoluta
      }

      if (isEnemyLeadingOrTied) {
        if (winningCards.length > 0) {
          const lowestWinning = winningCards[0];
          const isLowestZap = (lowestWinning.isManilha && lowestWinning.manilhaRank === 4);

          // Não queima o Zap em cima de carta fraca (<= 7)
          if (isLowestZap && highestPower <= 7) {
            return sorted[0];
          }

          if (isCasalMaior && highestPower >= 101) {
            return commons.length > 0 ? commons[0] : sorted[0];
          }

          if (isCasalPreto && lowestWinning.manilhaRank === 2) {
            if (highestPower === 10 || highestPower === 101) {
              return lowestWinning;
            }
          }

          // REGRA DE OURO DO PARA-PÉ:
          // Se a mesa está abaixo de 8 (fraca), arrocha com a MAIOR para sangrar o Pé adversário!
          if (isParaPe && highestPower < 8 && (diffConfig?.perfectPlayPe ?? true)) {
            return winningCards[winningCards.length - 1];
          }

          return lowestWinning;
        }

        if (tieCards.length > 0) {
          return tieCards[0]; // Canga
        }

        return sorted[0];
      }

      return sorted[0];
    }

    // -------------------------------------------------------------------------
    // 3. O PÉ (4º a fechar a rodada - Informação Perfeita)
    // -------------------------------------------------------------------------
    if (isPe) {
      if (isPartnerLeadingAlone) {
        return sorted[0];
      }

      if (winningCards.length > 0) {
        const lowestWinning = winningCards[0];
        const isLowestZap = (lowestWinning.isManilha && lowestWinning.manilhaRank === 4);

        if (isLowestZap && highestPower <= 7 && sorted.length > 1) {
          return sorted[0];
        }
        return lowestWinning;
      }

      if (tieCards.length > 0) {
        return tieCards[0]; // Canga no Pé na rodada 1
      }

      return sorted[0];
    }

    return sorted[0];
  }

  /**
   * Avalia se deve trucar na 1ª rodada
   */
  static shouldTruco(ctx, diffConfig) {
    const { availableCards } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const aggressiveness = diffConfig?.trucoAggressiveness ?? 0.65;

    // Com 2 ou mais manilhas na 1ª rodada:
    if (manilhas.length >= 2) {
      return Math.random() < aggressiveness;
    }

    return false;
  }

  /**
   * Avalia resposta ao Truco na 1ª rodada
   */
  static respondToTruco(ctx) {
    const cardsToEvaluate = (ctx.teamCards && ctx.teamCards.length > 0) ? ctx.teamCards : ctx.availableCards;
    const goodCards = cardsToEvaluate.filter(c => c.isManilha || (!c.isManilha && c.power === 10));

    // Na 1ª rodada: se tem 2 ou mais cartas boas (3 ou manilha) -> aceita
    if (goodCards.length >= 2) {
      return { action: 'accept' };
    }
    return { action: 'refuse' };
  }

  static findHighPairs(cards) {
    const powers = [10, 9, 8];
    for (const p of powers) {
      const match = cards.filter(c => c.power === p);
      if (match.length >= 2) return match;
    }
    return [];
  }
}
