/**
 * LiraQuest - Tela de Login Oficial (Pais vs Filhos)
 * frontend/src/views/LoginView.js
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

let activeTab = 'parents'; // 'parents' ou 'children'
let selectedHero = null;
let currentPin = '';

export async function renderLoginView() {
  const children = await auth.getChildren();

  return `
    <div style="max-width: 480px; margin: 30px auto; animation: fadeIn 0.3s ease-out;">
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.45);">
        
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 3rem; margin-bottom: 8px;">🏰</div>
          <h2 class="cinzel gold-gradient-text" style="font-size: 2rem; margin-bottom: 4px;">Portões do Reino</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Entre no Grande Salão com suas credenciais</p>
        </div>

        <!-- Abas de Alternância -->
        <div class="login-tabs-nav">
          <button id="tab-btn-parents" class="login-tab-btn ${activeTab === 'parents' ? 'active' : ''}">
            👑 Pais (Guardiões)
          </button>
          <button id="tab-btn-children" class="login-tab-btn ${activeTab === 'children' ? 'active' : ''}">
            ⚔️ Filhos (Heróis)
          </button>
        </div>

        <!-- ABA 1: PAIS / GUARDIÕES (E-MAIL E SENHA) -->
        <div id="tab-content-parents" style="display: ${activeTab === 'parents' ? 'block' : 'none'};">
          <form id="parents-login-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
                E-mail Cadastrado
              </label>
              <input 
                type="email" 
                id="parent-input-email" 
                required 
                placeholder="seu@email.com" 
                value=""
                autocomplete="email"
                style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
              />
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
                Senha Secreta
              </label>
              <input 
                type="password" 
                id="parent-input-password" 
                required 
                placeholder="Digite sua senha" 
                value=""
                autocomplete="current-password"
                style="width: 100%; background: #0f172a; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 14px; border-radius: 12px; font-size: 0.95rem; outline: none;"
              />
            </div>

            <button type="submit" id="btn-submit-parent" class="btn-noble btn-noble-primary" style="width: 100%; padding: 14px; font-size: 1.05rem; margin-top: 6px;">
              👑 Entrar como Guardião
            </button>
          </form>
        </div>

        <!-- ABA 2: FILHOS / HERÓIS (CARDS + PIN) -->
        <div id="tab-content-children" style="display: ${activeTab === 'children' ? 'block' : 'none'};">
          <p style="text-align: center; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 14px;">
            Toque no seu herói e digite o seu PIN de 4 números:
          </p>

          <!-- Cards dos Heróis -->
          <div class="hero-select-grid">
            ${children.map((child) => {
              const isSelected = selectedHero === child.hero_nickname;
              const avatar = child.skin_code?.includes('artifice') ? '🎨' : '🏹';
              return `
                <div class="hero-child-card ${isSelected ? 'selected' : ''}" data-nickname="${child.hero_nickname}">
                  <div class="hero-child-avatar">${avatar}</div>
                  <div class="hero-child-name">${child.hero_nickname}</div>
                  <div class="hero-child-class">${child.name} • Nvl ${child.level || 1}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Indicador Visual do PIN -->
          <div style="text-align: center; margin: 12px 0 6px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: #fde047; text-transform: uppercase;">
              PIN de 4 Números:
            </span>
          </div>
          <div class="pin-display-box">
            <div class="pin-dot ${currentPin.length >= 1 ? 'filled' : ''}"></div>
            <div class="pin-dot ${currentPin.length >= 2 ? 'filled' : ''}"></div>
            <div class="pin-dot ${currentPin.length >= 3 ? 'filled' : ''}"></div>
            <div class="pin-dot ${currentPin.length >= 4 ? 'filled' : ''}"></div>
          </div>

          <!-- Teclado Numérico de PIN -->
          <div class="pin-keypad">
            <button class="pin-key" data-val="1">1</button>
            <button class="pin-key" data-val="2">2</button>
            <button class="pin-key" data-val="3">3</button>
            <button class="pin-key" data-val="4">4</button>
            <button class="pin-key" data-val="5">5</button>
            <button class="pin-key" data-val="6">6</button>
            <button class="pin-key" data-val="7">7</button>
            <button class="pin-key" data-val="8">8</button>
            <button class="pin-key" data-val="9">9</button>
            <button class="pin-key" data-action="clear" style="font-size: 0.9rem; color: #f87171;">Limpar</button>
            <button class="pin-key" data-val="0">0</button>
            <button class="pin-key" data-action="backspace" style="font-size: 1.1rem; color: #fde047;">⌫</button>
          </div>

          <!-- Botão de Entrar -->
          <button id="btn-submit-child" class="btn-noble btn-noble-gold" style="width: 100%; padding: 14px; font-size: 1.05rem;">
            ⚔️ Iniciar Aventura ${selectedHero ? `(${selectedHero})` : ''}
          </button>
        </div>

        <!-- Mensagens de Erro / Status -->
        <div id="login-feedback-msg" style="margin-top: 14px; text-align: center; font-size: 0.85rem; display: none;"></div>

        <!-- Links Auxiliares de Navegação -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <a href="#/register" id="link-go-reg" style="color: #fde047; text-decoration: none; font-weight: 700;">
            ✨ Cadastrar Novo Clã
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
  const tabBtnChildren = document.getElementById('tab-btn-children');
  const tabBtnParents = document.getElementById('tab-btn-parents');
  const tabContentChildren = document.getElementById('tab-content-children');
  const tabContentParents = document.getElementById('tab-content-parents');
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

  // Alternar Abas
  if (tabBtnChildren && tabBtnParents) {
    tabBtnChildren.onclick = () => {
      activeTab = 'children';
      tabBtnChildren.classList.add('active');
      tabBtnParents.classList.remove('active');
      tabContentChildren.style.display = 'block';
      tabContentParents.style.display = 'none';
      if (feedbackMsg) feedbackMsg.style.display = 'none';
    };

    tabBtnParents.onclick = () => {
      activeTab = 'parents';
      tabBtnParents.classList.add('active');
      tabBtnChildren.classList.remove('active');
      tabContentChildren.style.display = 'none';
      tabContentParents.style.display = 'block';
      if (feedbackMsg) feedbackMsg.style.display = 'none';
    };
  }

  // Seleção de Herói
  const heroCards = document.querySelectorAll('.hero-child-card');
  heroCards.forEach((card) => {
    card.onclick = () => {
      heroCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedHero = card.getAttribute('data-nickname');
      const submitChildBtn = document.getElementById('btn-submit-child');
      if (submitChildBtn) {
        submitChildBtn.textContent = `⚔️ Iniciar Aventura (${selectedHero})`;
      }
    };
  });

  // Atualizar pontos do PIN
  function updatePinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
      if (index < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  // Teclado Numérico
  const pinKeys = document.querySelectorAll('.pin-key');
  pinKeys.forEach((key) => {
    key.onclick = () => {
      const val = key.getAttribute('data-val');
      const action = key.getAttribute('data-action');

      if (val && currentPin.length < 4) {
        currentPin += val;
        updatePinDisplay();
        if (currentPin.length === 4) {
          triggerChildLogin();
        }
      } else if (action === 'clear') {
        currentPin = '';
        updatePinDisplay();
      } else if (action === 'backspace') {
        currentPin = currentPin.slice(0, -1);
        updatePinDisplay();
      }
    };
  });

  // Ação de Login do Filho
  async function triggerChildLogin() {
    if (!selectedHero) {
      showMessage('Selecione o seu herói acima!');
      return;
    }
    if (currentPin.length !== 4) {
      showMessage('Digite os 4 números do seu PIN!');
      return;
    }

    const btn = document.getElementById('btn-submit-child');
    try {
      if (btn) btn.textContent = '⏳ Verificando Portões...';
      showMessage('Conectando ao Salão...', false);
      await auth.loginWithPin(selectedHero, currentPin);
      showMessage('🎉 Acesso concedido! Entrando...', false);
      setTimeout(() => {
        router.navigate('hub');
      }, 300);
    } catch (err) {
      currentPin = '';
      updatePinDisplay();
      showMessage(err.message || 'PIN incorreto. Tente novamente!');
      if (btn) btn.textContent = `⚔️ Iniciar Aventura (${selectedHero})`;
    }
  }

  const btnSubmitChild = document.getElementById('btn-submit-child');
  if (btnSubmitChild) {
    btnSubmitChild.onclick = triggerChildLogin;
  }

  // Ação de Login dos Pais
  const parentsForm = document.getElementById('parents-login-form');
  if (parentsForm) {
    parentsForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('parent-input-email')?.value?.trim();
      const password = document.getElementById('parent-input-password')?.value;
      const btn = document.getElementById('btn-submit-parent');

      if (!email || !password) {
        showMessage('Preencha seu e-mail e sua senha.');
        return;
      }

      try {
        if (btn) btn.textContent = '⏳ Autenticando...';
        showMessage('Validando credenciais...', false);
        await auth.loginWithEmail(email, password);
        showMessage('🎉 Bem-vindo, Guardião! Entrando...', false);
        setTimeout(() => {
          router.navigate('hub');
        }, 300);
      } catch (err) {
        showMessage(err.message || 'E-mail ou senha incorretos.');
        if (btn) btn.textContent = '👑 Entrar como Guardião';
      }
    };
  }
}

export default { renderLoginView, bindLoginEvents };
