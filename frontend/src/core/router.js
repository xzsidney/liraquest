/**
 * LiraQuest - Gerenciador de Rotas SPA Hash-Based
 */

import { auth } from './auth.js';

export const router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path.replace(/^#?\/?/, '')] = handler;
  },

  navigate(path) {
    const cleanPath = path.replace(/^#?\/?/, '');
    window.location.hash = `#/${cleanPath}`;
  },

  getPath() {
    const hash = window.location.hash;
    return hash.replace(/^#\/?/, '').trim() || 'hub';
  },

  handleRouting() {
    let path = this.getPath();

    const isAuth = auth.isAuthenticated();

    // Redirecionamentos de proteção de rotas
    if (!isAuth && path !== 'login' && path !== 'register') {
      window.location.hash = '#/login';
      return;
    }

    if (isAuth && (path === 'login' || path === 'register' || path === '')) {
      window.location.hash = '#/hub';
      return;
    }

    this.currentRoute = path;
    const handler = this.routes[path] || this.routes['hub'] || this.routes['login'];

    if (typeof handler === 'function') {
      handler();
    } else {
      console.warn(`Rota não encontrada: ${path}`);
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  },
};

export default router;
