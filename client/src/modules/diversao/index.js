/**
 * LiraQuest - Módulo 4: Diversão (Agenda do Clã, Votação de Passeios & Loja do Lar)
 * Fase 4: Modularização completa integrada aos Portais do Reino
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

// Estado Local do Módulo Diversão
let currentDiversaoTab = 'agenda'; // 'agenda', 'votacao', 'loja'
let selectedEventCategory = 'TODOS';
let cachedEvents = [];
let cachedPolls = [];
let cachedRewards = [];
let cachedRedemptions = [];
let userTokens = 0;

/**
 * Carrega todos os dados necessários do backend
 */
async function loadDiversaoData() {
  const isParent = auth.isParent();
  try {
    const promises = [
      api.get('/api/fun/events').catch(() => ({ events: [] })),
      api.get('/api/fun/polls').catch(() => ({ polls: [] })),
      api.get('/api/rewards').catch(() => ({ rewards: [] })),
      api.get('/api/progress/me').catch(() => ({ progress: {} })),
      api.get('/api/rewards/redemptions/my').catch(() => ({ redemptions: [] })),
    ];

    if (isParent) {
      promises.push(api.get('/api/rewards/redemptions/family').catch(() => ({ redemptions: [] })));
    }

    const [eventsRes, pollsRes, rewardsRes, progressRes, myRedemptionsRes, familyRedemptionsRes] = await Promise.all(promises);

    if (eventsRes && eventsRes.events) cachedEvents = eventsRes.events;
    if (pollsRes && pollsRes.polls) cachedPolls = pollsRes.polls;
    if (rewardsRes && rewardsRes.rewards) cachedRewards = rewardsRes.rewards;
    if (progressRes && progressRes.progress) userTokens = progressRes.progress.family_tokens || 0;
    if (myRedemptionsRes && myRedemptionsRes.redemptions) cachedRedemptions = myRedemptionsRes.redemptions;
    if (familyRedemptionsRes && familyRedemptionsRes.redemptions) {
      // Para pais, combina lista familiar destacando pendentes
      cachedRedemptions = familyRedemptionsRes.redemptions;
    }
  } catch (err) {
    console.error('Erro ao carregar dados do módulo Diversão:', err);
  }
}

/**
 * Calcula dias restantes para uma data
 */
function getEventCountdown(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: '🎉 É HOJE!', color: '#4ade80', urgent: true };
  if (diffDays === 1) return { label: '⭐ Amanhã!', color: '#facc15', urgent: true };
  if (diffDays > 1) return { label: `Em ${diffDays} dias`, color: '#60a5fa', urgent: false };
  return { label: 'Realizado', color: '#94a3b8', urgent: false };
}

/**
 * Renderiza o Módulo Diversão
 */
export async function renderDiversaoView() {
  await loadDiversaoData();
  const isParent = auth.isParent();

  // Filtragem de eventos
  const filteredEvents = cachedEvents.filter((ev) => {
    if (selectedEventCategory === 'TODOS') return true;
    return ev.category === selectedEventCategory;
  });

  // Próximo evento em destaque
  const upcomingEvents = cachedEvents.filter((ev) => {
    const today = new Date().toISOString().split('T')[0];
    return ev.event_date >= today;
  });
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : (cachedEvents[0] || null);

  return `
    <div class="module-diversao-view">
      
      <!-- Cabeçalho Nobre do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(236, 72, 153, 0.45); background: linear-gradient(135deg, rgba(128, 0, 32, 0.4), rgba(30, 58, 138, 0.35));">
        <div class="module-title-box">
          <span class="icon">🎡</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Diversão & Conexão Familiar</h2>
            <p>Agenda de passeios e festas do clã, votação democrática de fim de semana e vitrine de vales com Fichas do Lar.</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; color: #fde047; display: flex; align-items: center; gap: 6px;">
            <span>🎟️</span>
            <span>${userTokens} Fichas do Lar</span>
          </div>
          <button id="btn-back-salao-diversao" class="btn-noble btn-noble-secondary btn-noble-sm">
            ⬅️ Voltar ao Salão
          </button>
        </div>
      </div>

      <!-- Abas de Navegação Interna -->
      <div class="submodules-tabs" style="display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; overflow-x: auto;">
        <button class="btn-noble ${currentDiversaoTab === 'agenda' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-diversao-btn" data-tab="agenda">
          📅 Agenda de Eventos do Clã (${cachedEvents.length})
        </button>
        <button class="btn-noble ${currentDiversaoTab === 'votacao' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-diversao-btn" data-tab="votacao">
          🗳️ Votação de Passeios (${cachedPolls.filter(p => p.status === 'OPEN').length} Ativa)
        </button>
        <button class="btn-noble ${currentDiversaoTab === 'loja' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-diversao-btn" data-tab="loja">
          🎟️ Loja do Lar & Vales Reais (${cachedRewards.length})
        </button>
      </div>

      <!-- ========================================================
           ABA 1: AGENDA DE EVENTOS DO CLÃ
           ======================================================== -->
      ${currentDiversaoTab === 'agenda' ? `
        <div class="tab-content-agenda">
          
          <!-- Banner Destaque do Próximo Evento -->
          ${nextEvent ? `
            <div class="noble-card" style="margin-bottom: 24px; border-color: rgba(236, 72, 153, 0.4); background: radial-gradient(circle at 90% 20%, rgba(236, 72, 153, 0.18), rgba(15, 23, 42, 0.85));">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; gap: 18px; align-items: center;">
                  <div style="font-size: 3.2rem; background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    ${nextEvent.icon || '📅'}
                  </div>
                  <div>
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #f472b6; font-weight: 800;">
                        Próximo Grande Momento da Família
                      </span>
                      ${(() => {
                        const countdown = getEventCountdown(nextEvent.event_date);
                        return `<span style="background: ${countdown.color}22; color: ${countdown.color}; border: 1px solid ${countdown.color}55; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;">${countdown.label}</span>`;
                      })()}
                    </div>
                    <h3 class="cinzel" style="font-size: 1.4rem; color: #ffffff; margin-bottom: 6px;">${nextEvent.title}</h3>
                    <p style="font-size: 0.88rem; color: #cbd5e1; max-width: 650px;">${nextEvent.description || 'Momento especial planejado com amor para toda a família.'}</p>
                  </div>
                </div>
                <div style="text-align: right; min-width: 140px;">
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Data Marcada</div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: #fde047;">
                    ${new Date(nextEvent.event_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </div>
                  <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 2px;">⏰ ${nextEvent.event_time || 'Horário a combinar'}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Controles & Filtros da Agenda -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-noble btn-noble-sm filter-event-btn ${selectedEventCategory === 'TODOS' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-category="TODOS">
                Todos (${cachedEvents.length})
              </button>
              <button class="btn-noble btn-noble-sm filter-event-btn ${selectedEventCategory === 'FAMILY_OUTING' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-category="FAMILY_OUTING">
                🌳 Passeios
              </button>
              <button class="btn-noble btn-noble-sm filter-event-btn ${selectedEventCategory === 'BIRTHDAY' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-category="BIRTHDAY">
                🎂 Aniversários
              </button>
              <button class="btn-noble btn-noble-sm filter-event-btn ${selectedEventCategory === 'SPECIAL_LUNCH' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-category="SPECIAL_LUNCH">
                🍕 Noites Especiais
              </button>
              <button class="btn-noble btn-noble-sm filter-event-btn ${selectedEventCategory === 'MEETING' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-category="MEETING">
                👥 Reuniões do Clã
              </button>
            </div>

            ${isParent ? `
              <button id="btn-new-clan-event" class="btn-noble btn-noble-primary btn-noble-sm">
                ➕ Novo Evento / Aniversário
              </button>
            ` : ''}
          </div>

          <!-- Grid de Eventos -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 18px;">
            ${filteredEvents.length === 0 ? `
              <div class="noble-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">📅✨</div>
                <h4 class="cinzel" style="color: #ffffff; margin-bottom: 6px;">Nenhum evento nesta categoria</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Cadastre novos aniversários ou saídas do fim de semana para movimentar a agenda familiar!</p>
              </div>
            ` : filteredEvents.map((ev) => {
              const countdown = getEventCountdown(ev.event_date);
              const formattedDate = new Date(ev.event_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return `
                <div class="noble-card" style="border-color: ${ev.color || 'rgba(236, 72, 153, 0.3)'}; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <span style="font-size: 2.2rem;">${ev.icon || '📅'}</span>
                      <div style="display: flex; gap: 6px; align-items: center;">
                        ${ev.is_recurring_yearly ? '<span style="background: rgba(245, 158, 11, 0.2); color: #facc15; padding: 2px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 700;">Anual 🔁</span>' : ''}
                        <span style="background: ${countdown.color}22; color: ${countdown.color}; border: 1px solid ${countdown.color}55; padding: 3px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 800;">
                          ${countdown.label}
                        </span>
                      </div>
                    </div>
                    
                    <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">${ev.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
                      ${ev.description || 'Passeio programado do clã.'}
                    </p>
                  </div>

                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.82rem; color: #cbd5e1;">
                      <span>📅 ${formattedDate}</span>
                      <span style="margin-left: 8px; color: #94a3b8;">⏰ ${ev.event_time || '12:00'}</span>
                    </div>

                    ${isParent ? `
                      <div style="display: flex; gap: 6px;">
                        <button class="btn-noble btn-noble-secondary btn-noble-sm btn-delete-event" data-id="${ev.id}" style="padding: 4px 8px; font-size: 0.75rem; color: #ef4444;" title="Excluir Evento">
                          🗑️
                        </button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ========================================================
           ABA 2: VOTAÇÃO FAMILIAR DE PASSEIOS
           ======================================================== -->
      ${currentDiversaoTab === 'votacao' ? `
        <div class="tab-content-votacao">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin-bottom: 4px;">Decisão Democrática do Clã</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Cada herói e guardião tem direito a 1 voto pelo celular. A opção mais votada é o destino do fim de semana!</p>
            </div>
            ${isParent ? `
              <button id="btn-new-poll" class="btn-noble btn-noble-primary btn-noble-sm">
                ➕ Nova Votação de Passeio
              </button>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${cachedPolls.length === 0 ? `
              <div class="noble-card" style="text-align: center; padding: 40px;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">🗳️🌴</div>
                <h4 class="cinzel" style="color: #ffffff; margin-bottom: 6px;">Nenhuma votação ativa no momento</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Os pais podem abrir uma enquete com 3 opções para escolher onde almoçar ou passear no sábado!</p>
              </div>
            ` : cachedPolls.map((poll) => {
              const isOpen = poll.status === 'OPEN';
              const winnerOpt = poll.options.find(o => o.id === poll.winner_option_id);

              return `
                <div class="noble-card" style="border-color: ${isOpen ? 'rgba(59, 130, 246, 0.4)' : 'rgba(212, 175, 55, 0.4)'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                    <div>
                      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                        <span style="background: ${isOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(212, 175, 55, 0.2)'}; color: ${isOpen ? '#60a5fa' : '#facc15'}; border: 1px solid ${isOpen ? 'rgba(59, 130, 246, 0.4)' : 'rgba(212, 175, 55, 0.4)'}; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;">
                          ${isOpen ? '🟢 Votação Aberta' : '🏆 Votação Encerrada'}
                        </span>
                        <span style="font-size: 0.8rem; color: #94a3b8;">🗳️ ${poll.total_votes} voto${poll.total_votes === 1 ? '' : 's'} registrado${poll.total_votes === 1 ? '' : 's'}</span>
                      </div>
                      <h3 class="cinzel" style="font-size: 1.3rem; color: #ffffff; margin-bottom: 4px;">${poll.title}</h3>
                      <p style="font-size: 0.86rem; color: #cbd5e1;">${poll.description || 'Escolha seu passeio favorito!'}</p>
                    </div>

                    ${isParent && isOpen ? `
                      <div style="display: flex; gap: 8px;">
                        <button class="btn-noble btn-noble-gold btn-noble-sm btn-close-poll" data-id="${poll.id}">
                          🏆 Encerrar & Proclamar Vencedor
                        </button>
                        <button class="btn-noble btn-noble-secondary btn-noble-sm btn-delete-poll" data-id="${poll.id}" style="color: #ef4444;">
                          🗑️
                        </button>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Se encerrada, exibe o campeão proclamado -->
                  ${!isOpen && winnerOpt ? `
                    <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 14px 18px; border-radius: 12px; margin-bottom: 18px; display: flex; align-items: center; gap: 14px;">
                      <span style="font-size: 2.5rem;">👑</span>
                      <div>
                        <strong style="color: #fde047; font-size: 1.1rem; display: block;">Passeio Vencedor: ${winnerOpt.title} (${winnerOpt.votes_count} votos)</strong>
                        <span style="font-size: 0.82rem; color: #e2e8f0;">O clã decidiu! Preparem-se para este grande momento de conexão familiar.</span>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Cards das Opções de Passeio -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                    ${poll.options.map((opt) => {
                      const isMyVote = poll.my_vote === opt.id;
                      const isWinner = !isOpen && poll.winner_option_id === opt.id;

                      return `
                        <div style="background: ${isMyVote ? 'rgba(30, 58, 138, 0.4)' : 'rgba(15, 23, 42, 0.75)'}; border: 2px solid ${isMyVote ? '#3b82f6' : (isWinner ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)')}; padding: 16px; border-radius: 14px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                          ${isMyVote ? `
                            <span style="position: absolute; top: -10px; right: 12px; background: #2563eb; color: #ffffff; padding: 2px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 800; border: 1px solid #60a5fa;">
                              Seu Voto ✓
                            </span>
                          ` : ''}
                          ${isWinner ? `
                            <span style="position: absolute; top: -10px; right: 12px; background: #d97706; color: #ffffff; padding: 2px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 800; border: 1px solid #fde047;">
                              🏆 Vencedor
                            </span>
                          ` : ''}

                          <div>
                            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
                              <span style="font-size: 2rem;">${opt.icon || '🎯'}</span>
                              <div>
                                <h4 style="font-size: 1.05rem; color: #ffffff; margin-bottom: 2px;">${opt.title}</h4>
                                <span style="font-size: 0.78rem; color: #94a3b8;">${opt.description || ''}</span>
                              </div>
                            </div>

                            <!-- Barra de Porcentagem de Votos -->
                            <div style="margin: 12px 0 8px;">
                              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 4px;">
                                <span>${opt.votes_count} voto${opt.votes_count === 1 ? '' : 's'}</span>
                                <strong style="color: ${isMyVote ? '#60a5fa' : '#fde047'};">${opt.percentage}%</strong>
                              </div>
                              <div style="height: 8px; background: rgba(0, 0, 0, 0.4); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08);">
                                <div style="width: ${opt.percentage}%; height: 100%; background: ${isMyVote ? 'linear-gradient(90deg, #2563eb, #60a5fa)' : 'linear-gradient(90deg, #d4af37, #f59e0b)'};"></div>
                              </div>
                            </div>

                            ${opt.voters && opt.voters.length > 0 ? `
                              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;">
                                👥 Votaram: <strong style="color: #cbd5e1;">${opt.voters.join(', ')}</strong>
                              </div>
                            ` : ''}
                          </div>

                          ${isOpen ? `
                            <button class="btn-noble ${isMyVote ? 'btn-noble-secondary' : 'btn-noble-primary'} btn-noble-sm btn-vote-option" data-poll-id="${poll.id}" data-opt-id="${opt.id}" style="width: 100%; margin-top: 14px;">
                              ${isMyVote ? '✓ Votado (Clique p/ Confirmar)' : '🗳️ Votar Nesta Opção'}
                            </button>
                          ` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ========================================================
           ABA 3: LOJA DO LAR & VALES REAIS
           ======================================================== -->
      ${currentDiversaoTab === 'loja' ? `
        <div class="tab-content-loja">
          
          <!-- Banner de Fichas do Lar -->
          <div class="noble-card" style="margin-bottom: 24px; border-color: rgba(212, 175, 55, 0.4); background: radial-gradient(circle at 10% 50%, rgba(212, 175, 55, 0.15), rgba(15, 23, 42, 0.85));">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
              <div style="display: flex; gap: 16px; align-items: center;">
                <span style="font-size: 3rem;">🎟️💎</span>
                <div>
                  <h3 class="cinzel gold-gradient-text" style="font-size: 1.35rem; margin-bottom: 4px;">Cofre de Fichas do Lar</h3>
                  <p style="font-size: 0.86rem; color: #cbd5e1;">Você ganha Fichas cumprindo tarefas da Casa e focando nos Estudos. Troque por recompensas reais combinadas com seus pais!</p>
                </div>
              </div>

              <div style="text-align: right; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(212, 175, 55, 0.3); padding: 10px 18px; border-radius: 14px;">
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">Seu Saldo Disponível</span>
                <span style="font-size: 1.8rem; font-weight: 900; color: #fde047;">${userTokens} <span style="font-size: 0.95rem;">Fichas</span></span>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
            <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff;">Vitrine de Vales & Benefícios do Clã</h3>
            ${isParent ? `
              <button id="btn-new-reward-vale" class="btn-noble btn-noble-primary btn-noble-sm">
                ➕ Criar Novo Vale da Família
              </button>
            ` : ''}
          </div>

          <!-- Grid dos Vales -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 18px; margin-bottom: 30px;">
            ${cachedRewards.map((r) => {
              const cost = r.token_cost || 10;
              const canAfford = userTokens >= cost;

              return `
                <div class="noble-card" style="border-color: rgba(236, 72, 153, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <span style="font-size: 2.2rem;">${r.icon || '🎁'}</span>
                      <span style="background: ${canAfford ? 'rgba(212, 175, 55, 0.2)' : 'rgba(239, 68, 68, 0.15)'}; color: ${canAfford ? '#fde047' : '#f87171'}; border: 1px solid ${canAfford ? 'rgba(212, 175, 55, 0.4)' : 'rgba(239, 68, 68, 0.3)'}; padding: 4px 10px; border-radius: 14px; font-size: 0.78rem; font-weight: 800;">
                        🎟️ ${cost} Fichas
                      </span>
                    </div>

                    <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">${r.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
                      ${r.description || 'Vale especial da família.'}
                    </p>
                  </div>

                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px;">
                    <button class="btn-noble ${canAfford ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-redeem-vale" data-id="${r.id}" data-title="${r.title}" data-cost="${cost}" style="width: 100%;">
                      ${canAfford ? '🎟️ Resgatar Este Vale' : `🔒 Faltam ${cost - userTokens} Fichas`}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Histórico de Resgates -->
          <div class="noble-card" style="border-color: rgba(255, 255, 255, 0.1);">
            <h4 class="cinzel" style="font-size: 1.15rem; color: #ffffff; margin-bottom: 14px;">
              ${isParent ? '📋 Pedidos de Resgate do Clã (Visto dos Pais)' : '📋 Meus Vales Resgatados'}
            </h4>

            ${cachedRedemptions.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 16px;">Nenhum vale resgatado ainda.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${cachedRedemptions.slice(0, 10).map((red) => {
                  const isPending = red.status === 'PENDING';
                  const isApproved = red.status === 'APPROVED' || red.status === 'DELIVERED';

                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.06); padding: 12px 16px; border-radius: 12px; flex-wrap: wrap; gap: 10px;">
                      <div>
                        <strong style="color: #ffffff; font-size: 0.95rem; display: block;">
                          ${red.reward?.title || 'Vale do Lar'}
                          ${red.user?.name ? `<span style="font-size: 0.8rem; color: #94a3b8; font-weight: normal;"> • Herói: ${red.user.name}</span>` : ''}
                        </strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">
                          Custo: ${red.token_cost} Fichas • ${new Date(red.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="background: ${isPending ? 'rgba(245, 158, 11, 0.2)' : (isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')}; color: ${isPending ? '#facc15' : (isApproved ? '#4ade80' : '#f87171')}; padding: 3px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 800;">
                          ${isPending ? '⏳ Aguardando Visto' : (isApproved ? '✅ Aprovado / Entregue' : '❌ Cancelado')}
                        </span>

                        ${isParent && isPending ? `
                          <button class="btn-noble btn-noble-primary btn-noble-sm btn-review-redemption" data-id="${red.id}" style="padding: 4px 10px; font-size: 0.75rem;">
                            ✓ Dar Visto & Liberar
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

        </div>
      ` : ''}

    </div>
  `;
}

/**
 * Vincula eventos interativos aos elementos do DOM
 */
export function bindDiversaoEvents() {
  // Voltar ao Grande Salão
  const btnBack = document.getElementById('btn-back-salao-diversao');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Alternância de Abas
  document.querySelectorAll('.tab-diversao-btn').forEach((btn) => {
    btn.onclick = () => {
      currentDiversaoTab = btn.getAttribute('data-tab');
      router.navigate('diversao');
    };
  });

  // Filtro de Categorias de Eventos
  document.querySelectorAll('.filter-event-btn').forEach((btn) => {
    btn.onclick = () => {
      selectedEventCategory = btn.getAttribute('data-category');
      router.navigate('diversao');
    };
  });

  // Excluir Evento
  document.querySelectorAll('.btn-delete-event').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Deseja realmente excluir este evento do calendário da família?')) return;
      try {
        await api.delete(`/api/fun/events/${id}`);
        showToast('Evento removido com sucesso!', 'success');
        router.navigate('diversao');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Modal: Novo Evento do Clã
  const btnNewEvent = document.getElementById('btn-new-clan-event');
  if (btnNewEvent) {
    btnNewEvent.onclick = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      showModal({
        title: '📅 Agendar Novo Evento do Clã',
        contentHtml: `
          <form id="form-new-event" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Título do Evento *</label>
              <input type="text" id="event-input-title" class="input-noble" placeholder="Ex: Noite da Pizza, Aniversário do Arthur" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Data do Evento *</label>
                <input type="date" id="event-input-date" class="input-noble" value="${tomorrowStr}" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Horário</label>
                <input type="time" id="event-input-time" class="input-noble" value="19:30" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Categoria</label>
                <select id="event-input-category" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
                  <option value="FAMILY_OUTING">🌳 Passeio Familiar</option>
                  <option value="BIRTHDAY">🎂 Aniversário</option>
                  <option value="SPECIAL_LUNCH">🍕 Almoço / Jantar Especial</option>
                  <option value="PARTY">🎉 Festa / Comemoração</option>
                  <option value="MEETING">👥 Reunião do Clã</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Ícone Emocional</label>
                <input type="text" id="event-input-icon" class="input-noble" value="🍕" placeholder="Ex: 🍕, 🎂, 🌳, 🎬" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Descrição & Detalhes</label>
              <textarea id="event-input-desc" rows="2" class="input-noble" placeholder="Ex: Rodízio de pizzas e partidas no salão de jogos..." style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;"></textarea>
            </div>

            <label style="display: flex; gap: 8px; align-items: center; font-size: 0.85rem; color: #cbd5e1; cursor: pointer;">
              <input type="checkbox" id="event-input-recurring">
              Repetir todos os anos (Aniversário recorrente)
            </label>
          </form>
        `,
        confirmText: 'Salvar Evento',
        onConfirm: async () => {
          const title = document.getElementById('event-input-title')?.value;
          const event_date = document.getElementById('event-input-date')?.value;
          const event_time = document.getElementById('event-input-time')?.value;
          const category = document.getElementById('event-input-category')?.value;
          const icon = document.getElementById('event-input-icon')?.value || '📅';
          const description = document.getElementById('event-input-desc')?.value;
          const is_recurring_yearly = document.getElementById('event-input-recurring')?.checked;

          if (!title || !event_date) {
            showToast('Por favor, informe o título e a data do evento.', 'error');
            return false;
          }

          try {
            await api.post('/api/fun/events', {
              title,
              event_date,
              event_time,
              category,
              icon,
              description,
              is_recurring_yearly,
            });
            showToast('Evento registrado com sucesso no calendário do clã! 🎉', 'success');
            router.navigate('diversao');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Votação de Passeios: Votar em uma opção
  document.querySelectorAll('.btn-vote-option').forEach((btn) => {
    btn.onclick = async () => {
      const pollId = btn.getAttribute('data-poll-id');
      const optionId = btn.getAttribute('data-opt-id');

      try {
        await api.post(`/api/fun/polls/${pollId}/vote`, { option_id: optionId });
        showToast('Seu voto foi registrado com sucesso! 🗳️✨', 'success');
        router.navigate('diversao');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Votação de Passeios: Encerrar Votação
  document.querySelectorAll('.btn-close-poll').forEach((btn) => {
    btn.onclick = async () => {
      const pollId = btn.getAttribute('data-id');
      if (!confirm('Deseja encerrar a votação e proclamar o passeio vencedor agora?')) return;

      try {
        const res = await api.post(`/api/fun/polls/${pollId}/close`);
        showToast('Votação encerrada! O passeio vencedor foi proclamado! 🏆', 'success');
        router.navigate('diversao');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Votação de Passeios: Excluir Votação
  document.querySelectorAll('.btn-delete-poll').forEach((btn) => {
    btn.onclick = async () => {
      const pollId = btn.getAttribute('data-id');
      if (!confirm('Deseja realmente excluir esta votação?')) return;

      try {
        await api.delete(`/api/fun/polls/${pollId}`);
        showToast('Votação excluída.', 'success');
        router.navigate('diversao');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Modal: Nova Votação de Passeio
  const btnNewPoll = document.getElementById('btn-new-poll');
  if (btnNewPoll) {
    btnNewPoll.onclick = () => {
      showModal({
        title: '🗳️ Nova Votação de Passeio Familiar',
        contentHtml: `
          <form id="form-new-poll" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Pergunta da Enquete *</label>
              <input type="text" id="poll-input-title" class="input-noble" value="Qual será o grande passeio deste fim de semana?" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>

            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 10px;">
              <strong style="font-size: 0.85rem; color: #fde047; display: block; margin-bottom: 8px;">Opção 1 de Passeio</strong>
              <div style="display: grid; grid-template-columns: 60px 1fr; gap: 8px;">
                <input type="text" id="poll-opt1-icon" value="🌳" style="padding: 6px; text-align: center; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
                <input type="text" id="poll-opt1-title" value="Parque / Piquenique" placeholder="Título" style="padding: 6px 10px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 10px;">
              <strong style="font-size: 0.85rem; color: #fde047; display: block; margin-bottom: 8px;">Opção 2 de Passeio</strong>
              <div style="display: grid; grid-template-columns: 60px 1fr; gap: 8px;">
                <input type="text" id="poll-opt2-icon" value="🍿" style="padding: 6px; text-align: center; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
                <input type="text" id="poll-opt2-title" value="Cinema & Pipoca" placeholder="Título" style="padding: 6px 10px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 10px;">
              <strong style="font-size: 0.85rem; color: #fde047; display: block; margin-bottom: 8px;">Opção 3 de Passeio</strong>
              <div style="display: grid; grid-template-columns: 60px 1fr; gap: 8px;">
                <input type="text" id="poll-opt3-icon" value="🍕" style="padding: 6px; text-align: center; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
                <input type="text" id="poll-opt3-title" value="Pizzaria / Hamburgueria" placeholder="Título" style="padding: 6px 10px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #ffffff;">
              </div>
            </div>
          </form>
        `,
        confirmText: 'Lançar Votação',
        onConfirm: async () => {
          const title = document.getElementById('poll-input-title')?.value;
          const opt1Title = document.getElementById('poll-opt1-title')?.value;
          const opt1Icon = document.getElementById('poll-opt1-icon')?.value || '🎯';
          const opt2Title = document.getElementById('poll-opt2-title')?.value;
          const opt2Icon = document.getElementById('poll-opt2-icon')?.value || '🎯';
          const opt3Title = document.getElementById('poll-opt3-title')?.value;
          const opt3Icon = document.getElementById('poll-opt3-icon')?.value || '🎯';

          if (!title || !opt1Title || !opt2Title) {
            showToast('Preencha o título e pelo menos 2 opções de passeio.', 'error');
            return false;
          }

          const options = [
            { id: 'opt_1', title: opt1Title, icon: opt1Icon },
            { id: 'opt_2', title: opt2Title, icon: opt2Icon },
          ];
          if (opt3Title) {
            options.push({ id: 'opt_3', title: opt3Title, icon: opt3Icon });
          }

          try {
            await api.post('/api/fun/polls', { title, options });
            showToast('Nova votação de passeio aberta para a família! 🗳️🎉', 'success');
            router.navigate('diversao');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Resgate de Vales
  document.querySelectorAll('.btn-redeem-vale').forEach((btn) => {
    btn.onclick = () => {
      const rewardId = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const cost = parseInt(btn.getAttribute('data-cost'), 10);

      if (userTokens < cost) {
        showToast(`Você precisa de mais ${cost - userTokens} Fichas do Lar para este vale. Cumpra mais tarefas!`, 'warning');
        return;
      }

      showModal({
        title: `🎟️ Confirmar Resgate: ${title}`,
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🎁✨</div>
            <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 10px;">
              Deseja resgatar <strong>"${title}"</strong> utilizando <strong>${cost} Fichas do Lar</strong>?
            </p>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
              Seu pedido será registrado e seus pais darão o visto para liberar o benefício na vida real!
            </p>
          </div>
        `,
        confirmText: 'Confirmar Resgate',
        onConfirm: async () => {
          try {
            await api.post(`/api/rewards/${rewardId}/redeem`);
            showToast(`Vale "${title}" resgatado com sucesso! Os pais já receberam a notificação! 🎉`, 'success');
            router.navigate('diversao');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  });

  // Modal: Criar Novo Vale da Família (Guardiões)
  const btnNewReward = document.getElementById('btn-new-reward-vale');
  if (btnNewReward) {
    btnNewReward.onclick = () => {
      showModal({
        title: '🎟️ Cadastrar Novo Vale do Lar',
        contentHtml: `
          <form id="form-new-reward" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Título do Vale *</label>
              <input type="text" id="reward-input-title" class="input-noble" placeholder="Ex: 1 Hora Extra de Videogame, Noite do Hambúrguer" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Custo em Fichas do Lar *</label>
                <input type="number" id="reward-input-cost" class="input-noble" value="20" min="1" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Ícone</label>
                <input type="text" id="reward-input-icon" class="input-noble" value="🎮" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Descrição & Regras do Benefício</label>
              <textarea id="reward-input-desc" rows="2" class="input-noble" placeholder="Ex: Válido no fim de semana após os deveres escolares estarem finalizados." style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;"></textarea>
            </div>
          </form>
        `,
        confirmText: 'Salvar Vale',
        onConfirm: async () => {
          const title = document.getElementById('reward-input-title')?.value;
          const token_cost = document.getElementById('reward-input-cost')?.value;
          const icon = document.getElementById('reward-input-icon')?.value || '🎁';
          const description = document.getElementById('reward-input-desc')?.value;

          if (!title || !token_cost) {
            showToast('Informe o título e o custo em fichas do vale.', 'error');
            return false;
          }

          try {
            await api.post('/api/rewards', {
              title,
              token_cost: parseInt(token_cost, 10),
              icon,
              description,
              category: 'ENTERTAINMENT',
            });
            showToast('Novo vale cadastrado na Loja do Lar com sucesso! 🎟️', 'success');
            router.navigate('diversao');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Avaliação de Resgates pelos Pais
  document.querySelectorAll('.btn-review-redemption').forEach((btn) => {
    btn.onclick = async () => {
      const redemptionId = btn.getAttribute('data-id');
      try {
        await api.post(`/api/rewards/redemptions/${redemptionId}/review`, { status: 'DELIVERED' });
        showToast('Vale aprovado e entregue na vida real! 🏆🎉', 'success');
        router.navigate('diversao');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });
}
