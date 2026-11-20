// =============================================================================
// ROUND3STRATEGY.JS - REGRAS EXCLUSIVAS DA 3ª RODADA (O DESFECHO FINAL)
// Foco: Blefe de Pé em mesa baixa (< Ás), Zap no Arremate e All-in de Truco
// =============================================================================

export class Round3Strategy {
  /**
   * Escolhe a carta ideal para jogar na 3ª Vaza
   * @param {Object} ctx Contexto da partida
   * @param {Object} diffConfig Configuração de dificuldade
   * @returns {Object} Carta selecionada
   */
  static chooseCard(ctx, diffConfig) {
    const { availableCards, previousPlays } = ctx;
    const sorted = [...availableCards].sort((a, b) => a.power - b.power);
    const manilhas = sorted.filter(c => c.isManilha);
    const zapCard = manilhas.find(c => c.manilhaRank === 4);

    let maxPower = -1;
    previousPlays.forEach(p => {
      const pwr = p.card.covered ? 0 : p.card.power;
      if (pwr > maxPower) maxPower = pwr;
    });

    const winningCards = sorted.filter(c => c.power > maxPower);

    // Se tem o Zap na 3ª rodada: desce o Zap e liquida a fatura!
    if (zapCard) return zapCard;

    // Se tem carta vencedora: joga a carta que mata a mesa
    if (winningCards.length > 0) return winningCards[0];

    return sorted[0];
  }

  /**
   * Avalia pedidos de Truco na 3ª rodada
   * Implementa estritamente:
   * 1. Se tem Zap na 3ª vaza -> TRUCA antes de jogar!
   * 2. REGRA DO USUÁRIO: Se for o Pé (último a jogar) e a maior carta da mesa
   *    for baixa (< Ás, ou seja power < 8: K, J, Q, 7, 6, 5, 4) -> TRUCA DE QUALQUER JEITO!
   * 3. Blefe clássico em jogo 1 a 1 com carta fraca.
   */
  static shouldTruco(ctx, diffConfig) {
    const { role, availableCards, previousPlays, tricksHistory, playerFoldsCount } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);
    const isPe = (role === 'Pé');

    let maxPower = -1;
    previousPlays.forEach(p => {
      const pwr = p.card.covered ? 0 : p.card.power;
      if (pwr > maxPower) maxPower = pwr;
    });

    // 1. Zap na 3ª rodada: sempre truca antes de jogar
    if (hasZap) {
      return true;
    }

    // -------------------------------------------------------------------------
    // REGRA DO USUÁRIO:
    // Você é o último a jogar (Pé) na 3ª rodada e vem carta baixa abaixo de Ás
    // (power < 8: K, J, Q, 7, 6, 5, 4): TRUCA INDEPENDENTEMENTE DA CARTA QUE TENHA!
    // -------------------------------------------------------------------------
    if (isPe && previousPlays.length > 0 && maxPower > 0 && maxPower < 8) {
      ctx.setBluffActive && ctx.setBluffActive(ctx.botId);
      return true; // Blefe certeiro de arremate!
    }

    // 2. Blefe em jogo 1 a 1 com carta baixa
    const t1 = tricksHistory[0]?.winnerTeam;
    const t2 = tricksHistory[1]?.winnerTeam;
    const isOneAndOne = (t1 === 'them' && t2 === 'us') || (t1 === 'us' && t2 === 'them');

    if (isOneAndOne && availableCards.length === 1) {
      const lastCard = availableCards[0];
      if (!lastCard.isManilha && lastCard.power <= 5) {
        const bluffBase = diffConfig?.bluffChance ?? 0.14;
        const foldsMod = (playerFoldsCount || 0) * 0.10;
        const dynamicBluff = Math.min(0.65, bluffBase + foldsMod);

        if (Math.random() < dynamicBluff) {
          ctx.setBluffActive && ctx.setBluffActive(ctx.botId);
          return true;
        }
      }
    }

    // 3. Se tiver manilha na 3ª vaza: truca com 70% de chance
    if (manilhas.length > 0) {
      return Math.random() < 0.70;
    }

    return false;
  }

  /**
   * Avalia respostas a Truco na 3ª rodada
   * Implementa estritamente:
   * - Se tem Zap na 3ª vaza -> NUNCA CORRE! Retruca se puder ou aceita!
   * - Se tem carta boa (3 ou manilha) e mata a mesa -> aceita!
   */
  static respondToTruco(ctx) {
    const { requestedValue, availableCards } = ctx;
    const manilhas = availableCards.filter(c => c.isManilha);
    const hasZap = manilhas.some(c => c.manilhaRank === 4);

    const canRaise = (requestedValue < 12);
    const raiseVal = canRaise ? (requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12)) : null;

    // -------------------------------------------------------------------------
    // REGRA DE OURO DO ZAP NA RODADA 3:
    // Nunca corre com o Zap! Se puder retrucar (6, 9, 12), retruca; se não, aceita!
    // -------------------------------------------------------------------------
    if (hasZap) {
      if (canRaise) {
        return { action: 'raise', raiseVal };
      }
      return { action: 'accept' };
    }

    // Se tem carta boa (3 ou manilha) E mata a mesa:
    const cardsToEvaluate = (ctx.teamCards && ctx.teamCards.length > 0) ? ctx.teamCards : availableCards;
    const goodCards = cardsToEvaluate.filter(c => c.isManilha || (!c.isManilha && c.power === 10));
    const highestOnTable = (ctx.highestPower !== undefined && ctx.highestPower > 0) ? ctx.highestPower : 0;
    const canKillTrick = (highestOnTable === 0) || cardsToEvaluate.some(c => c.power > highestOnTable);

    if (goodCards.length >= 1 && canKillTrick) {
      return { action: 'accept' };
    }

    return { action: 'refuse' };
  }
}
