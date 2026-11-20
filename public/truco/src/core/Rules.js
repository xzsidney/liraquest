// =============================================================================
// RULES.JS - VALIDADOR PURO DE REGRAS DO TRUCO PAULISTA
// Regras oficiais: resolução de vazas, canga/empate, pontuação e mão de 11/ferro
// =============================================================================

export const BET_SEQUENCE = [1, 3, 6, 9, 12];

export const BET_LABELS = {
  1: 'NORMAL',
  3: 'TRUCO',
  6: 'SEIS',
  9: 'NOVE',
  12: 'DOZE'
};

/**
 * Retorna o próximo valor de aposta na escalada do Truco
 * @param {number} currentBet 
 * @returns {number|null} Próximo valor ou null se já estiver no teto (12)
 */
export function getNextBetValue(currentBet) {
  if (currentBet === 1) return 3;
  if (currentBet === 3) return 6;
  if (currentBet === 6) return 9;
  if (currentBet === 9) return 12;
  return null;
}

/**
 * Retorna o nome textual do valor da aposta
 * @param {number} val 
 * @returns {string} Ex: 'TRUCO', 'SEIS', etc.
 */
export function getBetLabel(val) {
  return BET_LABELS[val] || `${val}`;
}

/**
 * Avalia se o estado do placar caracteriza Mão de Ferro (11 x 11)
 * @param {number} scoreUs 
 * @param {number} scoreThem 
 * @returns {boolean}
 */
export function checkIsMaoDeFerro(scoreUs, scoreThem) {
  return scoreUs === 11 && scoreThem === 11;
}

/**
 * Avalia se o estado do placar caracteriza Mão de 11
 * @param {number} scoreUs 
 * @param {number} scoreThem 
 * @returns {{ isMaoDe11: boolean, team: 'us'|'them'|null }}
 */
export function checkIsMaoDe11(scoreUs, scoreThem) {
  if (checkIsMaoDeFerro(scoreUs, scoreThem)) {
    return { isMaoDe11: false, team: null };
  }
  if (scoreUs === 11) {
    return { isMaoDe11: true, team: 'us' };
  }
  if (scoreThem === 11) {
    return { isMaoDe11: true, team: 'them' };
  }
  return { isMaoDe11: false, team: null };
}

/**
 * Resolve o vencedor de uma vaza de cartas jogadas
 * Regras do Truco Paulista:
 * 1. Carta coberta vale poder 0.
 * 2. Se a maior carta for única, o jogador que a jogou vence para sua equipe.
 * 3. Se houver empate no topo:
 *    - Se os jogadores pertencerem à MESMA equipe (dupla afinada), a própria equipe leva a vaza!
 *    - Se forem de equipes adversárias rivais, ocorre CANGA ('draw').
 * 
 * @param {Array<{playerId: string, card: Object}>} plays 
 * @param {Map<string, {team: string, name: string}>|Function} playerLookup 
 * @returns {{ winnerTeam: 'us'|'them'|'draw', winningCard: Object|null, winningPlayerId: string|null, isPartnerTie: boolean }}
 */
export function resolveTrickPlays(plays, playerLookup) {
  const getPlayerTeam = (playerId) => {
    if (typeof playerLookup === 'function') return playerLookup(playerId)?.team;
    if (playerLookup instanceof Map) return playerLookup.get(playerId)?.team;
    return playerLookup[playerId]?.team;
  };

  let maxPower = -1;
  let topPlays = [];

  plays.forEach(p => {
    const pwr = p.card.covered ? 0 : p.card.power;
    if (pwr > maxPower) {
      maxPower = pwr;
      topPlays = [p];
    } else if (pwr === maxPower && pwr > 0) {
      topPlays.push(p);
    }
  });

  if (topPlays.length === 1) {
    const winnerPlayerId = topPlays[0].playerId;
    const team = getPlayerTeam(winnerPlayerId);
    return {
      winnerTeam: team,
      winningCard: topPlays[0].card,
      winningPlayerId: winnerPlayerId,
      isPartnerTie: false
    };
  }

  if (topPlays.length > 1) {
    const teams = topPlays.map(p => getPlayerTeam(p.playerId));
    const allSameTeam = teams.every(t => t === teams[0]);

    if (allSameTeam) {
      // Empate entre parceiros da mesma equipe leva a vaza para a própria equipe
      return {
        winnerTeam: teams[0],
        winningCard: topPlays[0].card,
        winningPlayerId: topPlays[0].playerId,
        isPartnerTie: true
      };
    }

    // Empate entre adversários: CANGA
    return {
      winnerTeam: 'draw',
      winningCard: topPlays[0].card,
      winningPlayerId: null,
      isPartnerTie: false
    };
  }

  // Fallback caso todas cartas sejam cobertas (poder 0)
  return {
    winnerTeam: 'draw',
    winningCard: null,
    winningPlayerId: null,
    isPartnerTie: false
  };
}

/**
 * Avalia o resultado global da mão após 1, 2 ou 3 vazas
 * @param {Array<{winnerTeam: 'us'|'them'|'draw'}>} tricks 
 * @returns {'us'|'them'|'triple_draw'|null} Vencedor da mão ou null se a mão ainda estiver em andamento
 */
export function evaluateHandWinner(tricks) {
  const len = tricks.length;
  if (len === 1) return null;

  const t0 = tricks[0]?.winnerTeam;
  const t1 = tricks[1]?.winnerTeam;

  // Após a 2ª Vaza:
  if (len === 2) {
    // 1ª empatou e 2ª teve vencedor -> vencedor da 2ª leva a mão inteira
    if (t0 === 'draw' && t1 !== 'draw') {
      return t1;
    }
    // Uma equipe venceu as duas primeiras vazas (2x0)
    if (t0 === 'us' && t1 === 'us') return 'us';
    if (t0 === 'them' && t1 === 'them') return 'them';

    // CANGA DA VITÓRIA: Uma equipe ganhou a 1ª e a 2ª empatou -> equipe da 1ª vence
    if (t0 !== 'draw' && t1 === 'draw') {
      return t0;
    }

    // Jogo 1 x 1 ou 1ª e 2ª empatadas -> vai para a 3ª vaza
    return null;
  }

  // Após a 3ª Vaza (Decisão Final):
  if (len === 3) {
    const t2 = tricks[2]?.winnerTeam;

    // Se a 1ª e a 2ª empataram:
    if (t0 === 'draw' && t1 === 'draw') {
      if (t2 !== 'draw') return t2;
      return 'triple_draw'; // As 3 vazas empataram: ninguém pontua
    }

    // Se a 3ª vaza empatou: quem fez a 1ª vaza leva a mão inteira
    if (t2 === 'draw') {
      return t0;
    }

    // Se houve vencedor na 3ª vaza:
    if (t2 === 'us') {
      const usWins = tricks.filter(x => x.winnerTeam === 'us').length;
      const themWins = tricks.filter(x => x.winnerTeam === 'them').length;
      return usWins >= themWins ? 'us' : 'them';
    }

    if (t2 === 'them') {
      const usWins = tricks.filter(x => x.winnerTeam === 'us').length;
      const themWins = tricks.filter(x => x.winnerTeam === 'them').length;
      return themWins >= usWins ? 'them' : 'us';
    }
  }

  return null;
}
