/**
 * LiraQuest - Ponto de Entrada da Interface Web SPA (frontend/src/main.js)
 */

import { auth } from './core/auth.js';
import { router } from './core/router.js';
import { renderNavbar, bindNavbarEvents } from './components/Navbar.js';
import { renderHomeView, bindHomeEvents } from './views/HomeView.js';
import { renderLoginView, bindLoginEvents } from './views/LoginView.js';
import { renderRegisterView, bindRegisterEvents } from './views/RegisterView.js';
import { renderHubView, bindHubEvents } from './views/HubView.js';
import { renderTasksView, bindTasksEvents } from './views/TasksView.js';
import { renderStudyView, bindStudyEvents } from './views/StudyView.js';
import { renderHealthView, bindHealthEvents } from './views/HealthView.js';
import { renderShopView, bindShopEvents } from './views/ShopView.js';
import { renderRpgView, bindRpgEvents } from './views/RpgView.js';
import { renderSheetTestView, bindSheetTestEvents } from './views/SheetTestView.js';

function updateNavbar() {
  const mount = document.getElementById('navbar-mount');
  if (mount) {
    mount.innerHTML = renderNavbar();
    bindNavbarEvents();
  }
}

async function mountView(renderFn, bindFn) {
  updateNavbar();
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = '<div style="text-align: center; padding: 60px;"><div style="font-size: 2.8rem; animation: pulse 1s infinite;">🏰</div><p style="color: #cbd5e1; margin-top: 12px;">Entrando no Grande Salão...</p></div>';

  try {
    const html = await renderFn();
    appEl.innerHTML = html;
    if (typeof bindFn === 'function') {
      bindFn();
    }
  } catch (err) {
    console.error('Erro ao montar tela:', err);
    appEl.innerHTML = `
      <div class="noble-card" style="text-align: center; margin: 40px auto; max-width: 500px;">
        <h3 class="cinzel" style="color: #ef4444; margin-bottom: 8px;">Falha ao Carregar</h3>
        <p style="color: #cbd5e1; font-size: 0.9rem;">${err.message || 'Ocorreu um erro ao carregar esta área.'}</p>
        <button onclick="window.location.reload()" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-top: 14px;">
          Recarregar Salão
        </button>
      </div>
    `;
  }
}

// Registro das Rotas Oficiais SPA
router.register('home', () => mountView(renderHomeView, bindHomeEvents));
router.register('login', () => mountView(renderLoginView, bindLoginEvents));
router.register('register', () => mountView(renderRegisterView, bindRegisterEvents));
router.register('hub', () => mountView(renderHubView, bindHubEvents));
router.register('tasks', () => mountView(renderTasksView, bindTasksEvents));
router.register('study', () => mountView(renderStudyView, bindStudyEvents));
router.register('health', () => mountView(renderHealthView, bindHealthEvents));
router.register('shop', () => mountView(renderShopView, bindShopEvents));
router.register('rpg', () => mountView(renderRpgView, bindRpgEvents));
router.register('home/teste', () => mountView(renderSheetTestView, bindSheetTestEvents));

// Inicialização da Aplicação
async function initApp() {
  console.log('🏰 [LiraQuest] Inicializando Interface Web Oficial...');

  auth.onChange(() => {
    updateNavbar();
  });

  // Validar sessão ativa
  await auth.checkSession();

  // Iniciar roteador
  router.init();
}

window.addEventListener('DOMContentLoaded', initApp);
