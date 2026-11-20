// =============================================================================
// TEST-TRUCO-ENGINE.JS - TESTES UNITÁRIOS AUTOMATIZADOS DO MOTOR DE TRUCO
// Validação de regras oficiais, baralho, canga, IA e máquina de estados
// =============================================================================

import assert from 'node:assert';
import { buildDeck, shuffleDeck, getManilhaValue, enrichCards, BASE_RANKS, MANILHA_SEQUENCE } from '../src/core/Cards.js';
import { resolveTrickPlays, evaluateHandWinner, getNextBetValue, getBetLabel, checkIsMaoDe11, checkIsMaoDeFerro } from '../src/core/Rules.js';
import { GameState } from '../src/core/GameState.js';
import { TrucoExpertAgent } from '../src/ai/TrucoExpertAgent.js';
import { TrucoGame } from '../src/TrucoGame.js';

console.log('🃏 INICIANDO BATERIA DE TESTES DO TRUCO PAULISTA...\n');

// -----------------------------------------------------------------------------
// TESTE 1: Baralho de 40 Cartas e Sequência de Manilhas
// -----------------------------------------------------------------------------
{
  const deck = buildDeck();
  assert.strictEqual(deck.length, 40, 'O baralho do Truco deve ter exatamente 40 cartas');

  // Testa sequência circular de manilhas
  assert.strictEqual(getManilhaValue('7'), 'Q', 'Vira 7 deve ter manilha Q');
  assert.strictEqual(getManilhaValue('3'), '4', 'Vira 3 deve ter manilha 4');
  assert.strictEqual(getManilhaValue('K'), 'A', 'Vira K deve ter manilha A');
  assert.strictEqual(getManilhaValue('A'), '2', 'Vira A deve ter manilha 2');

  // Testa enriquecimento de cartas
  const sampleCards = [
    { value: '7', suit: 'paus' },
    { value: 'Q', suit: 'paus' },   // Zap (se vira for 7)
    { value: 'Q', suit: 'copas' },  // Copeta
    { value: 'Q', suit: 'espadas' },// Espadilha
    { value: 'Q', suit: 'ouros' },  // Picafumo
    { value: '3', suit: 'espadas' } // 3 comum
  ];
  enrichCards(sampleCards, 'Q');

  const zap = sampleCards.find(c => c.value === 'Q' && c.suit === 'paus');
  const copeta = sampleCards.find(c => c.value === 'Q' && c.suit === 'copas');
  const espadilha = sampleCards.find(c => c.value === 'Q' && c.suit === 'espadas');
  const picafumo = sampleCards.find(c => c.value === 'Q' && c.suit === 'ouros');
  const tres = sampleCards.find(c => c.value === '3');

  assert.strictEqual(zap.power, 104, 'Zap deve ter poder 104');
  assert.strictEqual(copeta.power, 103, 'Copeta deve ter poder 103');
  assert.strictEqual(espadilha.power, 102, 'Espadilha deve ter poder 102');
  assert.strictEqual(picafumo.power, 101, 'Picafumo deve ter poder 101');
  assert.strictEqual(tres.power, 10, 'Carta 3 comum deve ter poder 10');

  console.log('✅ Teste 1 APROVADO: Baralho de 40 cartas, sequências e manilhas corretos.');
}

// -----------------------------------------------------------------------------
// TESTE 2: Resolução de Vazas (Maior carta, Empate Parceiros e Canga)
// -----------------------------------------------------------------------------
{
  const playersLookup = {
    'player': { team: 'us', name: 'Você' },
    'bot_partner': { team: 'us', name: 'Tião' },
    'bot_left': { team: 'them', name: 'Zé' },
    'bot_right': { team: 'them', name: 'Tonho' }
  };

  // Cenário A: Vitória limpa de um jogador
  const playsA = [
    { playerId: 'player', card: { power: 8, covered: false } },
    { playerId: 'bot_left', card: { power: 6, covered: false } },
    { playerId: 'bot_partner', card: { power: 10, covered: false } }, // 3 ganha
    { playerId: 'bot_right', card: { power: 7, covered: false } }
  ];
  const resA = resolveTrickPlays(playsA, playersLookup);
  assert.strictEqual(resA.winnerTeam, 'us', 'Equipe US deve vencer a vaza');
  assert.strictEqual(resA.winningPlayerId, 'bot_partner', 'Tião venceu com o 3');

  // Cenário B: Empate entre parceiros da mesma equipe (leva a vaza!)
  const playsB = [
    { playerId: 'player', card: { power: 10, covered: false } },       // 3
    { playerId: 'bot_left', card: { power: 8, covered: false } },
    { playerId: 'bot_partner', card: { power: 10, covered: false } },  // 3 empatou com Você
    { playerId: 'bot_right', card: { power: 7, covered: false } }
  ];
  const resB = resolveTrickPlays(playsB, playersLookup);
  assert.strictEqual(resB.winnerTeam, 'us', 'Empate entre parceiros deve dar a vaza para a própria equipe');
  assert.strictEqual(resB.isPartnerTie, true, 'Deve marcar como empate entre parceiros');

  // Cenário C: Empate entre adversários rivais (Canga)
  const playsC = [
    { playerId: 'player', card: { power: 10, covered: false } },       // 3
    { playerId: 'bot_left', card: { power: 10, covered: false } },      // 3 do Zé empata
    { playerId: 'bot_partner', card: { power: 7, covered: false } },
    { playerId: 'bot_right', card: { power: 6, covered: false } }
  ];
  const resC = resolveTrickPlays(playsC, playersLookup);
  assert.strictEqual(resC.winnerTeam, 'draw', 'Empate entre rivais deve ser Canga (draw)');

  console.log('✅ Teste 2 APROVADO: Resolução de vazas, canga e empate de parceiros.');
}

// -----------------------------------------------------------------------------
// TESTE 3: Avaliação Global da Mão (3 vazas e Canga da Vitória)
// -----------------------------------------------------------------------------
{
  // Cenário A: 2 a 0 direto
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'us' }, { winnerTeam: 'us' }]), 'us');

  // Cenário B: Canga na 1ª e vitória na 2ª leva a mão
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'draw' }, { winnerTeam: 'them' }]), 'them');

  // Cenário C: Canga da Vitória (Venceu a 1ª e empatou a 2ª)
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'us' }, { winnerTeam: 'draw' }]), 'us');

  // Cenário D: 1x1 vai pra 3ª vaza (retorna null na 2ª)
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'us' }, { winnerTeam: 'them' }]), null);

  // Cenário E: Decisão na 3ª vaza
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'us' }, { winnerTeam: 'them' }, { winnerTeam: 'us' }]), 'us');

  // Cenário F: Empate na 3ª vaza (quem fez a 1ª leva)
  assert.strictEqual(evaluateHandWinner([{ winnerTeam: 'them' }, { winnerTeam: 'us' }, { winnerTeam: 'draw' }]), 'them');

  console.log('✅ Teste 3 APROVADO: Avaliação oficial de mãos de 3 vazas do Truco Paulista.');
}

// -----------------------------------------------------------------------------
// TESTE 4: Escala de Apostas e Mão de 11 / Ferro
// -----------------------------------------------------------------------------
{
  assert.strictEqual(getNextBetValue(1), 3);
  assert.strictEqual(getNextBetValue(3), 6);
  assert.strictEqual(getNextBetValue(6), 9);
  assert.strictEqual(getNextBetValue(9), 12);
  assert.strictEqual(getNextBetValue(12), null);

  assert.strictEqual(getBetLabel(3), 'TRUCO');
  assert.strictEqual(getBetLabel(6), 'SEIS');
  assert.strictEqual(getBetLabel(9), 'NOVE');
  assert.strictEqual(getBetLabel(12), 'DOZE');

  assert.strictEqual(checkIsMaoDeFerro(11, 11), true);
  assert.strictEqual(checkIsMaoDeFerro(11, 10), false);

  const m11Us = checkIsMaoDe11(11, 9);
  assert.strictEqual(m11Us.isMaoDe11, true);
  assert.strictEqual(m11Us.team, 'us');

  const m11Them = checkIsMaoDe11(5, 11);
  assert.strictEqual(m11Them.isMaoDe11, true);
  assert.strictEqual(m11Them.team, 'them');

  console.log('✅ Teste 4 APROVADO: Escala de Truco e regras de Mão de 11/Ferro.');
}

// -----------------------------------------------------------------------------
// TESTE 5: Seletor de Dificuldade da IA e Agente Especialista
// -----------------------------------------------------------------------------
{
  const game = new TrucoGame('4p', 'normal');
  assert.strictEqual(game.getDifficulty(), 'normal');

  game.setDifficulty('hard');
  assert.strictEqual(game.getDifficulty(), 'hard');

  game.setDifficulty('easy');
  assert.strictEqual(game.getDifficulty(), 'easy');

  // Testa conselho honesto do Tião
  const partnerHand = [
    { isManilha: true, manilhaRank: 4, power: 104 },
    { isManilha: false, power: 3 },
    { isManilha: false, power: 2 }
  ];
  const advice = game.expertAgent.getPartnerAdvice(partnerHand);
  assert.ok(advice.includes('ZAP'), 'Tião deve mencionar o Zap em seu conselho');

  console.log('✅ Teste 5 APROVADO: Seletor de Dificuldade e inteligência dos Bots.');
}

// -----------------------------------------------------------------------------
// TESTE 6: Ciclo de Jogo Completo (Simulação de Partida)
// -----------------------------------------------------------------------------
{
  const simGame = new TrucoGame('1v1', 'hard');
  simGame.startNewGame();

  assert.strictEqual(simGame.playerScore, 0);
  assert.strictEqual(simGame.botScore, 0);
  assert.strictEqual(simGame.roundNumber, 1);
  assert.ok(simGame.viraCard, 'Vira card deve estar definido');
  assert.ok(simGame.manilhaValue, 'Manilha deve estar definida');

  const pCards = simGame.hands['player'];
  assert.strictEqual(pCards.length, 3, 'Jogador deve receber 3 cartas');

  console.log('✅ Teste 6 APROVADO: Partida e distribuição inicial funcionando perfeitamente.');
}

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
