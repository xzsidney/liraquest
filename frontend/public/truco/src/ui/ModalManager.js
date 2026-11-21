// =============================================================================
// MODALMANAGER.JS - GERENCIAMENTO DOS MODAIS DE DECISÃO E RECOMPENSAS
// Modais: Truco/Retruco, Mão de 11, Menu Mobile e Vitória LiraQuest (/api/truco/finish)
// =============================================================================

export class ModalManager {
  constructor(domElements, renderer) {
    this.dom = domElements;
    this.renderer = renderer;
  }

  showTrucoModal(state, onAccept, onRefuse, onRaise) {
    const { trucoModal, trucoModalTitle, trucoModalDesc, btnModalRaise } = this.dom;
    if (!trucoModal) return;

    if (state.betState === 'waiting_player') {
      if (trucoModalTitle) trucoModalTitle.textContent = `${state.nextBetLabel}!`;
      const caller = state.players.find(p => p.id === state.lastBettorPlayerId);
      const callerName = caller ? caller.name : "A dupla adversária";
      if (trucoModalDesc) {
        trucoModalDesc.textContent = `${callerName} aumentou para ${state.nextBetValue} pontos! Qual sua resposta?`;
      }

      // Renderiza as cartas do jogador no modal
      const trucoCardsPlayer = document.getElementById('truco-cards-player');
      if (trucoCardsPlayer) {
        trucoCardsPlayer.innerHTML = '';
        const availableHand = (state.hands['player'] || []).filter(c => !c.played);
        availableHand.forEach(c => {
          trucoCardsPlayer.appendChild(this.renderer.renderCard(c, false));
        });
      }

      // Sinal e conselho do parceiro Tião
      const partnerSigEl = document.getElementById('truco-modal-partner-signal');
      if (partnerSigEl) {
        const sigKey = state.handSignals ? state.handSignals['bot_partner'] : null;
        if (state.gameMode === '4p' && sigKey && window.BOT_SIGNALS && window.BOT_SIGNALS[sigKey]) {
          const sObj = window.BOT_SIGNALS[sigKey];
          partnerSigEl.style.display = 'block';
          const adviceTxt = state.lastPartnerAdvice ? `"${state.lastPartnerAdvice}"` : sObj.action;
          partnerSigEl.innerHTML = `🤝 <strong>Tião sinalizou:</strong> ${sObj.emoji} ${sObj.name} • <em>${adviceTxt}</em>`;
        } else {
          partnerSigEl.style.display = 'none';
        }
      }

      if (btnModalRaise) {
        if (state.nextBetValue < 12) {
          btnModalRaise.style.display = 'inline-block';
          const raiseVal = state.nextBetValue === 3 ? 6 : (state.nextBetValue === 6 ? 9 : 12);
          const label = raiseVal === 6 ? 'SEIS' : (raiseVal === 9 ? 'NOVE' : 'DOZE');
          btnModalRaise.textContent = `🔥 Pedir ${label}!`;
        } else {
          btnModalRaise.style.display = 'none';
        }
      }

      trucoModal.classList.add('active');
    } else {
      trucoModal.classList.remove('active');
    }
  }

  showMao11Modal(state) {
    const { mao11Modal } = this.dom;
    if (!mao11Modal) return;

    if (state.betState === 'player_deciding_mao11') {
      const playerCardsEl = document.getElementById('mao11-cards-player');
      if (playerCardsEl) {
        playerCardsEl.innerHTML = '';
        const available = (state.hands['player'] || []).filter(c => !c.played);
        available.forEach(c => {
          playerCardsEl.appendChild(this.renderer.renderCard(c, false));
        });
      }

      const partnerCardsEl = document.getElementById('mao11-cards-partner');
      const partnerCol = document.getElementById('mao11-col-partner');
      if (partnerCardsEl) {
        partnerCardsEl.innerHTML = '';
        if (state.gameMode === '4p') {
          if (partnerCol) partnerCol.style.display = 'flex';
          const pHand = (state.hands['bot_partner'] || []).filter(c => !c.played);
          pHand.forEach(c => {
            partnerCardsEl.appendChild(this.renderer.renderCard(c, false));
          });
        } else {
          if (partnerCol) partnerCol.style.display = 'none';
        }
      }

      const adviceText = document.getElementById('mao11-advice-text');
      if (adviceText) {
        if (state.lastPartnerAdvice) {
          adviceText.textContent = `"${state.lastPartnerAdvice}"`;
        } else if (state.gameMode === '4p') {
          adviceText.textContent = '"Avaliando nossa mão conjunta..."';
        } else {
          adviceText.textContent = '"Analise suas cartas com calma!"';
        }
      }

      mao11Modal.classList.add('active');
    } else {
      mao11Modal.classList.remove('active');
    }
  }

  showRewardModal(resultData, isVictory) {
    const {
      rewardModal, rewardTitle, rewardIcon, rewardDesc,
      rewardGoldTag, rewardXpTag, rewardLevelupBox, rewardNewLevel
    } = this.dom;

    if (!rewardModal || !resultData.success) return;

    const r = resultData.rewards;
    if (rewardTitle) rewardTitle.textContent = isVictory ? "VITÓRIA ÉPICA!" : "FIM DE JOGO!";
    if (rewardIcon) rewardIcon.textContent = isVictory ? "🏆" : "🎖️";
    if (rewardDesc) rewardDesc.textContent = resultData.message;
    if (rewardGoldTag) rewardGoldTag.textContent = `💰 +${r.gold} Ouro`;
    if (rewardXpTag) rewardXpTag.textContent = `⭐ +${r.xp} XP`;

    if (r.leveled_up && rewardLevelupBox && rewardNewLevel) {
      rewardLevelupBox.style.display = 'block';
      rewardNewLevel.textContent = r.new_level;
    } else if (rewardLevelupBox) {
      rewardLevelupBox.style.display = 'none';
    }

    setTimeout(() => {
      rewardModal.classList.add('active');
    }, 1200);
  }
}
