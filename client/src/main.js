/**
 * LiraQuest - Ponto de Entrada da Aplicação Modular SPA (client/src/main.js)
 */

import { auth } from './core/auth.js';
import { router } from './core/router.js';
import { socket } from './core/socket.js';
import { renderNavbar, bindNavbarEvents } from './components/Navbar.js';
import { renderHomeView, renderLoginView, renderRegisterView, bindAuthEvents } from './modules/auth/index.js';
import { renderSalaoView, bindSalaoEvents } from './modules/salao/index.js';
import { renderCasaView, bindCasaEvents } from './modules/casa/index.js';
import { renderEstudosView, bindEstudosEvents } from './modules/estudos/index.js';
import { renderSaudeView, bindSaudeEvents } from './modules/saude/index.js';
import { renderDiversaoView, bindDiversaoEvents } from './modules/diversao/index.js';
import { renderJogosView, bindJogosEvents } from './modules/jogos/index.js';
import { renderFinanceiroView, bindFinanceiroEvents } from './modules/financeiro/index.js';
import { registerServiceWorker } from './core/pushManager.js';

// Função para renderizar a Navbar global
function updateGlobalNavbar() {
  const navContainer = document.getElementById('navbar-mount');
  if (navContainer) {
    navContainer.innerHTML = renderNavbar();
    bindNavbarEvents();
  }
}

// Função auxiliar de montagem de telas
async function mountView(renderFn, bindFn) {
  updateGlobalNavbar();
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = '<div style="text-align: center; padding: 60px;"><div style="font-size: 2.5rem; animation: pulse 1s infinite;">🏰</div><p style="color: #cbd5e1; margin-top: 12px;">Carregando Salão...</p></div>';

  try {
    const html = await renderFn();
    appEl.innerHTML = html;
    if (typeof bindFn === 'function') {
      bindFn();
    }
  } catch (err) {
    console.error('Erro ao renderizar tela:', err);
    appEl.innerHTML = `
      <div class="noble-card" style="text-align: center; margin: 40px auto; max-width: 500px;">
        <h3 class="cinzel" style="color: #ef4444; margin-bottom: 8px;">Falha ao Carregar</h3>
        <p style="color: #cbd5e1; font-size: 0.9rem;">${err.message || 'Ocorreu um erro ao carregar este módulo.'}</p>
        <button onclick="window.location.reload()" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-top: 14px;">
          Recarregar Página
        </button>
      </div>
    `;
  }
}

// Registro das 10 Rotas SPA
router.register('home', () => mountView(renderHomeView, bindAuthEvents));
router.register('login', () => mountView(renderLoginView, bindAuthEvents));
router.register('register', () => mountView(renderRegisterView, bindAuthEvents));
router.register('salao', () => mountView(renderSalaoView, bindSalaoEvents));
router.register('casa', () => mountView(renderCasaView, bindCasaEvents));
router.register('estudos', () => mountView(renderEstudosView, bindEstudosEvents));
router.register('saude', () => mountView(renderSaudeView, bindSaudeEvents));
router.register('diversao', () => mountView(renderDiversaoView, bindDiversaoEvents));
router.register('jogos', () => mountView(renderJogosView, bindJogosEvents));
router.register('financeiro', () => mountView(renderFinanceiroView, bindFinanceiroEvents));

// Inicialização da Aplicação
async function initApp() {
  console.log('🏰 [LiraQuest] Inicializando Monorepo Modular Frontend...');
  
  // 1. Escuta mudanças na autenticação para atualizar a navbar
  auth.onChange(() => {
    updateGlobalNavbar();
  });

  // 2. Valida sessão salva em segundo plano
  await auth.checkSession();

  // 3. Inicializa conexão WebSocket em tempo real
  socket.init();

  // 4. Inicia roteador
  router.init();

  // 5. Registra o Service Worker para Notificações Web Push
  registerServiceWorker();
}

window.addEventListener('DOMContentLoaded', initApp);
