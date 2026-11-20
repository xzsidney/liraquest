// =============================================================================
// ROUND2STRATEGY.JS - REGRAS EXCLUSIVAS DA 2ª RODADA (A VAZA DA DEFINIÇÃO)
// Foco: 1ª ganha + 3 = Truco, Zap até 12 nunca corre, Canga da Vitória e Pós-Canga
// =============================================================================

export class Round2Strategy {
  /**
   * Escolhe a carta ideal para jogar na 2ª Vaza
   * @param {Object} ctx Contexto da partida
   * @param {Object} diffConfig Configuração de dificuldade
   * @returns {Object} Carta selecionada
   */
  static chooseCard(ctx, diffConfig) {
    const { role, availableCards, previousPlays, tricksHistory } = ctx;
    const sorted = [...availableCards].sort((a, b) => a.power - b.power);
    const manilhas = sorted.filter(c => c.isManilha);
    const zapCard = manilhas.find(c => c.manilhaRank === 4);
    const hasZap = Boolean(zapCard);
    const nonZapCards = sorted.filter(c => !(c.isManilha && c.manilhaRank === 4));

    const isPe = (role === 'Pé');

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

    const firstTrick = tricksHistory[0];
    const weWonFirst = (firstTrick && firstTrick.winnerTeam === ctx.botTeam);
    const firstDraw = (firstTrick && firstTrick.winnerTeam === 'draw');

    // -------------------------------------------------------------------------
    // REGRA DO ZAP NA RODADA 2:
    // - Se a 1ª está ganha (weWonFirst): NÃO queimar o Zap à toa!
    //   Pois se empatar leva na hora, ou guarda para garantir a 3ª.
    // - Se a 1ª cangou ou perdemos: deve matar qualquer ameaça de adversário!
    // -------------------------------------------------------------------------
    if (hasZap) {
      if (weWonFirst) {
        // Canga da vitória sem Zap (se empatar, ganha a mão imediatamente)
        const nonZapTieCards = tieCards.filter(c => !(c.isManilha && c.manilhaRank === 4));
        if (nonZapTieCards.length > 0) {
          return nonZapTieCards[0];
        }

        // Mata com 3 ou outra manilha sem gastar o Zap
        const nonZapWinningCards = winningCards.filter(c => !(c.isManilha && c.manilhaRank === 4));
        if (nonZapWinningCards.length > 0) {
          return nonZapWinningCards[0];
        }

        // Poupa o Zap para a 3ª vaza
        return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
      } else {
        // Se a 1ª cangou e o bot abre a 2ª: solta o Zap logo para faturar a mão!
        if (firstDraw && previousPlays.length === 0) {
          return zapCard;
        }

        const isEnemyThreat = isEnemyLeadingOrTied && (highestPower === 10 || highestPower >= 101);
        if (isEnemyThreat && winningCards.length > 0) {
          return winningCards[0]; // Mata com o que tiver (inclusive Zap)
        }

        if (isPartnerLeadingAlone) {
          return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
        }

        if (winningCards.length > 0) {
          return winningCards[0];
        }

        return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
      }
    }

    // -------------------------------------------------------------------------
    // CASO A: A 1ª VAZA CANGOU (Empatou na primeira) -> QUEM FIZER LEVA A MÃO!
    // -------------------------------------------------------------------------
    if (firstDraw) {
      // REGRA DE OURO: Descer a MAIOR CARTA ABSOLUTA sem piedade!
      return sorted[sorted.length - 1];
    }

    // -------------------------------------------------------------------------
    // CASO B: NOSSA DUPLA GANHOU A 1ª VAZA
    // -------------------------------------------------------------------------
    if (weWonFirst) {
      // 1. CANGA DA VITÓRIA: Quem fez a 1ª e empata a 2ª GANHA NA HORA!
      if (tieCards.length > 0) {
        return tieCards[0];
      }

      if (isPartnerLeadingAlone) {
        return sorted[0]; // Parceiro já fechou
      }

      // Se o adversário jogou o Zap na mesa: descarta o menor lixo
      if (highestPower === 104) {
        return sorted[0];
      }

      // O Pé fecha com a menor vencedora
      if (isPe && winningCards.length > 0) {
        return winningCards[0];
      }

      if (winningCards.length > 0) return winningCards[0];
      return sorted[0];
    }

    // -------------------------------------------------------------------------
    // CASO C: NOSSA DUPLA PERDEU A 1ª VAZA (Obrigação de Sobrevivência)
    // -------------------------------------------------------------------------
    if (!weWonFirst && !firstDraw) {
      if (isPartnerLeadingAlone) {
        return sorted[0];
      }
      if (winningCards.length > 0) {
        return winningCards[0];
      }
      return sorted[0];
    }

    return sorted[0];
  }

  /**
   * Avalia pedidos de Truco na 2ª rodada
   * Implementa estritamente:
   * 1. Se a 1ª está ganha e tem um 3 na mão -> TRUCA!
   * 2. Se a 1ª está ganha e tem Zap -> TRUCA!
   * 3. Se a 1ª cangou e tem manilha -> TRUCA para fechar na canga!
   */
  static shouldTruco(ctx, diffConfig) {
    const { botTeam, role, availableCards, previousPlays, tricksHistory, camaDeGato } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const hasThree = availableCards.some(c => !c.isManilha && c.power === 10);
    const isPe = (role === 'Pé');

    const firstTrick = tricksHistory[0];
    const firstWon = firstTrick && firstTrick.winnerTeam === botTeam;
    const firstDraw = firstTrick && firstTrick.winnerTeam === 'draw';

    let maxPower = -1;
    previousPlays.forEach(p => {
      const pwr = p.card.covered ? 0 : p.card.power;
      if (pwr > maxPower) maxPower = pwr;
    });

    const aggressiveness = diffConfig?.trucoAggressiveness ?? 0.65;

    // 1. FECHAMENTO DA CAMA DE GATO NA 2ª VAZA
    if (camaDeGato?.them && camaDeGato.armador === ctx.botId && camaDeGato.baitPlayed) {
      if (hasZap || hasCopeta) {
        return true;
      }
    }

    // 2. REGRA DO USUÁRIO: Se a 1ª está ganha e tem Zap -> TRUCA!
    if (firstWon && hasZap) {
      return true;
    }

    // 3. REGRA DO USUÁRIO: Se a 1ª está ganha e tem um 3 na mão -> TRUCA!
    if (firstWon && hasThree) {
      return Math.random() < aggressiveness;
    }

    // 4. PÓS-CANGA: 1ª vaza empatou e bot tem manilha -> TRUCA para liquidar!
    if (firstDraw && manilhas.length > 0) {
      return Math.random() < (aggressiveness + 0.2);
    }

    // 5. O Pé da 2ª vaza com a 1ª ganha e carta para matar:
    if (firstWon && isPe && availableCards.some(c => c.isManilha && c.power > maxPower)) {
      return true;
    }

    return false;
  }

  /**
   * Avalia respostas a Truco e Retruco na 2ª rodada
   * Implementa estritamente:
   * - Se a 1ª está ganha e tem Zap -> Retruca (6, 9, 12) e NUNCA FOGE!
   */
  static respondToTruco(ctx) {
    const { requestedValue, botTeam, role, availableCards, tricksHistory, camaDeGato } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const hasCopeta = manilhas.some(c => c.manilhaRank === 3);
    const hasEspadilha = manilhas.some(c => c.manilhaRank === 2);

    const firstTrick = tricksHistory[0];
    const firstWon = firstTrick && firstTrick.winnerTeam === botTeam;
    const firstDraw = firstTrick && firstTrick.winnerTeam === 'draw';

    const canRaise = (requestedValue < 12);
    const raiseVal = canRaise ? (requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12)) : null;

    // -------------------------------------------------------------------------
    // REGRA DO USUÁRIO:
    // Se a 1ª estiver feita e você tiver Zap: gritar 6, 9, 12 e NUNCA FUGIR!
    // -------------------------------------------------------------------------
    if (firstWon && hasZap) {
      if (canRaise) {
        return { action: 'raise', raiseVal };
      }
      return { action: 'accept' };
    }

    // Cama de gato armada
    if (camaDeGato?.them && camaDeGato.baitPlayed) {
      if (canRaise && Math.random() < 0.6) {
        return { action: 'raise', raiseVal };
      }
      return { action: 'accept' };
    }

    // Casal Maior ou Casal Preto no Pé retruca
    const isCasalMaior = (hasZap && hasCopeta);
    const isCasalPretoPe = (hasZap && hasEspadilha && role === 'Pé');
    if (canRaise && (isCasalMaior || isCasalPretoPe)) {
      return { action: 'raise', raiseVal };
    }

    // Critério de cartas boas na 2ª rodada:
    // 2 ou mais cartas boas (3 ou manilha) E consegue matar a carta da mesa
    const cardsToEvaluate = (ctx.teamCards && ctx.teamCards.length > 0) ? ctx.teamCards : availableCards;
    const goodCards = cardsToEvaluate.filter(c => c.isManilha || (!c.isManilha && c.power === 10));
    const highestOnTable = (ctx.highestPower !== undefined && ctx.highestPower > 0) ? ctx.highestPower : 0;
    const canKillTrick = (highestOnTable === 0) || cardsToEvaluate.some(c => c.power > highestOnTable);

    if (goodCards.length >= 2 && canKillTrick) {
      return { action: 'accept' };
    }

    // Se a 1ª empatou e tem Zap ou Copeta disputando Seis ou mais:
    if (firstDraw && requestedValue >= 6 && (hasZap || hasCopeta)) {
      return { action: 'accept' };
    }

    return { action: 'refuse' };
  }
}
