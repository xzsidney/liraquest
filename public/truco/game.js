// =============================================================================
// TRUCO PAULISTA ENGINE - 1v1 E 4 JOGADORES (2v2 EM DUPLAS) COM IA COOPERATIVA
// =============================================================================

const SUITS = [
  { id: 'ouros', name: 'Ouros', symbol: '♦', color: 'red', manilhaRank: 1, manilhaName: 'PICAFUMO' },
  { id: 'espadas', name: 'Espadas', symbol: '♠', color: 'black', manilhaRank: 2, manilhaName: 'ESPADILHA' },
  { id: 'copas', name: 'Copas', symbol: '♥', color: 'red', manilhaRank: 3, manilhaName: 'COPETA' },
  { id: 'paus', name: 'Paus', symbol: '♣', color: 'black', manilhaRank: 4, manilhaName: 'ZAP' }
];

const CARD_VALUES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

const BASE_RANKS = {
  '4': 1, '5': 2, '6': 3, '7': 4,
  'Q': 5, 'J': 6, 'K': 7,
  'A': 8, '2': 9, '3': 10
};

// Sequência circular de Manilhas
const MANILHA_SEQUENCE = {
  '4': '5', '5': '6', '6': '7', '7': 'Q',
  'Q': 'J', 'J': 'K', 'K': 'A', 'A': '2',
  '2': '3', '3': '4'
};

const BOT_QUOTES = {
  truco: [
    "TRUUUUCO, MARRECO! Quero ver peito!",
    "TRUCO! Sai que essa é nossa!",
    "TRUCO! Tá sentindo a pressão do boteco?",
    "TRUCO! Corre enquanto dá tempo!",
    "Bate na mesa! TRUUUCO!"
  ],
  seis: [
    "MEIO PAU! SEEEEIS! Chora agora!",
    "SEIS! Aumenta que tá barato!",
    "SEIS! Achou que a gente tava de bobeira?"
  ],
  nove: [
    "NOOOOOVE! Agora o bicho pegou!",
    "NOVE! É pra estourar a mesa!",
    "NOVE! Quero ver segurar o rojão!"
  ],
  doze: [
    "DOOOOOZE! VALE O JOGO TODO!",
    "DOZE! Ou ganha ou chora na cama!"
  ],
  accept: [
    "Caiu na rede é peixe! Desce!",
    "Aceito! Bota carta na mesa!",
    "Tamo dentro! Não temos medo de assombração!",
    "Cai que tá bonito! Quero ver!",
    "Aceito com gosto de cana!"
  ],
  refuse: [
    "Essa passou raspando... Vamo correr!",
    "Leva essa merreca, na próxima te pego!",
    "Pode levar essa, tamo guardando o veneno.",
    "Corri! Não vou queimar vela com defunto ruim!"
  ],
  partnerAdviceStrong: [
    "Parceiro, tô com o ZAP engatilhado! Aceita com gosto!",
    "Tô armado até os dentes, parceiro! Manda ver!",
    "Pode aceitar, essa eu garanto pra nós!",
    "Tô forte, parceiro! Bate o pé e aceita!"
  ],
  partnerAdviceWeak: [
    "Parceiro, só veio lixo pra mim... cuidado aí!",
    "Minha mão tá um horror, parceiro! Se não tiver nada, corre!",
    "Tô desarmado, parceiro... a decisão é tua!",
    "Se você não tiver bicho grande, melhor correr dessa!"
  ],
  partnerAdviceMedium: [
    "Dá pra brigar, parceiro! Você que manda!",
    "Tenho uma carta boa guardada. O que você acha?",
    "Tô no meio termo, parceiro!"
  ],
  playZap: [
    "TOMA ESSE ZAP NA TESTA!",
    "O GATO MIAU! ZAAAP!",
    "Respeita a manilha de paus!"
  ],
  playStrong: [
    "Essa aqui fecha a conta!",
    "Pede a bênção pra essa carta!",
    "Aqui tem munição pesada!"
  ],
  playWeak: [
    "Toma um choro...",
    "Vou jogar essa porcariazinha.",
    "Deixa a poeira baixar..."
  ],
  partnerHelper: [
    "Boa jogada parceiro! Deixa que eu guardo a minha!",
    "Garantido, parceiro! Não vou gastar a minha à toa.",
    "Malandragem é tudo, parceiro!"
  ],
  winRound: [
    "Essa vaza já foi pra conta!",
    "Mais uma pra nossa dupla!",
    "Sentiram o peso da máquina?"
  ],
  loseRound: [
    "Foi só sorte de vocês, calma lá...",
    "Tão cantando de galo cedo...",
    "Ainda tem jogo, segura a onda!"
  ],
  winHand: [
    "Tentos no bolso! Chora, pato!",
    "A mão é nossa! Próxima!",
    "Quem tem garrafa vazia pra vender hoje são vocês!"
  ],
  loseHand: [
    "Deu ruim nessa... mas o jogo não acabou!",
    "Sorte de principiante, quero ver manter!",
    "Na próxima a gente pega vocês no pulo!"
  ],
  canga: [
    "CANGA! Ninguém leva, agora a fogueira esquentou!",
    "Empatou! Agora quem fizer a próxima leva tudo!"
  ],
  mao11Accept: [
    "Mão de 11 aceita! Essa a gente não perde!",
    "Nossa mão tá boa, vamo pro fight de 11!"
  ],
  mao11Refuse: [
    "Mão horrível... vamo correr da mão de 11.",
    "Com esse lixo? Melhor dar 1 ponto."
  ]
};

// Configuração dos Jogadores para o modo 4 Jogadores (2v2)
// Sentido anti-horário: Sul (Você) -> Leste (Tonho) -> Norte (Tião) -> Oeste (Zé)
const PLAYERS_CONFIG = {
  '4p': [
    { id: 'player', name: 'Você', team: 'us', avatar: '😎', role: 'Sul (Você)' },
    { id: 'bot_right', name: 'Tonho', team: 'them', avatar: '🤠', role: 'Leste (Adversário)' },
    { id: 'bot_partner', name: 'Tião', team: 'us', avatar: '🤝', role: 'Norte (Seu Parceiro)' },
    { id: 'bot_left', name: 'Zé Truqueiro', team: 'them', avatar: '🤖', role: 'Oeste (Adversário)' }
  ],
  '1v1': [
    { id: 'player', name: 'Você', team: 'us', avatar: '😎', role: 'Você' },
    { id: 'bot_partner', name: 'Zé Truqueiro', team: 'them', avatar: '🤖', role: 'Máquina' }
  ]
};

class TrucoGame {
  constructor() {
    this.gameMode = '4p'; // '4p' (padrão) ou '1v1'
    this.players = [];

    this.playerScore = 0; // Placar da Dupla "Nós" (Você & Parceiro)
    this.botScore = 0;    // Placar da Dupla "Eles" (Adversários)
    this.targetScore = 12;

    this.handNumber = 0;
    this.starterIndex = 0; // Índice de quem começou a mão atual
    this.currentTurnPlayerId = 'player';
    this.roundNumber = 1; // vaza 1, 2 ou 3

    this.deck = [];
    this.viraCard = null;
    this.manilhaValue = null;

    // Mãos individuais dos jogadores: { [playerId]: Card[] }
    this.hands = {};

    // Histórico de vazas da mão atual
    // cada item: { plays: [{ playerId, card }], winnerTeam: 'us'|'them'|'draw', winningCard, leadPlayerId }
    this.tricks = [];

    // Sistema de Apostas
    this.betValue = 1;
    this.betState = 'none'; // 'none', 'waiting_bot', 'waiting_player', 'player_deciding_mao11'
    this.lastBettorTeam = null; // 'us' | 'them'
    this.lastBettorPlayerId = null;

    // Modos especiais
    this.isMaoDe11 = false;
    this.maoDe11Team = null; // 'us', 'them' ou null
    this.isMaoDeFerro = false; // 11 x 11

    this.isGameOver = false;
    this.roundInProgress = false;
    this.resolvingTrick = false;

    // Callbacks de Eventos
    this.onStateChange = null;
    this.onBotSpeech = null;
    this.onMessage = null;

    this.setupPlayers();
  }

  setGameMode(mode) {
    if (this.gameMode === mode) return;
    this.gameMode = mode;
    this.setupPlayers();
    this.startNewGame();
  }

  setupPlayers() {
    this.players = PLAYERS_CONFIG[this.gameMode];
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id);
  }

  getPlayerIndex(id) {
    return this.players.findIndex(p => p.id === id);
  }

  getNextPlayerId(currentId) {
    const idx = this.getPlayerIndex(currentId);
    const nextIdx = (idx + 1) % this.players.length;
    return this.players[nextIdx].id;
  }

  // Baralho oficial de 40 cartas
  buildDeck() {
    const deck = [];
    CARD_VALUES.forEach(val => {
      SUITS.forEach(s => {
        deck.push({
          value: val,
          suit: s.id,
          suitSymbol: s.symbol,
          suitName: s.name,
          color: s.color,
          id: `${val}_${s.id}`
        });
      });
    });
    return deck;
  }

  shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  startNewGame() {
    this.playerScore = 0;
    this.botScore = 0;
    this.handNumber = 0;
    this.starterIndex = Math.floor(Math.random() * this.players.length);
    this.isGameOver = false;

    const modeName = this.gameMode === '4p' ? "2 vs 2 (4 Jogadores em Duplas)" : "1 vs 1 (Mano a Mano)";
    this.notifyMessage(`Partida iniciada no modo ${modeName}! Quem fizer 12 pontos primeiro vence.`, "info");
    this.startNewHand();
  }

  startNewHand() {
    if (this.isGameOver) return;

    this.handNumber++;
    // Alterna o pé/primeiro a jogar a cada mão inteira
    if (this.handNumber > 1) {
      this.starterIndex = (this.starterIndex + 1) % this.players.length;
    }
    this.currentTurnPlayerId = this.players[this.starterIndex].id;
    this.roundNumber = 1;
    this.tricks = [];

    this.betValue = 1;
    this.betState = 'none';
    this.lastBettorTeam = null;
    this.lastBettorPlayerId = null;
    this.resolvingTrick = false;
    this.lastPartnerAdvice = "";

    // Checa Mão de 11 ou Mão de Ferro
    this.isMaoDeFerro = (this.playerScore === 11 && this.botScore === 11);
    this.isMaoDe11 = (this.playerScore === 11 || this.botScore === 11) && !this.isMaoDeFerro;
    if (this.isMaoDe11) {
      this.maoDe11Team = this.playerScore === 11 ? 'us' : 'them';
      this.betValue = 3;
    } else {
      this.maoDe11Team = null;
    }

    // Embaralha e distribui 3 cartas para cada jogador
    this.deck = this.shuffle(this.buildDeck());
    this.hands = {};
    this.players.forEach(p => {
      this.hands[p.id] = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    });

    this.viraCard = this.deck.pop();
    this.manilhaValue = MANILHA_SEQUENCE[this.viraCard.value];

    // Enriquece todas as cartas com poderes e nomes de manilha
    this.players.forEach(p => {
      this.enrichCards(this.hands[p.id]);
    });

    window.trucoAudio.playCardSlide();

    // Tratamento para Mão de Ferro
    if (this.isMaoDeFerro) {
      this.notifyMessage("🔥 MÃO DE FERRO (11 x 11)! Todas as cartas no escuro! Ninguém vê nada!", "warning");
      this.emitState();
      this.startTrick();
      return;
    }

    // Tratamento para Mão de 11
    if (this.isMaoDe11) {
      if (this.maoDe11Team === 'us') {
        const partnerDesc = this.gameMode === '4p' ? " Suas cartas e as do seu parceiro Tião foram reveladas para análise!" : "";
        this.notifyMessage(`⭐ MÃO DE 11 PARA NÓS!${partnerDesc} Escolha jogar (vale 3) ou correr (dá 1 ponto a eles).`, "warning");
        this.betState = 'player_deciding_mao11';

        // O parceiro dá uma dica se estiver no modo 4p
        if (this.gameMode === '4p') {
          setTimeout(() => {
            const partnerStrength = this.evaluateHandStrength(this.hands['bot_partner']);
            const hasZap = this.hands['bot_partner'].some(c => c.isManilha && c.manilhaRank === 4);
            let quote = "";
            if (hasZap || partnerStrength >= 25) {
              quote = this.pickRandom(BOT_QUOTES.partnerAdviceStrong);
            } else if (partnerStrength <= 12) {
              quote = this.pickRandom(BOT_QUOTES.partnerAdviceWeak);
            } else {
              quote = this.pickRandom(BOT_QUOTES.partnerAdviceMedium);
            }
            this.lastPartnerAdvice = quote;
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

    const starterName = this.getPlayer(this.currentTurnPlayerId).name;
    this.notifyMessage(`Mão ${this.handNumber} iniciada! Vira: ${this.viraCard.value} ${this.viraCard.suitSymbol} -> MANILHA: ${this.manilhaValue}! (${starterName} abre a mão)`, "info");
    this.emitState();
    this.startTrick();
  }

  enrichCards(cards) {
    cards.forEach(card => {
      card.isManilha = (card.value === this.manilhaValue);
      const suitObj = SUITS.find(s => s.id === card.suit);
      card.manilhaRank = card.isManilha ? suitObj.manilhaRank : 0;
      card.manilhaName = card.isManilha ? suitObj.manilhaName : null;

      if (card.isManilha) {
        card.power = 100 + card.manilhaRank; // 101 a 104
      } else {
        card.power = BASE_RANKS[card.value]; // 1 a 10
      }
      card.played = false;
      card.covered = false;
    });
  }

  // Decisão dos Robôs na Mão de 11
  botDecideMao11() {
    let combinedStrength = 0;
    let hasAnyManilha = false;

    const themPlayers = this.players.filter(p => p.team === 'them');
    themPlayers.forEach(p => {
      combinedStrength += this.evaluateHandStrength(this.hands[p.id]);
      if (this.hands[p.id].some(c => c.isManilha)) hasAnyManilha = true;
    });

    const threshold = this.gameMode === '4p' ? 36 : 18;

    if (hasAnyManilha || combinedStrength >= threshold) {
      this.botSay(themPlayers[0].id, this.pickRandom(BOT_QUOTES.mao11Accept));
      this.notifyMessage("A dupla adversária aceitou jogar a Mão de 11! A mão vale 3 pontos.", "info");
      this.startTrick();
    } else {
      this.botSay(themPlayers[0].id, this.pickRandom(BOT_QUOTES.mao11Refuse));
      this.notifyMessage("A dupla adversária correu da Mão de 11! Nós ganhamos 1 ponto.", "win");
      this.playerScore += 1;
      this.checkEndGame();
      if (!this.isGameOver) {
        setTimeout(() => this.startNewHand(), 1600);
      }
    }
  }

  playerDecideMao11(accept) {
    if (this.betState !== 'player_deciding_mao11') return;
    this.betState = 'none';

    if (accept) {
      window.trucoAudio.playClick();
      this.notifyMessage("Você aceitou jogar a Mão de 11! A mão vale 3 pontos.", "info");
      this.startTrick();
    } else {
      window.trucoAudio.playClick();
      this.notifyMessage("Você correu da Mão de 11. Adversários ganharam 1 ponto.", "loss");
      this.botScore += 1;
      this.checkEndGame();
      if (!this.isGameOver) {
        setTimeout(() => this.startNewHand(), 1600);
      }
    }
  }

  startTrick() {
    this.roundInProgress = true;
    this.resolvingTrick = false;

    // Inicializa estrutura da vaza atual se não existir
    if (!this.tricks[this.roundNumber - 1]) {
      this.tricks.push({
        plays: [], // [{ playerId, card }]
        winnerTeam: null,
        winningCard: null,
        leadPlayerId: this.currentTurnPlayerId
      });
    } else {
      this.tricks[this.roundNumber - 1].leadPlayerId = this.currentTurnPlayerId;
    }

    this.emitState();

    if (this.currentTurnPlayerId !== 'player') {
      setTimeout(() => this.botPlayTurn(this.currentTurnPlayerId), 900);
    }
  }

  // Jogador humano joga uma carta
  playerPlayCard(cardIndex, isCovered = false) {
    if (this.currentTurnPlayerId !== 'player' || this.isGameOver || this.betState !== 'none' || this.resolvingTrick) return;
    const myHand = this.hands['player'];
    const card = myHand[cardIndex];
    if (!card || card.played) return;

    if (isCovered && this.roundNumber === 1 && !this.isMaoDeFerro) {
      this.notifyMessage("Não é permitido jogar carta coberta na primeira vaza!", "warning");
      return;
    }

    card.played = true;
    card.covered = isCovered;

    const isSlam = card.isManilha && !isCovered;
    window.trucoAudio.playCardPlay(isSlam);

    let currentTrick = this.tricks[this.roundNumber - 1];
    if (!currentTrick) {
      currentTrick = { plays: [], winnerTeam: null, winningCard: null, leadPlayerId: 'player' };
      this.tricks.push(currentTrick);
    }
    currentTrick.plays.push({ playerId: 'player', card });

    this.emitState();

    // Se todos os jogadores da partida já jogaram nesta vaza -> resolve vaza
    if (currentTrick.plays.length === this.players.length) {
      this.resolvingTrick = true;
      setTimeout(() => this.resolveTrick(), 900);
    } else {
      // Passa a vez para o próximo jogador
      this.currentTurnPlayerId = this.getNextPlayerId('player');
      this.emitState();
      setTimeout(() => this.botPlayTurn(this.currentTurnPlayerId), 900);
    }
  }

  // Jogada de um Bot específico
  botPlayTurn(botId) {
    if (this.currentTurnPlayerId !== botId || this.isGameOver || this.resolvingTrick) return;

    // O bot pensa se deve pedir truco antes de colocar a carta na mesa
    if (this.shouldBotTruco(botId)) {
      this.botInitiateTruco(botId);
      return;
    }

    const availableCards = this.hands[botId].filter(c => !c.played);
    if (availableCards.length === 0) return;

    let currentTrick = this.tricks[this.roundNumber - 1];
    if (!currentTrick) {
      currentTrick = { plays: [], winnerTeam: null, winningCard: null, leadPlayerId: botId };
      this.tricks.push(currentTrick);
    }

    let chosenCard = null;
    let playCovered = false;

    if (this.isMaoDeFerro) {
      chosenCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    } else {
      chosenCard = this.pickBotCard(botId, availableCards, currentTrick.plays);

      // Blefe de carta coberta (apenas na 2ª ou 3ª vaza)
      if (this.roundNumber > 1 && chosenCard.power <= 3 && Math.random() < 0.2) {
        const firstTrick = this.tricks[0];
        const botObj = this.getPlayer(botId);
        if (firstTrick && firstTrick.winnerTeam === botObj.team) {
          playCovered = true;
        }
      }
    }

    chosenCard.played = true;
    chosenCard.covered = playCovered;
    currentTrick.plays.push({ playerId: botId, card: chosenCard });

    const isSlam = chosenCard.isManilha && !playCovered;
    window.trucoAudio.playCardPlay(isSlam);

    // Diálogos de mesa
    if (chosenCard.isManilha && chosenCard.manilhaRank === 4) {
      this.botSay(botId, this.pickRandom(BOT_QUOTES.playZap));
    } else if (chosenCard.isManilha || chosenCard.power >= 9) {
      if (Math.random() < 0.35) this.botSay(botId, this.pickRandom(BOT_QUOTES.playStrong));
    } else if (chosenCard.power <= 2) {
      if (Math.random() < 0.25) this.botSay(botId, this.pickRandom(BOT_QUOTES.playWeak));
    }

    this.emitState();

    if (currentTrick.plays.length === this.players.length) {
      this.resolvingTrick = true;
      setTimeout(() => this.resolveTrick(), 900);
    } else {
      this.currentTurnPlayerId = this.getNextPlayerId(botId);
      this.emitState();
      if (this.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.currentTurnPlayerId), 900);
      }
    }
  }

  // IA Cooperativa e Competitiva para escolha da carta
  pickBotCard(botId, availableCards, previousPlays) {
    const sorted = [...availableCards].sort((a, b) => a.power - b.power);
    const botObj = this.getPlayer(botId);

    // Se já houve cartas jogadas nesta vaza
    if (previousPlays.length > 0) {
      // Encontra a melhor carta jogada até agora na vaza
      let bestPlay = null;
      let highestPower = -1;

      previousPlays.forEach(p => {
        const pwr = p.card.covered ? 0 : p.card.power;
        if (pwr > highestPower) {
          highestPower = pwr;
          bestPlay = p;
        }
      });

      const leaderPlayer = bestPlay ? this.getPlayer(bestPlay.playerId) : null;
      const isPartnerWinning = leaderPlayer && leaderPlayer.team === botObj.team;

      // Se o PARCEIRO já está vencendo a vaza:
      if (isPartnerWinning) {
        // Se a carta do parceiro é muito forte (ex: Manilha ou 3) ou se o bot é o último a jogar:
        const remainingPlayersCount = this.players.length - previousPlays.length - 1;
        if (highestPower >= 9 || remainingPlayersCount === 0) {
          // Poupa munição! Joga a menor carta para ajudar a dupla
          if (botId === 'bot_partner' && Math.random() < 0.3) {
            this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.partnerHelper));
          }
          return sorted[0];
        }
      }

      // Se o ADVERSÁRIO está vencendo ou se o parceiro está com carta fraca:
      const winningCards = sorted.filter(c => c.power > highestPower);
      const tieCards = sorted.filter(c => c.power === highestPower);

      if (winningCards.length > 0) {
        // Joga a MENOR carta que garante a liderança
        return winningCards[0];
      }

      // Se não consegue ganhar, avalia empatar (canga)
      if (tieCards.length > 0) {
        if (this.roundNumber === 1 || (this.roundNumber === 2 && this.tricks[0]?.winnerTeam === botObj.team)) {
          return tieCards[0];
        }
      }

      // Se não consegue nem empatar nem ganhar, joga fora a pior carta ("lixo")
      return sorted[0];
    }

    // Se o bot é o primeiro a jogar na vaza (abre a vaza)
    if (this.roundNumber === 1) {
      if (sorted.length === 3) return sorted[1]; // carta intermediária
      return sorted[0];
    } else if (this.roundNumber === 2) {
      const firstTrick = this.tricks[0];
      if (firstTrick && firstTrick.winnerTeam !== botObj.team) {
        // Se a dupla perdeu a primeira, tem que ir com a mais forte
        return sorted[sorted.length - 1];
      }
      return sorted[sorted.length - 1];
    } else {
      return sorted[0];
    }
  }

  // Resolução da Vaza (Trick) de 2 ou 4 cartas
  resolveTrick() {
    const trick = this.tricks[this.roundNumber - 1];
    const plays = trick.plays;

    // Acha a maior carta e quem jogou
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
      // Vencedor único incontestável
      const winnerPlayer = this.getPlayer(topPlays[0].playerId);
      trick.winnerTeam = winnerPlayer.team;
      trick.winningCard = topPlays[0].card;
      this.currentTurnPlayerId = winnerPlayer.id; // Quem ganhou abre a próxima

      if (winnerPlayer.team === 'us') {
        window.trucoAudio.playRoundWin();
        const whoStr = winnerPlayer.id === 'player' ? "Você" : "Seu parceiro Tião";
        this.notifyMessage(`${whoStr} venceu a ${this.roundNumber}ª vaza para Nós!`, "win");
        if (winnerPlayer.id === 'bot_partner') {
          this.botSay('bot_partner', "Essa é nossa, parceiro!");
        } else {
          const opponent = this.players.find(p => p.team === 'them');
          if (Math.random() < 0.4) this.botSay(opponent.id, this.pickRandom(BOT_QUOTES.loseRound));
        }
      } else {
        window.trucoAudio.playRoundLoss();
        this.notifyMessage(`${winnerPlayer.name} venceu a ${this.roundNumber}ª vaza para a máquina!`, "loss");
        if (Math.random() < 0.5) this.botSay(winnerPlayer.id, this.pickRandom(BOT_QUOTES.winRound));
      }
    } else {
      // Houve empate no maior valor (CANGA ou EMPATE ENTRE PARCEIROS)
      const teams = topPlays.map(p => this.getPlayer(p.playerId).team);
      const allSameTeam = teams.every(t => t === teams[0]);

      if (allSameTeam) {
        // Se as maiores cartas empatadas pertencem aos parceiros da MESMA dupla:
        // A própria dupla ganha a vaza! (Regra clássica do Truco)
        const winTeam = teams[0];
        trick.winnerTeam = winTeam;
        trick.winningCard = topPlays[0].card;
        this.currentTurnPlayerId = topPlays[0].playerId;

        if (winTeam === 'us') {
          window.trucoAudio.playRoundWin();
          this.notifyMessage(`Dupla afinada! Vocês dois amarraram em cima e levaram a vaza!`, "win");
        } else {
          window.trucoAudio.playRoundLoss();
          this.notifyMessage(`A dupla adversária amarrou a maior carta e levou a vaza!`, "loss");
        }
      } else {
        // Empate real entre equipes rivais: CANGA!
        trick.winnerTeam = 'draw';
        this.currentTurnPlayerId = trick.leadPlayerId || this.currentTurnPlayerId;
        window.trucoAudio.playCanga();
        this.notifyMessage(`Empate (CANGA) na ${this.roundNumber}ª vaza!`, "warning");
        const botToSpeak = this.players.find(p => p.id !== 'player');
        if (botToSpeak) this.botSay(botToSpeak.id, this.pickRandom(BOT_QUOTES.canga));
      }
    }

    this.emitState();

    const handResult = this.checkHandResult();
    if (handResult) {
      setTimeout(() => {
        this.resolvingTrick = false;
        this.finishHand(handResult);
      }, 1500);
    } else {
      setTimeout(() => {
        this.roundNumber++;
        this.resolvingTrick = false;
        this.startTrick();
      }, 1500);
    }
  }

  // Avaliação das 3 vazas do Truco Paulista
  checkHandResult() {
    const t = this.tricks;
    const len = t.length;

    if (len === 1) return null;

    if (len === 2) {
      if (t[0].winnerTeam === 'draw' && t[1].winnerTeam !== 'draw') {
        return t[1].winnerTeam;
      }
      if (t[0].winnerTeam === 'us' && t[1].winnerTeam === 'us') return 'us';
      if (t[0].winnerTeam === 'them' && t[1].winnerTeam === 'them') return 'them';

      if (t[0].winnerTeam !== 'draw' && t[1].winnerTeam === 'draw') {
        return t[0].winnerTeam;
      }
      return null;
    }

    if (len === 3) {
      if (t[0].winnerTeam === 'draw' && t[1].winnerTeam === 'draw') {
        if (t[2].winnerTeam !== 'draw') return t[2].winnerTeam;
        return 'triple_draw';
      }
      if (t[2].winnerTeam === 'draw') {
        return t[0].winnerTeam;
      }
      if (t[2].winnerTeam === 'us') {
        const usWins = t.filter(x => x.winnerTeam === 'us').length;
        const themWins = t.filter(x => x.winnerTeam === 'them').length;
        return usWins >= themWins ? 'us' : 'them';
      }
      if (t[2].winnerTeam === 'them') {
        const usWins = t.filter(x => x.winnerTeam === 'us').length;
        const themWins = t.filter(x => x.winnerTeam === 'them').length;
        return themWins >= usWins ? 'them' : 'us';
      }
    }

    return null;
  }

  finishHand(winnerTeam) {
    if (winnerTeam === 'us') {
      this.playerScore += this.betValue;
      window.trucoAudio.playRoundWin();
      this.notifyMessage(`🎉 NÓS VENCEMOS A MÃO! (+${this.betValue} ponto${this.betValue > 1 ? 's' : ''})`, "win");
      if (this.gameMode === '4p') {
        this.botSay('bot_partner', "Boa parceiro! Jogamos muito!");
      }
    } else if (winnerTeam === 'them') {
      this.botScore += this.betValue;
      window.trucoAudio.playRoundLoss();
      this.notifyMessage(`💥 A DUPLA ADVERSÁRIA LEVOU A MÃO! (+${this.betValue} ponto${this.betValue > 1 ? 's' : ''})`, "loss");
      const opponent = this.players.find(p => p.team === 'them');
      if (opponent && Math.random() < 0.7) this.botSay(opponent.id, this.pickRandom(BOT_QUOTES.winHand));
    } else {
      this.notifyMessage("Canga nas 3 vazas! Ninguém pontuou nessa mão.", "info");
    }

    this.checkEndGame();
    this.emitState();

    if (!this.isGameOver) {
      setTimeout(() => this.startNewHand(), 2200);
    }
  }

  checkEndGame() {
    if (this.playerScore >= this.targetScore) {
      this.playerScore = this.targetScore;
      this.isGameOver = true;
      window.trucoAudio.playMatchVictory();
      this.notifyMessage(`🏆 VITÓRIA INCRÍVEL! NÓS VENCEMOS O JOGO POR ${this.playerScore} A ${this.botScore}!`, "win");
      if (this.gameMode === '4p') {
        this.botSay('bot_partner', "CAMPEÕES! Ninguém segura nossa dupla!");
      }
    } else if (this.botScore >= this.targetScore) {
      this.botScore = this.targetScore;
      this.isGameOver = true;
      window.trucoAudio.playMatchDefeat();
      this.notifyMessage(`💀 FIM DE JOGO! ELES FECHARAM O JOGO POR ${this.botScore} A ${this.playerScore}!`, "loss");
      const opponent = this.players.find(p => p.team === 'them');
      if (opponent) this.botSay(opponent.id, "GANHAMOS! Paga a rodada de cerveja no balcão!");
    }
  }

  // =========================================================================
  // SISTEMA DE APOSTAS / TRUCO EM DUPLAS
  // =========================================================================

  getNextBetValue() {
    if (this.betValue === 1) return 3;
    if (this.betValue === 3) return 6;
    if (this.betValue === 6) return 9;
    if (this.betValue === 9) return 12;
    return null;
  }

  getBetLabel(val) {
    if (val === 3) return 'TRUCO';
    if (val === 6) return 'SEIS';
    if (val === 9) return 'NOVE';
    if (val === 12) return 'DOZE';
    return `${val}`;
  }

  // Jogador humano pede Truco / Aumenta
  playerInitiateTruco() {
    if (this.isMaoDe11 || this.isMaoDeFerro || this.isGameOver || this.betState !== 'none') return;
    if (this.lastBettorTeam === 'us') {
      this.notifyMessage("Sua dupla já pediu o último aumento. Aguarde a resposta dos adversários!", "warning");
      return;
    }

    const nextVal = this.getNextBetValue();
    if (!nextVal) return;

    window.trucoAudio.playTrucoAlert(nextVal);
    this.lastBettorTeam = 'us';
    this.lastBettorPlayerId = 'player';
    this.betState = 'waiting_bot';
    this.notifyMessage(`📣 VOCÊ GRITOU ${this.getBetLabel(nextVal)}! (${nextVal} pontos)`, "warning");
    this.emitState();

    setTimeout(() => this.botsRespondToTruco(nextVal), 1400);
  }

  // Robôs adversários decidem se pedem Truco
  shouldBotTruco(botId) {
    if (this.isMaoDe11 || this.isMaoDeFerro || this.isGameOver || this.betState !== 'none') return false;
    const botObj = this.getPlayer(botId);
    if (this.lastBettorTeam === botObj.team) return false;

    // Se o bot for do time do jogador (Tião), ele só incentiva o jogador, não truca sozinho
    if (botObj.team === 'us') return false;

    const nextVal = this.getNextBetValue();
    if (!nextVal) return false;

    const unplayedCards = this.hands[botId].filter(c => !c.played);
    const handStrength = this.evaluateHandStrength(unplayedCards);
    const hasZap = unplayedCards.some(c => c.isManilha && c.manilhaRank === 4);
    const hasCopeta = unplayedCards.some(c => c.isManilha && c.manilhaRank === 3);

    const firstTrickWon = this.tricks[0] && this.tricks[0].winnerTeam === 'them';
    const isBluffing = Math.random() < 0.16;

    if (hasZap || (hasCopeta && firstTrickWon) || handStrength >= 26 || isBluffing) {
      return Math.random() < 0.6;
    }
    return false;
  }

  botInitiateTruco(botId) {
    const nextVal = this.getNextBetValue();
    if (!nextVal) return;

    this.lastBettorTeam = 'them';
    this.lastBettorPlayerId = botId;
    this.betState = 'waiting_player';
    window.trucoAudio.playTrucoAlert(nextVal);

    if (nextVal === 3) this.botSay(botId, this.pickRandom(BOT_QUOTES.truco));
    else if (nextVal === 6) this.botSay(botId, this.pickRandom(BOT_QUOTES.seis));
    else if (nextVal === 9) this.botSay(botId, this.pickRandom(BOT_QUOTES.nove));
    else if (nextVal === 12) this.botSay(botId, this.pickRandom(BOT_QUOTES.doze));

    const botName = this.getPlayer(botId).name;
    this.notifyMessage(`⚠️ ${botName.toUpperCase()} GRITOU ${this.getBetLabel(nextVal)}! Como sua dupla responde?`, "warning");

    // No modo 4p, o seu parceiro Tião te dá uma dica sobre as cartas dele!
    if (this.gameMode === '4p') {
      setTimeout(() => {
        const partnerCards = this.hands['bot_partner'].filter(c => !c.played);
        const pStrength = this.evaluateHandStrength(partnerCards);
        const hasZap = partnerCards.some(c => c.isManilha && c.manilhaRank === 4);

        if (hasZap || pStrength >= 22) {
          this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.partnerAdviceStrong));
        } else if (pStrength <= 10) {
          this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.partnerAdviceWeak));
        } else {
          this.botSay('bot_partner', this.pickRandom(BOT_QUOTES.partnerAdviceMedium));
        }
      }, 500);
    }

    this.emitState();
  }

  // Resposta dos robôs adversários quando Nós pedimos Truco
  botsRespondToTruco(requestedValue) {
    const themPlayers = this.players.filter(p => p.team === 'them');
    let bestHandStrength = 0;
    let hasZap = false;
    let hasCopeta = false;

    themPlayers.forEach(p => {
      const cards = this.hands[p.id].filter(c => !c.played);
      const str = this.evaluateHandStrength(cards);
      if (str > bestHandStrength) bestHandStrength = str;
      if (cards.some(c => c.isManilha && c.manilhaRank === 4)) hasZap = true;
      if (cards.some(c => c.isManilha && c.manilhaRank === 3)) hasCopeta = true;
    });

    const wonFirstTrick = this.tricks[0] && this.tricks[0].winnerTeam === 'them';
    const canRaise = (requestedValue < 12);
    const raiseVal = canRaise ? (requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12)) : null;

    const leadBot = themPlayers[0];

    // Chance de retrucar (aumentar)
    if (canRaise && (hasZap || (hasCopeta && wonFirstTrick) || bestHandStrength >= 28)) {
      if (Math.random() < 0.45) {
        this.betValue = requestedValue;
        this.lastBettorTeam = 'them';
        this.lastBettorPlayerId = leadBot.id;
        this.betState = 'waiting_player';
        window.trucoAudio.playTrucoAlert(raiseVal);

        if (raiseVal === 6) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.seis));
        else if (raiseVal === 9) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.nove));
        else if (raiseVal === 12) this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.doze));

        this.notifyMessage(`💥 ${leadBot.name} não só aceitou como RETRUCOU: PEDIU ${this.getBetLabel(raiseVal)}!`, "warning");
        this.emitState();
        return;
      }
    }

    // Aceitar ou Correr
    let acceptChance = 0.55;
    if (hasZap || hasCopeta) acceptChance = 0.95;
    else if (bestHandStrength >= 18) acceptChance = 0.8;
    else if (wonFirstTrick) acceptChance = 0.7;
    else if (bestHandStrength < 10 && this.roundNumber > 1 && this.tricks[0]?.winnerTeam === 'us') acceptChance = 0.15;

    if (Math.random() < acceptChance) {
      this.betValue = requestedValue;
      this.betState = 'none';
      window.trucoAudio.playClick();
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.accept));
      this.notifyMessage(`A dupla adversária aceitou o ${this.getBetLabel(requestedValue)}! A mão agora vale ${this.betValue} pontos.`, "info");
      this.emitState();

      if (this.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.currentTurnPlayerId), 900);
      }
    } else {
      this.betState = 'none';
      this.botSay(leadBot.id, this.pickRandom(BOT_QUOTES.refuse));
      this.notifyMessage(`A dupla adversária correu do ${this.getBetLabel(requestedValue)}! Nós ganhamos ${this.betValue} ponto(s)!`, "win");
      this.playerScore += this.betValue;
      this.checkEndGame();
      this.emitState();
      if (!this.isGameOver) {
        setTimeout(() => this.startNewHand(), 1800);
      }
    }
  }

  // Jogador humano responde ao Truco dos adversários
  playerRespondToTruco(action) {
    if (this.betState !== 'waiting_player') return;
    const requestedValue = this.getNextBetValue();

    if (action === 'accept') {
      window.trucoAudio.playClick();
      this.betValue = requestedValue;
      this.betState = 'none';
      this.notifyMessage(`Nossa dupla aceitou o ${this.getBetLabel(requestedValue)}! A mão vale ${this.betValue} pontos.`, "info");
      this.emitState();

      if (this.currentTurnPlayerId !== 'player') {
        setTimeout(() => this.botPlayTurn(this.currentTurnPlayerId), 900);
      }
    } else if (action === 'refuse') {
      window.trucoAudio.playClick();
      this.betState = 'none';
      this.notifyMessage(`Nossa dupla correu do Truco! Adversários ganharam ${this.betValue} ponto(s).`, "loss");
      this.botScore += this.betValue;
      this.checkEndGame();
      this.emitState();
      if (!this.isGameOver) {
        setTimeout(() => this.startNewHand(), 1800);
      }
    } else if (action === 'raise') {
      const raiseVal = requestedValue === 3 ? 6 : (requestedValue === 6 ? 9 : 12);
      this.betValue = requestedValue;
      this.lastBettorTeam = 'us';
      this.lastBettorPlayerId = 'player';
      this.betState = 'waiting_bot';
      window.trucoAudio.playTrucoAlert(raiseVal);
      this.notifyMessage(`🔥 VOCÊ RETRUCOU E PEDIU ${this.getBetLabel(raiseVal)}!`, "warning");
      this.emitState();

      setTimeout(() => this.botsRespondToTruco(raiseVal), 1400);
    }
  }

  evaluateHandStrength(cards) {
    let score = 0;
    cards.forEach(c => {
      if (c.isManilha) {
        score += 20 + c.manilhaRank * 5;
      } else {
        score += c.power;
      }
    });
    return score;
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
      this.onStateChange(this.getPublicState());
    }
  }

  getPublicState() {
    return {
      gameMode: this.gameMode,
      players: this.players,
      playerScore: this.playerScore,
      botScore: this.botScore,
      targetScore: this.targetScore,
      handNumber: this.handNumber,
      starterPlayerId: this.players[this.starterIndex]?.id,
      currentTurnPlayerId: this.currentTurnPlayerId,
      roundNumber: this.roundNumber,
      viraCard: this.viraCard,
      manilhaValue: this.manilhaValue,
      hands: this.hands,
      tricks: this.tricks,
      betValue: this.betValue,
      betState: this.betState,
      nextBetValue: this.getNextBetValue(),
      nextBetLabel: this.getBetLabel(this.getNextBetValue()),
      isMaoDe11: this.isMaoDe11,
      maoDe11Team: this.maoDe11Team,
      isMaoDeFerro: this.isMaoDeFerro,
      lastPartnerAdvice: this.lastPartnerAdvice || "",
      isGameOver: this.isGameOver,
      lastBettorTeam: this.lastBettorTeam,
      lastBettorPlayerId: this.lastBettorPlayerId,
      resolvingTrick: !!this.resolvingTrick
    };
  }
}

window.TrucoGame = TrucoGame;
