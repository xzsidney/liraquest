/**
 * LiraQuest - Tela de Cadastro de Novo Clã / Guardião
 * frontend/src/views/RegisterView.js
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';

export function renderRegisterView() {
  return `
    <div style="max-width: 480px; margin: 30px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.45);">
        
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 3rem; margin-bottom: 8px;">✨</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 2rem; margin-bottom: 4px;">Novo Clã Familiar</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Cadastre-se como Mestre Guardião e funde seu reino</p>
        </div>

        <form id="register-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Nome Completo do Guardião (Pai ou Mãe)
            </label>
            <input 
              type="text" 
              id="reg-input-name" 
              required 
              placeholder="Ex: Sidney Lira" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Nome do Clã Familiar
            </label>
            <input 
              type="text" 
              id="reg-input-clan" 
              placeholder="Ex: Clã Silva (ou deixe em branco)" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Seu Melhor E-mail
            </label>
            <input 
              type="email" 
              id="reg-input-email" 
              required 
              placeholder="seu@email.com" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              Senha de Acesso (Mínimo 6 caracteres)
            </label>
            <input 
              type="password" 
              id="reg-input-password" 
              required 
              minlength="6" 
              placeholder="••••••••" 
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <button type="submit" id="btn-submit-reg" class="btn-noble btn-noble-gold" style="width: 100%; padding: 14px; font-size: 1.05rem; margin-top: 6px;">
            ✨ Fundar Meu Clã & Despertar Herói
          </button>
        </form>

        <!-- Feedback de Erro ou Sucesso -->
        <div id="reg-feedback-msg" style="margin-top: 14px; text-align: center; font-size: 0.85rem; display: none;"></div>

        <!-- Links Auxiliares -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <a href="#/login" id="link-go-login" style="color: #60a5fa; text-decoration: none; font-weight: 700;">
            🔑 Já possui conta? Fazer Login
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
  const form = document.getElementById('register-form');
  const feedbackMsg = document.getElementById('reg-feedback-msg');
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

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-input-name')?.value?.trim();
      const clanName = document.getElementById('reg-input-clan')?.value?.trim();
      const email = document.getElementById('reg-input-email')?.value?.trim();
      const password = document.getElementById('reg-input-password')?.value;
      const btn = document.getElementById('btn-submit-reg');

      if (!name || !email || !password) {
        showMessage('Preencha todos os campos obrigatórios.');
        return;
      }

      try {
        if (btn) btn.textContent = '⏳ Fundando Clã...';
        showMessage('Criando o seu reino...', false);

        const data = await api.post('/api/auth/register', {
          name,
          email,
          password,
          family_name: clanName || undefined,
          role: 'PARENT',
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

        showMessage('🎉 Clã fundado com honra! Entrando no Salão...', false);
        setTimeout(() => {
          router.navigate('hub');
        }, 350);
      } catch (err) {
        showMessage(err.message || 'Erro ao criar conta. Tente novamente.');
        if (btn) btn.textContent = '✨ Fundar Meu Clã & Despertar Herói';
      }
    };
  }
}

export default { renderRegisterView, bindRegisterEvents };
