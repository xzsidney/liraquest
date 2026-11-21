/**
 * LiraQuest - Navbar Nobre Oficial (frontend/src/components/Navbar.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export function renderNavbar() {
  const isLogged = auth.isAuthenticated();
  const user = auth.getUser();

  const roleText = user?.role === 'ADMIN'
    ? '⚡ Mestre Guardião'
    : user?.role === 'PARENT'
    ? '👑 Guardiã Mestra'
    : '⚔️ Herói Aventureiro';

  const clanName = user?.family?.name || 'Clã Lira';
  const heroName = user?.hero_nickname || user?.name || 'Aventureiro';

  // Ícone temático conforme classe ou papel
  let avatarIcon = '⚔️';
  if (user?.role === 'ADMIN') avatarIcon = '🛡️';
  else if (user?.role === 'PARENT') avatarIcon = '👑';
  else if (user?.class_code === 'rastreador_veloz') avatarIcon = '🏹';
  else if (user?.class_code === 'artifice_criativo') avatarIcon = '🎨';

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

        <!-- Ações à Direita -->
        <div class="nav-actions">
          ${isLogged ? `
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <!-- Atalho para o Salão do Herói -->
              <button id="nav-btn-hub" class="btn-noble btn-noble-secondary btn-noble-sm">
                🏰 Salão do Herói
              </button>

              <!-- Badge do Membro -->
              <div class="user-badge-noble">
                <div class="user-avatar-small">${avatarIcon}</div>
                <div class="user-info-text">
                  <span class="user-name-text">${heroName}</span>
                  <span class="user-role-text">${clanName} • ${roleText}</span>
                </div>
              </div>

              <!-- Sair -->
              <button id="nav-btn-logout" class="btn-noble btn-noble-primary btn-noble-sm" style="border-color: rgba(239, 68, 68, 0.4);">
                🚪 Sair
              </button>
            </div>
          ` : `
            <button id="nav-btn-login" class="btn-noble btn-noble-gold btn-noble-sm">
              🔑 Entrar no Reino
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
      router.navigate(auth.isAuthenticated() ? 'hub' : 'login');
    };
  }

  const btnHub = document.getElementById('nav-btn-hub');
  if (btnHub) {
    btnHub.onclick = () => router.navigate('hub');
  }

  const btnLogin = document.getElementById('nav-btn-login');
  if (btnLogin) {
    btnLogin.onclick = () => router.navigate('login');
  }

  const btnLogout = document.getElementById('nav-btn-logout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      auth.logout();
      router.navigate('login');
    };
  }
}

export default { renderNavbar, bindNavbarEvents };
