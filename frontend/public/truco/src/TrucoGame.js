// =============================================================================
// TRUCOGAME.JS - MOTOR PRINCIPAL REFATORADO DO TRUCO PAULISTA
// Arquitetura Desacoplada e Modular: Core, AI, Audio e UI
// =============================================================================

import { buildDeck, shuffleDeck, getManilhaValue, enrichCards } from './core/Cards.js';
import { resolveTrickPlays, evaluateHandWinner, getNextBetValue, getBetLabel, checkIsMaoDe11, checkIsMaoDeFerro } from './core/Rules.js';
import { GameState } from './core/GameState.js';
import { TrucoExpertAgent, BOT_SIGNALS, BOT_QUOTES } from './ai/TrucoExpertAgent.js';
import { defaultAudio } from './audio/AudioManager.js';

export class TrucoGame {
  constructor(initialMode = '4p', initialDifficulty = 'normal') {
    this.state = new GameState(initialMode);
    this.expertAgent = new TrucoExpertAgent(this, initialDifficulty);
    this.audio = defaultAudio;

    this.signalTimeouts = [];

    // Callbacks de Eventos
    this.onStateChange = null;
    this.onBotSpeech = null;
    this.onBotSignal = null;
    this.onPlayerSignal = null;
    this.onMessage = null;
    this.onGameOver = null;
  }

  // Getters de conveniência para compatibilidade com código cliente existente
  get gameMode() { return this.state.gameMode; }
  get playerScore() { return this.state.playerScore; }
  set playerScore(val) { this.state.playerScore = val; }
  get botScore() { return this.state.botScore; }
  set botScore(val) { this.state.botScore = val; }
  get targetScore() { return this.state.targetScore; }
  get handNumber() { return this.state.handNumber; }
  get currentTurnPlayerId() { return this.state.currentTurnPlayerId; }
  get roundNumber() { return this.state.roundNumber; }
  get viraCard() { return this.state.viraCard; }
  get manilhaValue() { return this.state.manilhaValue; }
  get hands() { return this.state.hands; }
  get tricks() { return this.state.tricks; }
  get betValue() { return this.state.betValue; }
  set betValue(val) { this.state.betValue = val; }
  get betState() { return this.state.betState; }
  set betState(val) { this.state.betState = val; }
  get lastBettorTeam() { return this.state.lastBettorTeam; }
  get isMaoDe11() { return this.state.isMaoDe11; }
  get isMaoDeFerro() { return this.state.isMaoDeFerro; }
  get isGameOver() { return this.state.isGameOver; }
  get resolvingTrick() { return this.state.resolvingTrick; }

  setPlayerProfile(name, avatar) {
    this.state.setPlayerProfile(name, avatar);
    this.emitState();
  }

  setGameMode(mode) {
    if (this.state.gameMode === mode) return;
    this.state.setGameMode(mode);
    this.startNewGame();
  }

  setDifficulty(levelKey) {
    this.expertAgent.setDifficulty(levelKey);
    const cfg = this.expertAgent.getDifficultyConfig();
    this.notifyMessage(`Nível da Inteligência Artificial alterado para: ${cfg.emoji} ${cfg.name}.`, 'info');
  }

  getDifficulty() {
    return this.expertAgent.getDifficulty();
  }

  getPlayer(id) {
    return this.state.getPlayer(id);
  }

  getNextBetValue() {
    return getNextBetValue(this.state.betValue);
  }

  getBetLabel(val) {
    return getBetLabel(val);
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  botSay(botId, text) {
    if (this.onBotSpeech) {
      this.onBotSpeech(botId, text);
    }
  }

  notifyMessage(msg, type = "info") {
    if (this.onMessage) {
      this.onMessage(msg, type);
    }
  }

  emitState() {
    if (this.onStateChange) {
      const nextVal = this.getNextBetValue();
      const nextLabel = this.getBetLabel(nextVal);
      this.onStateChange(this.state.getSnapshot(nextVal, nextLabel));
    }
  }

  clearSignalTimeouts() {
    if (this.signalTimeouts && this.signalTimeouts.length > 0) {
      this.signalTimeouts.forEach(t => clearTimeout(t));
      this.signalTimeouts = [];
    }
  }

  // ===========================================================================
  // CICLO DA PARTIDA E DAS MÃOS
  // ===========================================================================

  startNewGame() {
    this.clearSignalTimeouts();
    this.state.playerScore = 0;
    this.state.botScore = 0;
    this.state.handNumber = 0;
    this.state.starterIndex = Math.floor(Math.random() * this.state.players.length);
    this.state.isGameOver = false;
    this.state.playerFoldsCount = 0;

    const modeName = this.state.gameMode === '4p' ? "2 vs 2 (4 Jogadores em Duplas)" : "1 vs 1 (Mano a Mano)";
    const diffCfg = this.expertAgent.getDifficultyConfig();
    this.notifyMessage(`Partida iniciada no modo ${modeName} [IA: ${diffCfg.emoji} ${diffCfg.name}]! Quem fizer 12 pontos primeiro vence.`, "info");
    this.startNewHand();
  }

  startNewHand() {
    if (this.state.isGameOver) return;
    this.clearSignalTimeouts();
    this.state.handSignals = { player: null, bot_partner: null, bot_left: null, bot_right: null };
    this.state.handNumber++;

    if (this.state.handNumber > 1) {
      this.state.starterIndex = (this.state.starterIndex + 1) % this.state.players.length;
    }
    this.state.currentTurnPlayerId = this.state.players[this.state.starterIndex].id;
    this.state.roundNumber = 1;
    this.state.tricks = [];

    this.state.betValue = 1;
    this.state.betState = 'none';
    this.state.lastBettorTeam = null;
    this.state.lastBettorPlayerId = null;
    this.state.resolvingTrick = false;
    this.state.lastPartnerAdvice = "";

    // Mão de Ferro e Mão de 11
    this.state.isMaoDeFerro = checkIsMaoDeFerro(this.state.playerScore, this.state.botScore);
    const m11 = checkIsMaoDe11(this.state.playerScore, this.state.botScore);
    this.state.isMaoDe11 = m11.isMaoDe11;
    this.state.maoDe11Team = m11.team;

    if (this.state.isMaoDe11) {
      this.state.betValue = 3;
    }

    // Distribuição de Cartas
    this.state.deck = shuffleDeck(buildDeck());
    this.state.hands = {};
    this.state.players.forEach(p => {
      this.state.hands[p.id] = [this.state.deck.pop(), this.state.deck.pop(), this.state.deck.pop()];
    });

    this.state.viraCard = this.state.deck.pop();
    this.state.manilhaValue = getManilhaValue(this.state.viraCard.value);

    // Enriquecimento com regras oficiais
    this.state.players.forEach(p => {
      enrichCards(this.state.hands[p.id], this.state.manilhaValue);
    });

    // Avalia táticas de Casal Maior e Cama de Gato
    this.evaluateAdvancedTactics();

    this.audio.playCardSlide();

    // Tratamento para Mão de Ferro
    if (this.state.isMaoDeFerro) {
      this.notifyMessage("🔥 MÃO DE FERRO (11 x 11)! Todas as cartas no escuro! Ninguém vê nada!", "warning");
      this.emitState();
      this.startTrick();
      return;
    }

    // Tratamento para Mão de 11
    if (this.state.isMaoDe11) {
      if (this.state.maoDe11Team === 'us') {
        const partnerDesc = this.state.gameMode === '4p' ? " Suas cartas e as do seu parceiro Tião foram reveladas para análise!" : "";
        this.notifyMessage(`⭐ MÃO DE 11 PARA NÓS!${partnerDesc} Escolha jogar (vale 3) ou correr (dá 1 ponto a eles).`, "warning");
        this.state.betState = 'player_deciding_mao11';

        if (this.state.gameMode === '4p') {
          setTimeout(() => {
            const partnerCards = (this.state.hands['bot_partner'] || []).filter(c => !c.played);
            const quote = this.expertAgent.getPartnerAdvice(partnerCards);
            this.state.lastPartnerAdvice = quote;
            this.botSay('bot_partner', quote);
            this.emitState();
          }, 300);
        }

        this.emitState();
        return;
      } else {
        this.notifyMessage("⚠️ A dupla adversária está com 11 pontos e está avaliando as cartas...", "warning");
        this.emitState();
        setTimeout(() => this.botDecideMao11(), 1400);
        return;
      }
    }

    const starterName = this.state.getPlayer(this.state.currentTurnPlayerId).name;
    this.notifyMessage(`Mão ${this.state.handNumber} iniciada! Vira: ${this.state.viraCard.value} ${this.state.viraCard.suitSymbol} -> MANILHA: ${this.state.manilhaValue}! (${starterName} abre a mão)`, "info");
    this.emitState();
    this.scheduleHandSignals();
    this.startTrick();
  }

  evaluateAdvancedTactics() {
    this.state.camaDeGato = { us: false, them: false, armador: null, baitPlayed: false };
    this.state.casalMaior = { us: false, them: false };
    this.state.activeBluff = { isBluff: false, botId: null, caught: false };

    if (this.state.isMaoDeFerro || this.state.isMaoDe11) return;

    // 1. Casal Maior (Zap + Copeta)
    const usCards = [...(this.state.hands['player'] || []), ...(this.state.hands['bot_partner'] || [])];
    const usHasZap = usCards.some(c => c.isManilha && c.manilhaRank === 4);
    const usHasCopeta = usCards.some(c => c.isManilha && c.manilhaRank === 3);
    if (usHasZap && usHasCopeta) {
      this.state.casalMaior.us = true;
      if (this.state.gameMode === '4p' && Math.random() < 0.65) {
        setTimeout(() => this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.casalMaior)), 500);
      }
    }

    const themBots = this.state.players.filter(p => p.team === 'them');
    let themCards = [];
    themBots.forEach(b => themCards.push(...(this.state.hands[b.id] || [])));
    const themHasZap = themCards.some(c => c.isManilha && c.manilhaRank === 4);
    const themHasCopeta = themCards.some(c => c.isManilha && c.manilhaRank === 3);
    if (themHasZap && themHasCopeta) {
      this.state.casalMaior.them = true;
    }

    // 2. Cama de Gato
    const camaChance = this.expertAgent.getDifficultyConfig().camaDeGatoChance;
    if (camaChance > 0) {
      for (const b of themBots) {
        const bHand = this.state.hands[b.id] || [];
        const bHasZap = bHand.some(c => c.isManilha && c.manilhaRank === 4);
        const bHasSecondBoss = bHand.some(c => (c.isManilha && c.manilhaRank >= 2) || (!c.isManilha && c.power === 10));
        const bHasTrash = bHand.some(c => !c.isManilha && c.power <= 6);

        if (bHasZap && bHasSecondBoss && bHasTrash && Math.random() < camaChance) {
          this.state.camaDeGato.them = true;
          this.state.camaDeGato.armador = b.id;
          this.state.camaDeGato.baitPlayed = false;
          break;
        }
      }
    }
  }

  // ===========================================================================
  // MÃO DE 11 DECISÕES
  // ===========================================================================

  botDecideMao11() {
    const themPlayers = this.state.players.filter(p => p.team === 'them');
    let combinedCards = [];
    themPlayers.forEach(p => combinedCards.push(...(this.state.hands[p.id] || [])));

    const scoreDiff = this.state.botScore - this.state.playerScore;
    const roles = this.state.getTacticalRoles();
    const leadBot = themPlayers[0];
    const role = roles[leadBot.id]?.name || 'Meio';

    const willPlay = this.expertAgent.evaluateMao11(combinedCards, scoreDiff, role);

    if (willPlay) {
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.mao11Accept));
      this.notifyMessage("A dupla adversária aceitou jogar a Mão de 11! A mão vale 3 pontos.", "info");
      this.startTrick();
    } else {
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.mao11Refuse));
      this.notifyMessage("A dupla adversária correu da Mão de 11! Nós ganhamos 1 ponto.", "win");
      this.state.playerScore += 1;
      this.checkEndGame();
      if (!this.state.isGameOver) {
        setTimeout(() => this.startNewHand(), 1600);
      }
    }
  }

  playerDecideMao11(accept) {
    if (this.state.betState !== 'player_deciding_mao11') return;
    this.state.betState = 'none';

    if (accept) {
      this.audio.playClick();
      this.notifyMessage("Você aceitou jogar a Mão de 11! A mão vale 3 pontos.", "info");
      this.startTrick();
    } else {
      this.audio.playClick();
      this.notifyMessage("Você correu da Mão de 11. Adversários ganharam 1 ponto.", "loss");
      this.state.botScore += 1;
      this.checkEndGame();
      if (!this.state.isGameOver) {
        setTimeout(() => this.startNewHand(), 1600);
      }
    }
  }

  // ===========================================================================
  // VAZAS (TRICKS)
  // ===========================================================================

  startTrick() {
    this.state.resolvingTrick = false;

    if (!this.state.tricks[this.state.roundNumber - 1]) {
      this.state.tricks.push({
        plays: [],
        winnerTeam: null,
        winningCard: null,
        leadPlayerId: this.state.currentTurnPlayerId
      });
    } else {
      this.state.tricks[this.state.roundNumber - 1].leadPlayerId = this.state.currentTurnPlayerId;
    }

    this.emitState();

    if (this.state.gameMode === '4p' && !this.state.isGameOver) {
      if (this.state.roundNumber === 2 || this.state.roundNumber === 3) {
        setTimeout(() => this.checkAndSendPartnerSignal('trick_start'), 450);
      }
      const roles = this.state.getTacticalRoles();
      if (this.state.roundNumber === 1) {
        if (roles['bot_partner']?.name === 'Pé') {
          setTimeout(() => this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.tiaoPe)), 350);
        } else if (roles['bot_partner']?.name === 'Para-Pé') {
          setTimeout(() => this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.tiaoParaPe)), 350);
        }
      } else if (this.state.roundNumber === 2) {
        const firstTrick = this.state.tricks[0];
        if (firstTrick && firstTrick.winnerTeam === 'draw') {
          setTimeout(() => this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.tiaoCangaAdvice)), 350);
        } else if (firstTrick && firstTrick.winnerTeam === 'us') {
          setTimeout(() => this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.tiaoTieWin)), 350);
        }
      }
    }

    if (this.state.currentTurnPlayerId !== 'player') {
      const delay = (this.state.roundNumber === 1 && !this.state.isMaoDeFerro && !this.state.isMaoDe11) ? 2200 : 900;
      setTimeout(() => this.botPlayTurn(this.state.currentTurnPlayerId), delay);
    }
  }

  playerPlayCard(cardIndex, isCovered = false) {
    if (this.state.currentTurnPlayerId !== 'player' || this.state.isGameOver || this.state.betState !== 'none' || this.state.resolvingTrick) return;
    const myHand = this.state.hands['player'];
    const card = myHand[cardIndex];
    if (!card || card.played) return;

    if (isCovered && this.state.roundNumber === 1 && !this.state.isMaoDeFerro) {
      this.notifyMessage("Não é permitido jogar carta coberta na primeira vaza!", "warning");
      return;
    }

    card.played = true;
    card.covered = isCovered;

    const isSlam = card.isManilha && !isCovered;
    this.audio.playCardPlay(isSlam);

    let currentTrick = this.state.tricks[this.state.roundNumber - 1];
    if (!currentTrick) {
      currentTrick = { plays: [], winnerTeam: null, winningCard: null, leadPlayerId: 'player' };
      this.state.tricks.push(currentTrick);
    }
    currentTrick.plays.push({ playerId: 'player', card });

    this.emitState();

    if (currentTrick.plays.length === this.state.players.length) {
      this.state.resolvingTrick = true;
      setTimeout(() => this.resolveTrick(), 900);
    } else {
      this.state.currentTurnPlayerId = this.state.getNextPlayerId('player');
      this.emitState();
      setTimeout(() => this.botPlayTurn(this.state.currentTurnPlayerId), 900);
    }
  }

  botPlayTurn(botId) {
    if (this.state.currentTurnPlayerId !== botId || this.state.isGameOver || this.state.resolvingTrick) return;

    const availableCards = this.state.hands[botId].filter(c => !c.played);
    if (availableCards.length === 0) return;

    let currentTrick = this.state.tricks[this.state.roundNumber - 1];
    if (!currentTrick) {
      currentTrick = { plays: [], winnerTeam: null, winningCard: null, leadPlayerId: botId };
      this.state.tricks.push(currentTrick);
    }

    const roles = this.state.getTacticalRoles();
    const botObj = this.state.getPlayer(botId);
    const partnerId = this.state.getPartnerId(botId);
    const scoreDiff = botObj.team === 'us' ? (this.state.playerScore - this.state.botScore) : (this.state.botScore - this.state.playerScore);

    const ctx = {
      botId,
      botTeam: botObj.team,
      partnerId,
      role: roles[botId]?.name || 'Meio',
      roundNumber: this.state.roundNumber,
      availableCards,
      previousPlays: currentTrick.plays,
      tricksHistory: this.state.tricks,
      handSignals: this.state.handSignals,
      scoreDiff,
      isMaoDe11: this.state.isMaoDe11,
      isMaoDeFerro: this.state.isMaoDeFerro,
      isGameOver: this.state.isGameOver,
      betState: this.state.betState,
      lastBettorTeam: this.state.lastBettorTeam,
      nextBetValue: this.getNextBetValue(),
      playerFoldsCount: this.state.playerFoldsCount,
      camaDeGato: this.state.camaDeGato,
      getPlayerTeam: (pid) => this.state.getPlayer(pid)?.team,
      setBluffActive: (bId) => { this.state.activeBluff = { isBluff: true, botId: bId, caught: false }; }
    };

    // 1. Avalia se pede Truco
    if (this.expertAgent.shouldTruco(ctx)) {
      this.botInitiateTruco(botId);
      return;
    }

    let chosenCard = null;
    let playCovered = false;

    if (this.state.isMaoDeFerro) {
      chosenCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    } else {
      chosenCard = this.expertAgent.chooseCard(ctx);

      // Blefe de carta coberta (apenas na 2ª ou 3ª vaza)
      if (this.state.roundNumber > 1 && chosenCard.power <= 3 && Math.random() < 0.2) {
        const firstTrick = this.state.tricks[0];
        if (firstTrick && firstTrick.winnerTeam === botObj.team) {
          playCovered = true;
        }
      }
    }

    chosenCard.played = true;
    chosenCard.covered = playCovered;
    currentTrick.plays.push({ playerId: botId, card: chosenCard });

    const isSlam = chosenCard.isManilha && !playCovered;
    this.audio.playCardPlay(isSlam);

    if (this.state.gameMode === '4p' && this.state.roundNumber === 2 && botObj.team === 'them') {
      setTimeout(() => this.checkAndSendPartnerSignal('enemy_play'), 300);
    }

    // Falas de mesa
    if (chosenCard.isManilha && chosenCard.manilhaRank === 4) {
      this.botSay(botId, this.pickRandom(BOT_QUOTES.playZap));
    } else if (chosenCard.isManilha || chosenCard.power >= 9) {
      if (Math.random() < 0.35) this.botSay(botId, this.pickRandom(BOT_QUOTES.playStrong));
    } else if (chosenCard.power <= 2) {
      if (Math.random() < 0.25) this.botSay(botId, this.pickRandom(BOT_QUOTES.playWeak));
    }

    this.emitState();

    if (currentTrick.plays.length === this.state.players.length) {
      this.state.resolvingTrick = true;
      setTimeout(() => this.resolveTrick(), 900);
    } else {
      this.state.currentTurnPlayerId = this.state.getNextPlayerId(botId);
      this.emitState();
      if (this.state.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.state.currentTurnPlayerId), 900);
      }
    }
  }

  resolveTrick() {
    const trick = this.state.tricks[this.state.roundNumber - 1];
    const outcome = resolveTrickPlays(trick.plays, (pid) => this.state.getPlayer(pid));

    trick.winnerTeam = outcome.winnerTeam;
    trick.winningCard = outcome.winningCard;

    if (outcome.winnerTeam !== 'draw') {
      const winnerPlayer = this.state.getPlayer(outcome.winningPlayerId);
      this.state.currentTurnPlayerId = winnerPlayer.id;

      if (winnerPlayer.team === 'us') {
        this.audio.playRoundWin();
        if (outcome.isPartnerTie) {
          this.notifyMessage(`Dupla afinada! Vocês dois amarraram em cima e levaram a vaza!`, "win");
        } else {
          const whoStr = winnerPlayer.id === 'player' ? "Você" : "Seu parceiro Tião";
          this.notifyMessage(`${whoStr} venceu a ${this.state.roundNumber}ª vaza para Nós!`, "win");
        }
        if (winnerPlayer.id === 'bot_partner') {
          this.botSay('bot_partner', "Essa é nossa, parceiro!");
        } else {
          const opponent = this.state.players.find(p => p.team === 'them');
          if (Math.random() < 0.4) this.botSay(opponent.id, this.pickRandom(BOT_QUOTES.loseRound));
        }
      } else {
        this.audio.playRoundLoss();
        if (outcome.isPartnerTie) {
          this.notifyMessage(`A dupla adversária amarrou a maior carta e levou a vaza!`, "loss");
        } else {
          this.notifyMessage(`${winnerPlayer.name} venceu a ${this.state.roundNumber}ª vaza para a máquina!`, "loss");
        }
        if (Math.random() < 0.5) this.botSay(winnerPlayer.id, this.pickRandom(BOT_QUOTES.winRound));
      }
    } else {
      // Canga
      this.state.currentTurnPlayerId = trick.leadPlayerId || this.state.currentTurnPlayerId;
      this.audio.playCanga();
      this.notifyMessage(`Empate (CANGA) na ${this.state.roundNumber}ª vaza!`, "warning");
      const botToSpeak = this.state.players.find(p => p.id !== 'player');
      if (botToSpeak) this.botSay(botToSpeak.id, this.pickRandom(BOT_QUOTES.canga));
    }

    this.emitState();

    const handResult = evaluateHandWinner(this.state.tricks);
    if (handResult) {
      setTimeout(() => {
        this.state.resolvingTrick = false;
        this.finishHand(handResult);
      }, 1500);
    } else {
      setTimeout(() => {
        this.state.roundNumber++;
        this.state.resolvingTrick = false;
        this.startTrick();
      }, 1500);
    }
  }

  finishHand(winnerTeam) {
    this.clearSignalTimeouts();
    if (winnerTeam === 'us') {
      this.state.playerScore += this.state.betValue;
      this.audio.playRoundWin();
      this.notifyMessage(`🎉 NÓS VENCEMOS A MÃO! (+${this.state.betValue} ponto${this.state.betValue > 1 ? 's' : ''})`, "win");
      if (this.state.activeBluff.caught) {
        const bluffBot = this.state.activeBluff.botId;
        setTimeout(() => {
          this.botSay(bluffBot, this.pickRandom(BOT_QUOTES.bluffCaught));
          this.state.activeBluff.caught = false;
          this.state.activeBluff.isBluff = false;
        }, 400);
      } else if (this.state.gameMode === '4p') {
        this.botSay('bot_partner', "Boa parceiro! Jogamos muito!");
      }
    } else if (winnerTeam === 'them') {
      this.state.botScore += this.state.betValue;
      this.audio.playRoundLoss();
      this.notifyMessage(`💥 A DUPLA ADVERSÁRIA LEVOU A MÃO! (+${this.state.betValue} ponto${this.state.betValue > 1 ? 's' : ''})`, "loss");
      if (this.state.camaDeGato.them && this.state.camaDeGato.baitPlayed) {
        setTimeout(() => {
          this.botSay(this.state.camaDeGato.armador, this.pickRandom(BOT_QUOTES.camaDeGatoSpring));
        }, 350);
      } else {
        const opponent = this.state.players.find(p => p.team === 'them');
        if (opponent && Math.random() < 0.7) this.botSay(opponent.id, this.pickRandom(BOT_QUOTES.winHand));
      }
    } else {
      this.notifyMessage("Canga nas 3 vazas! Ninguém pontuou nessa mão.", "info");
    }

    this.checkEndGame();
    this.emitState();

    if (!this.state.isGameOver) {
      setTimeout(() => this.startNewHand(), 2200);
    }
  }

  checkEndGame() {
    if (this.state.playerScore >= this.state.targetScore) {
      this.state.playerScore = this.state.targetScore;
      this.state.isGameOver = true;
      this.audio.playMatchVictory();
      this.notifyMessage(`🏆 VITÓRIA INCRÍVEL! NÓS VENCEMOS O JOGO POR ${this.state.playerScore} A ${this.state.botScore}!`, "win");
      if (this.state.gameMode === '4p') {
        this.botSay('bot_partner', "CAMPEÕES! Ninguém segura nossa dupla!");
      }
      if (this.onGameOver) {
        this.onGameOver(true, this.state.playerScore, this.state.botScore);
      }
    } else if (this.state.botScore >= this.state.targetScore) {
      this.state.botScore = this.state.targetScore;
      this.state.isGameOver = true;
      this.audio.playMatchDefeat();
      this.notifyMessage(`💀 FIM DE JOGO! ELES FECHARAM O JOGO POR ${this.state.botScore} A ${this.state.playerScore}!`, "loss");
      const opponent = this.state.players.find(p => p.team === 'them');
      if (opponent) this.botSay(opponent.id, "GANHAMOS! Paga a rodada de cerveja no balcão!");
      if (this.onGameOver) {
        this.onGameOver(false, this.state.playerScore, this.state.botScore);
      }
    }
  }

  // ===========================================================================
  // SISTEMA DE APOSTAS / TRUCO
  // ===========================================================================

  playerInitiateTruco() {
    if (this.state.isMaoDe11 || this.state.isMaoDeFerro || this.state.isGameOver || this.state.betState !== 'none') return;
    if (this.state.lastBettorTeam === 'us') {
      this.notifyMessage("Sua dupla já pediu o último aumento. Aguarde a resposta dos adversários!", "warning");
      return;
    }

    const nextVal = this.getNextBetValue();
    if (!nextVal) return;

    this.audio.playTrucoAlert(nextVal);
    this.state.lastBettorTeam = 'us';
    this.state.lastBettorPlayerId = 'player';
    this.state.betState = 'waiting_bot';
    this.notifyMessage(`📣 VOCÊ GRITOU ${this.getBetLabel(nextVal)}! (${nextVal} pontos)`, "warning");
    this.emitState();

    setTimeout(() => this.botsRespondToTruco(nextVal), 1400);
  }

  botInitiateTruco(botId) {
    const nextVal = this.getNextBetValue();
    if (!nextVal) return;

    const botObj = this.state.getPlayer(botId);
    const isPartner = (botObj.team === 'us');

    this.state.lastBettorTeam = botObj.team;
    this.state.lastBettorPlayerId = botId;
    this.state.betState = isPartner ? 'waiting_bot' : 'waiting_player';
    this.audio.playTrucoAlert(nextVal);

    if (this.state.activeBluff.isBluff && this.state.activeBluff.botId === botId) {
      this.botSay(botId, this.pickRandom(BOT_QUOTES.bluffTruco));
    } else if (this.state.camaDeGato.them && this.state.camaDeGato.armador === botId && this.state.roundNumber >= 2) {
      this.botSay(botId, this.pickRandom(BOT_QUOTES.camaDeGatoSpring));
    } else {
      if (nextVal === 3) this.botSay(botId, this.pickRandom(BOT_QUOTES.truco));
      else if (nextVal === 6) this.botSay(botId, this.pickRandom(BOT_QUOTES.seis));
      else if (nextVal === 9) this.botSay(botId, this.pickRandom(BOT_QUOTES.nove));
      else if (nextVal === 12) this.botSay(botId, this.pickRandom(BOT_QUOTES.doze));
    }

    const botName = botObj.name;
    if (isPartner) {
      this.notifyMessage(`📣 SEU PARCEIRO ${botName.toUpperCase()} GRITOU ${this.getBetLabel(nextVal)}! (${nextVal} pontos)`, "warning");
      this.emitState();
      setTimeout(() => this.botsRespondToTruco(nextVal), 1400);
    } else {
      this.notifyMessage(`⚠️ ${botName.toUpperCase()} GRITOU ${this.getBetLabel(nextVal)}! Como sua dupla responde?`, "warning");

      if (this.state.gameMode === '4p') {
        setTimeout(() => {
          this.checkAndSendPartnerSignal('truco');
          const partnerCards = (this.state.hands['bot_partner'] || []).filter(c => !c.played);
          const advice = this.expertAgent.getPartnerAdvice(partnerCards);
          this.state.lastPartnerAdvice = advice;
          this.botSay('bot_partner', advice);
          this.emitState();
        }, 400);
      }

      this.emitState();
    }
  }

  botsRespondToTruco(requestedValue) {
    const themPlayers = this.state.players.filter(p => p.team === 'them');
    const leadBot = themPlayers[0];
    const roles = this.state.getTacticalRoles();
    const role = roles[leadBot.id]?.name || 'Meio';
    const scoreDiff = this.state.botScore - this.state.playerScore;

    const leadCards = (this.state.hands[leadBot.id] || []).filter(c => !c.played);
    const partnerBot = themPlayers[1];
    const partnerCards = partnerBot ? (this.state.hands[partnerBot.id] || []).filter(c => !c.played) : [];
    const teamCards = [...leadCards, ...partnerCards];

    let currentTrick = this.state.tricks[this.state.roundNumber - 1];
    let maxPower = 0;
    if (currentTrick?.plays) {
      currentTrick.plays.forEach(p => {
        const pwr = p.card.covered ? 0 : p.card.power;
        if (pwr > maxPower) maxPower = pwr;
      });
    }

    const ctx = {
      requestedValue,
      botTeam: 'them',
      role,
      roundNumber: this.state.roundNumber,
      availableCards: leadCards,
      teamCards,
      highestPower: maxPower,
      tricksHistory: this.state.tricks,
      handSignals: this.state.handSignals,
      scoreDiff,
      partnerId: this.state.getPartnerId(leadBot.id),
      camaDeGato: this.state.camaDeGato
    };

    const decision = this.expertAgent.respondToTruco(ctx);

    if (decision.action === 'raise' && decision.raiseVal) {
      this.state.betValue = requestedValue;
      this.state.lastBettorTeam = 'them';
      this.state.lastBettorPlayerId = leadBot.id;
      this.state.betState = 'waiting_player';
      this.audio.playTrucoAlert(decision.raiseVal);

      if (decision.raiseVal === 6) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.seis));
      else if (decision.raiseVal === 9) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.nove));
      else if (decision.raiseVal === 12) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.doze));

      this.notifyMessage(`💥 ${leadBot.name} não só aceitou como RETRUCOU: PEDIU ${this.getBetLabel(decision.raiseVal)}!`, "warning");
      this.emitState();
      return;
    }

    if (decision.action === 'accept') {
      this.state.betValue = requestedValue;
      this.state.betState = 'none';
      this.audio.playClick();
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.accept));
      this.notifyMessage(`A dupla adversária aceitou o ${this.getBetLabel(requestedValue)}! A mão agora vale ${this.state.betValue} pontos.`, "info");
      this.emitState();

      if (this.state.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.state.currentTurnPlayerId), 900);
      }
    } else {
      this.state.betState = 'none';
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.refuse));
      this.notifyMessage(`A dupla adversária correu do ${this.getBetLabel(requestedValue)}! Nós ganhamos ${this.state.betValue} ponto(s)!`, "win");
      this.state.playerScore += this.state.betValue;
      this.checkEndGame();
      this.emitState();
      if (!this.state.isGameOver) {
        setTimeout(() => this.startNewHand(), 1800);
      }
    }
  }

  playerRespondToTruco(action) {
    if (this.state.betState !== 'waiting_player') return;
    const requestedValue = this.getNextBetValue();

    if (action === 'accept') {
      this.audio.playClick();
      this.state.betValue = requestedValue;
      this.state.betState = 'none';
      if (this.state.activeBluff.isBluff) {
        this.state.activeBluff.caught = true;
      }
      this.notifyMessage(`Nossa dupla aceitou o ${this.getBetLabel(requestedValue)}! A mão vale ${this.state.betValue} pontos.`, "info");
      this.emitState();

      if (this.state.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.state.currentTurnPlayerId), 900);
      }
    } else if (action === 'refuse') {
      this.audio.playClick();
      this.state.betState = 'none';
      this.state.playerFoldsCount++;

      if (this.state.activeBluff.isBluff) {
        const bluffBot = this.state.activeBluff.botId;
        setTimeout(() => {
          this.botSay(bluffBot, this.pickRandom(BOT_QUOTES.bluffRevealedWin));
        }, 400);
        this.notifyMessage(`🎭 BLEFE REVELADO! ${this.state.getPlayer(bluffBot).name} estava blefando com carta fraca e ganhou no grito!`, "warning");
        this.state.activeBluff.isBluff = false;
      } else {
        this.notifyMessage(`Nossa dupla correu do Truco! Adversários ganharam ${this.state.betValue} ponto(s).`, "loss");
      }

      this.state.botScore += this.state.betValue;
      this.checkEndGame();
      this.emitState();
      if (!this.state.isGameOver) {
        setTimeout(() => this.startNewHand(), 1800);
      }
    } else if (action === 'raise') {
      const raiseVal = requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12);
      this.state.betValue = requestedValue;
      this.state.lastBettorTeam = 'us';
      this.state.lastBettorPlayerId = 'player';
      this.state.betState = 'waiting_bot';
      this.audio.playTrucoAlert(raiseVal);
      this.notifyMessage(`🔥 VOCÊ RETRUCOU E PEDIU ${this.getBetLabel(raiseVal)}!`, "warning");
      this.emitState();

      setTimeout(() => this.botsRespondToTruco(raiseVal), 1400);
    }
  }

  // ===========================================================================
  // SINAIS CORPORAIS
  // ===========================================================================

  getBestSignalForHand(cards) {
    if (!cards || cards.length === 0) return null;
    const activeCards = cards.filter(c => !c.played);
    if (activeCards.length === 0) return null;

    if (activeCards.some(c => c.isManilha && c.manilhaRank === 4)) return 'zap';
    if (activeCards.some(c => c.isManilha && c.manilhaRank === 3)) return 'copeta';
    if (activeCards.some(c => c.isManilha && c.manilhaRank === 2)) return 'espadilha';
    if (activeCards.some(c => c.isManilha && c.manilhaRank === 1)) return 'picafumo';
    if (activeCards.some(c => !c.isManilha && c.power === 10)) return 'tres';
    if (activeCards.every(c => !c.isManilha && c.power <= 6)) return 'lixo';

    return null;
  }

  botSendSignal(botId, signalKey) {
    const signalObj = BOT_SIGNALS[signalKey];
    if (!signalObj) return;

    this.state.handSignals[botId] = signalKey;
    const phrase = this.pickRandom(signalObj.botPhrases);
    if (this.onBotSignal) {
      this.onBotSignal(botId, signalKey, signalObj.emoji, phrase);
    }
    this.botSay(botId, phrase);
  }

  checkAndSendPartnerSignal(context = 'round') {
    if (this.state.gameMode !== '4p' || this.state.isGameOver || this.state.isMaoDeFerro) return;

    const partnerHand = (this.state.hands['bot_partner'] || []).filter(c => !c.played);
    if (partnerHand.length === 0) return;

    let currentTrick = this.state.tricks[this.state.roundNumber - 1];
    let highestPower = 0;
    if (currentTrick?.plays) {
      currentTrick.plays.forEach(p => {
        const pwr = p.card.covered ? 0 : p.card.power;
        if (pwr > highestPower) highestPower = pwr;
      });
    }

    const goodCards = partnerHand.filter(c => c.isManilha || (!c.isManilha && c.power === 10));
    let signalToSend = null;

    if (this.state.roundNumber === 1) {
      signalToSend = goodCards.length > 0 ? this.getBestSignalForHand(goodCards) : 'lixo';
    } else if (this.state.roundNumber === 2) {
      const canKillCards = goodCards.filter(c => highestPower === 0 || c.power > highestPower);
      if (canKillCards.length > 0) {
        signalToSend = this.getBestSignalForHand(canKillCards);
      } else if (goodCards.length > 0 && highestPower === 0) {
        signalToSend = this.getBestSignalForHand(goodCards);
      } else {
        signalToSend = 'lixo';
      }
    } else if (this.state.roundNumber === 3) {
      signalToSend = goodCards.length > 0 ? this.getBestSignalForHand(goodCards) : 'lixo';
    }

    if (signalToSend) {
      this.botSendSignal('bot_partner', signalToSend);
    }
  }

  scheduleHandSignals() {
    this.clearSignalTimeouts();
    if (this.state.gameMode !== '4p' || this.state.isMaoDe11 || this.state.isMaoDeFerro) return;

    const leftSignal = this.getBestSignalForHand(this.state.hands['bot_left']);
    const rightSignal = this.getBestSignalForHand(this.state.hands['bot_right']);

    let chosenEnemy = null;
    let chosenSignal = null;
    let partnerEnemy = null;

    const signalPriority = { zap: 6, copeta: 5, espadilha: 4, picafumo: 3, tres: 2, lixo: 1 };
    const leftPri = leftSignal ? (signalPriority[leftSignal] || 0) : 0;
    const rightPri = rightSignal ? (signalPriority[rightSignal] || 0) : 0;

    if (leftPri > 0 || rightPri > 0) {
      if (leftPri >= rightPri) {
        chosenEnemy = 'bot_left';
        chosenSignal = leftSignal;
        partnerEnemy = 'bot_right';
      } else {
        chosenEnemy = 'bot_right';
        chosenSignal = rightSignal;
        partnerEnemy = 'bot_left';
      }
    }

    if (chosenEnemy && chosenSignal && Math.random() < 0.72) {
      const tEnemy = setTimeout(() => {
        if (this.state.isGameOver || this.state.roundNumber > 1) return;
        this.botSendSignal(chosenEnemy, chosenSignal);

        if (Math.random() < 0.5) {
          const tAck = setTimeout(() => {
            if (this.state.isGameOver || this.state.roundNumber > 1) return;
            this.botSay(partnerEnemy, this.pickRandom(BOT_QUOTES.enemyPartnerAck));
          }, 1600);
          this.signalTimeouts.push(tAck);
        }
      }, 1200 + Math.random() * 800);
      this.signalTimeouts.push(tEnemy);
    }

    const tTiao = setTimeout(() => {
      if (this.state.isGameOver || this.state.roundNumber > 1) return;
      this.checkAndSendPartnerSignal('deal');
    }, 2200 + Math.random() * 800);
    this.signalTimeouts.push(tTiao);
  }

  playerSendSignal(signalType) {
    const signalObj = BOT_SIGNALS[signalType];
    if (!signalObj) return;

    this.state.handSignals['player'] = signalType;
    const playerPhrase = this.pickRandom(signalObj.playerPhrases);

    if (this.onPlayerSignal) {
      this.onPlayerSignal(signalType, signalObj.emoji, playerPhrase);
    }

    if (this.state.gameMode === '4p') {
      const playerHand = this.state.hands['player'] || [];
      let isTrue = false;

      if (signalType === 'zap') {
        isTrue = playerHand.some(c => !c.played && c.isManilha && c.manilhaRank === 4);
      } else if (signalType === 'copeta') {
        isTrue = playerHand.some(c => !c.played && c.isManilha && c.manilhaRank === 3);
      } else if (signalType === 'espadilha') {
        isTrue = playerHand.some(c => !c.played && c.isManilha && c.manilhaRank === 2);
      } else if (signalType === 'picafumo') {
        isTrue = playerHand.some(c => !c.played && c.isManilha && c.manilhaRank === 1);
      } else if (signalType === 'tres') {
        isTrue = playerHand.some(c => !c.played && !c.isManilha && c.power === 10);
      } else if (signalType === 'lixo') {
        isTrue = playerHand.filter(c => !c.played).every(c => !c.isManilha && c.power <= 6);
      }

      const tTiaoReply = setTimeout(() => {
        if (this.state.isGameOver) return;
        let replyQuote = "";
        if (isTrue) {
          if (signalType === 'zap') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTrueZap);
          else if (signalType === 'copeta') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTrueCopeta);
          else if (signalType === 'espadilha') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTrueEspadilha);
          else if (signalType === 'picafumo') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTruePicafumo);
          else if (signalType === 'tres') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTrueTres);
          else if (signalType === 'lixo') replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyTrueLixo);
        } else {
          replyQuote = this.pickRandom(BOT_QUOTES.partnerSignalReplyBluff);
        }
        this.botSay('bot_partner', replyQuote);
      }, 1000);
      this.signalTimeouts.push(tTiaoReply);

      const interceptChance = this.expertAgent.getDifficultyConfig().readSignalsChance;
      if (Math.random() < interceptChance) {
        const enemyBot = Math.random() < 0.5 ? 'bot_left' : 'bot_right';
        const tEnemyAlert = setTimeout(() => {
          if (this.state.isGameOver) return;
          this.botSay(enemyBot, this.pickRandom(BOT_QUOTES.enemyInterceptAlert));
        }, 2200);
        this.signalTimeouts.push(tEnemyAlert);
      }
    }
  }
}

// Compatibilidade global
if (typeof window !== 'undefined') {
  window.TrucoGame = TrucoGame;
  window.BOT_SIGNALS = BOT_SIGNALS;
}
