/**
 * LiraQuest - Loja do Lar & Vales Reais (frontend/src/views/ShopView.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

export function renderShopView() {
  const member = auth.getMember();
  const tokens = member?.family_tokens || 0;

  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
            ⬅️ Voltar ao Salão
          </button>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem;">🏪 Loja do Lar & Vales Reais</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Troque suas 🎟️ Fichas do Lar conquistadas por recompensas da vida real.
          </p>
        </div>

        <button id="btn-go-rpg" class="btn-noble btn-noble-gold btn-noble-sm">
          ⚔️ Masmorras RPG D20 ➜
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        
        <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🍕</div>
            <h3 class="cinzel" style="color: #fff; font-size: 1.2rem;">Noite da Pizza em Família</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
              Escolha o sabor da pizza favorita da sexta-feira à noite!
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
            <span style="font-weight: 800; color: #fde047;">🎟️ 30 Fichas</span>
            <button class="btn-noble btn-noble-primary btn-noble-sm" ${tokens < 30 ? 'disabled style="opacity:0.5;"' : ''}>
              Resgatar Vale
            </button>
          </div>
        </div>

        <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🎬</div>
            <h3 class="cinzel" style="color: #fff; font-size: 1.2rem;">Escolha do Filme do Sábado</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
              Direito exclusivo de escolher o filme com pipoca para todos assistirem.
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
            <span style="font-weight: 800; color: #fde047;">🎟️ 15 Fichas</span>
            <button class="btn-noble btn-noble-primary btn-noble-sm" ${tokens < 15 ? 'disabled style="opacity:0.5;"' : ''}>
              Resgatar Vale
            </button>
          </div>
        </div>

        <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🎮</div>
            <h3 class="cinzel" style="color: #fff; font-size: 1.2rem;">+1 Hora Extra de Videogame</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
              Tempo bônus no final de semana após cumprir todas as tarefas da semana.
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
            <span style="font-weight: 800; color: #fde047;">🎟️ 20 Fichas</span>
            <button class="btn-noble btn-noble-primary btn-noble-sm" ${tokens < 20 ? 'disabled style="opacity:0.5;"' : ''}>
              Resgatar Vale
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindShopEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');

  const btnRpg = document.getElementById('btn-go-rpg');
  if (btnRpg) btnRpg.onclick = () => router.navigate('rpg');
}

export default { renderShopView, bindShopEvents };
