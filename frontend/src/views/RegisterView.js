/**
 * LiraQuest - Tela de Cadastro de Herói (Sempre do Tipo FILHO)
 * frontend/src/views/RegisterView.js
 * Regra: Apenas Pais criam Clãs. O cadastro é sempre de Heróis (Filhos)!
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';

let selectedClass = 'rastreador_veloz';

export function renderRegisterView() {
  return `
    <div style="max-width: 520px; margin: 30px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.45);">
        
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 22px;">
          <div style="font-size: 3rem; margin-bottom: 8px;">⚔️✨</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.9rem; margin-bottom: 4px;">Despertar Novo Herói</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Cadastre seu herói (Filho) para ingressar na jornada do seu clã familiar.
          </p>
        </div>

        <form id="hero-register-form" style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- 1. Código do Clã dos Pais (OPCIONAL) -->
          <div>
            <label style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              <span>Código do Clã Familiar (dos Pais)</span>
              <span style="color: #94a3b8; font-weight: 600;">Opcional</span>
            </label>
            <input 
              type="text" 
              id="reg-input-clan-code" 
              placeholder="Ex: LIRA-2026 (ou deixe em branco)" 
              style="width: 100%; background: #0f172a; color: #fde047; font-weight: 800; letter-spacing: 1.5px; border: 1px solid rgba(212, 175, 55, 0.25); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none; text-transform: uppercase;"
            />
            <small style="color: var(--text-dim); font-size: 0.75rem; margin-top: 4px; display: block;">
              Se você ainda não tem o código dos seus pais, pode deixar em branco e escolher o seu clã depois do login!
            </small>
          </div>

          <!-- 2. Nome Real do Filho -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Nome Real da Criança / Jovem
            </label>
            <input 
              type="text" 
              id="reg-input-name" 
              required 
              placeholder="Ex: Paulo Lira ou Jennifer Lira" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <!-- 3. Nome de Guerra / Apelido Heroico -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Nome de Guerra / Apelido Heroico no RPG
            </label>
            <input 
              type="text" 
              id="reg-input-hero-nick" 
              required 
              placeholder="Ex: Sir Paulinho, Valquíria Jennifer" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <!-- 4. Senha de Acesso -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              🔒 Senha de Acesso
            </label>
            <input 
              type="password" 
              id="reg-input-password" 
              required 
              placeholder="Crie sua senha secreta (ex: 1234 ou sua senha)" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <!-- 5. Escolha da Classe Inicial -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
              Escolha seu Arquétipo Heroico Inicial:
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              
              <div class="class-choice-card ${selectedClass === 'rastreador_veloz' ? 'selected' : ''}" data-class="rastreador_veloz" style="cursor: pointer; background: rgba(255,255,255,0.04); border: 2px solid ${selectedClass === 'rastreador_veloz' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 10px; text-align: center;">
                <div style="font-size: 1.8rem;">🏹</div>
                <strong style="color: #fff; font-size: 0.88rem; display: block;">Rastreador Veloz</strong>
                <span style="font-size: 0.72rem; color: #60a5fa;">Agilidade & Reflexos</span>
              </div>

              <div class="class-choice-card ${selectedClass === 'artifice_criativo' ? 'selected' : ''}" data-class="artifice_criativo" style="cursor: pointer; background: rgba(255,255,255,0.04); border: 2px solid ${selectedClass === 'artifice_criativo' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 10px; text-align: center;">
                <div style="font-size: 1.8rem;">🎨</div>
                <strong style="color: #fff; font-size: 0.88rem; display: block;">Artífice Criativa</strong>
                <span style="font-size: 0.72rem; color: #c084fc;">Inteligência & Criação</span>
              </div>

              <div class="class-choice-card ${selectedClass === 'guardiao_do_lar' ? 'selected' : ''}" data-class="guardiao_do_lar" style="cursor: pointer; background: rgba(255,255,255,0.04); border: 2px solid ${selectedClass === 'guardiao_do_lar' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 10px; text-align: center;">
                <div style="font-size: 1.8rem;">🛡️</div>
                <strong style="color: #fff; font-size: 0.88rem; display: block;">Guardião do Lar</strong>
                <span style="font-size: 0.72rem; color: #4ade80;">Força & Proteção</span>
              </div>

              <div class="class-choice-card ${selectedClass === 'guerreiro_disciplina' ? 'selected' : ''}" data-class="guerreiro_disciplina" style="cursor: pointer; background: rgba(255,255,255,0.04); border: 2px solid ${selectedClass === 'guerreiro_disciplina' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 10px; text-align: center;">
                <div style="font-size: 1.8rem;">⚔️</div>
                <strong style="color: #fff; font-size: 0.88rem; display: block;">Guerreiro</strong>
                <span style="font-size: 0.72rem; color: #f87171;">Força & Honra</span>
              </div>

            </div>
          </div>

          <!-- Aviso de Regra Nobre -->
          <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 10px 14px; margin-top: 4px;">
            <p style="font-size: 0.75rem; color: #fde047; line-height: 1.4; margin: 0;">
              👑 <strong>Regra do Clã:</strong> A criação de Clãs é exclusiva dos Pais (Guardiões). Os filhos ingressam utilizando o Código do Clã com perfil de Herói Aventureiro.
            </p>
          </div>

          <!-- Botão de Cadastro -->
          <button type="submit" id="btn-submit-hero-reg" class="btn-noble btn-noble-gold" style="width: 100%; padding: 14px; font-size: 1.05rem; margin-top: 8px;">
            ⚔️ Despertar Herói & Entrar no Clã
          </button>
        </form>

        <!-- Feedback de Erro ou Sucesso -->
        <div id="hero-reg-feedback-msg" style="margin-top: 14px; text-align: center; font-size: 0.85rem; display: none;"></div>

        <!-- Links Auxiliares -->
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <a href="#/login" id="link-go-login" style="color: #60a5fa; text-decoration: none; font-weight: 700;">
            🔑 Já possui cadastro? Fazer Login
          </a>
          <a href="#/home" id="link-go-home" style="color: var(--text-muted); text-decoration: none;">
            ⬅️ Voltar ao Início
          </a>
        </div>

      </div>
    </div>
  `;
}

export function bindRegisterEvents() {
  const form = document.getElementById('hero-register-form');
  const feedbackMsg = document.getElementById('hero-reg-feedback-msg');
  const linkGoLogin = document.getElementById('link-go-login');
  const linkGoHome = document.getElementById('link-go-home');

  if (linkGoLogin) linkGoLogin.onclick = (e) => { e.preventDefault(); router.navigate('login'); };
  if (linkGoHome) linkGoHome.onclick = (e) => { e.preventDefault(); router.navigate('home'); };

  function showMessage(text, isError = true) {
    if (feedbackMsg) {
      feedbackMsg.textContent = text;
      feedbackMsg.style.display = 'block';
      feedbackMsg.style.color = isError ? '#f87171' : '#4ade80';
    }
  }

  // Seleção de classe
  const classCards = document.querySelectorAll('.class-choice-card');
  classCards.forEach((card) => {
    card.onclick = () => {
      classCards.forEach((c) => {
        c.style.borderColor = 'rgba(255,255,255,0.1)';
        c.classList.remove('selected');
      });
      card.style.borderColor = 'var(--gold)';
      card.classList.add('selected');
      selectedClass = card.getAttribute('data-class');
    };
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const clanCode = document.getElementById('reg-input-clan-code')?.value?.trim();
      const name = document.getElementById('reg-input-name')?.value?.trim();
      const heroNick = document.getElementById('reg-input-hero-nick')?.value?.trim();
      const password = document.getElementById('reg-input-password')?.value?.trim();
      const btn = document.getElementById('btn-submit-hero-reg');

      if (!name || !heroNick || !password) {
        showMessage('Por favor, preencha Nome Real, Apelido Heroico e Senha!');
        return;
      }

      try {
        if (btn) btn.textContent = '⏳ Despertando Herói...';
        showMessage('Ingressando no Clã...', false);

        const data = await api.post('/api/auth/register', {
          invite_code: clanCode ? clanCode.toUpperCase() : undefined,
          name,
          hero_nickname: heroNick,
          password,
          class_code: selectedClass,
        });

        const memberData = data.user || data.member;
        if (data.token && memberData) {
          auth.state.token = data.token;
          auth.state.user = memberData;
          localStorage.setItem('liraquest_token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('liraquest_user', JSON.stringify(memberData));
          auth.notify();
        }

        showMessage('🎉 Herói despertado com sucesso! Entrando no Salão...', false);
        setTimeout(() => {
          router.navigate('hub');
        }, 350);
      } catch (err) {
        showMessage(err.message || 'Erro ao cadastrar herói. Verifique o código do clã.');
        if (btn) btn.textContent = '⚔️ Despertar Herói & Entrar no Clã';
      }
    };
  }
}

export default { renderRegisterView, bindRegisterEvents };
