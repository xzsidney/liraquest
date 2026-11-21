/**
 * LiraQuest - Salão Único do Herói (HubView.js)
 * HeroHUD no Topo + Os 4 Portais da Vida Familiar
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

export async function renderHubView() {
  const member = auth.getMember();
  const heroName = member?.hero_nickname || member?.name || 'Aventureiro';
  const clanName = member?.family?.name || 'Clã Lira';

  return `
    <div style="animation: fadeIn 0.35s ease-out;">
      
      <!-- 1. HeroHUD Nobre no Topo -->
      ${renderHeroHUD()}

      <!-- 2. Boas-vindas e Status do Clã -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
        <div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem; margin-bottom: 2px;">
            Grande Salão do ${clanName}
          </h2>
          <p style="color: var(--text-muted); font-size: 0.92rem;">
            Seja bem-vindo, <strong>${heroName}</strong>! Complete suas missões na vida real para fortalecer seu herói.
          </p>
        </div>

        <div style="text-align: right;">
          <span style="display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: #fde047;">
            🏰 Clã Oficial: ${clanName}
          </span>
        </div>
      </div>

      <!-- 3. Os 4 Pilares da Vida Familiar (Portais Interativos) -->
      <div class="pilares-grid">
        
        <!-- PILAR 1: TAREFAS DO LAR -->
        <div class="pilar-card pilar-tarefas" id="portal-card-tasks">
          <div class="pilar-icon-box">🧹</div>
          <h3 class="cinzel pilar-title">Tarefas do Lar</h3>
          <p class="pilar-desc">
            Organização do quarto, louça, arrumar a cama e missões diárias com comprovação fotográfica.
          </p>
          <div class="pilar-footer">
            <span class="pilar-bonus">💪 +FORÇA (STR) & ⚡ ENERGIA</span>
            <span class="pilar-action">Acessar ➜</span>
          </div>
        </div>

        <!-- PILAR 2: ESTUDOS & FOCO -->
        <div class="pilar-card pilar-estudos" id="portal-card-study">
          <div class="pilar-icon-box">📚</div>
          <h3 class="cinzel pilar-title">Estudos & Saber</h3>
          <p class="pilar-desc">
            Temporizador Pomodoro gamificado, lições escolares, leitura diária e expansão do intelecto.
          </p>
          <div class="pilar-footer">
            <span class="pilar-bonus">🧠 +INTELIGÊNCIA (INT)</span>
            <span class="pilar-action">Acessar ➜</span>
          </div>
        </div>

        <!-- PILAR 3: SAÚDE & CORPO -->
        <div class="pilar-card pilar-saude" id="portal-card-health">
          <div class="pilar-icon-box">🥗</div>
          <h3 class="cinzel pilar-title">Saúde & Vitalidade</h3>
          <p class="pilar-desc">
            Cardápio saudável do dia, pesagem de pratos, registro de copos de água e alarmes de hidratação.
          </p>
          <div class="pilar-footer">
            <span class="pilar-bonus">❤️ +CONSTITUIÇÃO (CON)</span>
            <span class="pilar-action">Acessar ➜</span>
          </div>
        </div>

        <!-- PILAR 4: EMPÓRIO & AVENTURAS RPG -->
        <div class="pilar-card pilar-lazer" id="portal-card-shop">
          <div class="pilar-icon-box">🎡</div>
          <h3 class="cinzel pilar-title">Empório & Lazer</h3>
          <p class="pilar-desc">
            Troque suas Fichas do Lar por vales da vida real (noite da pizza, cinema) e desafie masmorras D20.
          </p>
          <div class="pilar-footer">
            <span class="pilar-bonus">🎟️ FICHAS & 💰 OURO</span>
            <span class="pilar-action">Acessar ➜</span>
          </div>
        </div>

      </div>

      <!-- 4. Resumo de Atributos do Herói (D20 / Ficha Viva) -->
      <div class="noble-card" style="margin-top: 10px;">
        <h3 class="cinzel gold-gradient-text" style="font-size: 1.25rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          <span>⚔️</span> Atributos Fundamentais do Herói (Ficha Viva D20)
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; text-align: center;">
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f87171;">FORÇA (STR)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.str || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Tarefas do Lar</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #60a5fa;">AGILIDADE (AGI)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.agi || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Velocidade & Reflexos</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #4ade80;">CONSTITUIÇÃO (CON)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.con || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Saúde & Água</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #c084fc;">INTELIGÊNCIA (INT)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.int || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Estudos & Lições</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f472b6;">CARISMA (CHA)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.cha || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Harmonia Familiar</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 12px 8px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #fde047;">SORTE (LUK)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.luk || 10}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Dados & Recompensas</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindHubEvents() {
  const portalTasks = document.getElementById('portal-card-tasks');
  if (portalTasks) portalTasks.onclick = () => router.navigate('tasks');

  const portalStudy = document.getElementById('portal-card-study');
  if (portalStudy) portalStudy.onclick = () => router.navigate('study');

  const portalHealth = document.getElementById('portal-card-health');
  if (portalHealth) portalHealth.onclick = () => router.navigate('health');

  const portalShop = document.getElementById('portal-card-shop');
  if (portalShop) portalShop.onclick = () => router.navigate('shop');
}

export default { renderHubView, bindHubEvents };
