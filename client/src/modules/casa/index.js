/**
 * LiraQuest - Módulo 1: Casa (Missões, Hábitos & Organização)
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

export async function renderCasaView() {
  const isParent = auth.isParent();
  let tasks = [];
  try {
    const res = await api.get('/api/tasks/list').catch(() => null);
    if (res && res.tasks) tasks = res.tasks;
  } catch (e) {
    console.error('Erro ao buscar tarefas:', e);
  }

  return `
    <div class="module-casa-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(245, 158, 11, 0.4);">
        <div class="module-title-box">
          <span class="icon">🏡</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Casa & Hábitos</h2>
            <p>Missões diárias da casa, tarefas de organização, envio de comprovações e visto do guardião.</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="btn-back-salao" class="btn-noble btn-noble-secondary btn-noble-sm">
            ⬅️ Voltar ao Grande Salão
          </button>
          ${isParent ? `
            <button id="btn-new-task" class="btn-noble btn-noble-gold btn-noble-sm">
              ➕ Nova Missão
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Grid de Tarefas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
        ${tasks.length === 0 ? `
          <div class="noble-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🧹✨</div>
            <h3 class="cinzel" style="color: #ffffff; margin-bottom: 6px;">Todas as missões da casa estão em dia!</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Nenhuma missão pendente no momento. Excelente trabalho de organização do lar!
            </p>
          </div>
        ` : tasks.map(task => `
          <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-color: rgba(245, 158, 11, 0.25);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span style="font-size: 1.8rem;">${task.icon || '🧹'}</span>
                <span style="background: rgba(245, 158, 11, 0.2); color: #fde047; border: 1px solid rgba(245, 158, 11, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                  ${task.frequency === 'DAILY' ? 'Diária' : 'Semanal'}
                </span>
              </div>
              <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">${task.title}</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
                ${task.description || 'Cumprir com capricho e dedicação.'}
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +${task.reward_gold || 10} Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⭐ +${task.reward_xp || 50} XP</span>
                <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🎟️ +${task.reward_tokens || 5} Fichas</span>
              </div>
            </div>

            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px;">
              ${isParent ? `
                <div style="display: flex; gap: 8px;">
                  <button class="btn-noble btn-noble-secondary btn-noble-sm" style="flex: 1;" onclick="window.viewTaskSubmissions('${task.id}')">
                    🔍 Ver Envios
                  </button>
                </div>
              ` : `
                <button class="btn-noble btn-noble-primary btn-noble-sm" style="width: 100%;" onclick="window.openSubmitProofModal('${task.id}', '${task.title}')">
                  📸 Enviar Comprovação
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function bindCasaEvents() {
  const btnBack = document.getElementById('btn-back-salao');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  const btnNewTask = document.getElementById('btn-new-task');
  if (btnNewTask) {
    btnNewTask.onclick = () => {
      showModal({
        title: '➕ Cadastrar Nova Missão da Casa',
        contentHtml: `
          <form id="form-create-task" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Título da Missão</label>
              <input type="text" id="task-title-input" class="form-input" placeholder="Ex: Arrumar a Cama, Lavar a Louça" required style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Descrição / Instruções</label>
              <textarea id="task-desc-input" class="form-input" placeholder="Detalhes de como a missão deve ser feita..." rows="2" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Fichas do Lar</label>
                <input type="number" id="task-tokens-input" value="5" min="1" max="100" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Ouro Real</label>
                <input type="number" id="task-gold-input" value="10" min="1" max="200" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
              </div>
            </div>
          </form>
        `,
        confirmText: 'Criar Missão',
        onConfirm: async () => {
          const title = document.getElementById('task-title-input')?.value?.trim();
          const desc = document.getElementById('task-desc-input')?.value?.trim();
          const tokens = parseInt(document.getElementById('task-tokens-input')?.value || '5');
          const gold = parseInt(document.getElementById('task-gold-input')?.value || '10');

          if (!title) {
            showToast('Informe o título da missão.', 'warning');
            return false;
          }

          try {
            await api.post('/api/tasks/create', {
              title,
              description: desc,
              reward_tokens: tokens,
              reward_gold: gold,
              reward_xp: 50,
              frequency: 'DAILY',
            });
            showToast('Missão criada com sucesso!', 'success');
            router.navigate('casa');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        }
      });
    };
  }

  // Modal para filho enviar comprovação
  window.openSubmitProofModal = (taskId, taskTitle) => {
    showModal({
      title: `📸 Enviar Prova: ${taskTitle}`,
      contentHtml: `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.88rem; color: #cbd5e1;">
            Relate o que você fez ou anexe uma foto para seus pais validarem!
          </p>
          <div>
            <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Relato do que você fez:</label>
            <textarea id="proof-text-input" placeholder="Ex: Deixei meu quarto arrumado, os brinquedos guardados e a cama feita." rows="3" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;"></textarea>
          </div>
        </div>
      `,
      confirmText: 'Enviar para os Pais',
      onConfirm: async () => {
        const text = document.getElementById('proof-text-input')?.value?.trim();
        try {
          await api.post('/api/tasks/submit', {
            task_id: taskId,
            proof_text: text || 'Missão concluída!',
          });
          showToast('Comprovação enviada para seus pais com sucesso! 🎉', 'success');
          router.navigate('casa');
          return true;
        } catch (err) {
          showToast(err.message, 'error');
          return false;
        }
      }
    });
  };
}
