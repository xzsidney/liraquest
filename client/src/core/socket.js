/**
 * LiraQuest - Gerenciador de WebSockets em Tempo Real
 */

export const socket = {
  instance: null,
  connected: false,

  init() {
    if (this.instance) return this.instance;
    if (typeof io === 'undefined') {
      console.warn('⚠️ Biblioteca Socket.IO não encontrada globalmente.');
      return null;
    }

    try {
      this.instance = io({
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.instance.on('connect', () => {
        this.connected = true;
        console.log('⚡ [Socket.IO] Conectado ao servidor LiraQuest!');
      });

      this.instance.on('disconnect', () => {
        this.connected = false;
        console.log('⚡ [Socket.IO] Desconectado do servidor.');
      });

      return this.instance;
    } catch (err) {
      console.error('❌ Erro ao inicializar Socket.IO:', err);
      return null;
    }
  },

  on(event, callback) {
    if (!this.instance) this.init();
    if (this.instance) {
      this.instance.on(event, callback);
    }
  },

  emit(event, data) {
    if (!this.instance) this.init();
    if (this.instance) {
      this.instance.emit(event, data);
    }
  },
};
