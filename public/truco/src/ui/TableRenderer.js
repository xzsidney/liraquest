// =============================================================================
// TABLERENDERER.JS - RENDERIZAÇÃO VISUAL DOS ELEMENTOS DA MESA
// Cartas com design nobre, feltro verde, vaza-dots, pílulas táticas e vez ativa
// =============================================================================

export class TableRenderer {
  constructor(domElements) {
    this.dom = domElements;
  }

  /**
   * Cria o elemento DOM visual de uma carta do Truco
   * @param {Object} card 
   * @param {boolean} isInteractive 
   * @param {Function|null} onCardClick 
   * @param {boolean} isMini 
   * @returns {HTMLElement}
   */
  renderCard(card, isInteractive = false, onCardClick = null, isMini = false) {
    if (!card) return document.createElement('div');

    const cardEl = document.createElement('div');
    cardEl.className = `truco-card is-${card.color}`;
    if (isMini) {
      cardEl.classList.add('is-mini');
    }

    if (card.isManilha) cardEl.classList.add('is-manilha');
    if (card.played) cardEl.classList.add('played');
    if (card.covered) cardEl.classList.add('is-covered');

    if (card.covered) {
      cardEl.className = `truco-card is-covered ${isMini ? 'is-mini' : ''}`;
      return cardEl;
    }

    let manilhaTagHtml = '';
    if (card.isManilha && card.manilhaName) {
      const fontSize = isMini ? '0.42rem' : '0.52rem';
      manilhaTagHtml = `<div class="manilha-tag" style="font-size: ${fontSize}">★ ${card.manilhaName}</div>`;
    }

    const valSize = isMini ? '0.78rem' : '1.15rem';
    const suitSize = isMini ? '0.65rem' : '0.95rem';
    const centerSize = isMini ? '1.25rem' : '1.85rem';

    cardEl.innerHTML = `
      ${manilhaTagHtml}
      <div class="card-corner top">
        <span class="card-value" style="font-size: ${valSize}">${card.value}</span>
        <span class="card-suit" style="font-size: ${suitSize}">${card.suitSymbol}</span>
      </div>
      <div class="card-center" style="font-size: ${centerSize}">${card.suitSymbol}</div>
      <div class="card-corner bottom">
        <span class="card-value" style="font-size: ${valSize}">${card.value}</span>
        <span class="card-suit" style="font-size: ${suitSize}">${card.suitSymbol}</span>
      </div>
    `;

    if (isInteractive && !card.played && onCardClick) {
      cardEl.addEventListener('click', onCardClick);
    }

    return cardEl;
  }

  updateManilhasPlaque(val) {
    if (!this.dom.manilhasCardsRow || !val) return;
    this.dom.manilhasCardsRow.innerHTML = `
      <span class="m-card is-red">${val}♦</span>
      <span class="m-card is-black">${val}♠</span>
      <span class="m-card is-red">${val}♥</span>
      <span class="m-card is-black">${val}♣</span>
    `;
  }

  renderState(state, callbacks = {}) {
    const { onPlayerCardClick, playNextCovered } = callbacks;

    // 1. Modo 4p vs 1v1
    if (state.gameMode === '4p') {
      this.dom.feltTable?.classList.remove('mode-1v1');
      this.dom.btnMode4p?.classList.add('active');
      this.dom.btnMode1v1?.classList.remove('active');
      if (this.dom.scoreNameUs) this.dom.scoreNameUs.textContent = "nós";
      if (this.dom.scoreNameThem) this.dom.scoreNameThem.textContent = "eles";
      const avPartner = document.getElementById('avatar-bot_partner');
      if (avPartner) avPartner.querySelector('.avatar-icon').textContent = '🤖';
    } else {
      this.dom.feltTable?.classList.add('mode-1v1');
      this.dom.btnMode4p?.classList.remove('active');
      this.dom.btnMode1v1?.classList.add('active');
      if (this.dom.scoreNameUs) this.dom.scoreNameUs.textContent = "você";
      if (this.dom.scoreNameThem) this.dom.scoreNameThem.textContent = "zé";
      const avPartner = document.getElementById('avatar-bot_partner');
      if (avPartner) avPartner.querySelector('.avatar-icon').textContent = '👾';
    }

    // 2. Placar
    if (this.dom.scoreNumUs) this.dom.scoreNumUs.textContent = state.playerScore;
    if (this.dom.scoreNumThem) this.dom.scoreNumThem.textContent = state.botScore;
    if (this.dom.scoreHandVal) this.dom.scoreHandVal.textContent = state.betValue;

    // 3. Vaza Dots
    for (let r = 1; r <= 3; r++) {
      const dotUs = document.getElementById(`dot-us-${r}`);
      const dotThem = document.getElementById(`dot-them-${r}`);
      if (dotUs) dotUs.className = 'dot';
      if (dotThem) dotThem.className = 'dot';

      const trick = state.tricks[r - 1];
      if (trick) {
        if (trick.winnerTeam === 'us') {
          if (dotUs) { dotUs.className = 'dot won'; dotUs.textContent = '✔️'; }
          if (dotThem) { dotThem.className = 'dot lost'; dotThem.textContent = '❌'; }
        } else if (trick.winnerTeam === 'them') {
          if (dotUs) { dotUs.className = 'dot lost'; dotUs.textContent = '❌'; }
          if (dotThem) { dotThem.className = 'dot won'; dotThem.textContent = '✔️'; }
        } else if (trick.winnerTeam === 'draw') {
          if (dotUs) { dotUs.className = 'dot draw'; dotUs.textContent = '🟡'; }
          if (dotThem) { dotThem.className = 'dot draw'; dotThem.textContent = '🟡'; }
        }
      } else {
        if (dotUs) dotUs.textContent = '';
        if (dotThem) dotThem.textContent = '';
      }
    }

    // 4. Indicador de Casal Maior
    const tacticTag = document.getElementById('tactic-indicator-tag');
    if (tacticTag) {
      if (state.casalMaior?.us) {
        tacticTag.style.display = 'block';
        tacticTag.textContent = '👑 CASAL MAIOR (Zap + Copeta)';
      } else {
        tacticTag.style.display = 'none';
      }
    }

    // 5. Manilhas
    if (state.manilhaValue) {
      this.updateManilhasPlaque(state.manilhaValue);
    }

    // 6. Vez ativa
    const stations = [this.dom.stationSouth, this.dom.stationNorth, this.dom.stationWest, this.dom.stationEast];
    stations.forEach(s => s?.classList.remove('active-turn'));
    const activeStation = document.getElementById(`station-${state.currentTurnPlayerId}`);
    activeStation?.classList.add('active-turn');

    // 7. Pílulas de função tática
    if (state.tacticalRoles) {
      const allStationIds = ['player', 'bot_partner', 'bot_left', 'bot_right'];
      allStationIds.forEach(id => {
        const roleEl = document.getElementById(`role-tag-${id}`);
        const roleInfo = state.tacticalRoles[id];
        if (roleEl && roleInfo) {
          roleEl.textContent = id === 'player' ? `Você • ${roleInfo.name}` : roleInfo.name;
          roleEl.className = `tactical-role-pill ${roleInfo.class}`;
          roleEl.style.display = 'inline-block';
        } else if (roleEl) {
          roleEl.style.display = 'none';
        }
      });
    }

    // 8. Vira Card
    if (this.dom.viraCardSlot) {
      this.dom.viraCardSlot.innerHTML = '';
      if (state.viraCard) {
        const viraEl = this.renderCard(state.viraCard, false, null, true);
        this.dom.viraCardSlot.appendChild(viraEl);
      }
    }

    // 9. Vaza central
    const currentTrick = state.tricks[state.roundNumber - 1];
    const allSlotIds = ['player', 'bot_partner', 'bot_left', 'bot_right'];
    allSlotIds.forEach(id => {
      const slotEl = document.getElementById(`played-card-${id}`);
      if (slotEl) slotEl.innerHTML = '';
    });

    if (currentTrick?.plays) {
      currentTrick.plays.forEach(p => {
        const slotEl = document.getElementById(`played-card-${p.playerId}`);
        if (slotEl && p.card) {
          slotEl.appendChild(this.renderCard(p.card));
        }
      });
    }

    // 10. Mão do Jogador
    if (this.dom.playerHandEl) {
      this.dom.playerHandEl.innerHTML = '';
      const myHand = state.hands['player'] || [];
      myHand.forEach((card, idx) => {
        if (!card.played) {
          if (state.isMaoDeFerro) {
            const ironCard = document.createElement('div');
            ironCard.className = 'card-back-blue';
            ironCard.style.width = 'var(--card-width)';
            ironCard.style.height = 'var(--card-height)';
            ironCard.style.cursor = 'pointer';
            ironCard.title = "Jogar carta no escuro";
            ironCard.addEventListener('click', () => {
              if (state.currentTurnPlayerId !== 'player' || state.resolvingTrick || state.betState !== 'none') return;
              onPlayerCardClick && onPlayerCardClick(idx, false);
            });
            this.dom.playerHandEl.appendChild(ironCard);
          } else {
            const cEl = this.renderCard(card, true, () => {
              if (state.currentTurnPlayerId !== 'player' || state.resolvingTrick || state.betState !== 'none') return;
              onPlayerCardClick && onPlayerCardClick(idx, playNextCovered);
            });
            this.dom.playerHandEl.appendChild(cEl);
          }
        }
      });
    }

    // 11. Cartas dos Bots (Verso Azul)
    this.renderBotCards('cards-bot_partner', state.hands['bot_partner'], state.isMaoDe11 && state.maoDe11Team === 'us', 'mini-back');
    this.renderBotCards('cards-bot_left', state.hands['bot_left'], false, 'side-card-landscape');
    this.renderBotCards('cards-bot_right', state.hands['bot_right'], false, 'side-card-landscape');

    // 12. Botão de Truco
    this.updateTrucoButton(state);

    // 13. Botão de Coberta
    this.updateCoveredButton(state, playNextCovered);
  }

  renderBotCards(elementId, hand, isRevealed, extraClass) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';
    const cards = hand || [];
    cards.forEach(c => {
      if (!c.played) {
        if (isRevealed) {
          el.appendChild(this.renderCard(c, false, null, true));
        } else {
          const back = document.createElement('div');
          back.className = `card-back-blue ${extraClass}`;
          el.appendChild(back);
        }
      }
    });
  }

  updateTrucoButton(state) {
    const btn = this.dom.btnTrucoAction;
    const txt = this.dom.btnTrucoText;
    if (!btn || !txt) return;

    if (state.isMaoDe11 || state.isMaoDeFerro || state.isGameOver || state.betState !== 'none' || state.lastBettorTeam === 'us') {
      btn.disabled = true;
      if (state.lastBettorTeam === 'us') {
        txt.textContent = 'AGUARDE...';
      } else if (state.isMaoDe11) {
        txt.textContent = 'MÃO 11';
      } else {
        txt.textContent = 'TRUCO';
      }
    } else {
      btn.disabled = false;
      if (state.nextBetValue) {
        const label = state.nextBetValue === 3 ? 'TRUCO' : state.nextBetLabel.toUpperCase();
        txt.textContent = label;
      } else {
        btn.disabled = true;
        txt.textContent = 'TRUCO';
      }
    }
  }

  updateCoveredButton(state, playNextCovered) {
    const btn = this.dom.btnToggleCovered;
    if (!btn) return;

    if (state.roundNumber === 1 || state.isMaoDeFerro || state.isGameOver) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }

    if (playNextCovered) {
      btn.classList.add('active');
      btn.innerHTML = '🙈 Coberta (On)';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '👁️ Aberta';
    }
  }
}
