/**
 * LiraQuest - Gerenciador de Rotas SPA Hash-Based (frontend/src/core/router.js)
 */

import { auth } from './auth.js';

const PUBLIC_ROUTES = ['home', 'login', 'register'];

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
    const clean = hash.replace(/^#\/?/, '').trim();
    if (!clean) {
      return auth.isAuthenticated() ? 'hub' : 'home';
    }
    return clean;
  },

  handleRouting() {
    let path = this.getPath();
    const isAuth = auth.isAuthenticated();
    const isPublic = PUBLIC_ROUTES.includes(path);

    // 1. Não autenticado tentando acessar rota privada -> Redireciona para login
    if (!isAuth && !isPublic) {
      window.location.hash = '#/login';
      return;
    }

    // 2. Autenticado tentando acessar tela de login ou registro -> Redireciona para o hub
    if (isAuth && (path === 'login' || path === 'register')) {
      window.location.hash = '#/hub';
      return;
    }

    this.currentRoute = path;
    const handler = this.routes[path] || (isAuth ? this.routes['hub'] : this.routes['home']);

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
