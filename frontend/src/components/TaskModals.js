/**
 * LiraQuest - Modais Compartilhados de Missões & Comprovações
 * Reutilizado entre o Grande Salão (HubView.js) e o Mural de Tarefas (TasksView.js)
 */

import { api } from '../core/api.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatFrequencyLabel(freq) {
  if (freq === 'WEEKLY') return 'Semanal';
  if (freq === 'ONCE') return 'Única';
  return 'Diária';
}

export function showToast(message, type = 'gold') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'noble-toast';
  toast.style.borderColor = type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : 'var(--accent)');
  toast.innerHTML = `<span>${type === 'danger' ? '⚠️' : (type === 'success' ? '✅' : '👑')}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 4500);
}

export function showFanfareModal(mountId, heroName, newStr, oldStr, onClose) {
  const modalMount = document.getElementById(mountId);
  if (!modalMount) return;

  modalMount.innerHTML = `
    <div class="noble-modal-backdrop" id="fanfare-modal-backdrop" style="animation: fadeIn 0.3s ease-out;">
      <div class="noble-modal-content" style="text-align: center; border-color: #fde047; box-shadow: 0 0 40px rgba(253, 224, 71, 0.6); background: linear-gradient(135deg, rgba(74, 14, 23, 0.98), rgba(15, 23, 42, 0.98));">
        <div style="font-size: 3.5rem; margin-bottom: 8px; animation: bounce 1s infinite;">👑⚡💪</div>
        <h2 class="cinzel gold-gradient-text" style="font-size: 1.9rem; margin-bottom: 6px;">
          MESTRIA EM FORÇA ALCANÇADA!
        </h2>
        <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 16px;">
          O herói <strong>${escapeHtml(heroName)}</strong> atingiu 100 XP de Força e seu atributo subiu de 
          <span style="color: #f87171; font-weight: 800;">STR ${oldStr}</span> para 
          <span style="color: #fde047; font-weight: 900; font-size: 1.3rem;">STR ${newStr}</span>!
        </p>
        <div style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 14px; padding: 14px; margin-bottom: 20px;">
          <p style="color: #fde047; font-size: 0.88rem; font-weight: 700;">
            ⚔️ Bônus em Combate: Seus golpes físicos causam mais impacto em masmorras e raids!
          </p>
        </div>
        <button id="btn-close-fanfare" class="btn-noble btn-noble-gold" style="width: 100%; padding: 12px; font-size: 1rem;">
          ⚔️ Continuar Jornada com Honra
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-fanfare')?.addEventListener('click', () => {
    modalMount.innerHTML = '';
    if (typeof onClose === 'function') onClose();
  });
}

export function openSubmitProofModal({ mountId, taskId, taskTitle, onSuccess }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  let currentPreviewBase64 = null;

  mount.innerHTML = `
    <div class="noble-modal-backdrop" id="modal-submit-backdrop">
      <div class="noble-modal-content">
        <div class="noble-modal-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: 800; color: #fde047; text-transform: uppercase;">
              COMPROVAÇÃO DE MISSÃO
            </span>
            <h3 class="cinzel" style="color: #fff; font-size: 1.25rem;">${escapeHtml(taskTitle)}</h3>
          </div>
          <button class="noble-modal-close" id="btn-close-modal">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              📸 Tire ou selecione uma foto da tarefa feita:
            </label>
            <input 
              type="file" 
              id="input-proof-file" 
              accept="image/*" 
              capture="environment"
              style="display: none;" 
            />
            <button 
              type="button" 
              id="btn-trigger-file-select" 
              class="btn-noble btn-noble-secondary" 
              style="width: 100%; padding: 12px; font-size: 0.92rem;"
            >
              📷 Abrir Câmera / Selecionar Foto
            </button>
          </div>

          <!-- Preview da Imagem -->
          <div id="proof-preview-container" style="display: none; text-align: center; background: rgba(0,0,0,0.4); border-radius: 12px; padding: 10px; border: 1px solid rgba(212, 175, 55, 0.3);">
            <img id="img-proof-preview" src="" alt="Preview" style="max-height: 200px; max-width: 100%; border-radius: 8px; object-fit: contain;" />
            <div style="margin-top: 6px;">
              <button type="button" id="btn-remove-preview" style="background: none; border: none; color: #f87171; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
                🗑️ Trocar Foto
              </button>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              📝 Anotação do Herói (opcional):
            </label>
            <textarea 
              id="textarea-member-notes" 
              class="noble-textarea" 
              rows="2" 
              placeholder="Ex: Arrumei a cama bem esticadinha e guardei meus brinquedos!"
            ></textarea>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button id="btn-cancel-submit" class="btn-noble btn-noble-secondary" style="flex: 1; padding: 10px;">
              Cancelar
            </button>
            <button id="btn-confirm-submit" class="btn-noble btn-noble-gold" style="flex: 2; padding: 10px;">
              🚀 Enviar Prova
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const btnClose = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel-submit');
  const btnTrigger = document.getElementById('btn-trigger-file-select');
  const inputFile = document.getElementById('input-proof-file');
  const previewContainer = document.getElementById('proof-preview-container');
  const imgPreview = document.getElementById('img-proof-preview');
  const btnRemovePreview = document.getElementById('btn-remove-preview');
  const btnConfirm = document.getElementById('btn-confirm-submit');
  const textNotes = document.getElementById('textarea-member-notes');

  const closeModal = () => { mount.innerHTML = ''; };
  btnClose.onclick = closeModal;
  btnCancel.onclick = closeModal;

  btnTrigger.onclick = () => inputFile.click();

  inputFile.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      currentPreviewBase64 = loadEvt.target.result;
      imgPreview.src = currentPreviewBase64;
      previewContainer.style.display = 'block';
      btnTrigger.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  btnRemovePreview.onclick = () => {
    currentPreviewBase64 = null;
    inputFile.value = '';
    previewContainer.style.display = 'none';
    btnTrigger.style.display = 'block';
  };

  btnConfirm.onclick = async () => {
    if (!currentPreviewBase64) {
      alert('Por favor, tire ou anexe uma foto para comprovar sua missão!');
      return;
    }

    btnConfirm.disabled = true;
    btnConfirm.textContent = '⏳ Enviando Prova...';

    try {
      await api.post(`/api/tasks/${taskId}/submit`, {
        proof_image: currentPreviewBase64,
        member_notes: textNotes?.value || '',
      });

      showToast('📸 Prova enviada com sucesso! O papai/mamãe já pode aprovar.', 'success');
      closeModal();
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      showToast(err.message || 'Erro ao enviar prova', 'danger');
      btnConfirm.disabled = false;
      btnConfirm.textContent = '🚀 Enviar Prova';
    }
  };
}

export function openNewTaskModal({ mountId, children = [], onSuccess }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `
    <div class="noble-modal-backdrop" id="modal-new-task-backdrop">
      <div class="noble-modal-content">
        <div class="noble-modal-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: 800; color: #fde047; text-transform: uppercase;">
              MESTRES GUARDIÕES
            </span>
            <h3 class="cinzel" style="color: #fff; font-size: 1.25rem;">➕ Criar Nova Missão Familiar</h3>
          </div>
          <button class="noble-modal-close" id="btn-close-new-task">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">
              Título da Missão:
            </label>
            <input type="text" id="new-task-title" class="noble-input" placeholder="Ex: Varrer a Varanda e Regar as Plantas" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">
              Instruções / Detalhes:
            </label>
            <textarea id="new-task-desc" class="noble-textarea" rows="2" placeholder="O que o herói deve fazer para ter sucesso..."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #60a5fa; margin-bottom: 4px;">
                🔁 Frequência:
              </label>
              <select id="new-task-frequency" class="noble-select">
                <option value="DAILY" selected>Diária</option>
                <option value="WEEKLY">Semanal</option>
                <option value="ONCE">Única</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #fde047; margin-bottom: 4px;">
                👤 Destinatário:
              </label>
              <select id="new-task-assignee" class="noble-select">
                <option value="">👥 Todos os Heróis do Clã</option>
                ${children.map(child => `
                  <option value="${escapeHtml(child.id)}">${escapeHtml(child.hero_nickname || child.name)} (${escapeHtml(child.name)})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #f87171; margin-bottom: 4px;">
                💪 Bônus Força (STR XP):
              </label>
              <input type="number" min="0" id="new-task-str-xp" class="noble-input" value="25" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #fde047; margin-bottom: 4px;">
                💰 Ouro do Herói:
              </label>
              <input type="number" min="0" id="new-task-gold" class="noble-input" value="10" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #60a5fa; margin-bottom: 4px;">
                🎟️ Fichas do Lar:
              </label>
              <input type="number" min="0" id="new-task-tokens" class="noble-input" value="1" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #a78bfa; margin-bottom: 4px;">
                ⚡ XP de Aventureiro:
              </label>
              <input type="number" min="0" id="new-task-xp" class="noble-input" value="15" />
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button id="btn-cancel-new-task" class="btn-noble btn-noble-secondary" style="flex: 1; padding: 10px;">
              Cancelar
            </button>
            <button id="btn-save-new-task" class="btn-noble btn-noble-gold" style="flex: 2; padding: 10px;">
              Criar Missão
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const mountModal = () => { mount.innerHTML = ''; };
  document.getElementById('btn-close-new-task').onclick = mountModal;
  document.getElementById('btn-cancel-new-task').onclick = mountModal;

  document.getElementById('btn-save-new-task').onclick = async () => {
    const title = document.getElementById('new-task-title')?.value;
    const desc = document.getElementById('new-task-desc')?.value;
    const frequency = document.getElementById('new-task-frequency')?.value || 'DAILY';
    const assignedTo = document.getElementById('new-task-assignee')?.value || '';
    const strXpRaw = document.getElementById('new-task-str-xp')?.value;
    const goldRaw = document.getElementById('new-task-gold')?.value;
    const tokensRaw = document.getElementById('new-task-tokens')?.value;
    const xpRaw = document.getElementById('new-task-xp')?.value;

    if (!title || !title.trim()) {
      alert('Por favor, informe o título da missão!');
      return;
    }

    try {
      await api.post('/api/tasks', {
        title: title.trim(),
        description: desc?.trim() || '',
        category: 'LAR',
        frequency,
        assigned_to: assignedTo || null,
        reward_str_xp: strXpRaw === '' || strXpRaw === undefined ? 25 : Number(strXpRaw),
        reward_gold: goldRaw === '' || goldRaw === undefined ? 10 : Number(goldRaw),
        reward_tokens: tokensRaw === '' || tokensRaw === undefined ? 1 : Number(tokensRaw),
        reward_xp: xpRaw === '' || xpRaw === undefined ? 15 : Number(xpRaw),
      });

      showToast('🎉 Nova missão do lar criada com sucesso!', 'success');
      mountModal();
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      showToast(err.message || 'Erro ao criar missão', 'danger');
    }
  };
}

export function openImagePreviewModal(mountId, imgSrc) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `
    <div class="noble-modal-backdrop" id="img-preview-backdrop">
      <div class="noble-modal-content" style="max-width: 600px; text-align: center;">
        <div class="noble-modal-header">
          <h4 class="cinzel gold-gradient-text" style="font-size: 1.1rem;">Foto da Comprovação</h4>
          <button class="noble-modal-close" id="btn-close-img-preview">&times;</button>
        </div>
        <img src="${escapeHtml(imgSrc)}" alt="Foto Comprovação" style="max-height: 450px; width: auto; max-width: 100%; border-radius: 12px; border: 2px solid var(--accent);" />
      </div>
    </div>
  `;

  document.getElementById('btn-close-img-preview').onclick = () => { mount.innerHTML = ''; };
  document.getElementById('img-preview-backdrop').onclick = (e) => {
    if (e.target.id === 'img-preview-backdrop') mount.innerHTML = '';
  };
}

export default {
  escapeHtml,
  formatFrequencyLabel,
  showToast,
  showFanfareModal,
  openSubmitProofModal,
  openNewTaskModal,
  openImagePreviewModal,
};
