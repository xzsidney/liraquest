/**
 * LiraQuest - Módulo 1: Casa (Hábitos, Missões Domésticas & Patentes do Lar)
 * Fase 3: Modularização completa integrada aos Portais do Reino
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';
import { renderModuleNavbar, bindModuleNavbarEvents } from '../../components/ModuleNavbar.js';

// Estado Local do Módulo Casa
let currentCasaTab = 'mural'; // 'mural', 'validador', 'patentes'
let selectedPeriodFilter = 'TODOS'; // 'TODOS', 'MANHA', 'TARDE', 'NOITE', 'CONCLUIDAS'
let cachedTasks = [];
let pendingSubmissions = [];
let reviewedSubmissions = [];
let heroDashboardData = null;

// Categorização de período automática e amigável
function inferPeriod(task) {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  if (text.includes('cama') || text.includes('café') || text.includes('manha') || text.includes('manhã') || text.includes('acordar') || text.includes('dente') && !text.includes('noite')) {
    return 'MANHA';
  }
  if (text.includes('almoço') || text.includes('almoco') || text.includes('tarde') || text.includes('louça') || text.includes('louca') || text.includes('mesa') || text.includes('sapato')) {
    return 'TARDE';
  }
  if (text.includes('jantar') || text.includes('noite') || text.includes('banho') || text.includes('pijama') || text.includes('dormir') || text.includes('lixo')) {
    return 'NOITE';
  }
  return 'LIVRE';
}

function getPeriodMeta(period) {
  switch (period) {
    case 'MANHA':
      return { label: '☀️ Manhã', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    case 'TARDE':
      return { label: '🌤️ Tarde', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    case 'NOITE':
      return { label: '🌙 Noite', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
    default:
      return { label: '✨ Qualquer Hora', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  }
}

/**
 * Carrega dados do backend para o módulo
 */
async function loadCasaData() {
  const isParent = auth.isParent();
  try {
    const promises = [
      api.get('/api/tasks').catch(() => ({ tasks: [] })),
      api.get('/api/character/hero-dashboard').catch(() => null),
    ];

    if (isParent) {
      promises.push(api.get('/api/tasks/submissions/pending').catch(() => ({ submissions: [] })));
      promises.push(api.get('/api/tasks/submissions/reviewed').catch(() => ({ submissions: [] })));
    }

    const [tasksRes, heroDashRes, pendingRes, reviewedRes] = await Promise.all(promises);

    if (tasksRes && tasksRes.tasks) {
      cachedTasks = tasksRes.tasks;
    }
    if (heroDashRes && heroDashRes.success) {
      heroDashboardData = heroDashRes;
    }
    if (pendingRes && pendingRes.submissions) {
      pendingSubmissions = pendingRes.submissions;
    }
    if (reviewedRes && reviewedRes.submissions) {
      reviewedSubmissions = reviewedRes.submissions;
    }
  } catch (err) {
    console.error('Erro ao carregar dados do módulo Casa:', err);
  }
}

/**
 * Renderização Principal do Módulo Casa
 */
export async function renderCasaView() {
  await loadCasaData();

  const isParent = auth.isParent();
  const user = auth.getUser();
  const pendingCount = pendingSubmissions.length;
  const streak = heroDashboardData?.heroProgress?.current_streak || 0;
  const bestStreak = heroDashboardData?.heroProgress?.longest_streak || 0;
  const rankTitle = heroDashboardData?.heroProgress?.rankTitle || '🌱 Recruta do Lar';
  const heroLevel = heroDashboardData?.heroProgress?.level || 1;

  // Filtragem das tarefas
  let filteredTasks = cachedTasks.map(t => ({
    ...t,
    period: inferPeriod(t),
  }));

  if (selectedPeriodFilter === 'MANHA') {
    filteredTasks = filteredTasks.filter(t => t.period === 'MANHA');
  } else if (selectedPeriodFilter === 'TARDE') {
    filteredTasks = filteredTasks.filter(t => t.period === 'TARDE');
  } else if (selectedPeriodFilter === 'NOITE') {
    filteredTasks = filteredTasks.filter(t => t.period === 'NOITE');
  } else if (selectedPeriodFilter === 'CONCLUIDAS') {
    filteredTasks = filteredTasks.filter(t => t.submissions?.some(s => s.status === 'APPROVED'));
  }

  const topNavbarHtml = renderModuleNavbar({
    currentModule: 'casa',
    title: 'Módulo Casa & Hábitos do Lar',
    subtitle: 'Mural diário dividido por períodos, envio de fotos de comprovação, visto dos pais e evolução de patentes.',
    icon: '🏡',
    badges: [
      { label: `Streak: ${streak} Dias`, icon: '🔥', bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' },
      { label: rankTitle, icon: '🛡️', bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' },
    ],
    extraActionsHtml: isParent ? `
      <button id="btn-new-task" class="btn-noble btn-noble-gold btn-noble-sm">
        ➕ Nova Missão
      </button>
    ` : '',
  });

  return `
    <div class="module-casa-view" style="animation: fadeIn 0.3s ease;">
      
      <!-- BARRA SUPERIOR NOBRE DE NAVEGAÇÃO (FASE 5) -->
      ${topNavbarHtml}

      <!-- BARRA DE ABAS DO MÓDULO -->
      <div style="display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;">
        <button class="module-tab-btn ${currentCasaTab === 'mural' ? 'active' : ''}" id="tab-casa-mural">
          📋 Mural de Missões
        </button>

        ${isParent ? `
          <button class="module-tab-btn ${currentCasaTab === 'validador' ? 'active' : ''}" id="tab-casa-validador">
            🛡️ Painel do Mestre (Validador)
            ${pendingCount > 0 ? `<span style="background: #ef4444; color: #fff; font-size: 0.72rem; padding: 2px 7px; border-radius: 10px; margin-left: 4px;">${pendingCount}</span>` : ''}
          </button>
        ` : `
          <button class="module-tab-btn ${currentCasaTab === 'validador' ? 'active' : ''}" id="tab-casa-validador">
            ⏳ Minhas Comprovações
          </button>
        `}

        <button class="module-tab-btn ${currentCasaTab === 'patentes' ? 'active' : ''}" id="tab-casa-patentes">
          🏆 Streak & Patentes (${rankTitle.split(' ')[0]} Nv ${heroLevel})
        </button>
      </div>

      <!-- CONTEÚDO DA ABA 1: MURAL DE MISSÕES -->
      ${currentCasaTab === 'mural' ? `
        <!-- Filtros de Período -->
        <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-right: 4px;">Período:</span>
          <button class="btn-noble ${selectedPeriodFilter === 'TODOS' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm filter-period-btn" data-period="TODOS">
            Todas (${cachedTasks.length})
          </button>
          <button class="btn-noble ${selectedPeriodFilter === 'MANHA' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm filter-period-btn" data-period="MANHA">
            ☀️ Manhã
          </button>
          <button class="btn-noble ${selectedPeriodFilter === 'TARDE' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm filter-period-btn" data-period="TARDE">
            🌤️ Tarde
          </button>
          <button class="btn-noble ${selectedPeriodFilter === 'NOITE' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm filter-period-btn" data-period="NOITE">
            🌙 Noite
          </button>
          <button class="btn-noble ${selectedPeriodFilter === 'CONCLUIDAS' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm filter-period-btn" data-period="CONCLUIDAS">
            ✅ Concluídas
          </button>
        </div>

        <!-- Grid de Missões do Período -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
          ${filteredTasks.length === 0 ? `
            <div class="noble-card" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
              <div style="font-size: 3.5rem; margin-bottom: 12px;">🧹✨</div>
              <h3 class="cinzel" style="color: #ffffff; margin-bottom: 8px;">Tudo em ordem neste período!</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 460px; margin: 0 auto;">
                Nenhuma missão pendente para o filtro selecionado. Mantenha os bons hábitos para preservar o streak familiar!
              </p>
            </div>
          ` : filteredTasks.map(task => {
            const periodMeta = getPeriodMeta(task.period);
            const userSub = task.submissions && task.submissions[0];
            const isApproved = userSub && userSub.status === 'APPROVED';
            const isPending = userSub && userSub.status === 'PENDING';
            const isRejected = userSub && userSub.status === 'REJECTED';

            return `
              <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-color: ${isApproved ? 'rgba(34, 197, 94, 0.4)' : isPending ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.25)'}; position: relative;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <span style="font-size: 2rem;">${task.icon || '🧹'}</span>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <span style="background: ${periodMeta.bg}; color: ${periodMeta.color}; border: 1px solid ${periodMeta.color}44; padding: 2px 9px; border-radius: 14px; font-size: 0.72rem; font-weight: 800;">
                        ${periodMeta.label}
                      </span>
                      <span style="background: rgba(255, 255, 255, 0.08); color: #cbd5e1; padding: 2px 8px; border-radius: 14px; font-size: 0.72rem;">
                        ${task.difficulty === 'EASY' ? 'Fácil' : task.difficulty === 'HARD' ? 'Desafio' : 'Médio'}
                      </span>
                    </div>
                  </div>

                  <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px; font-weight: 700;">${task.title}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                    ${task.description || 'Cumprir a tarefa com capricho e respeito ao clã familiar.'}
                  </p>

                  <!-- Recompensas Claras -->
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
                    <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.3);">
                      🪙 +${task.gold_reward || 10} Ouro
                    </span>
                    <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.3);">
                      ⭐ +${task.xp_reward || 50} XP
                    </span>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3);">
                      ⚡ +${task.energy_reward || 2} Energia
                    </span>
                    <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.3);">
                      🎟️ +${task.token_reward || 10} Fichas
                    </span>
                  </div>
                </div>

                <!-- Ações e Status -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px;">
                  ${isApproved ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 8px 12px;">
                      <span style="color: #4ade80; font-size: 0.85rem; font-weight: 700;">✅ Missão Aprovada</span>
                      <span style="color: #94a3b8; font-size: 0.75rem;">Recompensas creditadas</span>
                    </div>
                  ` : isPending ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 8px 12px;">
                      <span style="color: #fbbf24; font-size: 0.85rem; font-weight: 700;">⏳ Aguardando Visto</span>
                      <span style="color: #cbd5e1; font-size: 0.75rem;">Comprovação enviada</span>
                    </div>
                  ` : `
                    <button class="btn-noble btn-noble-primary btn-noble-sm btn-submit-proof" data-task-id="${task.id}" data-task-title="${task.title.replace(/"/g, '&quot;')}" style="width: 100%;">
                      📸 Enviar Prova com Foto
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- CONTEÚDO DA ABA 2: PAINEL DO MESTRE (VALIDADOR DOS PAIS) -->
      ${currentCasaTab === 'validador' ? `
        ${!isParent ? `
          <div class="noble-card" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⏳📸</div>
            <h3 class="cinzel gold-gradient-text" style="margin-bottom: 8px;">Câmara de Visto dos Pais</h3>
            <p style="color: #cbd5e1; font-size: 0.9rem; max-width: 500px; margin: 0 auto 16px;">
              Aqui os Guardiões do Lar (pais) revisam as fotos enviadas pelos heróis e liberam o XP e Ouro.
              Quando você envia uma comprovação, ela aparece aqui instantaneamente para eles validarem!
            </p>
          </div>
        ` : `
          <!-- Visão Exclusiva dos Pais: Validador com 1 Clique -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 class="cinzel gold-gradient-text" style="font-size: 1.25rem; margin: 0;">
                🛡️ Comprovações Pendentes de Avaliação (${pendingSubmissions.length})
              </h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Aprove ou solicite ajuste com 1 clique</span>
            </div>

            ${pendingSubmissions.length === 0 ? `
              <div class="noble-card" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 3rem; margin-bottom: 12px;">🌟👏</div>
                <h3 class="cinzel" style="color: #ffffff; margin-bottom: 6px;">Nenhuma prova pendente!</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                  Todos os envios foram avaliados. Excelente gestão da guilda familiar!
                </p>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
                ${pendingSubmissions.map(sub => `
                  <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.4); display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; background: #1e3a8a; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; border: 1.5px solid var(--accent);">
                            ${sub.character?.avatar_value || '⚔️'}
                          </div>
                          <div>
                            <strong style="color: #ffffff; font-size: 0.95rem;">${sub.submitter?.name || 'Filho'}</strong>
                            <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">${new Date(sub.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 700;">
                          ⏳ Pendente
                        </span>
                      </div>

                      <h4 style="font-size: 1.1rem; color: #fde047; margin-bottom: 6px;">${sub.task?.title || 'Missão Doméstica'}</h4>
                      
                      <!-- Relato do Filho -->
                      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 2px;">Relato do herói:</span>
                        <p style="color: #ffffff; font-size: 0.88rem; margin: 0; font-style: italic;">
                          "${sub.proof_text || 'Missão concluída com capricho!'}"
                        </p>
                      </div>

                      <!-- Foto Anexada (se houver) -->
                      ${sub.proof_photo_url ? `
                        <div style="margin-bottom: 12px; border-radius: 12px; overflow: hidden; border: 1.5px solid rgba(212, 175, 55, 0.3); max-height: 220px; text-align: center; background: #000;">
                          <img src="${sub.proof_photo_url}" alt="Foto da Comprovação" style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;" onclick="window.open('${sub.proof_photo_url}', '_blank')">
                          <span style="font-size: 0.72rem; color: var(--accent); display: block; padding: 4px;">🔍 Clique na foto para ampliar</span>
                        </div>
                      ` : `
                        <div style="background: rgba(255, 255, 255, 0.04); border-radius: 10px; padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 12px;">
                          📷 Sem foto anexada (comprovado por texto)
                        </div>
                      `}

                      <!-- Recompensas a liberar -->
                      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">+${sub.task?.gold_reward || 10} 🪙</span>
                        <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">+${sub.task?.xp_reward || 50} ⭐</span>
                        <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">+${sub.task?.energy_reward || 2} ⚡</span>
                      </div>

                      <!-- Campo de Comentário dos Pais -->
                      <div>
                        <label style="display: block; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px;">Comentário de Incentivo (Opcional):</label>
                        <input type="text" id="feedback-input-${sub.id}" class="noble-input" placeholder="Ex: Parabéns pela dedicação! Quarto ficou nota 10!" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 8px 10px; border-radius: 8px; font-size: 0.82rem;">
                      </div>
                    </div>

                    <!-- Botões de Ação 1-Clique -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      <button class="btn-noble btn-noble-sm btn-review-approve" data-sub-id="${sub.id}" style="background: #10b981; border-color: #059669; color: #ffffff;">
                        🏆 Aprovar (+XP)
                      </button>
                      <button class="btn-noble btn-noble-secondary btn-noble-sm btn-review-reject" data-sub-id="${sub.id}" style="border-color: #ef4444; color: #f87171;">
                        ❌ Pedir Ajuste
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Histórico das Últimas Avaliações -->
          ${reviewedSubmissions.length > 0 ? `
            <div class="noble-card" style="margin-top: 24px; border-color: rgba(255, 255, 255, 0.1);">
              <h4 class="cinzel" style="color: #ffffff; margin-bottom: 12px; font-size: 1.05rem;">📜 Últimas Avaliações Concluídas</h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${reviewedSubmissions.slice(0, 5).map(rev => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-radius: 10px; font-size: 0.85rem;">
                    <div>
                      <strong style="color: #ffffff;">${rev.task?.title || 'Missão'}</strong>
                      <span style="color: var(--text-muted); font-size: 0.78rem; margin-left: 8px;">por ${rev.submitter?.name || 'Filho'}</span>
                    </div>
                    <span style="color: ${rev.status === 'APPROVED' ? '#4ade80' : '#f87171'}; font-weight: 700; font-size: 0.8rem;">
                      ${rev.status === 'APPROVED' ? '✅ Aprovada' : '❌ Reprovada'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `}
      ` : ''}

      <!-- CONTEÚDO DA ABA 3: STREAK & PATENTES DO LAR -->
      ${currentCasaTab === 'patentes' ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          
          <!-- Card de Streak & Sequência -->
          <div class="noble-card" style="border-color: rgba(245, 158, 11, 0.4); text-align: center; padding: 32px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 3.5rem; margin-bottom: 6px;">🔥</div>
            <div class="cinzel gold-gradient-text" style="font-size: 3.2rem; font-weight: 900; line-height: 1;">
              ${streak}
            </div>
            <div style="font-size: 0.95rem; color: #fde047; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; margin-bottom: 12px;">
              Dias Consecutivos (Streak Ativo)
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 300px; margin-bottom: 16px;">
              Cumprir tarefas todos os dias alimenta a fogueira da família e multiplica as recompensas de XP!
            </p>
            <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 8px 16px; font-size: 0.82rem; color: #fbbf24;">
              🏆 Recorde Histórico: <strong>${bestStreak} dias seguidos</strong>
            </div>
          </div>

          <!-- Card de Patente & Nível Real -->
          <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.4); padding: 26px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Patente da Vida Real</span>
                <h3 class="cinzel" style="color: #ffffff; font-size: 1.35rem; margin-top: 2px;">${rankTitle}</h3>
              </div>
              <span style="font-size: 2.2rem;">🛡️</span>
            </div>

            <!-- Barra de Progresso Real -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
                <span style="color: #93c5fd; font-weight: 700;">Nível ${heroLevel}</span>
                <span style="color: var(--text-muted);">${heroDashboardData?.heroProgress?.xpProgressPct || 0}% para o Nível ${heroLevel + 1}</span>
              </div>
              <div style="height: 10px; background: rgba(255, 255, 255, 0.08); border-radius: 6px; overflow: hidden; border: 1px solid rgba(59, 130, 246, 0.25);">
                <div style="height: 100%; width: ${heroDashboardData?.heroProgress?.xpProgressPct || 0}%; background: linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa); border-radius: 6px;"></div>
              </div>
            </div>

            <!-- Lista das 5 Patentes -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: ${heroLevel >= 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${heroLevel >= 1 ? '#22c55e44' : 'transparent'};">
                <span style="font-size: 0.85rem; color: #ffffff;">🌱 Recruta do Lar (Nv 1)</span>
                <span style="font-size: 0.75rem; color: ${heroLevel >= 1 ? '#4ade80' : '#64748b'}; font-weight: 700;">${heroLevel >= 1 ? 'Conquistada' : 'Bloqueada'}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: ${heroLevel >= 2 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${heroLevel >= 2 ? '#22c55e44' : 'transparent'};">
                <span style="font-size: 0.85rem; color: #ffffff;">⚔️ Herói Dedicado (Nv 2)</span>
                <span style="font-size: 0.75rem; color: ${heroLevel >= 2 ? '#4ade80' : '#64748b'}; font-weight: 700;">${heroLevel >= 2 ? 'Conquistada' : 'Bloqueada'}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: ${heroLevel >= 4 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${heroLevel >= 4 ? '#22c55e44' : 'transparent'};">
                <span style="font-size: 0.85rem; color: #ffffff;">🛡️ Guardião Exemplar (Nv 4)</span>
                <span style="font-size: 0.75rem; color: ${heroLevel >= 4 ? '#4ade80' : '#64748b'}; font-weight: 700;">${heroLevel >= 4 ? 'Conquistada' : 'Bloqueada'}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: ${heroLevel >= 7 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${heroLevel >= 7 ? '#22c55e44' : 'transparent'};">
                <span style="font-size: 0.85rem; color: #ffffff;">👑 Cavaleiro de Elite (Nv 7)</span>
                <span style="font-size: 0.75rem; color: ${heroLevel >= 7 ? '#4ade80' : '#64748b'}; font-weight: 700;">${heroLevel >= 7 ? 'Conquistada' : 'Bloqueada'}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: ${heroLevel >= 10 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${heroLevel >= 10 ? '#22c55e44' : 'transparent'};">
                <span style="font-size: 0.85rem; color: #ffffff;">🌟 Campeão Lendário (Nv 10)</span>
                <span style="font-size: 0.75rem; color: ${heroLevel >= 10 ? '#4ade80' : '#64748b'}; font-weight: 700;">${heroLevel >= 10 ? 'Conquistada' : 'Bloqueada'}</span>
              </div>
            </div>
          </div>

        </div>
      ` : ''}

    </div>
  `;
}

/**
 * Vinculação dos Eventos Interativos do Módulo Casa
 */
export function bindCasaEvents() {
  // Barra Superior Nobre de Navegação (Fase 5)
  bindModuleNavbarEvents();

  // Voltar ao Grande Salão (compatibilidade)
  const btnBack = document.getElementById('btn-back-salao');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Alternância de Abas
  const setupTab = (id, tabName) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = () => {
        currentCasaTab = tabName;
        router.navigate('casa');
      };
    }
  };
  setupTab('tab-casa-mural', 'mural');
  setupTab('tab-casa-validador', 'validador');
  setupTab('tab-casa-patentes', 'patentes');

  // Filtros de Período do Mural
  document.querySelectorAll('.filter-period-btn').forEach(btn => {
    btn.onclick = () => {
      selectedPeriodFilter = btn.dataset.period;
      router.navigate('casa');
    };
  });

  // Modal para Criar Nova Missão (Pais)
  const btnNewTask = document.getElementById('btn-new-task');
  if (btnNewTask) {
    btnNewTask.onclick = () => {
      showModal({
        title: '➕ Cadastrar Nova Missão da Casa',
        contentHtml: `
          <form id="form-create-task" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Título da Missão</label>
              <input type="text" id="task-title-input" class="noble-input" placeholder="Ex: Arrumar o Quarto, Lavar a Louça" required style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Descrição / Instruções</label>
              <textarea id="task-desc-input" class="noble-input" placeholder="Instruções claras do que precisa ser feito..." rows="2" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Dificuldade</label>
                <select id="task-diff-input" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
                  <option value="EASY">Fácil (+1 ⚡ / 10 🪙)</option>
                  <option value="MEDIUM" selected>Médio (+2 ⚡ / 15 🪙)</option>
                  <option value="HARD">Desafio (+4 ⚡ / 30 🪙)</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Exigir Foto?</label>
                <select id="task-proof-req-input" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
                  <option value="true" selected>Sim (Foto Obrigatória)</option>
                  <option value="false">Não (Apenas Relato)</option>
                </select>
              </div>
            </div>
          </form>
        `,
        confirmText: 'Lançar Missão no Mural',
        onConfirm: async () => {
          const title = document.getElementById('task-title-input')?.value?.trim();
          const desc = document.getElementById('task-desc-input')?.value?.trim();
          const difficulty = document.getElementById('task-diff-input')?.value || 'MEDIUM';
          const reqProof = document.getElementById('task-proof-req-input')?.value === 'true';

          if (!title) {
            showToast('Informe o título da missão.', 'warning');
            return false;
          }

          try {
            await api.post('/api/tasks', {
              title,
              description: desc,
              difficulty,
              requires_proof: reqProof,
              category: 'DOMESTIC',
              xp_reward: difficulty === 'EASY' ? 30 : difficulty === 'HARD' ? 80 : 50,
              gold_reward: difficulty === 'EASY' ? 10 : difficulty === 'HARD' ? 25 : 15,
              energy_reward: difficulty === 'EASY' ? 1 : difficulty === 'HARD' ? 4 : 2,
              token_reward: difficulty === 'EASY' ? 5 : difficulty === 'HARD' ? 20 : 10,
            });
            showToast('Missão lançada no mural da família!', 'success');
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

  // Botões para o Filho Enviar Prova com Foto
  document.querySelectorAll('.btn-submit-proof').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.dataset.taskId;
      const taskTitle = btn.dataset.taskTitle;
      openSubmitProofDialog(taskId, taskTitle);
    };
  });

  // Botões de Avaliação dos Pais (Aprovar / Reprovar 1-Clique)
  document.querySelectorAll('.btn-review-approve').forEach(btn => {
    btn.onclick = async () => {
      const subId = btn.dataset.subId;
      const feedbackInput = document.getElementById(`feedback-input-${subId}`);
      const feedback = feedbackInput?.value?.trim() || 'Muito bem! Missão aprovada com sucesso!';
      await reviewTaskSubmission(subId, 'APPROVED', feedback);
    };
  });

  document.querySelectorAll('.btn-review-reject').forEach(btn => {
    btn.onclick = async () => {
      const subId = btn.dataset.subId;
      const feedbackInput = document.getElementById(`feedback-input-${subId}`);
      const feedback = feedbackInput?.value?.trim() || 'Favor revisar a tarefa e enviar uma foto mais nítida.';
      await reviewTaskSubmission(subId, 'REJECTED', feedback);
    };
  });
}

/**
 * Modal com Foto e Câmera para Envio de Prova
 */
function openSubmitProofDialog(taskId, taskTitle) {
  let selectedFile = null;

  showModal({
    title: `📸 Comprovação: ${taskTitle}`,
    contentHtml: `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <p style="font-size: 0.88rem; color: #cbd5e1; margin: 0;">
          Tire uma foto do que você fez (quarto arrumado, louça limpa, etc.) ou escolha uma foto da galeria para seus pais avaliarem!
        </p>

        <!-- Preview da Imagem -->
        <div id="proof-preview-box" style="display: none; text-align: center; border-radius: 12px; overflow: hidden; border: 1.5px solid var(--accent); background: #000;">
          <img id="proof-preview-img" src="" alt="Preview" style="width: 100%; max-height: 220px; object-fit: cover;">
        </div>

        <!-- Seletor de Arquivo com Câmera -->
        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 6px;">
            📷 Tirar Foto pelo Celular ou Anexar Arquivo:
          </label>
          <input type="file" id="proof-file-input" accept="image/*" capture="environment" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 8px; font-size: 0.85rem;">
        </div>

        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Relato do que você fez:</label>
          <textarea id="proof-text-input" class="noble-input" placeholder="Ex: Deixei meu quarto impecável, a cama feita e o lixo recolhido!" rows="2" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px; font-size: 0.88rem;"></textarea>
        </div>

        <div id="upload-status-indicator" style="display: none; color: #38bdf8; font-size: 0.85rem; text-align: center;">
          ⏳ Enviando foto e comprovação para os pais...
        </div>
      </div>
    `,
    confirmText: '🚀 Enviar para os Pais',
    onConfirm: async () => {
      const fileInput = document.getElementById('proof-file-input');
      const text = document.getElementById('proof-text-input')?.value?.trim();
      const statusEl = document.getElementById('upload-status-indicator');

      let uploadedPhotoUrl = null;

      if (fileInput && fileInput.files && fileInput.files[0]) {
        if (statusEl) statusEl.style.display = 'block';
        const formData = new FormData();
        formData.append('photo', fileInput.files[0]);

        try {
          const uploadRes = await api.postForm('/api/upload/task-proof', formData);
          if (uploadRes && uploadRes.photo_url) {
            uploadedPhotoUrl = uploadRes.photo_url;
          }
        } catch (err) {
          console.warn('Erro ao fazer upload da imagem:', err);
          showToast('Não foi possível enviar a foto, enviando apenas o relato.', 'warning');
        }
      }

      try {
        await api.post(`/api/tasks/${taskId}/submit`, {
          proof_text: text || 'Missão cumprida!',
          proof_photo_url: uploadedPhotoUrl,
        });

        showToast('🎉 Comprovação enviada com sucesso para seus pais!', 'success');
        router.navigate('casa');
        return true;
      } catch (err) {
        showToast(err.message || 'Erro ao submeter comprovação.', 'error');
        return false;
      }
    }
  });

  // Handler para exibir o preview quando o arquivo for selecionado
  setTimeout(() => {
    const fileInput = document.getElementById('proof-file-input');
    const previewBox = document.getElementById('proof-preview-box');
    const previewImg = document.getElementById('proof-preview-img');

    if (fileInput && previewBox && previewImg) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            previewImg.src = re.target.result;
            previewBox.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }, 100);
}

/**
 * Realiza a avaliação da comprovação pelo Pai
 */
async function reviewTaskSubmission(submissionId, status, feedback) {
  try {
    const res = await api.post(`/api/tasks/submissions/${submissionId}/review`, {
      status,
      feedback,
    });

    if (status === 'APPROVED') {
      showToast('🏆 Missão aprovada com sucesso! XP e Ouro concedidos ao herói!', 'success');
    } else {
      showToast('Comprovação devolvida ao herói para ajustes.', 'info');
    }

    router.navigate('casa');
  } catch (err) {
    showToast(err.message || 'Erro ao avaliar submissão.', 'error');
  }
}
