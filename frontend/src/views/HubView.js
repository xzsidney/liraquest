/**
 * LiraQuest - Salão Único do Herói (HubView.js)
 * HeroHUD no Topo + Os 4 Portais da Vida Familiar
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

export async function renderHubView() {
  const member = auth.getMember();
  const heroName = member?.hero_nickname || member?.name || 'Aventureiro';
  const hasClan = Boolean(member?.family_id || member?.family);
  const clanName = member?.family?.name || (hasClan ? 'Clã Familiar' : 'Sem Clã Vinculado');

  return `
    <div style="animation: fadeIn 0.35s ease-out;">
      
      <!-- 1. HeroHUD Nobre no Topo -->
      ${renderHeroHUD()}

      <!-- 1.1 Banner de Ingressar no Clã (Aparece se o herói ainda não escolheu um Clã) -->
      ${!hasClan ? `
        <div class="noble-card" id="join-clan-card" style="border-color: rgba(212, 175, 55, 0.7); background: linear-gradient(135deg, rgba(128, 0, 32, 0.4), rgba(15, 23, 42, 0.95)); margin-bottom: 24px; padding: 20px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                🏰 ESCOLHA SEU CLÃ FAMILIAR
              </div>
              <h3 class="cinzel gold-gradient-text" style="font-size: 1.35rem; margin-bottom: 4px;">
                Vincule-se ao Clã dos seus Pais
              </h3>
              <p style="color: #cbd5e1; font-size: 0.88rem; max-width: 620px; line-height: 1.5;">
                Digite o <strong>Código do Clã</strong> (ex: <code>LIRA-2026</code>) fornecido pelos seus pais para sincronizar suas missões do lar, recompensas e rankings familiares!
              </p>
            </div>

            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <input 
                type="text" 
                id="input-hub-clan-code" 
                placeholder="EX: LIRA-2026" 
                style="background: #0f172a; color: #fde047; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(212, 175, 55, 0.4); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none; width: 170px;" 
              />
              <button id="btn-hub-join-clan" class="btn-noble btn-noble-gold btn-noble-sm" style="padding: 12px 20px; font-size: 0.95rem;">
                🛡️ Ingressar no Clã
              </button>
            </div>
          </div>
          <div id="hub-clan-feedback-msg" style="display: none; margin-top: 12px; font-size: 0.85rem; font-weight: 700;"></div>
        </div>
      ` : ''}

      <!-- 2. Boas-vindas e Status do Clã -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
        <div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem; margin-bottom: 2px;">
            ${hasClan ? `Grande Salão do ${clanName}` : `Salão do Aventureiro Solitário`}
          </h2>
          <p style="color: var(--text-muted); font-size: 0.92rem;">
            Seja bem-vindo, <strong>${heroName}</strong>! Complete suas missões na vida real para fortalecer seu herói.
          </p>
        </div>

        <div style="text-align: right;">
          <span style="display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: #fde047;">
            ${hasClan ? `🏰 Clã Oficial: ${clanName}` : `🛡️ Sem Clã Vinculado`}
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
            <span class="pilar-bonus">💪 +FORÇA (STR) & 🎟️ FICHAS</span>
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; text-align: center;">
          <!-- FORÇA (STR) -->
          <div class="attr-card-d20" title="${member?.xp_str || 0}% para FORÇA ${(member?.str || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f87171;">FORÇA (STR)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.str || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-str" style="width: ${Math.min(100, member?.xp_str || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_str || 0}% para FORÇA ${(member?.str || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Tarefas do Lar</div>
          </div>

          <!-- AGILIDADE (AGI) -->
          <div class="attr-card-d20" title="${member?.xp_agi || 0}% para AGILIDADE ${(member?.agi || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #60a5fa;">AGILIDADE (AGI)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.agi || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-agi" style="width: ${Math.min(100, member?.xp_agi || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_agi || 0}% para AGI ${(member?.agi || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Velocidade & Reflexos</div>
          </div>

          <!-- CONSTITUIÇÃO (CON) -->
          <div class="attr-card-d20" title="${member?.xp_con || 0}% para CON ${(member?.con || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #4ade80;">CONSTITUIÇÃO (CON)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.con || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-con" style="width: ${Math.min(100, member?.xp_con || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_con || 0}% para CON ${(member?.con || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Saúde & Água</div>
          </div>

          <!-- INTELIGÊNCIA (INT) -->
          <div class="attr-card-d20" title="${member?.xp_int || 0}% para INT ${(member?.int || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #c084fc;">INTELIGÊNCIA (INT)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.int || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-int" style="width: ${Math.min(100, member?.xp_int || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_int || 0}% para INT ${(member?.int || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Estudos & Lições</div>
          </div>

          <!-- CARISMA (CHA) -->
          <div class="attr-card-d20" title="${member?.xp_cha || 0}% para CHA ${(member?.cha || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f472b6;">CARISMA (CHA)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.cha || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-cha" style="width: ${Math.min(100, member?.xp_cha || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_cha || 0}% para CHA ${(member?.cha || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Harmonia Familiar</div>
          </div>

          <!-- SORTE (LUK) -->
          <div class="attr-card-d20" title="${member?.xp_luk || 0}% para LUK ${(member?.luk || 10) + 1}">
            <div style="font-size: 0.75rem; font-weight: 800; color: #fde047;">SORTE (LUK)</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #fff;">${member?.luk || 10}</div>
            <div class="attr-progress-bar">
              <div class="attr-progress-fill fill-luk" style="width: ${Math.min(100, member?.xp_luk || 0)}%;"></div>
            </div>
            <div class="attr-progress-label">${member?.xp_luk || 0}% para LUK ${(member?.luk || 10) + 1}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 2px;">Dados & Recompensas</div>
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

  // Evento de Ingressar no Clã após o Login
  const btnJoinClan = document.getElementById('btn-hub-join-clan');
  const inputClanCode = document.getElementById('input-hub-clan-code');
  const msgEl = document.getElementById('hub-clan-feedback-msg');

  if (btnJoinClan && inputClanCode) {
    btnJoinClan.onclick = async () => {
      const code = inputClanCode.value?.trim();
      if (!code) {
        if (msgEl) {
          msgEl.textContent = 'Digite o código do clã dos seus pais!';
          msgEl.style.display = 'block';
          msgEl.style.color = '#f87171';
        }
        return;
      }

      try {
        btnJoinClan.textContent = '⏳ Ingressando...';
        const res = await api.post('/api/family/join', { invite_code: code });
        
        if (res.token) {
          auth.state.token = res.token;
          localStorage.setItem('liraquest_token', res.token);
          localStorage.setItem('token', res.token);
        }

        const member = res.member || res.user;
        if (member) {
          auth.state.user = member;
          localStorage.setItem('liraquest_user', JSON.stringify(member));
          auth.notify();
        }

        if (msgEl) {
          msgEl.textContent = res.message || '🎉 Vinculado com sucesso!';
          msgEl.style.display = 'block';
          msgEl.style.color = '#4ade80';
        }

        setTimeout(() => {
          router.navigate('hub');
        }, 600);
      } catch (err) {
        btnJoinClan.textContent = '🛡️ Ingressar no Clã';
        if (msgEl) {
          msgEl.textContent = err.message || 'Código do clã inválido.';
          msgEl.style.display = 'block';
          msgEl.style.color = '#f87171';
        }
      }
    };
  }
}

export default { renderHubView, bindHubEvents };
