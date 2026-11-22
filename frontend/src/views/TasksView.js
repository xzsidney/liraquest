/**
 * LiraQuest - Mural de Tarefas do Lar & Mestria em Força (STR)
 * frontend/src/views/TasksView.js
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

let cachedTasks = [];
let cachedPendingSubmissions = [];
let selectedTaskForSubmission = null;
let currentPreviewBase64 = null;

function showToast(message, type = 'gold') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'noble-toast';
  toast.style.borderColor = type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : 'var(--accent)');
  toast.innerHTML = `<span>${type === 'danger' ? '⚠️' : (type === 'success' ? '✅' : '👑')}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 4500);
}

function showFanfareModal(heroName, newStr, oldStr) {
  const modalMount = document.getElementById('tasks-modal-mount');
  if (!modalMount) return;

  modalMount.innerHTML = `
    <div class="noble-modal-backdrop" id="fanfare-modal-backdrop" style="animation: fadeIn 0.3s ease-out;">
      <div class="noble-modal-content" style="text-align: center; border-color: #fde047; box-shadow: 0 0 40px rgba(253, 224, 71, 0.6); background: linear-gradient(135deg, rgba(74, 14, 23, 0.98), rgba(15, 23, 42, 0.98));">
        <div style="font-size: 3.5rem; margin-bottom: 8px; animation: bounce 1s infinite;">👑⚡💪</div>
        <h2 class="cinzel gold-gradient-text" style="font-size: 1.9rem; margin-bottom: 6px;">
          MESTRIA EM FORÇA ALCANÇADA!
        </h2>
        <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 16px;">
          O herói <strong>${heroName}</strong> atingiu 100 XP de Força e seu atributo subiu de 
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
  });
}

export async function renderTasksView() {
  const member = auth.getMember();
  const isParent = auth.isParent();

  // 1. Carregar tarefas do backend
  try {
    const tasksRes = await api.get('/api/tasks');
    cachedTasks = tasksRes.tasks || [];
  } catch (err) {
    console.warn('Erro ao buscar tarefas:', err.message);
    cachedTasks = [];
  }

  // 2. Se for pai, carregar fila de provas pendentes
  if (isParent) {
    try {
      const pendingRes = await api.get('/api/tasks/submissions/pending');
      cachedPendingSubmissions = pendingRes.submissions || [];
    } catch (err) {
      console.warn('Erro ao buscar pendências:', err.message);
      cachedPendingSubmissions = [];
    }
  }

  const strVal = member?.str || 10;
  const xpStrVal = member?.xp_str || 0;
  const strPercent = Math.min(100, xpStrVal);

  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <!-- Topo de Navegação & Ações -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div>
          <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
            ⬅️ Voltar ao Salão
          </button>
          <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem; margin-bottom: 2px;">
            🧹 Missões do Lar & Mestria em Força (STR)
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Cumpra os deveres da casa com foto para fortalecer sua FORÇA (STR), ganhar moedas e Fichas do Lar.
          </p>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          ${isParent ? `
            <button id="btn-open-new-task-modal" class="btn-noble btn-noble-gold btn-noble-sm">
              ➕ Nova Missão
            </button>
          ` : ''}
          <button id="btn-refresh-tasks" class="btn-noble btn-noble-secondary btn-noble-sm">
            🔄 Atualizar
          </button>
        </div>
      </div>

      <!-- Ficha Viva D20: Mestria de Atributos com Destaque em FORÇA (STR) -->
      <div class="noble-card" style="margin-bottom: 24px; padding: 18px 22px; border-color: rgba(239, 68, 68, 0.4); background: linear-gradient(135deg, rgba(128, 0, 32, 0.35), rgba(15, 23, 42, 0.9));">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
              💪
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">
                  Pilar da Força (Tarefas do Lar)
                </span>
                <span class="noble-badge noble-badge-str">Nível STR ${strVal}</span>
              </div>
              <h4 class="cinzel" style="color: #fff; font-size: 1.15rem; margin-top: 2px;">
                Progresso para FORÇA ${strVal + 1}
              </h4>
            </div>
          </div>

          <div style="text-align: right;">
            <span style="font-size: 1.1rem; font-weight: 900; color: #fde047;">${xpStrVal} / 100 XP STR</span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${100 - xpStrVal} XP restantes para subir STR</div>
          </div>
        </div>

        <!-- Barra Nobre de Progresso em STR -->
        <div class="attr-progress-bar" style="height: 10px;">
          <div class="attr-progress-fill fill-str" style="width: ${strPercent}%;"></div>
        </div>

        <!-- Mini resumo dos outros 5 atributos -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(95px, 1fr)); gap: 8px; margin-top: 14px;">
          <div class="attr-card-d20" style="padding: 6px 8px;">
            <span style="font-size: 0.68rem; color: #60a5fa; font-weight: 800;">AGI ${member?.agi || 10}</span>
            <div class="attr-progress-bar" style="height: 4px;"><div class="attr-progress-fill fill-agi" style="width: ${member?.xp_agi || 0}%;"></div></div>
            <span class="attr-progress-label">${member?.xp_agi || 0}%</span>
          </div>
          <div class="attr-card-d20" style="padding: 6px 8px;">
            <span style="font-size: 0.68rem; color: #4ade80; font-weight: 800;">CON ${member?.con || 10}</span>
            <div class="attr-progress-bar" style="height: 4px;"><div class="attr-progress-fill fill-con" style="width: ${member?.xp_con || 0}%;"></div></div>
            <span class="attr-progress-label">${member?.xp_con || 0}%</span>
          </div>
          <div class="attr-card-d20" style="padding: 6px 8px;">
            <span style="font-size: 0.68rem; color: #c084fc; font-weight: 800;">INT ${member?.int || 10}</span>
            <div class="attr-progress-bar" style="height: 4px;"><div class="attr-progress-fill fill-int" style="width: ${member?.xp_int || 0}%;"></div></div>
            <span class="attr-progress-label">${member?.xp_int || 0}%</span>
          </div>
          <div class="attr-card-d20" style="padding: 6px 8px;">
            <span style="font-size: 0.68rem; color: #f472b6; font-weight: 800;">CHA ${member?.cha || 10}</span>
            <div class="attr-progress-bar" style="height: 4px;"><div class="attr-progress-fill fill-cha" style="width: ${member?.xp_cha || 0}%;"></div></div>
            <span class="attr-progress-label">${member?.xp_cha || 0}%</span>
          </div>
          <div class="attr-card-d20" style="padding: 6px 8px;">
            <span style="font-size: 0.68rem; color: #fde047; font-weight: 800;">LUK ${member?.luk || 10}</span>
            <div class="attr-progress-bar" style="height: 4px;"><div class="attr-progress-fill fill-luk" style="width: ${member?.xp_luk || 0}%;"></div></div>
            <span class="attr-progress-label">${member?.xp_luk || 0}%</span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO EXCLUSIVA DOS PAIS: FILA DE APROVAÇÃO -->
      ${isParent ? `
        <div class="noble-card" style="margin-bottom: 24px; border-color: rgba(212, 175, 55, 0.45); background: linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(15, 23, 42, 0.95));">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="cinzel gold-gradient-text" style="font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
              <span>👑</span> Fila de Aprovação dos Mestres Guardiões 
              <span class="noble-badge ${cachedPendingSubmissions.length > 0 ? 'noble-badge-pending' : 'noble-badge-approved'}">
                ${cachedPendingSubmissions.length} pendente(s)
              </span>
            </h3>
          </div>

          ${cachedPendingSubmissions.length === 0 ? `
            <div style="text-align: center; padding: 24px 16px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.1);">
              <span style="font-size: 2rem;">🛡️✨</span>
              <p style="color: var(--text-muted); font-size: 0.92rem; margin-top: 6px;">
                Nenhuma tarefa aguardando comprovação no momento. O clã está em ordem!
              </p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${cachedPendingSubmissions.map(sub => `
                <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                  
                  <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 260px;">
                    <!-- Foto da Prova -->
                    ${sub.proof_image ? `
                      <img 
                        src="${sub.proof_image}" 
                        alt="Comprovação" 
                        class="proof-thumbnail" 
                        data-img="${sub.proof_image}" 
                        style="width: 72px; height: 72px; object-fit: cover; border-radius: 10px; border: 2px solid var(--accent); cursor: pointer; transition: transform 0.2s;"
                        title="Clique para ampliar a foto"
                      />
                    ` : `
                      <div style="width: 72px; height: 72px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        📷
                      </div>
                    `}

                    <div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: #fde047; text-transform: uppercase;">
                          ${sub.member?.hero_nickname || 'Herói'} (${sub.member?.name || ''})
                        </span>
                        <span class="noble-badge noble-badge-str">STR ${sub.member?.str || 10}</span>
                      </div>
                      <strong style="color: #fff; font-size: 1.05rem;">
                        ${sub.task?.title || 'Tarefa do Lar'}
                      </strong>
                      ${sub.member_notes ? `
                        <p style="color: #cbd5e1; font-size: 0.82rem; font-style: italic; margin-top: 4px;">
                          "${sub.member_notes}"
                        </p>
                      ` : ''}
                      <div style="display: flex; gap: 10px; margin-top: 6px; font-size: 0.78rem; font-weight: 800;">
                        <span style="color: #f87171;">💪 +${sub.task?.reward_str_xp || 25} XP STR</span>
                        <span style="color: #fde047;">💰 +${sub.task?.reward_gold || 10} Ouro</span>
                        <span style="color: #60a5fa;">🎟️ +${sub.task?.reward_tokens || 1} Ficha</span>
                      </div>
                    </div>
                  </div>

                  <!-- Botões de Decisão dos Pais -->
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <button 
                      class="btn-noble btn-noble-gold btn-noble-sm btn-approve-submission" 
                      data-id="${sub.id}"
                      data-hero="${sub.member?.hero_nickname || 'Herói'}"
                    >
                      ✅ Aprovar (+STR)
                    </button>
                    <button 
                      class="btn-noble btn-noble-secondary btn-noble-sm btn-reject-submission" 
                      data-id="${sub.id}"
                      style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4);"
                    >
                      ❌ Rejeitar
                    </button>
                  </div>

                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- MURAL DE MISSÕES DO LAR -->
      <div class="noble-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="cinzel gold-gradient-text" style="color: #fff; font-size: 1.25rem;">
            📋 Mural de Missões do Dia
          </h3>
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            Total: <strong>${cachedTasks.length}</strong> missões ativas
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${cachedTasks.length === 0 ? `
            <div style="text-align: center; padding: 30px; color: var(--text-muted);">
              Nenhuma missão do lar encontrada. ${isParent ? 'Clique em "➕ Nova Missão" acima para criar a primeira!' : ''}
            </div>
          ` : cachedTasks.map(task => {
            let icon = '🧹';
            if (task.title.toLowerCase().includes('cama')) icon = '🛏️';
            else if (task.title.toLowerCase().includes('louça') || task.title.toLowerCase().includes('mesa')) icon = '🍽️';
            else if (task.title.toLowerCase().includes('lixo')) icon = '🗑️';
            else if (task.title.toLowerCase().includes('estudos') || task.title.toLowerCase().includes('quarto')) icon = '📚';

            return `
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; transition: border-color 0.2s;">
                
                <div style="flex: 1; min-width: 250px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 1.3rem;">${icon}</span>
                    <strong style="color: #fff; font-size: 1.05rem;">${task.title}</strong>
                    <span class="noble-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">
                      ${task.frequency === 'DAILY' ? 'Diária' : task.frequency}
                    </span>
                  </div>
                  <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">
                    ${task.description || 'Cumprir com capricho e dedicação.'}
                  </p>
                  <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.8rem; font-weight: 800;">
                    <span style="color: #f87171;">💪 +${task.reward_str_xp} XP STR</span>
                    <span style="color: #fde047;">💰 +${task.reward_gold} Ouro</span>
                    <span style="color: #60a5fa;">🎟️ +${task.reward_tokens} Ficha</span>
                    <span style="color: #a78bfa;">⚡ +${task.reward_xp} XP Geral</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                  ${task.today_pending ? `
                    <span class="noble-badge noble-badge-pending" style="padding: 8px 14px; font-size: 0.8rem;">
                      ⏳ Aguardando Aprovação dos Pais
                    </span>
                  ` : (task.today_approved ? `
                    <span class="noble-badge noble-badge-approved" style="padding: 8px 14px; font-size: 0.8rem;">
                      ✅ Concluída Hoje (+STR)
                    </span>
                  ` : `
                    <button 
                      class="btn-noble btn-noble-primary btn-noble-sm btn-submit-task-photo"
                      data-task-id="${task.id}"
                      data-task-title="${task.title}"
                    >
                      📸 Enviar Prova
                    </button>
                  `)}
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Ponto de Montagem de Modais -->
      <div id="tasks-modal-mount"></div>

    </div>
  `;
}

export function bindTasksEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');

  const btnRefresh = document.getElementById('btn-refresh-tasks');
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      btnRefresh.textContent = '⏳ Atualizando...';
      router.navigate('tasks');
    };
  }

  // 1. Abertura do Modal de Envio de Prova (Herói Filho)
  document.querySelectorAll('.btn-submit-task-photo').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.taskId;
      const taskTitle = btn.dataset.taskTitle;
      openSubmitProofModal(taskId, taskTitle);
    });
  });

  // 2. Abertura do Modal de Nova Missão (Pais)
  const btnNewTask = document.getElementById('btn-open-new-task-modal');
  if (btnNewTask) {
    btnNewTask.onclick = () => openNewTaskModal();
  }

  // 3. Clique nas Miniaturas para Ampliação
  document.querySelectorAll('.proof-thumbnail').forEach(img => {
    img.addEventListener('click', () => {
      openImagePreviewModal(img.dataset.img);
    });
  });

  // 4. Ações de Aprovação da Fila dos Pais
  document.querySelectorAll('.btn-approve-submission').forEach(btn => {
    btn.addEventListener('click', async () => {
      const submissionId = btn.dataset.id;
      const heroName = btn.dataset.hero;
      btn.disabled = true;
      btn.textContent = '⏳ Aprovando...';

      try {
        const res = await api.post(`/api/tasks/submissions/${submissionId}/approve`);
        if (res.str_leveled_up) {
          showFanfareModal(heroName, res.new_str, res.old_str);
        } else {
          showToast(res.message || 'Missão aprovada com sucesso!', 'success');
        }

        // Atualizar sessão do usuário caso ele seja o membro modificado
        await auth.checkSession();

        setTimeout(() => {
          router.navigate('tasks');
        }, 1200);
      } catch (err) {
        showToast(err.message || 'Erro ao aprovar submissão', 'danger');
        btn.disabled = false;
        btn.textContent = '✅ Aprovar (+STR)';
      }
    });
  });

  // 5. Ações de Rejeição da Fila dos Pais
  document.querySelectorAll('.btn-reject-submission').forEach(btn => {
    btn.addEventListener('click', async () => {
      const submissionId = btn.dataset.id;
      const feedback = prompt('Orientação para o herói caprichar mais na próxima (opcional):', 'Precisa organizar melhor os cantinhos!');
      if (feedback === null) return; // cancelou

      btn.disabled = true;
      btn.textContent = '⏳ Enviando...';

      try {
        await api.post(`/api/tasks/submissions/${submissionId}/reject`, { feedback });
        showToast('Submissão devolvida ao herói para melhoria.', 'gold');
        setTimeout(() => {
          router.navigate('tasks');
        }, 800);
      } catch (err) {
        showToast(err.message || 'Erro ao rejeitar', 'danger');
        btn.disabled = false;
        btn.textContent = '❌ Rejeitar';
      }
    });
  });
}

/**
 * Modal Nobre de Envio de Prova Fotográfica com Câmera / Upload e Preview
 */
function openSubmitProofModal(taskId, taskTitle) {
  const mount = document.getElementById('tasks-modal-mount');
  if (!mount) return;

  currentPreviewBase64 = null;

  mount.innerHTML = `
    <div class="noble-modal-backdrop" id="modal-submit-backdrop">
      <div class="noble-modal-content">
        <div class="noble-modal-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: 800; color: #fde047; text-transform: uppercase;">
              COMPROVAÇÃO DE MISSÃO
            </span>
            <h3 class="cinzel" style="color: #fff; font-size: 1.25rem;">${taskTitle}</h3>
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

  const backdrop = document.getElementById('modal-submit-backdrop');
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
      router.navigate('tasks');
    } catch (err) {
      showToast(err.message || 'Erro ao enviar prova', 'danger');
      btnConfirm.disabled = false;
      btnConfirm.textContent = '🚀 Enviar Prova';
    }
  };
}

/**
 * Modal Nobre para Criar Nova Missão (Pais)
 */
function openNewTaskModal() {
  const mount = document.getElementById('tasks-modal-mount');
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
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #f87171; margin-bottom: 4px;">
                💪 Bônus Força (STR XP):
              </label>
              <input type="number" id="new-task-str-xp" class="noble-input" value="25" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #fde047; margin-bottom: 4px;">
                💰 Ouro do Herói:
              </label>
              <input type="number" id="new-task-gold" class="noble-input" value="10" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #60a5fa; margin-bottom: 4px;">
                🎟️ Fichas do Lar:
              </label>
              <input type="number" id="new-task-tokens" class="noble-input" value="1" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #a78bfa; margin-bottom: 4px;">
                ⚡ XP de Aventureiro:
              </label>
              <input type="number" id="new-task-xp" class="noble-input" value="15" />
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
    const strXp = document.getElementById('new-task-str-xp')?.value;
    const gold = document.getElementById('new-task-gold')?.value;
    const tokens = document.getElementById('new-task-tokens')?.value;
    const xp = document.getElementById('new-task-xp')?.value;

    if (!title || !title.trim()) {
      alert('Por favor, informe o título da missão!');
      return;
    }

    try {
      await api.post('/api/tasks', {
        title: title.trim(),
        description: desc?.trim() || '',
        category: 'LAR',
        frequency: 'DAILY',
        reward_str_xp: Number(strXp) || 25,
        reward_gold: Number(gold) || 10,
        reward_tokens: Number(tokens) || 1,
        reward_xp: Number(xp) || 15,
      });

      showToast('🎉 Nova missão do lar criada com sucesso!', 'success');
      mountModal();
      router.navigate('tasks');
    } catch (err) {
      showToast(err.message || 'Erro ao criar missão', 'danger');
    }
  };
}

/**
 * Modal Nobre para Visualização de Imagem em Alta Resolução
 */
function openImagePreviewModal(imgSrc) {
  const mount = document.getElementById('tasks-modal-mount');
  if (!mount) return;

  mount.innerHTML = `
    <div class="noble-modal-backdrop" id="img-preview-backdrop">
      <div class="noble-modal-content" style="max-width: 600px; text-align: center;">
        <div class="noble-modal-header">
          <h4 class="cinzel gold-gradient-text" style="font-size: 1.1rem;">Foto da Comprovação</h4>
          <button class="noble-modal-close" id="btn-close-img-preview">&times;</button>
        </div>
        <img src="${imgSrc}" alt="Foto Comprovação" style="max-height: 450px; width: auto; max-width: 100%; border-radius: 12px; border: 2px solid var(--accent);" />
      </div>
    </div>
  `;

  document.getElementById('btn-close-img-preview').onclick = () => { mount.innerHTML = ''; };
  document.getElementById('img-preview-backdrop').onclick = (e) => {
    if (e.target.id === 'img-preview-backdrop') mount.innerHTML = '';
  };
}

export default { renderTasksView, bindTasksEvents };
