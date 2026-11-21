/**
 * LiraQuest - Mural de Tarefas do Lar (frontend/src/views/TasksView.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

export function renderTasksView() {
  const member = auth.getMember();
  const isParent = auth.isParent();

  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
            ⬅️ Voltar ao Salão
          </button>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem;">🧹 Missões do Lar & Deveres</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Cumpra suas tarefas diárias para ganhar Força (STR), XP e Fichas do Lar.
          </p>
        </div>

        ${isParent ? `
          <button class="btn-noble btn-noble-gold btn-noble-sm">
            ➕ Nova Missão
          </button>
        ` : ''}
      </div>

      <div class="noble-card">
        <h3 class="cinzel" style="color: #fff; font-size: 1.2rem; margin-bottom: 16px;">
          Mural do Dia
        </h3>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1.2rem;">🛏️</span>
                <strong style="color: #fff; font-size: 1.05rem;">Arrumar a Cama e Organizar Quarto</strong>
                <span style="background: rgba(16, 185, 129, 0.2); color: #4ade80; font-size: 0.72rem; padding: 2px 8px; border-radius: 8px; font-weight: 700;">Diária</span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Lençóis esticados, travesseiros no lugar e brinquedos guardados.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 0.85rem; font-weight: 800; color: #fde047;">⚡ +10 XP • 🎟️ +1 Ficha</span>
              <button class="btn-noble btn-noble-primary btn-noble-sm">📸 Enviar Foto</button>
            </div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1.2rem;">🍽️</span>
                <strong style="color: #fff; font-size: 1.05rem;">Ajudar a Tirar e Lavar a Mesa</strong>
                <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 0.72rem; padding: 2px 8px; border-radius: 8px; font-weight: 700;">Almoço</span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Levar os pratos para a pia e limpar a mesa após a refeição.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 0.85rem; font-weight: 800; color: #fde047;">⚡ +15 XP • 🎟️ +1 Ficha</span>
              <button class="btn-noble btn-noble-primary btn-noble-sm">📸 Enviar Foto</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export function bindTasksEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');
}

export default { renderTasksView, bindTasksEvents };
