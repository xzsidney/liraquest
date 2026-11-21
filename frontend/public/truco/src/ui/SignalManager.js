// =============================================================================
// SIGNALMANAGER.JS - SINAIS TRADICIONAIS, BALÕES DE FALA E CHAT DE BOTECO
// Controla animações dos badges corporais, balões flutuantes e feed de mensagens
// =============================================================================

export class SignalManager {
  constructor(chatLogEl) {
    this.chatLogEl = chatLogEl;
    this.speechTimeouts = {};
    this.badgeTimeouts = {};
  }

  addChatMessage(author, text, type = 'system') {
    if (!this.chatLogEl) return;
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${type}`;
    if (author) {
      msgEl.innerHTML = `<span class="chat-author">${author}:</span> ${text}`;
    } else {
      msgEl.textContent = text;
    }
    this.chatLogEl.appendChild(msgEl);
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
  }

  showBotSpeech(botId, text, botName = 'Mesa', botTeam = 'them') {
    const bubble = document.getElementById(`speech-${botId}`);
    if (bubble) {
      bubble.textContent = text;
      bubble.classList.add('visible');

      if (this.speechTimeouts[botId]) clearTimeout(this.speechTimeouts[botId]);
      this.speechTimeouts[botId] = setTimeout(() => {
        bubble.classList.remove('visible');
      }, 4200);
    }

    const type = botTeam === 'us' ? 'partner' : 'enemy';
    this.addChatMessage(botName, text, type);
  }

  showBotSignal(botId, emoji) {
    const badge = document.getElementById(`badge-${botId}`);
    if (badge) {
      badge.textContent = emoji;
      badge.classList.add('signaling');
      if (this.badgeTimeouts[botId]) clearTimeout(this.badgeTimeouts[botId]);
      this.badgeTimeouts[botId] = setTimeout(() => {
        badge.classList.remove('signaling');
        badge.textContent = '😐';
      }, 3800);
    }
  }

  showPlayerSignal(emoji, phrase) {
    const playerBadge = document.getElementById('badge-player');
    if (playerBadge) {
      playerBadge.textContent = emoji;
      playerBadge.classList.add('signaling');
      if (this.badgeTimeouts['player']) clearTimeout(this.badgeTimeouts['player']);
      this.badgeTimeouts['player'] = setTimeout(() => {
        playerBadge.classList.remove('signaling');
        playerBadge.textContent = '😐';
      }, 3800);
    }

    this.addChatMessage('Você (Sinal)', `[${emoji}] "${phrase}"`, 'partner');
  }
}
