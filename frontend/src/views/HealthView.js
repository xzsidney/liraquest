/**
 * LiraQuest - Saúde, Refeições & Água (frontend/src/views/HealthView.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

let waterGlasses = 4; // copos tomados hoje

export function renderHealthView() {
  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <div style="margin-bottom: 20px;">
        <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
          ⬅️ Voltar ao Salão
        </button>
        <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem;">🥗 Saúde, Refeições & Hidratação</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Alimente-se com disciplina e beba 2L de água para aumentar sua Constituição (CON).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        
        <!-- Hidratação (Copos de Água) -->
        <div class="noble-card" style="text-align: center;">
          <h3 class="cinzel" style="color: #fff; margin-bottom: 12px;">💧 Hidratação do Aventureiro (2L)</h3>
          <div style="font-size: 3rem; margin: 12px 0;">
            🥤 <span id="water-count-display" style="font-weight: 900; color: #60a5fa;">${waterGlasses}</span> / 8 Copos
          </div>
          <div style="height: 12px; background: rgba(0,0,0,0.5); border-radius: 10px; overflow: hidden; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <div id="water-bar-fill" style="width: ${(waterGlasses / 8) * 100}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
          </div>
          <button id="btn-add-water" class="btn-noble btn-noble-secondary" style="width: 100%;">
            ➕ Beber 1 Copo de Água (250ml)
          </button>
        </div>

        <!-- Cardápio do Clã -->
        <div class="noble-card">
          <h3 class="cinzel" style="color: #fff; margin-bottom: 12px;">🍲 Refeições Saudáveis</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: rgba(255, 255, 255, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25);">
              <span style="font-size: 0.75rem; color: #4ade80; font-weight: 800; text-transform: uppercase;">Almoço dos Campeões</span>
              <div style="color: #fff; font-weight: 700; font-size: 0.95rem;">Arroz, Feijão, Salada & Patinho Moído</div>
              <small style="color: var(--text-muted); font-size: 0.75rem;">Proteína limpa e legumes frescos</small>
            </div>
            <div style="background: rgba(255, 255, 255, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.25);">
              <span style="font-size: 0.75rem; color: #fde047; font-weight: 800; text-transform: uppercase;">Lanche da Tarde</span>
              <div style="color: #fff; font-weight: 700; font-size: 0.95rem;">Frutas Frescas & Iogurte Natural</div>
              <small style="color: var(--text-muted); font-size: 0.75rem;">Energia pura para a mente</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindHealthEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');

  const btnAddWater = document.getElementById('btn-add-water');
  const countDisplay = document.getElementById('water-count-display');
  const barFill = document.getElementById('water-bar-fill');

  if (btnAddWater) {
    btnAddWater.onclick = () => {
      if (waterGlasses < 8) {
        waterGlasses++;
        if (countDisplay) countDisplay.textContent = waterGlasses;
        if (barFill) barFill.style.width = `${(waterGlasses / 8) * 100}%`;
        if (waterGlasses === 8) {
          alert('🏆 Meta de 2L atingida hoje! +20 XP e bônus de Constituição (CON)!');
        }
      }
    };
  }
}

export default { renderHealthView, bindHealthEvents };
