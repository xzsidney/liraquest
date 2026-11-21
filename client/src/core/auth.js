/**
 * LiraQuest - Gerenciador de Autenticação e Sessão
 */

import { api } from './api.js';

export const auth = {
  state: {
    token: localStorage.getItem('liraquest_token') || null,
    user: JSON.parse(localStorage.getItem('liraquest_user') || 'null'),
    character: null,
    family: null,
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

  getCharacter() {
    return this.state.character;
  },

  getFamily() {
    return this.state.family;
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

  async login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    const userData = data.user || data.member;
    if (data.token && userData) {
      this.state.token = data.token;
      this.state.user = userData;
      localStorage.setItem('liraquest_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('liraquest_user', JSON.stringify(userData));
      
      // Carregar dados complementares do personagem e família
      await this.loadInitialUserData();
      this.notify();
    }
    return data;
  },

  async register(name, email, password, role = 'PARENT', family_name = null, invite_code = null) {
    const data = await api.post('/api/auth/register', { name, email, password, role, family_name, invite_code });
    const userData = data.user || data.member;
    if (data.token && userData) {
      this.state.token = data.token;
      this.state.user = userData;
      localStorage.setItem('liraquest_token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('liraquest_user', JSON.stringify(userData));
      
      await this.loadInitialUserData();
      this.notify();
    }
    return data;
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    this.state.character = null;
    this.state.family = null;
    localStorage.removeItem('liraquest_token');
    localStorage.removeItem('token');
    localStorage.removeItem('liraquest_user');
    this.notify();
  },

  async checkSession() {
    if (!this.state.token) return false;
    try {
      const res = await api.get('/api/auth/me');
      const resUser = res && (res.user || res.member);
      if (res && resUser) {
        this.state.user = resUser;
        localStorage.setItem('liraquest_user', JSON.stringify(resUser));
        await this.loadInitialUserData();
        this.notify();
        return true;
      }
    } catch (e) {
      console.warn('Sessão expirada ao validar:', e.message);
      this.logout();
    }
    return false;
  },

  async loadInitialUserData() {
    if (!this.isAuthenticated()) return;
    try {
      // 1. Tenta carregar personagem
      const charRes = await api.get('/api/character/me').catch(() => null);
      if (charRes && charRes.character) {
        this.state.character = charRes.character;
      }

      // 2. Tenta carregar família
      const familyRes = await api.get('/api/family/my-family').catch(() => null);
      if (familyRes && familyRes.family) {
        this.state.family = familyRes.family;
      }
    } catch (err) {
      console.error('Erro ao carregar dados complementares do usuário:', err);
    }
  },
};
