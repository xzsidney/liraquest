/**
 * LiraQuest - Barra Superior Nobre de Navegação dos Módulos (Fase 5)
 * Permite retorno ao Grande Salão e alternância imediata entre os 6 módulos da família com 1 clique e transição suave.
 */

import { router } from '../core/router.js';

const MODULES_LIST = [
  { key: 'salao', name: 'Grande Salão', icon: '🏰', route: 'salao' },
  { key: 'casa', name: 'Casa', icon: '🏡', route: 'casa' },
  { key: 'estudos', name: 'Estudos', icon: '📚', route: 'estudos' },
  { key: 'saude', name: 'Saúde', icon: '🥗', route: 'saude' },
  { key: 'diversao', name: 'Diversão', icon: '🎡', route: 'diversao' },
  { key: 'jogos', name: 'Jogos', icon: '🎮', route: 'jogos' },
  { key: 'financeiro', name: 'Finanças', icon: '💰', route: 'financeiro' },
];

/**
 * Renderiza a Barra Superior Nobre padronizada
 */
export function renderModuleNavbar({
  currentModule = 'salao',
  title = '',
  subtitle = '',
  icon = '🏰',
  extraActionsHtml = '',
  badges = [],
}) {
  const quickLinksHtml = MODULES_LIST
    .filter(m => m.key !== 'salao')
    .map(m => {
      const isCurrent = m.key === currentModule;
      return `
        <button class="nav-module-pill ${isCurrent ? 'active' : ''}" data-nav-target="${m.route}" title="Ir para ${m.name}">
          <span>${m.icon}</span>
          <span>${m.name}</span>
        </button>
      `;
    })
    .join('');

  const badgesHtml = badges
    .map(b => `
      <div class="nav-module-badge" style="background: ${b.bg || 'rgba(212, 175, 55, 0.15)'}; border: 1px solid ${b.border || 'rgba(212, 175, 55, 0.35)'}; color: ${b.color || '#fde047'};">
        <span>${b.icon || '⭐'}</span>
        <strong>${b.label || ''}</strong>
      </div>
    `)
    .join('');

  return `
    <div class="noble-top-navigation-bar" style="margin-bottom: 22px; animation: fadeIn 0.25s ease;">
      <!-- Linha 1: Botão Grande Salão + Título do Módulo + Ações Rápidas -->
      <div class="noble-top-header-row">
        <div class="module-identity-cluster">
          <button id="btn-global-back-salao" class="btn-noble-back-salao" title="Retornar ao Grande Salão do Reino">
            <span class="castle-icon">🏰</span>
            <span class="back-text">Voltar ao Grande Salão</span>
          </button>

          <div class="module-title-meta">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="module-icon-emblem">${icon}</span>
              <h2 class="cinzel gold-gradient-text" style="margin: 0; font-size: 1.35rem;">${title}</h2>
            </div>
            ${subtitle ? `<p class="module-subtitle-desc">${subtitle}</p>` : ''}
          </div>
        </div>

        <div class="module-header-actions-cluster">
          ${badgesHtml}
          ${extraActionsHtml}
        </div>
      </div>

      <!-- Linha 2: Pílulas de Alternância Rápida entre os 6 Módulos Familiares -->
      <div class="noble-modules-quick-strip">
        <span class="strip-label">Navegação Rápida do Reino:</span>
        <div class="strip-buttons-wrapper">
          ${quickLinksHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Ativa os ouvintes de evento da barra superior de navegação
 */
export function bindModuleNavbarEvents() {
  const btnBack = document.getElementById('btn-global-back-salao');
  if (btnBack) {
    btnBack.onclick = (e) => {
      e.preventDefault();
      router.navigate('salao');
    };
  }

  // Ouvintes de clique em todas as pílulas de navegação rápida
  document.querySelectorAll('.nav-module-pill').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const targetRoute = btn.dataset.navTarget;
      if (targetRoute) {
        router.navigate(targetRoute);
      }
    };
  });
}

export default {
  renderModuleNavbar,
  bindModuleNavbarEvents,
};
