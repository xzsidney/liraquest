/**
 * LiraQuest - Módulo de Acesso Público & Autenticação
 * Tela 1: Forja do Reino (Em Construção com Acesso Restrito dos Guardiões)
 * Tela 2: Login dos Guardiões
 * Tela 3: Cadastro de Membros
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { showToast } from '../../components/Toast.js';

export function renderHomeView() {
  return `
    <div style="max-width: 820px; margin: 40px auto; text-align: center; animation: fadeIn 0.4s ease-out;">
      
      <!-- Emblema da Forja com Brilho Nobre -->
      <div style="width: 100px; height: 100px; margin: 0 auto 24px; border-radius: 30px; background: linear-gradient(135deg, #800020, #1e3a8a); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 3rem; box-shadow: 0 0 35px rgba(212, 175, 55, 0.4);">
        🏰🔨✨
      </div>

      <!-- Badge Nobre -->
      <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.45); padding: 5px 16px; border-radius: 30px; font-size: 0.8rem; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">
        👑 ACESSO ANTECIPADO • EM FORJAÇÃO
      </div>

      <!-- Título Nobre -->
      <h1 class="cinzel gold-gradient-text" style="font-size: 2.5rem; line-height: 1.2; margin-bottom: 16px;">
        O Reino de LiraQuest está sendo Forjado...
      </h1>

      <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; max-width: 660px; margin: 0 auto 32px;">
        Nossos mestres artesãos e guardiões estão preparando as missões, os 6 portais nobres e as masmorras da nossa plataforma familiar. Em breve, as portas do castelo estarão abertas para todos os lares!
      </p>

      <!-- Cartão da Forja com Barra de Progresso -->
      <div class="noble-card" style="text-align: left; margin-bottom: 36px; border-color: rgba(212, 175, 55, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 0.92rem; font-weight: 700; color: #ffffff;">⚒️ Estado da Forja Real</span>
          <span style="font-size: 0.85rem; font-weight: 800; color: #fde047;">92% Concluído • Salões Ativos</span>
        </div>

        <div style="height: 10px; background: rgba(0, 0, 0, 0.6); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;">
          <div style="width: 92%; height: 100%; background: linear-gradient(90deg, #800020, #d4af37, #f59e0b);"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
          <div style="background: rgba(255, 255, 255, 0.04); padding: 10px; border-radius: 10px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <span style="font-size: 0.8rem; color: #4ade80; font-weight: 700;">✓ Grande Salão</span>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">6 Módulos Prontos</span>
          </div>
          <div style="background: rgba(255, 255, 255, 0.04); padding: 10px; border-radius: 10px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <span style="font-size: 0.8rem; color: #4ade80; font-weight: 700;">✓ Salão de Jogos</span>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">Truco & Zombi Autenticados</span>
          </div>
          <div style="background: rgba(255, 255, 255, 0.04); padding: 10px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.3);">
            <span style="font-size: 0.8rem; color: #fde047; font-weight: 700;">⚒️ Batalha MUGEN</span>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">Fase de Polimento</span>
          </div>
        </div>
      </div>

      <!-- Botão Único e Discreto de Acesso dos Guardiões -->
      <div>
        <button id="btn-forge-login" class="btn-noble btn-noble-gold" style="padding: 14px 32px; font-size: 1.05rem;">
          🔑 Acesso dos Guardiões (Login)
        </button>
        <p style="font-size: 0.82rem; color: var(--text-dim); margin-top: 14px;">
          Área exclusiva para os mestres e heróis fundadores com credenciais de acesso.
        </p>
      </div>

    </div>
  `;
}

export function renderLoginView() {
  return `
    <div style="max-width: 440px; margin: 40px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.8rem; margin-bottom: 8px;">🔑</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem; margin-bottom: 4px;">Acesso dos Guardiões</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Entre com suas credenciais no LiraQuest.</p>
        </div>

        <form id="login-form-element" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">E-mail Cadastrado</label>
            <input type="email" id="login-input-email" required placeholder="seu@email.com" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">Senha Secreta</label>
            <input type="password" id="login-input-password" required placeholder="••••••••" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <button type="submit" id="btn-submit-login" class="btn-noble btn-noble-primary" style="width: 100%; padding: 12px; font-size: 1rem; margin-top: 8px;">
            🏰 Entrar no Grande Salão
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 0.88rem; color: var(--text-muted);">
          <span>Novo membro no reino?</span>
          <a href="/register" id="link-go-register" style="color: #fde047; font-weight: 700; text-decoration: none; margin-left: 6px;">Criar Conta</a>
        </div>
      </div>
    </div>
  `;
}

export function renderRegisterView() {
  return `
    <div style="max-width: 440px; margin: 40px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.8rem; margin-bottom: 8px;">✨</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem; margin-bottom: 4px;">Novo Membro do Clã</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Junte-se à jornada familiar do LiraQuest.</p>
        </div>

        <form id="register-form-element" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">Nome Completo</label>
            <input type="text" id="reg-input-name" required placeholder="Ex: Davi Lira" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">E-mail</label>
            <input type="email" id="reg-input-email" required placeholder="seu@email.com" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">Código do Clã ou Nome da Família (Opcional)</label>
            <input type="text" id="reg-input-clan" placeholder="Ex: LIRA-2026 ou Clã Silva" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">Senha (mínimo 6 caracteres)</label>
            <input type="password" id="reg-input-password" required minlength="6" placeholder="••••••••" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;">
          </div>

          <button type="submit" id="btn-submit-reg" class="btn-noble btn-noble-gold" style="width: 100%; padding: 12px; font-size: 1rem; margin-top: 8px;">
            ✨ Despertar Herói
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 0.88rem; color: var(--text-muted);">
          <span>Já possui conta?</span>
          <a href="/login" id="link-go-login" style="color: #60a5fa; font-weight: 700; text-decoration: none; margin-left: 6px;">Acessar</a>
        </div>
      </div>
    </div>
  `;
}

export function bindAuthEvents() {
  const btnForgeLogin = document.getElementById('btn-forge-login');
  if (btnForgeLogin) {
    btnForgeLogin.onclick = () => router.navigate('login');
  }

  const linkGoReg = document.getElementById('link-go-register');
  if (linkGoReg) {
    linkGoReg.onclick = (e) => {
      e.preventDefault();
      router.navigate('register');
    };
  }

  const linkGoLogin = document.getElementById('link-go-login');
  if (linkGoLogin) {
    linkGoLogin.onclick = (e) => {
      e.preventDefault();
      router.navigate('login');
    };
  }

  const loginForm = document.getElementById('login-form-element');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-input-email')?.value?.trim();
      const password = document.getElementById('login-input-password')?.value;
      const btn = document.getElementById('btn-submit-login');

      if (!email || !password) {
        showToast('Preencha e-mail e senha.', 'warning');
        return;
      }

      try {
        if (btn) btn.textContent = '⏳ Autenticando...';
        await auth.login(email, password);
        showToast('Bem-vindo ao Grande Salão do Reino! 🏰', 'success');
        router.navigate('salao');
      } catch (err) {
        showToast(err.message || 'Falha ao autenticar.', 'error');
        if (btn) btn.textContent = '🏰 Entrar no Grande Salão';
      }
    };
  }

  const regForm = document.getElementById('register-form-element');
  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-input-name')?.value?.trim();
      const email = document.getElementById('reg-input-email')?.value?.trim();
      const clanVal = document.getElementById('reg-input-clan')?.value?.trim();
      const password = document.getElementById('reg-input-password')?.value;
      const btn = document.getElementById('btn-submit-reg');

      if (!name || !email || !password) {
        showToast('Preencha Nome Completo, E-mail e Senha.', 'warning');
        return;
      }

      let inviteCode = null;
      let familyName = null;
      if (clanVal) {
        if (clanVal.includes('-') || clanVal.length <= 10) {
          inviteCode = clanVal.toUpperCase();
        } else {
          familyName = clanVal;
        }
      }

      try {
        if (btn) btn.textContent = '⏳ Despertando...';
        await auth.register(name, email, password, 'PARENT', familyName, inviteCode);
        showToast('Conta criada com sucesso! Bem-vindo ao LiraQuest! 🎉', 'success');
        router.navigate('salao');
      } catch (err) {
        showToast(err.message || 'Erro ao criar conta.', 'error');
        if (btn) btn.textContent = '✨ Despertar Herói';
      }
    };
  }
}
