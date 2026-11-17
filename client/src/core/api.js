/**
 * LiraQuest - Cliente HTTP Core
 * Injeta token JWT automaticamente e normaliza respostas de API
 */

export const api = {
  getToken() {
    return localStorage.getItem('liraquest_token') || null;
  },

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
    const isFormData = options.body instanceof FormData;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Se receber 401 Unauthorized e o usuário estiver tentando usar a API logada, desloga suavemente
        if (response.status === 401 && this.getToken()) {
          console.warn('⚠️ Sessão expirada ou inválida. Redirecionando para login.');
          localStorage.removeItem('liraquest_token');
          localStorage.removeItem('liraquest_user');
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || `Erro na requisição HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ [API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
