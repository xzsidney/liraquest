/**
 * LiraQuest - Tela de Login Universal (Usuário/E-mail + Senha)
 * frontend/src/views/LoginView.js
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export async function renderLoginView() {
  return `
    <div style="max-width: 480px; margin: 30px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.45);">
        
        <!-- Cabeçalho Nobre -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 3.2rem; margin-bottom: 8px;">🏰</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 2.1rem; margin-bottom: 6px;">Portões do Reino</h2>
          <p style="font-size: 0.92rem; color: var(--text-muted);">
            Acesse o Grande Salão com seu e-mail ou apelido heroico
          </p>
        </div>

        <!-- Formulário de Autenticação Universal -->
        <form id="universal-login-form" style="display: flex; flex-direction: column; gap: 18px;">
          
          <!-- 1. Identificador: E-mail ou Apelido -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              👤 E-mail ou Apelido do Herói
            </label>
            <input 
              type="text" 
              id="login-input-identifier" 
              required 
              placeholder="Ex: sidney@liraquest.com ou Sir Paulinho" 
              autocomplete="username"
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <!-- 2. Senha -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              🔒 Senha
            </label>
            <input 
              type="password" 
              id="login-input-password" 
              required 
              placeholder="Digite sua senha" 
              autocomplete="current-password"
              style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
            />
          </div>

          <!-- 3. Botão de Submissão Destacado -->
          <button type="submit" id="btn-submit-login" class="btn-noble btn-noble-gold" style="width: 100%; padding: 14px; font-size: 1.1rem; font-weight: 800; margin-top: 8px;">
            ⚔️ Entrar no Reino
          </button>
        </form>

        <!-- Mensagens de Erro / Status -->
        <div id="login-feedback-msg" style="margin-top: 16px; text-align: center; font-size: 0.9rem; display: none;"></div>

        <!-- Links Auxiliares de Navegação -->
        <div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <a href="#/register" id="link-go-reg" style="color: #fde047; text-decoration: none; font-weight: 700;">
            ✨ Despertar Novo Herói (Cadastro)
          </a>
          <a href="#/home" id="link-go-home" style="color: var(--text-muted); text-decoration: none;">
            ⬅️ Voltar ao Início
          </a>
        </div>

      </div>
    </div>
  `;
}

export function bindLoginEvents() {
  const form = document.getElementById('universal-login-form');
  const feedbackMsg = document.getElementById('login-feedback-msg');
  const linkGoReg = document.getElementById('link-go-reg');
  const linkGoHome = document.getElementById('link-go-home');

  if (linkGoReg) linkGoReg.onclick = (e) => { e.preventDefault(); router.navigate('register'); };
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
      const identifier = document.getElementById('login-input-identifier')?.value?.trim();
      const password = document.getElementById('login-input-password')?.value;
      const btn = document.getElementById('btn-submit-login');

      if (!identifier || !password) {
        showMessage('Preencha seu e-mail ou apelido heroico e sua senha.');
        return;
      }

      try {
        if (btn) btn.textContent = '⏳ Abrindo Portões...';
        showMessage('Verificando credenciais no Reino...', false);

        const res = await auth.login(identifier, password);
        showMessage(res.message || '🎉 Bem-vindo ao Reino! Entrando...', false);

        setTimeout(() => {
          router.navigate('hub');
        }, 300);
      } catch (err) {
        showMessage(err.message || 'Credenciais inválidas. Verifique os dados e tente novamente.');
        if (btn) btn.textContent = '⚔️ Entrar no Reino';
      }
    };
  }
}

export default { renderLoginView, bindLoginEvents };
