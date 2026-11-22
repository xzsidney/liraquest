/**
 * LiraQuest - Mural de Tarefas do Lar & Mestria em Força (STR)
 * frontend/src/views/TasksView.js
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';
import { renderHeroHUD } from '../components/HeroHUD.js';
import {
  escapeHtml,
  formatFrequencyLabel,
  showToast,
  showFanfareModal,
  openSubmitProofModal,
  openNewTaskModal,
  openImagePreviewModal,
} from '../components/TaskModals.js';

let cachedTasks = [];
let cachedPendingSubmissions = [];
let cachedChildren = [];

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

  // 2. Se for pai, carregar fila de provas pendentes e lista de heróis filhos do clã
  if (isParent) {
    try {
      const pendingRes = await api.get('/api/tasks/submissions/pending');
      cachedPendingSubmissions = pendingRes.submissions || [];
    } catch (err) {
      console.warn('Erro ao buscar pendências:', err.message);
      cachedPendingSubmissions = [];
    }

    try {
      const childrenRes = await api.get('/api/family/children');
      cachedChildren = childrenRes.children || [];
    } catch (err) {
      console.warn('Erro ao buscar heróis do clã:', err.message);
      cachedChildren = [];
    }
  } else {
    cachedChildren = [];
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
                          ${escapeHtml(sub.member?.hero_nickname || 'Herói')} (${escapeHtml(sub.member?.name || '')})
                        </span>
                        <span class="noble-badge noble-badge-str">STR ${sub.member?.str || 10}</span>
                      </div>
                      <strong style="color: #fff; font-size: 1.05rem;">
                        ${escapeHtml(sub.task?.title || 'Tarefa do Lar')}
                      </strong>
                      ${sub.member_notes ? `
                        <p style="color: #cbd5e1; font-size: 0.82rem; font-style: italic; margin-top: 4px;">
                          "${escapeHtml(sub.member_notes)}"
                        </p>
                      ` : ''}
                      <div style="display: flex; gap: 10px; margin-top: 6px; font-size: 0.78rem; font-weight: 800;">
                        <span style="color: #f87171;">💪 +${sub.task?.reward_str_xp ?? 25} XP STR</span>
                        <span style="color: #fde047;">💰 +${sub.task?.reward_gold ?? 10} Ouro</span>
                        <span style="color: #60a5fa;">🎟️ +${sub.task?.reward_tokens ?? 1} Ficha</span>
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

            const rejectedSub = !task.today_pending && !task.today_approved && task.latest_submission?.status === 'REJECTED'
              ? task.latest_submission
              : null;

            return `
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid ${rejectedSub ? 'rgba(239, 68, 68, 0.45)' : 'rgba(212, 175, 55, 0.2)'}; border-radius: 14px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; transition: border-color 0.2s;">
                
                <div style="flex: 1; min-width: 250px;">
                  <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 1.3rem;">${icon}</span>
                    <strong style="color: #fff; font-size: 1.05rem;">${escapeHtml(task.title)}</strong>
                    <span class="noble-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">
                      ${formatFrequencyLabel(task.frequency)}
                    </span>
                    ${task.assignee ? `
                      <span class="noble-badge noble-badge-gold">
                        👤 ${escapeHtml(task.assignee.hero_nickname || task.assignee.name)}
                      </span>
                    ` : ''}
                  </div>
                  <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">
                    ${escapeHtml(task.description || 'Cumprir com capricho e dedicação.')}
                  </p>
                  ${rejectedSub ? `
                    <div class="task-rejection-feedback" style="margin-top: 8px; padding: 8px 12px; border-radius: 10px; background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.38); color: #fecaca; font-size: 0.82rem; line-height: 1.4;">
                      💬 <strong>Orientação dos Pais:</strong> "${escapeHtml(rejectedSub.parent_feedback || 'Capriche um pouco mais e envie novamente!')}"
                    </div>
                  ` : ''}
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
                      data-task-title="${escapeHtml(task.title)}"
                    >
                      ${rejectedSub ? '📸 Reenviar Prova' : '📸 Enviar Prova'}
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
      openSubmitProofModal({
        mountId: 'tasks-modal-mount',
        taskId,
        taskTitle,
        onSuccess: () => router.navigate('tasks'),
      });
    });
  });

  // 2. Abertura do Modal de Nova Missão (Pais)
  const btnNewTask = document.getElementById('btn-open-new-task-modal');
  if (btnNewTask) {
    btnNewTask.onclick = () => openNewTaskModal({
      mountId: 'tasks-modal-mount',
      children: cachedChildren,
      onSuccess: () => router.navigate('tasks'),
    });
  }

  // 3. Clique nas Miniaturas para Ampliação
  document.querySelectorAll('.proof-thumbnail').forEach(img => {
    img.addEventListener('click', () => {
      openImagePreviewModal('tasks-modal-mount', img.dataset.img);
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

        // Atualizar sessão do usuário caso ele seja o membro modificado
        await auth.checkSession();

        if (res.str_leveled_up) {
          showFanfareModal('tasks-modal-mount', heroName, res.new_str, res.old_str, () => router.navigate('tasks'));
        } else {
          showToast(res.message || 'Missão aprovada com sucesso!', 'success');
          setTimeout(() => {
            router.navigate('tasks');
          }, 800);
        }
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

export default { renderTasksView, bindTasksEvents };
