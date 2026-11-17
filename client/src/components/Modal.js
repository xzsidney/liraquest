/**
 * LiraQuest - Gerenciador de Modais Nobres
 */

export function showModal({ title, contentHtml, onConfirm = null, confirmText = 'Confirmar', cancelText = 'Fechar' }) {
  // Remove modais abertos anteriores
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal-content-noble" onclick="event.stopPropagation()">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 class="cinzel gold-gradient-text" style="font-size: 1.35rem; margin: 0;">${title}</h3>
        <button id="modal-btn-close" style="background: transparent; border: none; color: #94a3b8; font-size: 1.6rem; cursor: pointer; line-height: 1;">✕</button>
      </div>

      <div class="modal-body" style="margin-bottom: 24px;">
        ${contentHtml}
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="modal-btn-cancel" class="btn-noble btn-noble-secondary btn-noble-sm">${cancelText}</button>
        ${onConfirm ? `<button id="modal-btn-confirm" class="btn-noble btn-noble-primary btn-noble-sm">${confirmText}</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.addEventListener('click', close);
  overlay.querySelector('#modal-btn-close').addEventListener('click', close);
  overlay.querySelector('#modal-btn-cancel').addEventListener('click', close);

  if (onConfirm) {
    overlay.querySelector('#modal-btn-confirm').addEventListener('click', async () => {
      const result = await onConfirm();
      if (result !== false) close();
    });
  }
}
