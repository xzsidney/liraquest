/**
 * LiraQuest - Masmorras D20 & Combates (frontend/src/views/RpgView.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

let lastD20Roll = null;

export function renderRpgView() {
  const member = auth.getMember();
  const heroName = member?.hero_nickname || 'Herói';

  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <div style="margin-bottom: 20px;">
        <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
          ⬅️ Voltar ao Salão
        </button>
        <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem;">⚔️ Masmorras D20 & Combates do Reino</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Gaste sua Energia de Aventura para explorar cavernas e enfrentar monstros com rolagens de dados!
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        
        <!-- Rolador de Dados D20 -->
        <div class="noble-card" style="text-align: center;">
          <h3 class="cinzel" style="color: #fff; margin-bottom: 8px;">🎲 Teste de Resolução D20</h3>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 16px;">
            Role contra a Classe de Dificuldade (CD) para vencer o desafio.
          </p>

          <div id="d20-display" style="width: 100px; height: 100px; margin: 0 auto 16px; border-radius: 20px; background: linear-gradient(135deg, #800020, #1e3a8a); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2.8rem; font-weight: 900; color: #fde047; box-shadow: 0 0 25px var(--gold-glow);">
            ${lastD20Roll || 'D20'}
          </div>

          <button id="btn-roll-d20" class="btn-noble btn-noble-gold" style="padding: 12px 28px;">
            🎲 Rolar Dado de 20 Lados
          </button>
          <div id="d20-result-text" style="font-size: 0.9rem; font-weight: 700; color: #4ade80; margin-top: 12px; min-height: 24px;"></div>
        </div>

        <!-- Masmorra Ativa -->
        <div class="noble-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="cinzel" style="color: #fff;">Caverna dos Ecos Arcanos</h3>
            <span style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-size: 0.75rem; padding: 2px 8px; border-radius: 8px; font-weight: 800;">CD 12</span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px;">
            Um Goblin Guardião bloqueia o baú dourado. Faça um teste de Força (STR) ou Agilidade (AGI) para superá-lo!
          </p>
          <div style="background: rgba(255, 255, 255, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 16px;">
            <div style="font-size: 0.8rem; color: #cbd5e1;">Recompensas do Baú:</div>
            <strong style="color: #fde047; font-size: 0.95rem;">💰 +25 Ouro • ⚡ +30 XP • 🏆 Troféu de Caçador</strong>
          </div>
          <button class="btn-noble btn-noble-primary" style="width: 100%;">
            ⚡ Desafiar Monstro (-2 Energia)
          </button>
        </div>

      </div>
    </div>
  `;
}

export function bindRpgEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');

  const btnRoll = document.getElementById('btn-roll-d20');
  const d20Display = document.getElementById('d20-display');
  const resultText = document.getElementById('d20-result-text');

  if (btnRoll) {
    btnRoll.onclick = () => {
      const roll = Math.floor(Math.random() * 20) + 1;
      lastD20Roll = roll;
      if (d20Display) d20Display.textContent = roll;

      if (resultText) {
        if (roll === 20) {
          resultText.textContent = '🌟 ACERTO CRÍTICO NATURAL! SUCESSO LENDÁRIO!';
          resultText.style.color = '#fde047';
        } else if (roll === 1) {
          resultText.textContent = '💀 FALHA CRÍTICA! O monstro aproveitou a brecha!';
          resultText.style.color = '#f87171';
        } else if (roll >= 12) {
          resultText.textContent = `✅ SUCESSO! Rolou ${roll} (Superou a CD 12)!`;
          resultText.style.color = '#4ade80';
        } else {
          resultText.textContent = `❌ FALHA! Rolou ${roll} (Necessário 12). Tente novamente!`;
          resultText.style.color = '#f87171';
        }
      }
    };
  }
}

export default { renderRpgView, bindRpgEvents };
