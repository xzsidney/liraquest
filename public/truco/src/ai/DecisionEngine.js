// =============================================================================
// DECISIONENGINE.JS - MOTOR TÁTICO DE ESCOLHA DE CARTAS DOS BOTS
// Heurística baseada em papéis de mesa (Mão, Meio, Para-Pé, Pé) e nível de IA
// =============================================================================

export class DecisionEngine {
  constructor(difficultyConfig = null) {
    this.diffConfig = difficultyConfig;
  }

  setDifficultyConfig(cfg) {
    this.diffConfig = cfg;
  }

  /**
   * Escolhe a melhor carta para o bot jogar na vaza atual
   * @param {Object} ctx Contexto completo da jogada
   * @returns {Object} A carta escolhida do array availableCards
   */
  chooseCard(ctx) {
    const { botId, role, roundNumber, availableCards, previousPlays, tricksHistory, handSignals, scoreDiff, camaDeGato } = ctx;
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

    // Cama de gato ativa na Rodada 1 para o armador: joga isca (menor lixo)
    if (roundNumber === 1 && camaDeGato?.them && camaDeGato.armador === botId && !camaDeGato.baitPlayed) {
      return sorted[0];
    }

    // Cartas maiores jogadas até agora na vaza
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

    // Casais na mão
    const isCasalMaior = (hasZap && hasCopeta);
    const isCasalPreto = (hasZap && hasEspadilha);
    const isCasalSemZap = (!hasZap && manilhas.length >= 2);

    // Sinal do parceiro
    const partnerSignal = handSignals ? handSignals[ctx.partnerId] : null;

    // =========================================================================
    // RODADA 1: A BATALHA DA PRIMEIRA
    // =========================================================================
    if (roundNumber === 1) {
      // -----------------------------------------------------------------------
      // REGRA MESTRE DO ZAP (RODADA 1):
      // Validar se está vindo um 3, ou outra manilha se estiver deve matar.
      // Caso contrário, NÃO jogar o Zap!
      // -----------------------------------------------------------------------
      if (hasZap) {
        const isEnemyThreat = isEnemyLeadingOrTied && (highestPower === 10 || highestPower >= 101);
        if (isEnemyThreat) {
          if (winningCards.length > 0) {
            return winningCards[0];
          }
        }
        if (isMao) {
          const threeCard = nonZapCards.find(c => c.power === 10);
          if (threeCard) return threeCard; // Chama sangue com o 3
        }
        return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
      }

      // 1. O MÃO (1º a jogar da rodada)
      if (isMao) {
        // A) CASAL MAIOR (Zap + Copeta): Deixa passar na 1ª para virar Pé na 2ª
        if (isCasalMaior) {
          return commons.length > 0 ? commons[0] : manilhas[0];
        }

        // B) CASAL SEM ZAP: Desce a maior manilha de cara
        if (isCasalSemZap) {
          return manilhas[manilhas.length - 1];
        }

        // C) CASAL PRETO: Economiza manilha se tiver lixo
        if (isCasalPreto) {
          if (commons.length > 0) return commons[0];
          return hasEspadilha ? manilhas.find(c => c.manilhaRank === 2) : manilhas[0];
        }

        // D) Par Dobrado (Dois 3, Dois 2 ou Dois Ás):
        const pairs = this.findHighPairs(commons);
        if (pairs.length > 0 && partnerSignal) {
          return pairs[0];
        }

        // E) Se parceiro avisou mão podre: assume a bronca
        if (partnerSignal === 'lixo') {
          if (manilhas.length > 0 && !hasZap) return manilhas[manilhas.length - 1];
          const strongCom = commons.filter(c => c.power >= 9);
          if (strongCom.length > 0) return strongCom[strongCom.length - 1];
          if (hasZap && commons.length > 0) return commons[commons.length - 1];
        }

        // F) Se tem apenas ZAP + lixo: sai com lixo ou 3
        if (hasZap && manilhas.length === 1) {
          const threeCard = commons.find(c => c.power === 10);
          if (threeCard) return threeCard;
          return commons[0];
        }

        // G) 1 manilha média + 3: chama sangue com o 3
        const threeCard = commons.find(c => c.power === 10);
        if (threeCard && manilhas.length === 1) {
          return threeCard;
        }

        // H) Maciota
        if (commons.length > 0) return commons[0];
        return sorted[0];
      }

      // 2. O MEIO (2º a jogar) ou O PARA-PÉ (3º a jogar)
      if (isMeio || isParaPe) {
        if (isPartnerLeadingAlone) {
          return sorted[0]; // Poupa munição total
        }

        if (isEnemyLeadingOrTied) {
          if (winningCards.length > 0) {
            const lowestWinning = winningCards[0];
            const isLowestZap = (lowestWinning.isManilha && lowestWinning.manilhaRank === 4);

            // Não queima o Zap em cima de carta fraca (power <= 7)
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

            // Para-Pé pressiona com a maior carta se for nível normal ou mestre
            if (isParaPe && highestPower < 8 && this.diffConfig?.perfectPlayPe) {
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

      // 3. O PÉ (4º a jogar - Informação Perfeita)
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
    }

    // =========================================================================
    // RODADA 2: A VAZA DA DEFINIÇÃO
    // =========================================================================
    if (roundNumber === 2) {
      const firstTrick = tricksHistory[0];
      const weWonFirst = (firstTrick && firstTrick.winnerTeam === ctx.botTeam);
      const firstDraw = (firstTrick && firstTrick.winnerTeam === 'draw');

      if (hasZap) {
        if (weWonFirst) {
          // Já ganhou a 1ª: poupa o Zap se puder empatar ou ganhar com outra carta
          const nonZapTieCards = tieCards.filter(c => !(c.isManilha && c.manilhaRank === 4));
          if (nonZapTieCards.length > 0) {
            return nonZapTieCards[0]; // Canga da vitória
          }

          const nonZapWinningCards = winningCards.filter(c => !(c.isManilha && c.manilhaRank === 4));
          if (nonZapWinningCards.length > 0) {
            return nonZapWinningCards[0];
          }

          return nonZapCards.length > 0 ? nonZapCards[0] : sorted[0];
        } else {
          // Perdeu a 1ª ou empatou:
          if (firstDraw && previousPlays.length === 0) {
            return zapCard; // Se a 1ª cangou e abre a 2ª, solta o Zap
          }

          const isEnemyThreat = isEnemyLeadingOrTied && (highestPower === 10 || highestPower >= 101);
          if (isEnemyThreat && winningCards.length > 0) {
            return winningCards[0];
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

      // CASO A: RODADA 1 CANGOU -> VALE A VIDA
      if (firstDraw) {
        return sorted[sorted.length - 1]; // Maior carta absoluta
      }

      // CASO B: NOSSA DUPLA GANHOU A 1ª RODADA
      if (weWonFirst) {
        // Canga da vitória
        if (tieCards.length > 0) {
          return tieCards[0];
        }

        if (isPartnerLeadingAlone) {
          return sorted[0];
        }

        if (highestPower === 104) {
          return sorted[0];
        }

        if (isPe && winningCards.length > 0) {
          return winningCards[0];
        }

        if (winningCards.length > 0) return winningCards[0];
        return sorted[0];
      }

      // CASO C: PERDEMOS A 1ª RODADA (Obrigação de matar a 2ª)
      if (!weWonFirst && !firstDraw) {
        if (isPartnerLeadingAlone) {
          return sorted[0];
        }
        if (winningCards.length > 0) {
          return winningCards[0];
        }
        return sorted[0];
      }
    }

    // =========================================================================
    // RODADA 3: DESFECHO FINAL
    // =========================================================================
    if (roundNumber === 3) {
      if (hasZap) return zapCard;
      if (winningCards.length > 0) return winningCards[0];
      return sorted[0];
    }

    return sorted[0];
  }

  findHighPairs(cards) {
    const powers = [10, 9, 8];
    for (const p of powers) {
      const match = cards.filter(c => c.power === p);
      if (match.length >= 2) return match;
    }
    return [];
  }
}
