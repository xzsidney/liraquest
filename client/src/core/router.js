/**
 * LiraQuest - Roteador SPA (Single Page Application)
 */

import { auth } from './auth.js';

export const router = {
  currentRoute: 'home',
  routes: {},
  beforeEachHooks: [],

  register(route, handler, options = {}) {
    this.routes[route] = { handler, options };
  },

  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  },

  navigate(route, updateHistory = true) {
    // Normalizar rota
    let target = (route || 'home').replace(/^\/+|\/+$/g, '').toLowerCase();
    if (target === '' || target === 'index.html') target = 'home';

    // Rota protegida: Se não logado e tentar rota restrita
    const isPublic = ['home', 'login', 'register'].includes(target);
    if (!isPublic && !auth.isAuthenticated()) {
      target = 'login';
    }

    // Se já estiver logado e tentar acessar 'home' ou 'login', direciona direto para o Grande Salão
    if (auth.isAuthenticated() && (target === 'home' || target === 'login' || target === 'register')) {
      target = 'salao';
    }

    // Executar hooks
    for (const hook of this.beforeEachHooks) {
      const allowed = hook(target, this.currentRoute);
      if (allowed === false) return;
      if (typeof allowed === 'string') target = allowed;
    }

    this.currentRoute = target;

    // Atualizar barra de endereço do navegador
    if (updateHistory) {
      const path = target === 'home' ? '/' : `/${target}`;
      if (window.location.pathname !== path) {
        window.history.pushState({ route: target }, '', path);
      }
    }

    // Disparar manipulador de renderização
    const routeConfig = this.routes[target];
    if (routeConfig && typeof routeConfig.handler === 'function') {
      routeConfig.handler();
    } else {
      console.warn(`Rota não encontrada: ${target}. Redirecionando para salao/home.`);
      this.navigate(auth.isAuthenticated() ? 'salao' : 'home');
    }
  },

  init() {
    // Escutar eventos de avançar/voltar do navegador
    window.addEventListener('popstate', (e) => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home';
      this.navigate(path, false);
    });

    // Detectar rota inicial
    const initialPath = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home';
    this.navigate(initialPath, false);
  },
};
