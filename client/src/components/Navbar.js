/**
 * LiraQuest - Navbar Nobre Oficial
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export function renderNavbar() {
  const isLogged = auth.isAuthenticated();
  const user = auth.getUser();
  const character = auth.getCharacter();
  const family = auth.getFamily();

  const userRoleText = user?.role === 'PARENT' ? '👑 Guardião Mestre' : (user?.role === 'ADMIN' ? '⚡ Administrador Real' : '⚔️ Herói Aventureiro');
  const clanName = family?.name || 'Clã Familiar';
  const avatar = character?.avatar_icon || '⚔️';

  return `
    <nav class="noble-navbar">
      <div class="nav-container">
        <!-- Marca / Logo -->
        <div class="brand-noble" id="nav-brand-btn">
          <div class="brand-crest">🏰</div>
          <div class="brand-text">
            <h1 class="gold-gradient-text">LiraQuest</h1>
            <span class="brand-subtitle">Reino Familiar</span>
          </div>
        </div>

        <!-- Ações Direita -->
        <div class="nav-actions">
          ${isLogged ? `
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <!-- Botão Atalho para o Grande Salão -->
              <button id="nav-btn-salao" class="btn-noble btn-noble-secondary btn-noble-sm">
                🏰 Grande Salão
              </button>

              <!-- Pill de Usuário -->
              <div class="user-badge-noble">
                <div class="user-avatar-small">${avatar}</div>
                <div class="user-info-text">
                  <span class="user-name-text">${user?.name || 'Membro'}</span>
                  <span class="user-role-text">${clanName} • ${userRoleText}</span>
                </div>
              </div>

              <!-- Botão Sair -->
              <button id="nav-btn-logout" class="btn-noble btn-noble-primary btn-noble-sm" style="border-color: rgba(239, 68, 68, 0.4);">
                🚪 Sair
              </button>
            </div>
          ` : `
            <button id="nav-btn-login" class="btn-noble btn-noble-gold btn-noble-sm">
              🔑 Acesso dos Guardiões
            </button>
          `}
        </div>
      </div>
    </nav>
  `;
}

export function bindNavbarEvents() {
  const brandBtn = document.getElementById('nav-brand-btn');
  if (brandBtn) {
    brandBtn.onclick = () => {
      router.navigate(auth.isAuthenticated() ? 'salao' : 'home');
    };
  }

  const btnSalao = document.getElementById('nav-btn-salao');
  if (btnSalao) {
    btnSalao.onclick = () => router.navigate('salao');
  }

  const btnLogin = document.getElementById('nav-btn-login');
  if (btnLogin) {
    btnLogin.onclick = () => router.navigate('login');
  }

  const btnLogout = document.getElementById('nav-btn-logout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      auth.logout();
      router.navigate('home');
    };
  }
}
