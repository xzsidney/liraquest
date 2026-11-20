// =============================================================================
// GAMESTATE.JS - MÁQUINA DE ESTADOS DO TRUCO PAULISTA
// Gerencia jogadores, turnos, histórico de vazas, papéis táticos e snapshots
// =============================================================================

export const PLAYERS_CONFIG = {
  '4p': [
    { id: 'player', name: 'Você', team: 'us', avatar: '😎', role: 'Sul (Você)' },
    { id: 'bot_left', name: 'Zé Truqueiro', team: 'them', avatar: '🤖', role: 'Oeste (Adversário)' },
    { id: 'bot_partner', name: 'Tião', team: 'us', avatar: '🤝', role: 'Norte (Seu Parceiro)' },
    { id: 'bot_right', name: 'Tonho', team: 'them', avatar: '🤠', role: 'Leste (Adversário)' }
  ],
  '1v1': [
    { id: 'player', name: 'Você', team: 'us', avatar: '😎', role: 'Você' },
    { id: 'bot_partner', name: 'Zé Truqueiro', team: 'them', avatar: '🤖', role: 'Máquina' }
  ]
};

export class GameState {
  constructor(gameMode = '4p') {
    this.gameMode = gameMode;
    this.playerScore = 0;
    this.botScore = 0;
    this.targetScore = 12;

    this.handNumber = 0;
    this.starterIndex = 0;
    this.currentTurnPlayerId = 'player';
    this.roundNumber = 1;

    this.deck = [];
    this.viraCard = null;
    this.manilhaValue = null;

    this.hands = {};
    this.tricks = [];

    this.betValue = 1;
    this.betState = 'none'; // 'none' | 'waiting_bot' | 'waiting_player' | 'player_deciding_mao11'
    this.lastBettorTeam = null;
    this.lastBettorPlayerId = null;

    this.isMaoDe11 = false;
    this.maoDe11Team = null;
    this.isMaoDeFerro = false;

    this.isGameOver = false;
    this.resolvingTrick = false;
    this.lastPartnerAdvice = "";

    this.playerFoldsCount = 0;
    this.camaDeGato = { us: false, them: false, armador: null, baitPlayed: false };
    this.casalMaior = { us: false, them: false };
    this.activeBluff = { isBluff: false, botId: null, caught: false };
    this.handSignals = { player: null, bot_partner: null, bot_left: null, bot_right: null };

    this.playerName = 'Você';
    this.playerAvatar = '😎';

    this.players = [];
    this.setupPlayers();
  }

  setupPlayers() {
    this.players = JSON.parse(JSON.stringify(PLAYERS_CONFIG[this.gameMode]));
    const p = this.players.find(x => x.id === 'player');
    if (p) {
      p.name = this.playerName || 'Você';
      p.avatar = this.playerAvatar || '😎';
    }
  }

  setPlayerProfile(name, avatar) {
    if (name) this.playerName = name;
    if (avatar) this.playerAvatar = avatar;
    const p = this.players.find(x => x.id === 'player');
    if (p) {
      p.name = this.playerName;
      p.avatar = this.playerAvatar;
    }
  }

  setGameMode(mode) {
    if (this.gameMode === mode) return;
    this.gameMode = mode;
    this.setupPlayers();
  }

  getPlayer(id) {
    return this.players.find(p => p.id === id);
  }

  getPlayerIndex(id) {
    return this.players.findIndex(p => p.id === id);
  }

  getNextPlayerId(currentId) {
    const idx = this.getPlayerIndex(currentId);
    if (idx === -1) return this.players[0].id;
    const nextIdx = (idx + 1) % this.players.length;
    return this.players[nextIdx].id;
  }

  getPartnerId(playerId) {
    if (this.gameMode === '1v1') return null;
    if (playerId === 'player') return 'bot_partner';
    if (playerId === 'bot_partner') return 'player';
    if (playerId === 'bot_left') return 'bot_right';
    if (playerId === 'bot_right') return 'bot_left';
    return null;
  }

  /**
   * Identifica a função tática de cada jogador na vaza atual: Mão, Meio, Para-Pé ou Pé
   * @returns {Object} Dicionário por playerId com role, class e order
   */
  getTacticalRoles() {
    const roles = {};
    const currentTrick = this.tricks[this.roundNumber - 1];
    const leadId = currentTrick?.leadPlayerId || this.players[this.starterIndex]?.id;
    if (!leadId) return roles;

    const numPlayers = this.players.length;
    let curr = leadId;
    for (let i = 0; i < numPlayers; i++) {
      let roleName = 'Meio';
      let roleClass = 'role-meio';
      if (i === 0) {
        roleName = 'Mão';
        roleClass = 'role-mao';
      } else if (i === numPlayers - 1) {
        roleName = 'Pé';
        roleClass = 'role-pe';
      } else if (numPlayers === 4 && i === 2) {
        roleName = 'Para-Pé';
        roleClass = 'role-parape';
      }
      roles[curr] = { name: roleName, class: roleClass, order: i + 1 };
      curr = this.getNextPlayerId(curr);
    }
    return roles;
  }

  /**
   * Retorna uma foto do estado público para renderização na UI
   */
  getSnapshot(nextBetValue, nextBetLabel) {
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
      nextBetValue,
      nextBetLabel,
      isMaoDe11: this.isMaoDe11,
      maoDe11Team: this.maoDe11Team,
      isMaoDeFerro: this.isMaoDeFerro,
      lastPartnerAdvice: this.lastPartnerAdvice || "",
      isGameOver: this.isGameOver,
      lastBettorTeam: this.lastBettorTeam,
      lastBettorPlayerId: this.lastBettorPlayerId,
      resolvingTrick: !!this.resolvingTrick,
      tacticalRoles: this.getTacticalRoles(),
      casalMaior: this.casalMaior,
      camaDeGatoActive: !!(this.camaDeGato.them || this.camaDeGato.us)
    };
  }
}
