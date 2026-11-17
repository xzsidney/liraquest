/**
 * LiraQuest - Módulo 5: Jogos (Salão Nobre de Jogos & Arcade Familiar)
 * Lobby interno com Truco Paulista, Marvel Zombies, Arqueiro, Duelos e Quests
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { showToast } from '../../components/Toast.js';

export function renderJogosView() {
  const user = auth.getUser();
  const character = auth.getCharacter();
  const gold = character?.gold || 0;

  return `
    <div class="module-jogos-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(139, 92, 246, 0.4);">
        <div class="module-title-box">
          <span class="icon">🎮</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Salão de Jogos & Batalhas</h2>
            <p>Lobby oficial de jogos do reino familiar. Todos os games conectados ao seu progresso e perfil.</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); padding: 6px 12px; border-radius: 10px; font-weight: 700; color: #c4b5fd; font-size: 0.85rem;">
            🪙 ${gold} Ouro
          </div>
          <button id="btn-back-salao-jogos" class="btn-noble btn-noble-secondary btn-noble-sm">
            ⬅️ Voltar ao Grande Salão
          </button>
        </div>
      </div>

      <!-- GRID DOS JOGOS DISPONÍVEIS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px;">
        
        <!-- JOGO 1: TRUCO PAULISTA -->
        <div class="noble-card" style="border-color: rgba(245, 158, 11, 0.4); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="font-size: 2.6rem;">🃏</span>
              <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                🟢 100% OPERACIONAL
              </span>
            </div>
            <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Truco Paulista Mobile</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              Mão de 11, vira, manilhas e blefe! Dispute em duplas ou 1v1 com inteligência artificial cooperativa e acumule Ouro e XP para seu herói!
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 Ganhe Ouro</span>
              <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⭐ Suba de Nível</span>
              <span style="background: rgba(139, 92, 246, 0.15); color: #c4b5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🔒 Acesso Restrito</span>
            </div>
          </div>
          <button id="btn-play-truco" class="btn-noble btn-noble-gold" style="width: 100%;">
            🃏 Jogar Truco Paulista
          </button>
        </div>

        <!-- JOGO 2: MARVEL ZOMBIES RPG -->
        <div class="noble-card" style="border-color: rgba(239, 68, 68, 0.4); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="font-size: 2.6rem;">🧟</span>
              <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                🟢 100% OPERACIONAL
              </span>
            </div>
            <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Marvel Zombies RPG</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              Companheiro digital de campanha pós-apocalíptica: 82 fichas de heróis, missões cooperativas e sincronização em tempo real com MySQL.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🦸 82 Heróis Vivos/Zumbis</span>
              <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">📜 Campanha RPG</span>
            </div>
          </div>
          <button id="btn-play-zombi" class="btn-noble btn-noble-primary" style="width: 100%; border-color: rgba(239, 68, 68, 0.5);">
            🧟 Acessar Marvel Zombies
          </button>
        </div>

        <!-- JOGO 3: DUELO DE ARQUEIROS 1v1 -->
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.4); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="font-size: 2.6rem;">⚔️🏹</span>
              <span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                ⚡ MULTIPLAYER 1v1
              </span>
            </div>
            <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Duelo de Arqueiros (1v1)</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              Duelo de reflexo e conhecimento em tempo real via WebSockets! Irmãos duelam respondendo quizzes do seu próprio nível escolar.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🌐 WebSockets</span>
              <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🧠 +Inteligência</span>
            </div>
          </div>
          <button id="btn-play-duel" class="btn-noble btn-noble-secondary" style="width: 100%;">
            🏹 Entrar no Duelo 1v1
          </button>
        </div>

        <!-- JOGO 4: ESCONDE-ESCONDE CAMALEÃO -->
        <div class="noble-card" style="border-color: rgba(16, 185, 129, 0.4); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="font-size: 2.6rem;">🔦</span>
              <span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                🟢 DISPONÍVEL
              </span>
            </div>
            <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Esconde-Esconde Camaleão</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              Camufle sua bolinha ficando sobre pisos da mesma cor! Desvie do facho de luz da patrulha e sobreviva aos 45 segundos de adrenalina!
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Reflexo & Agilidade</span>
              <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">💰 +30 Ouro</span>
            </div>
          </div>
          <button id="btn-play-chameleon" class="btn-noble btn-noble-secondary" style="width: 100%;">
            🔦 Jogar Camaleão
          </button>
        </div>

      </div>
    </div>
  `;
}

export function bindJogosEvents() {
  const btnBack = document.getElementById('btn-back-salao-jogos');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Abertura Segura do Truco Paulista
  const btnTruco = document.getElementById('btn-play-truco');
  if (btnTruco) {
    btnTruco.onclick = () => {
      if (!auth.isAuthenticated()) {
        showToast('Acesso negado: Faça login para jogar Truco.', 'error');
        router.navigate('login');
        return;
      }
      window.location.href = '/truco';
    };
  }

  // Abertura Segura do Marvel Zombies
  const btnZombi = document.getElementById('btn-play-zombi');
  if (btnZombi) {
    btnZombi.onclick = () => {
      if (!auth.isAuthenticated()) {
        showToast('Acesso negado: Faça login para acessar Marvel Zombies.', 'error');
        router.navigate('login');
        return;
      }
      window.location.href = '/zombi';
    };
  }

  // Abertura do Duelo de Arqueiros 1v1
  const btnDuel = document.getElementById('btn-play-duel');
  if (btnDuel) {
    btnDuel.onclick = () => {
      if (!auth.isAuthenticated()) {
        showToast('Faça login para entrar no duelo.', 'error');
        router.navigate('login');
        return;
      }
      window.location.href = '/duel.html';
    };
  }

  // Abertura do Esconde-Esconde Camaleão
  const btnChameleon = document.getElementById('btn-play-chameleon');
  if (btnChameleon) {
    btnChameleon.onclick = () => {
      showToast('Iniciando Esconde-Esconde Camaleão...', 'info');
      // Abre via hash ou tela do avatar
      try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch(e) {}
      window.location.href = '/#avatar';
    };
  }
}
