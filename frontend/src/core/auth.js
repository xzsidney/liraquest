/**
 * LiraQuest - Gerenciador de Autenticação Unificada (O Membro É o Herói)
 */

import { api } from './api.js';

export const auth = {
  state: {
    token: localStorage.getItem('liraquest_token') || null,
    user: JSON.parse(localStorage.getItem('liraquest_user') || 'null'),
    listeners: new Set(),
  },

  onChange(listener) {
    this.state.listeners.add(listener);
    return () => this.state.listeners.delete(listener);
  },

  notify() {
    for (const listener of this.state.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Erro em listener de auth:', e);
      }
    }
  },

  isAuthenticated() {
    return Boolean(this.state.token && this.state.user);
  },

  getUser() {
    return this.state.user;
  },

  getMember() {
    return this.state.user;
  },

  isParent() {
    return this.state.user?.role === 'PARENT' || this.state.user?.role === 'ADMIN';
  },

  isChild() {
    return this.state.user?.role === 'CHILD';
  },

  isAdmin() {
    return this.state.user?.role === 'ADMIN';
  },

  /**
   * Login dos Pais via E-mail e Senha
   */
  async loginWithEmail(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    const memberData = data.user || data.member;

    if (data.token && memberData) {
      this.state.token = data.token;
      this.state.user = memberData;
      localStorage.setItem('liraquest_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('liraquest_user', JSON.stringify(memberData));
      this.notify();
    }
    return data;
  },

  /**
   * Login dos Filhos via Apelido/Herói e PIN de 4 dígitos
   */
  async loginWithPin(heroNickname, pin) {
    const data = await api.post('/api/auth/login', {
      hero_nickname: heroNickname,
      pin: String(pin).trim(),
    });
    const memberData = data.user || data.member;

    if (data.token && memberData) {
      this.state.token = data.token;
      this.state.user = memberData;
      localStorage.setItem('liraquest_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('liraquest_user', JSON.stringify(memberData));
      this.notify();
    }
    return data;
  },

  /**
   * Busca a lista de crianças/heróis para exibição nos cards da tela de login
   */
  async getChildren() {
    try {
      const res = await api.get('/api/auth/children');
      return res.children || [];
    } catch {
      // Fallback padrão Clã Lira
      return [
        {
          id: 'child-paulinho',
          name: 'Paulo Lira',
          hero_nickname: 'Sir Paulinho',
          class_code: 'rastreador_veloz',
          skin_code: 'rastreador_veloz',
          level: 3,
        },
        {
          id: 'child-jennifer',
          name: 'Jennifer Lira',
          hero_nickname: 'Valquíria Jennifer',
          class_code: 'artifice_criativo',
          skin_code: 'artifice_criativa',
          level: 3,
        },
      ];
    }
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem('liraquest_token');
    localStorage.removeItem('token');
    localStorage.removeItem('liraquest_user');
    this.notify();
  },

  /**
   * Valida a sessão ativa via /api/auth/me
   */
  async checkSession() {
    if (!this.state.token) return false;
    try {
      const res = await api.get('/api/auth/me');
      const member = res && (res.user || res.member);
      if (res && member) {
        this.state.user = member;
        localStorage.setItem('liraquest_user', JSON.stringify(member));
        this.notify();
        return true;
      }
    } catch (e) {
      console.warn('Sessão expirada:', e.message);
      this.logout();
    }
    return false;
  },
};

export default auth;
