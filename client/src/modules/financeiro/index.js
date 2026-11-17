/**
 * LiraQuest - Módulo 6: Financeiro (Contas dos Pais, Cofre dos Filhos & Sonhos do Clã)
 * Fase 4: Modularização completa integrada aos Portais do Reino
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

// Estado Local do Módulo Financeiro
let currentFinanceiroTab = 'cofre_filhos'; // 'cofre_filhos', 'sonhos_cla', 'contas_pais'
let selectedBillFilter = 'TODOS'; // 'TODOS', 'PENDING', 'PAID'
let cachedBills = [];
let cachedBillsSummary = { total_pending: 0, total_paid: 0, total_month: 0, count_pending: 0, count_paid: 0, count_overdue: 0 };
let cachedVaults = [];
let childVaultData = null;
let childrenVaultsList = [];

/**
 * Carrega todos os dados do módulo Financeiro
 */
async function loadFinanceiroData() {
  const isParent = auth.isParent();
  try {
    const promises = [
      api.get('/api/finance/vaults').catch(() => ({ vaults: [] })),
      api.get('/api/finance/child-vault').catch(() => ({ my_vault: {}, children_vaults: [] })),
    ];

    if (isParent) {
      promises.push(api.get('/api/finance/bills').catch(() => ({ bills: [], summary: {} })));
    }

    const [vaultsRes, childRes, billsRes] = await Promise.all(promises);

    if (vaultsRes && vaultsRes.vaults) cachedVaults = vaultsRes.vaults;
    if (childRes) {
      childVaultData = childRes.my_vault || null;
      childrenVaultsList = childRes.children_vaults || [];
    }
    if (billsRes && billsRes.bills) {
      cachedBills = billsRes.bills;
      if (billsRes.summary) cachedBillsSummary = billsRes.summary;
    }
  } catch (err) {
    console.error('Erro ao carregar dados do módulo Financeiro:', err);
  }
}

/**
 * Retorna ícone da categoria de despesa doméstica
 */
function getBillCategoryIcon(category) {
  switch (category) {
    case 'ENERGY': return '💡';
    case 'WATER': return '💧';
    case 'INTERNET': return '🌐';
    case 'HOUSING': return '🏡';
    case 'SUPERMARKET': return '🛒';
    case 'STREAMING': return '📱';
    case 'EDUCATION': return '🎓';
    case 'HEALTH': return '🏥';
    default: return '📑';
  }
}

/**
 * Renderiza o Módulo Financeiro
 */
export async function renderFinanceiroView() {
  await loadFinanceiroData();
  const isParent = auth.isParent();
  const character = auth.getCharacter();
  const heroGold = childVaultData?.hero_gold ?? (character?.gold || 0);
  const savedGold = childVaultData?.saved_gold || 0;
  const allowanceBalance = childVaultData?.allowance_balance_brl || 0;
  const goalTitle = childVaultData?.goal_title || 'Meu Grande Sonho';
  const goalAmount = childVaultData?.goal_amount_brl || 50;
  const goalProgress = goalAmount > 0 ? Math.min(100, Math.round((allowanceBalance / goalAmount) * 100)) : 0;

  // Filtragem de contas
  const filteredBills = cachedBills.filter((b) => {
    if (selectedBillFilter === 'TODOS') return true;
    if (selectedBillFilter === 'PAID') return b.status === 'PAID';
    if (selectedBillFilter === 'PENDING') return b.status === 'PENDING' || b.status === 'OVERDUE';
    return true;
  });

  return `
    <div class="module-financeiro-view">
      
      <!-- Cabeçalho Nobre do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(212, 175, 55, 0.45); background: linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(128, 0, 32, 0.35));">
        <div class="module-title-box">
          <span class="icon">💰</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Tesouro & Finanças do Clã</h2>
            <p>Educação financeira dos heróis com poupança e mesada gamificada, metas coletivas dos sonhos da casa e provisão dos pais.</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; color: #fde047; display: flex; align-items: center; gap: 6px;">
            <span>🪙</span>
            <span>${heroGold} Ouro na Bolsa</span>
          </div>
          <button id="btn-back-salao-financeiro" class="btn-noble btn-noble-secondary btn-noble-sm">
            ⬅️ Voltar ao Salão
          </button>
        </div>
      </div>

      <!-- Abas de Navegação Interna -->
      <div class="submodules-tabs" style="display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; overflow-x: auto;">
        <button class="btn-noble ${currentFinanceiroTab === 'cofre_filhos' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-financeiro-btn" data-tab="cofre_filhos">
          🪙 Cofre & Mesada dos Filhos
        </button>
        <button class="btn-noble ${currentFinanceiroTab === 'sonhos_cla' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-financeiro-btn" data-tab="sonhos_cla">
          🏰 Sonhos do Clã (${cachedVaults.length} Metas)
        </button>
        <button class="btn-noble ${currentFinanceiroTab === 'contas_pais' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm tab-financeiro-btn" data-tab="contas_pais">
          📑 Contas do Mês (${isParent ? `${cachedBillsSummary.count_pending} Pendente` : 'Guardiões'})
        </button>
      </div>

      <!-- ========================================================
           ABA 1: COFRE & MESADA DOS FILHOS (EDUCAÇÃO FINANCEIRA)
           ======================================================== -->
      ${currentFinanceiroTab === 'cofre_filhos' ? `
        <div class="tab-content-cofre-filhos">
          
          <!-- Banner Principal do Cofrinho do Herói -->
          <div class="noble-card" style="margin-bottom: 24px; border-color: rgba(212, 175, 55, 0.4); background: radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.2), rgba(15, 23, 42, 0.9));">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
              <div>
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #fde047; font-weight: 800;">
                    Educação Financeira & Poupança do Aventureiro
                  </span>
                  <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 800;">
                    Taxa: 10 Ouro = R$ 1,00
                  </span>
                </div>
                <h3 class="cinzel" style="font-size: 1.5rem; color: #ffffff; margin-bottom: 6px;">Cofrinho de Poupança do Herói</h3>
                <p style="font-size: 0.88rem; color: #cbd5e1; max-width: 600px;">
                  O ouro que você ganha cumprindo missões da casa e nos estudos pode ser guardado no cofrinho e convertido em mesada real para comprar brinquedos ou jogos!
                </p>
              </div>

              <!-- Três Indicadores de Saldo -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 480px;">
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(212, 175, 55, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Bolsa de Aventuras</span>
                  <strong style="font-size: 1.35rem; color: #fde047;">${heroGold} 🪙</strong>
                </div>
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(59, 130, 246, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Poupança Cofrinho</span>
                  <strong style="font-size: 1.35rem; color: #60a5fa;">${savedGold} 🐷</strong>
                </div>
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(34, 197, 94, 0.3); padding: 12px; border-radius: 12px; text-align: center;">
                  <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Mesada Acumulada</span>
                  <strong style="font-size: 1.35rem; color: #4ade80;">R$ ${allowanceBalance.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <!-- Meta Pessoal do Herói -->
            <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.3rem;">🎯</span>
                  <strong style="color: #ffffff; font-size: 1rem;">Objetivo Pessoal: ${goalTitle}</strong>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-size: 0.85rem; color: #cbd5e1;">R$ ${allowanceBalance.toFixed(2)} / R$ ${goalAmount.toFixed(2)}</span>
                  <strong style="color: #fde047; font-size: 0.9rem;">(${goalProgress}%)</strong>
                </div>
              </div>
              <div style="height: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 10px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.3);">
                <div style="width: ${goalProgress}%; height: 100%; background: linear-gradient(90deg, #10b981, #fde047);"></div>
              </div>
            </div>

            <!-- Botões de Ações do Cofrinho -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
              <button id="btn-save-gold-piggy" class="btn-noble btn-noble-gold btn-noble-sm">
                🏦 Guardar Ouro na Poupança
              </button>
              <button id="btn-convert-gold-allowance" class="btn-noble btn-noble-primary btn-noble-sm">
                🔄 Converter Ouro em Mesada (R$)
              </button>
              <button id="btn-set-child-goal" class="btn-noble btn-noble-secondary btn-noble-sm">
                🎯 Alterar Meu Objetivo
              </button>
              ${savedGold > 0 ? `
                <button id="btn-withdraw-gold-piggy" class="btn-noble btn-noble-secondary btn-noble-sm" style="color: #cbd5e1;">
                  🪙 Resgatar p/ Aventuras
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Seção dos Pais: Visão de Todos os Filhos da Casa -->
          ${isParent && childrenVaultsList.length > 0 ? `
            <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.35); margin-top: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div>
                  <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin-bottom: 2px;">Central dos Guardiões: Mesada dos Heróis</h3>
                  <p style="font-size: 0.82rem; color: var(--text-muted);">Acompanhe a poupança de cada filho e registre o pagamento da mesada entregue na vida real.</p>
                </div>
                <span style="font-size: 1.8rem;">👨‍👩‍👧‍👦💵</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                ${childrenVaultsList.map((ch) => `
                  <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; border-radius: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                      <div>
                        <strong style="color: #ffffff; font-size: 1.1rem; display: block;">${ch.user_name}</strong>
                        <span style="font-size: 0.78rem; color: #60a5fa;">Herói: ${ch.hero_name}</span>
                      </div>
                      <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                        ${ch.saved_gold} Ouro Poupado
                      </span>
                    </div>

                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Mesada Acumulada:</span>
                        <strong style="color: #4ade80; font-size: 0.95rem;">R$ ${ch.allowance_balance_brl.toFixed(2)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #94a3b8;">
                        <span>🎯 Meta: ${ch.goal_title}</span>
                        <span>R$ ${ch.goal_amount_brl.toFixed(2)}</span>
                      </div>
                    </div>

                    <button class="btn-noble btn-noble-primary btn-noble-sm btn-pay-allowance" data-child-id="${ch.user_id}" data-child-name="${ch.user_name}" data-balance="${ch.allowance_balance_brl}" style="width: 100%;">
                      💵 Registrar Pagamento Real (R$ ${ch.allowance_balance_brl.toFixed(2)})
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      ` : ''}

      <!-- ========================================================
           ABA 2: COFRE DOS SONHOS DO CLÃ (METAS COMPARTILHADAS)
           ======================================================== -->
      ${currentFinanceiroTab === 'sonhos_cla' ? `
        <div class="tab-content-sonhos-cla">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin-bottom: 4px;">Grandes Conquistas Coletivas da Casa</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Metas de sonhos onde toda a família poupa e cumpre missões juntas para realizar viagens, reformas e passeios épicos.</p>
            </div>
            ${isParent ? `
              <button id="btn-new-clan-vault" class="btn-noble btn-noble-primary btn-noble-sm">
                ➕ Nova Meta do Clã
              </button>
            ` : ''}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            ${cachedVaults.length === 0 ? `
              <div class="noble-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">🏖️🏰</div>
                <h4 class="cinzel" style="color: #ffffff; margin-bottom: 6px;">Nenhuma meta ativa no momento</h4>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Os pais podem criar um cofre de viagem ou compra conjunta para unir o clã!</p>
              </div>
            ` : cachedVaults.map((vault) => {
              const isAchieved = vault.status === 'ACHIEVED' || vault.progress_percentage >= 100;

              return `
                <div class="noble-card" style="border-color: ${isAchieved ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.35)'}; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <span style="font-size: 2.5rem;">${vault.icon || '🏖️'}</span>
                      <span style="background: ${isAchieved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${isAchieved ? '#4ade80' : '#60a5fa'}; border: 1px solid ${isAchieved ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;">
                        ${isAchieved ? '🎉 Meta Atingida!' : `${vault.progress_percentage}% Concluído`}
                      </span>
                    </div>

                    <h4 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin-bottom: 6px;">${vault.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px;">
                      ${vault.description || 'Sonho coletivo do clã.'}
                    </p>

                    <!-- Barra 1: Progresso Financeiro (R$) -->
                    <div style="margin-bottom: 14px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">
                        <span>💰 Economia da Família</span>
                        <strong style="color: #fde047;">R$ ${vault.current_amount.toFixed(2)} / R$ ${vault.target_amount.toFixed(2)}</strong>
                      </div>
                      <div style="height: 10px; background: rgba(0, 0, 0, 0.4); border-radius: 8px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.3);">
                        <div style="width: ${vault.progress_percentage}%; height: 100%; background: linear-gradient(90deg, #d4af37, #f59e0b);"></div>
                      </div>
                    </div>

                    <!-- Barra 2: Progresso de Missões da Casa (Se houver meta de tarefas) -->
                    ${vault.target_tasks > 0 ? `
                      <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">
                          <span>🎯 Missões do Clã</span>
                          <strong style="color: #60a5fa;">${vault.current_tasks} / ${vault.target_tasks}</strong>
                        </div>
                        <div style="height: 10px; background: rgba(0, 0, 0, 0.4); border-radius: 8px; overflow: hidden; border: 1px solid rgba(59, 130, 246, 0.3);">
                          <div style="width: ${vault.task_progress_percentage}%; height: 100%; background: linear-gradient(90deg, #2563eb, #60a5fa);"></div>
                        </div>
                      </div>
                    ` : ''}
                  </div>

                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 14px; display: flex; gap: 8px;">
                    <button class="btn-noble btn-noble-gold btn-noble-sm btn-deposit-vault" data-id="${vault.id}" data-title="${vault.title}" style="flex: 1;">
                      🪙 Fazer Aporte no Cofre
                    </button>
                    ${isParent ? `
                      <button class="btn-noble btn-noble-secondary btn-noble-sm btn-delete-vault" data-id="${vault.id}" style="color: #ef4444;" title="Excluir Meta">
                        🗑️
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ========================================================
           ABA 3: CONTAS DO MÊS (ÁREA PRIVADA DOS PAIS)
           ======================================================== -->
      ${currentFinanceiroTab === 'contas_pais' ? `
        <div class="tab-content-contas-pais">
          
          ${!isParent ? `
            <!-- Visão Educativa para Filhos -->
            <div class="noble-card" style="border-color: rgba(128, 0, 32, 0.4); text-align: center; padding: 40px 20px;">
              <div style="font-size: 3.5rem; margin-bottom: 14px;">🏰🛡️</div>
              <h3 class="cinzel gold-gradient-text" style="font-size: 1.4rem; margin-bottom: 8px;">Área Privada dos Guardiões do Lar</h3>
              <p style="font-size: 0.95rem; color: #cbd5e1; max-width: 580px; margin: 0 auto 16px; line-height: 1.5;">
                Aqui seus pais cuidam da provisão da casa, contas de luz, água e internet. Como um herói, você pode ajudar a família apagando as luzes dos cômodos vazios e fechando as torneiras!
              </p>
              <span style="background: rgba(30, 58, 138, 0.3); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
                💡 Economizar na casa acelera as metas do nosso Cofre dos Sonhos!
              </span>
            </div>
          ` : `
            <!-- Painel de Gestão Completo dos Pais -->
            
            <!-- Cards Métricos do Mês -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
              <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.3); padding: 16px;">
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Total Previsto no Mês</span>
                <strong style="font-size: 1.45rem; color: #ffffff;">R$ ${cachedBillsSummary.total_month.toFixed(2)}</strong>
              </div>
              <div class="noble-card" style="border-color: rgba(245, 158, 11, 0.3); padding: 16px;">
                <span style="font-size: 0.78rem; color: #facc15; display: block; margin-bottom: 4px;">⏳ Pendente / A Pagar</span>
                <strong style="font-size: 1.45rem; color: #fde047;">R$ ${cachedBillsSummary.total_pending.toFixed(2)}</strong>
                <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 2px;">${cachedBillsSummary.count_pending} conta${cachedBillsSummary.count_pending === 1 ? '' : 's'}</span>
              </div>
              <div class="noble-card" style="border-color: rgba(34, 197, 94, 0.3); padding: 16px;">
                <span style="font-size: 0.78rem; color: #4ade80; display: block; margin-bottom: 4px;">✅ Contas Já Pagas</span>
                <strong style="font-size: 1.45rem; color: #4ade80;">R$ ${cachedBillsSummary.total_paid.toFixed(2)}</strong>
                <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 2px;">${cachedBillsSummary.count_paid} liquidada${cachedBillsSummary.count_paid === 1 ? '' : 's'}</span>
              </div>
              <div class="noble-card" style="border-color: rgba(239, 68, 68, 0.3); padding: 16px;">
                <span style="font-size: 0.78rem; color: #f87171; display: block; margin-bottom: 4px;">⚠️ Contas Vencidas</span>
                <strong style="font-size: 1.45rem; color: ${cachedBillsSummary.count_overdue > 0 ? '#ef4444' : '#4ade80'};">
                  ${cachedBillsSummary.count_overdue}
                </strong>
                <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 2px;">${cachedBillsSummary.count_overdue > 0 ? 'Atenção aos juros' : 'Tudo em dia ✓'}</span>
              </div>
            </div>

            <!-- Controles & Filtros -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; gap: 8px;">
                <button class="btn-noble btn-noble-sm filter-bill-btn ${selectedBillFilter === 'TODOS' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-filter="TODOS">
                  Todas (${cachedBills.length})
                </button>
                <button class="btn-noble btn-noble-sm filter-bill-btn ${selectedBillFilter === 'PENDING' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-filter="PENDING">
                  ⏳ Pendentes (${cachedBillsSummary.count_pending})
                </button>
                <button class="btn-noble btn-noble-sm filter-bill-btn ${selectedBillFilter === 'PAID' ? 'btn-noble-gold' : 'btn-noble-secondary'}" data-filter="PAID">
                  ✅ Pagas (${cachedBillsSummary.count_paid})
                </button>
              </div>

              <button id="btn-new-bill" class="btn-noble btn-noble-primary btn-noble-sm">
                ➕ Nova Conta Doméstica
              </button>
            </div>

            <!-- Lista de Contas -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${filteredBills.length === 0 ? `
                <div class="noble-card" style="text-align: center; padding: 30px;">
                  <p style="color: var(--text-muted); font-size: 0.88rem;">Nenhuma conta encontrada neste filtro.</p>
                </div>
              ` : filteredBills.map((bill) => {
                const isPaid = bill.status === 'PAID';
                const isOverdue = bill.status === 'OVERDUE';
                const icon = getBillCategoryIcon(bill.category);

                return `
                  <div class="noble-card" style="border-color: ${isPaid ? 'rgba(34, 197, 94, 0.25)' : (isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.25)')}; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; gap: 14px; align-items: center;">
                      <span style="font-size: 2rem;">${icon}</span>
                      <div>
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;">
                          <h4 style="font-size: 1.1rem; color: #ffffff; margin: 0;">${bill.title}</h4>
                          <span style="background: ${isPaid ? 'rgba(34, 197, 94, 0.2)' : (isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)')}; color: ${isPaid ? '#4ade80' : (isOverdue ? '#f87171' : '#facc15')}; padding: 2px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 800;">
                            ${isPaid ? '✓ PAGO' : (isOverdue ? '⚠️ VENCIDA' : '⏳ A VENCER')}
                          </span>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">
                          Vencimento: <strong>${new Date(bill.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> • Método: ${bill.payment_method || 'PIX'}
                        </span>
                        ${bill.notes ? `<p style="font-size: 0.76rem; color: #94a3b8; margin-top: 4px;">${bill.notes}</p>` : ''}
                      </div>
                    </div>

                    <div style="display: flex; gap: 14px; align-items: center;">
                      <strong style="font-size: 1.3rem; color: ${isPaid ? '#4ade80' : '#fde047'};">
                        R$ ${bill.amount.toFixed(2)}
                      </strong>

                      <div style="display: flex; gap: 8px;">
                        <button class="btn-noble ${isPaid ? 'btn-noble-secondary' : 'btn-noble-primary'} btn-noble-sm btn-toggle-bill" data-id="${bill.id}">
                          ${isPaid ? '↩️ Reabrir' : '✅ Marcar como Pago'}
                        </button>
                        <button class="btn-noble btn-noble-secondary btn-noble-sm btn-delete-bill" data-id="${bill.id}" style="color: #ef4444;" title="Excluir Conta">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

        </div>
      ` : ''}

    </div>
  `;
}

/**
 * Vincula eventos interativos aos elementos do DOM
 */
export function bindFinanceiroEvents() {
  // Voltar ao Grande Salão
  const btnBack = document.getElementById('btn-back-salao-financeiro');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Alternância de Abas
  document.querySelectorAll('.tab-financeiro-btn').forEach((btn) => {
    btn.onclick = () => {
      currentFinanceiroTab = btn.getAttribute('data-tab');
      router.navigate('financeiro');
    };
  });

  // Filtros de Contas
  document.querySelectorAll('.filter-bill-btn').forEach((btn) => {
    btn.onclick = () => {
      selectedBillFilter = btn.getAttribute('data-filter');
      router.navigate('financeiro');
    };
  });

  // Alternar Status da Conta (Pago / Pendente)
  document.querySelectorAll('.btn-toggle-bill').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      try {
        const res = await api.patch(`/api/finance/bills/${id}/toggle`);
        showToast(res.message || 'Status da conta atualizado!', 'success');
        router.navigate('financeiro');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Excluir Conta
  document.querySelectorAll('.btn-delete-bill').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Deseja realmente remover esta conta do controle doméstico?')) return;
      try {
        await api.delete(`/api/finance/bills/${id}`);
        showToast('Conta removida com sucesso.', 'success');
        router.navigate('financeiro');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Modal: Nova Conta Doméstica (Guardiões)
  const btnNewBill = document.getElementById('btn-new-bill');
  if (btnNewBill) {
    btnNewBill.onclick = () => {
      const today = new Date().toISOString().split('T')[0];
      showModal({
        title: '📑 Cadastrar Conta Doméstica',
        contentHtml: `
          <form id="form-new-bill" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Nome / Título da Despesa *</label>
              <input type="text" id="bill-input-title" class="input-noble" placeholder="Ex: Conta de Luz (Enel), Internet Fibra, Condomínio" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Categoria</label>
                <select id="bill-input-category" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
                  <option value="ENERGY">💡 Energia / Luz</option>
                  <option value="WATER">💧 Água / Saneamento</option>
                  <option value="INTERNET">🌐 Internet / Telefonia</option>
                  <option value="HOUSING">🏡 Condomínio / Aluguel</option>
                  <option value="SUPERMARKET">🛒 Mercado & Feira</option>
                  <option value="STREAMING">📱 Assinaturas & Streaming</option>
                  <option value="EDUCATION">🎓 Escola / Cursos</option>
                  <option value="HEALTH">🏥 Saúde & Farmácia</option>
                  <option value="OTHER">📑 Outra Despesa</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Valor (R$) *</label>
                <input type="number" id="bill-input-amount" step="0.01" min="0" placeholder="0.00" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Vencimento *</label>
                <input type="date" id="bill-input-due" value="${today}" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Forma de Pagamento</label>
                <select id="bill-input-method" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Débito Automático">Débito Automático</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Anotações / Chave PIX / Código de Barras</label>
              <textarea id="bill-input-notes" rows="2" placeholder="Opcional: chave PIX ou observação..." style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;"></textarea>
            </div>
          </form>
        `,
        confirmText: 'Salvar Conta',
        onConfirm: async () => {
          const title = document.getElementById('bill-input-title')?.value;
          const category = document.getElementById('bill-input-category')?.value;
          const amount = document.getElementById('bill-input-amount')?.value;
          const due_date = document.getElementById('bill-input-due')?.value;
          const payment_method = document.getElementById('bill-input-method')?.value;
          const notes = document.getElementById('bill-input-notes')?.value;

          if (!title || !amount || !due_date) {
            showToast('Preencha o título, valor e vencimento da conta.', 'error');
            return false;
          }

          try {
            await api.post('/api/finance/bills', {
              title,
              category,
              amount: parseFloat(amount),
              due_date,
              payment_method,
              notes,
            });
            showToast('Conta cadastrada com sucesso! 📑✅', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Aporte no Cofre do Clã
  document.querySelectorAll('.btn-deposit-vault').forEach((btn) => {
    btn.onclick = () => {
      const vaultId = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');

      showModal({
        title: `🪙 Aporte no Sonho: ${title}`,
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🏰🪙</div>
            <p style="color: #cbd5e1; font-size: 0.92rem; margin-bottom: 16px;">
              Informe o valor em Reais que a família está guardando agora para atingir este grande objetivo:
            </p>
            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 14px;">
              <button type="button" class="btn-noble btn-noble-secondary btn-noble-sm btn-quick-deposit" data-val="50">+ R$ 50</button>
              <button type="button" class="btn-noble btn-noble-secondary btn-noble-sm btn-quick-deposit" data-val="100">+ R$ 100</button>
              <button type="button" class="btn-noble btn-noble-secondary btn-noble-sm btn-quick-deposit" data-val="200">+ R$ 200</button>
            </div>
            <input type="number" id="deposit-input-amount" step="10" min="1" value="50" style="width: 160px; text-align: center; font-size: 1.3rem; font-weight: 800; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,175,55,0.4); border-radius: 8px; color: #fde047;">
          </div>
        `,
        confirmText: 'Confirmar Depósito',
        onConfirm: async () => {
          const val = document.getElementById('deposit-input-amount')?.value;
          if (!val || parseFloat(val) <= 0) {
            showToast('Informe um valor de aporte válido.', 'error');
            return false;
          }

          try {
            const res = await api.post(`/api/finance/vaults/${vaultId}/deposit`, { amount: parseFloat(val) });
            showToast(res.message || 'Aporte realizado com sucesso no Cofre do Clã! 🏖️✨', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });

      // Quick buttons no modal
      setTimeout(() => {
        document.querySelectorAll('.btn-quick-deposit').forEach((qb) => {
          qb.onclick = () => {
            const input = document.getElementById('deposit-input-amount');
            if (input) input.value = qb.getAttribute('data-val');
          };
        });
      }, 50);
    };
  });

  // Modal: Nova Meta do Clã (Guardiões)
  const btnNewVault = document.getElementById('btn-new-clan-vault');
  if (btnNewVault) {
    btnNewVault.onclick = () => {
      showModal({
        title: '🏰 Nova Meta de Sonho do Clã',
        contentHtml: `
          <form id="form-new-vault" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Título da Meta Familiar *</label>
              <input type="text" id="vault-input-title" class="input-noble" placeholder="Ex: Viagem de Férias na Praia, Novo Console, Reforma do Quarto" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Valor Alvo (R$) *</label>
                <input type="number" id="vault-input-target" step="50" min="10" value="1500" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Ícone Emocional</label>
                <input type="text" id="vault-input-icon" class="input-noble" value="🏖️" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Meta de Missões (Opcional)</label>
                <input type="number" id="vault-input-tasks" min="0" value="300" placeholder="Ex: 300 missões" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Categoria</label>
                <select id="vault-input-category" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
                  <option value="TRIP">🏖️ Viagem de Férias</option>
                  <option value="RENOVATION">🛠️ Reforma / Casa</option>
                  <option value="PURCHASE">🎮 Compra Coletiva / Videogame</option>
                  <option value="EXPERIENCE">🎢 Passeio Especial</option>
                  <option value="SAVINGS">🏦 Fundo de Reserva</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Descrição & Motivação</label>
              <textarea id="vault-input-desc" rows="2" placeholder="O que faremos juntos quando batermos esta meta?" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;"></textarea>
            </div>
          </form>
        `,
        confirmText: 'Criar Meta do Clã',
        onConfirm: async () => {
          const title = document.getElementById('vault-input-title')?.value;
          const target_amount = document.getElementById('vault-input-target')?.value;
          const icon = document.getElementById('vault-input-icon')?.value || '🏰';
          const target_tasks = document.getElementById('vault-input-tasks')?.value || 0;
          const category = document.getElementById('vault-input-category')?.value;
          const description = document.getElementById('vault-input-desc')?.value;

          if (!title || !target_amount) {
            showToast('Informe o título e o valor alvo da meta.', 'error');
            return false;
          }

          try {
            await api.post('/api/finance/vaults', {
              title,
              target_amount: parseFloat(target_amount),
              icon,
              target_tasks: parseInt(target_tasks, 10),
              category,
              description,
            });
            showToast('Nova meta de sonho cadastrada no Clã com sucesso! 🏖️✨', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Excluir Meta do Clã
  document.querySelectorAll('.btn-delete-vault').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Deseja realmente remover esta meta do clã?')) return;
      try {
        await api.delete(`/api/finance/vaults/${id}`);
        showToast('Meta removida.', 'success');
        router.navigate('financeiro');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Guardar Ouro na Poupança (Herói)
  const btnSaveGold = document.getElementById('btn-save-gold-piggy');
  if (btnSaveGold) {
    btnSaveGold.onclick = () => {
      showModal({
        title: '🏦 Guardar no Cofrinho de Poupança',
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🐷🪙</div>
            <p style="color: #cbd5e1; font-size: 0.92rem; margin-bottom: 14px;">
              Quantas moedas de Ouro da sua bolsa você deseja guardar na poupança segura?
            </p>
            <input type="number" id="piggy-deposit-amount" value="50" min="5" step="5" style="width: 140px; text-align: center; font-size: 1.4rem; font-weight: 800; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,175,55,0.4); border-radius: 8px; color: #fde047;">
          </div>
        `,
        confirmText: 'Guardar Moedas',
        onConfirm: async () => {
          const val = document.getElementById('piggy-deposit-amount')?.value;
          if (!val || parseInt(val, 10) <= 0) {
            showToast('Informe uma quantidade válida de ouro.', 'error');
            return false;
          }

          try {
            const res = await api.post('/api/finance/child-vault/deposit', { gold_amount: parseInt(val, 10) });
            showToast(res.message || 'Ouro guardado no cofrinho com sucesso!', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Resgatar Ouro da Poupança para Aventuras
  const btnWithdrawGold = document.getElementById('btn-withdraw-gold-piggy');
  if (btnWithdrawGold) {
    btnWithdrawGold.onclick = () => {
      showModal({
        title: '🪙 Resgatar Ouro para a Bolsa',
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚔️🪙</div>
            <p style="color: #cbd5e1; font-size: 0.92rem; margin-bottom: 14px;">
              Quantas moedas de Ouro deseja retirar do cofrinho para gastar em batalhas ou compras mágicas?
            </p>
            <input type="number" id="piggy-withdraw-amount" value="20" min="5" step="5" style="width: 140px; text-align: center; font-size: 1.4rem; font-weight: 800; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(59,130,246,0.4); border-radius: 8px; color: #60a5fa;">
          </div>
        `,
        confirmText: 'Resgatar Ouro',
        onConfirm: async () => {
          const val = document.getElementById('piggy-withdraw-amount')?.value;
          try {
            const res = await api.post('/api/finance/child-vault/withdraw', { gold_amount: parseInt(val, 10) });
            showToast(res.message || 'Ouro transferido para sua bolsa!', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Converter Ouro em Mesada Real
  const btnConvertGold = document.getElementById('btn-convert-gold-allowance');
  if (btnConvertGold) {
    btnConvertGold.onclick = () => {
      showModal({
        title: '🔄 Converter Ouro em Mesada Real',
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🪙➡️💵</div>
            <p style="color: #cbd5e1; font-size: 0.92rem; margin-bottom: 12px;">
              Regra da Família: <strong>Cada 10 Moedas de Ouro poupadas = R$ 1,00 de Mesada Real!</strong>
            </p>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">
              Quantas moedas de ouro do seu cofrinho você quer converter em mesada agora?
            </p>
            <input type="number" id="convert-input-gold" value="50" min="10" step="10" style="width: 140px; text-align: center; font-size: 1.4rem; font-weight: 800; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(34,197,94,0.4); border-radius: 8px; color: #4ade80;">
          </div>
        `,
        confirmText: 'Converter em Reais',
        onConfirm: async () => {
          const val = document.getElementById('convert-input-gold')?.value;
          try {
            const res = await api.post('/api/finance/child-vault/convert', { gold_to_convert: parseInt(val, 10) });
            showToast(res.message || 'Moedas convertidas em mesada real! 🎉💵', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Alterar Objetivo Pessoal do Herói
  const btnSetGoal = document.getElementById('btn-set-child-goal');
  if (btnSetGoal) {
    btnSetGoal.onclick = () => {
      showModal({
        title: '🎯 Meu Sonho & Objetivo de Poupança',
        contentHtml: `
          <form id="form-child-goal" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">O que você quer comprar com sua mesada? *</label>
              <input type="text" id="goal-input-title" value="${childVaultData?.goal_title || ''}" placeholder="Ex: Lego Star Wars, Jogo de Nintendo Switch, Patinete" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">Quanto custa na vida real? (R$) *</label>
              <input type="number" id="goal-input-amount" step="5" min="1" value="${childVaultData?.goal_amount_brl || 50}" required style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #ffffff;">
            </div>
          </form>
        `,
        confirmText: 'Salvar Meu Sonho',
        onConfirm: async () => {
          const goal_title = document.getElementById('goal-input-title')?.value;
          const goal_amount_brl = document.getElementById('goal-input-amount')?.value;

          if (!goal_title || !goal_amount_brl) {
            showToast('Preencha o título e o valor do seu objetivo.', 'error');
            return false;
          }

          try {
            await api.post('/api/finance/child-vault/goal', {
              goal_title,
              goal_amount_brl: parseFloat(goal_amount_brl),
            });
            showToast('Objetivo atualizado! Foque nas tarefas para conquistar seu sonho! 🎯✨', 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  }

  // Registrar Pagamento da Mesada Real (Pais)
  document.querySelectorAll('.btn-pay-allowance').forEach((btn) => {
    btn.onclick = () => {
      const childId = btn.getAttribute('data-child-id');
      const childName = btn.getAttribute('data-child-name');
      const balance = parseFloat(btn.getAttribute('data-balance')) || 0;

      if (balance <= 0) {
        showToast(`${childName} ainda não possui saldo de mesada acumulado para receber.`, 'warning');
        return;
      }

      showModal({
        title: `💵 Pagar Mesada: ${childName}`,
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">💵🤝</div>
            <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 12px;">
              Saldo acumulado de ${childName}: <strong>R$ ${balance.toFixed(2)}</strong>.
            </p>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">
              Ao confirmar, você registra que entregou o valor em dinheiro vivo ou transferiu na vida real, dando baixa no saldo do herói.
            </p>
            <div style="margin-bottom: 8px;">
              <label style="font-size: 0.8rem; color: #cbd5e1; display: block; margin-bottom: 4px;">Valor Pago Agora (R$):</label>
              <input type="number" id="pay-allowance-val" value="${balance.toFixed(2)}" max="${balance}" step="5" min="1" style="width: 140px; text-align: center; font-size: 1.3rem; font-weight: 800; padding: 6px; background: rgba(0,0,0,0.5); border: 1px solid rgba(34,197,94,0.4); border-radius: 8px; color: #4ade80;">
            </div>
          </div>
        `,
        confirmText: 'Confirmar Pagamento Entregue',
        onConfirm: async () => {
          const val = document.getElementById('pay-allowance-val')?.value;
          try {
            await api.post('/api/finance/child-vault/pay', {
              target_user_id: childId,
              amount_brl: parseFloat(val),
            });
            showToast(`Pagamento de R$ ${parseFloat(val).toFixed(2)} registrado com sucesso para ${childName}! 🎉`, 'success');
            router.navigate('financeiro');
            return true;
          } catch (err) {
            showToast(err.message, 'error');
            return false;
          }
        },
      });
    };
  });
}
