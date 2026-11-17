/**
 * LiraQuest - Módulo 3: Saúde (Alimentação, Cardápio, Horários & Hidratação)
 */

import { router } from '../../core/router.js';
import { showToast } from '../../components/Toast.js';

let waterGlasses = parseInt(localStorage.getItem('liraquest_water_count') || '3');

export function renderSaudeView() {
  return `
    <div class="module-saude-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(16, 185, 129, 0.4);">
        <div class="module-title-box">
          <span class="icon">🥗</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Saúde & Vitalidade</h2>
            <p>Alimentação balanceada, horários de refeição, controle de hidratação e bem-estar do clã.</p>
          </div>
        </div>
        <button id="btn-back-salao-saude" class="btn-noble btn-noble-secondary btn-noble-sm">
          ⬅️ Voltar ao Grande Salão
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
        <!-- CARD DE HIDRATAÇÃO -->
        <div class="noble-card" style="border-color: rgba(16, 185, 129, 0.35); text-align: center; padding: 28px 20px;">
          <div style="font-size: 2.5rem; margin-bottom: 6px;">💧</div>
          <h3 class="cinzel" style="font-size: 1.3rem; color: #ffffff; margin-bottom: 4px;">Hidratação Diária do Herói</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 18px;">
            Meta: 8 copos d'água (2 litros) para manter sua Constituição máxima!
          </p>

          <div style="font-size: 2.2rem; font-weight: 900; color: #6ee7b7; margin-bottom: 14px;">
            <span id="water-count-val">${waterGlasses}</span> / 8 <span style="font-size: 1.2rem; color: #94a3b8;">copos</span>
          </div>

          <!-- Ícones dos copos -->
          <div id="water-glasses-row" style="display: flex; justify-content: center; gap: 8px; font-size: 1.5rem; margin-bottom: 22px; flex-wrap: wrap;">
            ${Array.from({ length: 8 }, (_, i) => `
              <span style="opacity: ${i < waterGlasses ? '1' : '0.25'}; filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)); transition: all 0.2s;">🥤</span>
            `).join('')}
          </div>

          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-add-water" class="btn-noble btn-noble-primary btn-noble-sm" style="background: linear-gradient(135deg, #059669, #10b981); border-color: #34d399;">
              ➕ Bebi 1 Copo (+5 XP)
            </button>
            <button id="btn-reset-water" class="btn-noble btn-noble-secondary btn-noble-sm">
              ↺ Resetar
            </button>
          </div>
        </div>

        <!-- CARD DE HORÁRIOS & CARDÁPIO -->
        <div class="noble-card" style="border-color: rgba(16, 185, 129, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin: 0;">🍽️ Cardápio & Horários</h3>
            <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Rotina do Clã</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.92rem;">☕ Café da Manhã (07:30)</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Frutas, ovos mexidos e suco natural</span>
              </div>
              <span style="color: #4ade80; font-size: 0.82rem; font-weight: 700;">Cumprido ✓</span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.92rem;">🥗 Almoço Fortalecedor (12:30)</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Arroz, feijão, proteína e salada colorida</span>
              </div>
              <span style="color: #4ade80; font-size: 0.82rem; font-weight: 700;">Cumprido ✓</span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.92rem;">🍎 Lanche da Tarde (16:30)</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Iogurte com aveia e maçã</span>
              </div>
              <span style="color: #fbbf24; font-size: 0.82rem; font-weight: 700;">Próximo ⏳</span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.92rem;">🍲 Jantar em Família (19:30)</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Sopa de legumes ou grelhado leve</span>
              </div>
              <span style="color: #94a3b8; font-size: 0.82rem; font-weight: 700;">Agendado</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindSaudeEvents() {
  const btnBack = document.getElementById('btn-back-salao-saude');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  const btnAddWater = document.getElementById('btn-add-water');
  const btnResetWater = document.getElementById('btn-reset-water');

  if (btnAddWater) {
    btnAddWater.onclick = () => {
      if (waterGlasses < 8) {
        waterGlasses++;
        localStorage.setItem('liraquest_water_count', waterGlasses.toString());
        showToast(`💧 Copo contabilizado! (${waterGlasses}/8) +5 XP de Vitalidade!`, 'success');
        router.navigate('saude');
      } else {
        showToast('🎉 Parabéns! Meta de 8 copos atingida no dia de hoje!', 'success');
      }
    };
  }

  if (btnResetWater) {
    btnResetWater.onclick = () => {
      waterGlasses = 0;
      localStorage.setItem('liraquest_water_count', '0');
      showToast('Contador de água zerado para um novo dia.', 'info');
      router.navigate('saude');
    };
  }
}
