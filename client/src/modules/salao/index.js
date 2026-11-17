/**
 * LiraQuest - Grande Salão do Reino (Hub Central Pós-Login 5 Estrelas)
 * Matriz dos 6 Portais Nobres Familiares
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';

export async function renderSalaoView() {
  const user = auth.getUser();
  const character = auth.getCharacter();
  const family = auth.getFamily();

  // Dados dinâmicos ou padrões nobres
  const userName = user?.name || 'Guardião';
  const roleTitle = user?.role === 'PARENT' ? 'Mestre da Guilda' : (user?.role === 'ADMIN' ? 'Grão-Mestre' : 'Herói Aventureiro');
  const heroClass = character?.class_name || (user?.role === 'PARENT' ? 'Guardião do Lar' : 'Guerreiro da Disciplina');
  const heroLevel = character?.level || 1;
  const avatar = character?.avatar_icon || (user?.role === 'PARENT' ? '👑' : '⚔️');
  const clanName = family?.name || 'Clã Lira';

  // Buscar dados em tempo real dos 6 módulos para o resumo épico do dia
  let pendingTasksCount = 0;
  let isAwaitingReview = false;
  let nextMealLabel = 'Almoço dos Heróis (12:00)';
  let nextMealDish = 'Patinho Moído Magro';
  let clanVaultBalance = 'R$ 0,00';
  let waConnected = false;

  try {
    const [tasksRes, pendingReviewsRes, nutritionRes, financeRes, waRes] = await Promise.all([
      api.get('/api/tasks').catch(() => null),
      user?.role === 'PARENT' || user?.role === 'ADMIN' ? api.get('/api/tasks/submissions/pending').catch(() => null) : null,
      api.get('/api/nutrition/today').catch(() => null),
      api.get('/api/finance/vault').catch(() => null),
      api.get('/api/whatsapp/config').catch(() => null),
    ]);

    // 1. Casa & Missões
    if (pendingReviewsRes && pendingReviewsRes.submissions) {
      pendingTasksCount = pendingReviewsRes.submissions.length;
      isAwaitingReview = true;
    } else if (tasksRes && tasksRes.tasks) {
      pendingTasksCount = tasksRes.tasks.filter(t => !t.submissions || !t.submissions.some(s => s.status === 'APPROVED')).length;
    }

    // 2. Saúde & Próximo Prato
    if (nutritionRes && nutritionRes.meals) {
      const now = new Date();
      const currentH = now.getHours();
      let targetMeal = null;
      if (currentH < 10) targetMeal = nutritionRes.meals.find(m => m.meal_type === 'cafe');
      else if (currentH < 14) targetMeal = nutritionRes.meals.find(m => m.meal_type === 'almoco');
      else if (currentH < 18) targetMeal = nutritionRes.meals.find(m => m.meal_type === 'lanche');
      else targetMeal = nutritionRes.meals.find(m => m.meal_type === 'jantar');

      if (!targetMeal && nutritionRes.meals.length > 0) targetMeal = nutritionRes.meals[0];

      if (targetMeal) {
        const typeNames = { cafe: 'Café', almoco: 'Almoço', lanche: 'Lanche', jantar: 'Jantar', ceia: 'Ceia' };
        nextMealLabel = `${typeNames[targetMeal.meal_type] || 'Refeição'} do Clã`;
        nextMealDish = targetMeal.title || 'Cardápio Saudável';
      }
    }

    // 3. Financeiro & Saldo do Cofre
    if (financeRes && financeRes.vaults) {
      const totalVault = financeRes.vaults.reduce((sum, v) => sum + Number(v.current_amount || 0), 0);
      clanVaultBalance = `R$ ${totalVault.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    // 4. WhatsApp
    if (waRes && waRes.config) {
      waConnected = waRes.config.is_connected;
    }
  } catch (e) {
    console.warn('Erro ao carregar dados em tempo real para resumo do clã:', e);
  }

  return `
    <div class="salao-wrapper">
      
      <!-- ========================================================
           1. SAUDAÇÃO NOBRE (HERO BANNER)
           ======================================================== -->
      <header class="salao-header">
        <div class="hero-greeting-box">
          <div class="hero-profile-info">
            <div class="hero-avatar-box-lg">${avatar}</div>
            <div class="hero-meta-titles">
              <h2 class="cinzel gold-gradient-text">Saudações, ${userName}!</h2>
              <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 8px;">
                Bem-vindo ao <strong>Grande Salão do Reino</strong>. A ordem e a prosperidade do seu clã começam aqui.
              </p>
              <div class="hero-tags-row">
                <span class="tag-clan">🏰 ${clanName}</span>
                <span class="tag-class">🛡️ ${heroClass}</span>
                <span class="tag-level">⭐ Nível ${heroLevel} • ${roleTitle}</span>
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;">Hoje no Reino</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
      </header>

      <!-- ========================================================
           2. RESUMO DO CLÃ (INDICADORES RÁPIDOS EM TEMPO REAL)
           ======================================================== -->
      <section class="clan-summary-ribbon" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 30px;">
        <!-- Indicador 1: Casa -->
        <div class="summary-chip" id="summary-chip-casa" style="cursor: pointer;" title="Abrir Módulo Casa">
          <div class="summary-chip-icon" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35);">🏡</div>
          <div class="summary-chip-content">
            <h4>${isAwaitingReview ? 'Visto dos Pais' : 'Missões da Casa'}</h4>
            <div class="summary-chip-val" style="color: #fde047;">${pendingTasksCount} ${isAwaitingReview ? 'a Aprovar' : 'Pendente(s)'}</div>
          </div>
        </div>

        <!-- Indicador 2: Saúde -->
        <div class="summary-chip" id="summary-chip-saude" style="cursor: pointer;" title="Abrir Módulo Saúde">
          <div class="summary-chip-icon" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35);">🥗</div>
          <div class="summary-chip-content">
            <h4>${nextMealLabel}</h4>
            <div class="summary-chip-val" style="color: #6ee7b7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${nextMealDish}">
              ${nextMealDish}
            </div>
          </div>
        </div>

        <!-- Indicador 3: Financeiro -->
        <div class="summary-chip" id="summary-chip-financeiro" style="cursor: pointer;" title="Abrir Módulo Financeiro">
          <div class="summary-chip-icon" style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35);">💰</div>
          <div class="summary-chip-content">
            <h4>Cofre do Clã</h4>
            <div class="summary-chip-val" style="color: #fde047;">${clanVaultBalance}</div>
          </div>
        </div>

        <!-- Indicador 4: WhatsApp do Clã -->
        <div class="summary-chip" id="summary-chip-whatsapp" style="cursor: pointer;" title="Abrir Central WhatsApp">
          <div class="summary-chip-icon" style="background: rgba(37, 211, 102, 0.15); border: 1px solid rgba(37, 211, 102, 0.35);">📱</div>
          <div class="summary-chip-content">
            <h4>WhatsApp do Clã</h4>
            <div class="summary-chip-val" style="color: ${waConnected ? '#34d399' : '#fbbf24'};">
              ${waConnected ? '🟢 Conectado' : '🟡 Parear Sessão'}
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================
           3. GRID DOS 6 PORTAIS NOBRES (CARDS TEMÁTICOS 1 CLIQUE)
           ======================================================== -->
      <div class="portais-section-header">
        <h3 class="cinzel gold-gradient-text">
          <span>🏛️</span> Os Seis Portais do Reino Familiar
        </h3>
        <span style="font-size: 0.82rem; color: var(--text-muted);">Clique no portal para acessar o módulo desejado</span>
      </div>

      <div class="portais-grid">
        
        <!-- PORTAL 1: CASA -->
        <div class="portal-card portal-casa" id="portal-card-casa">
          <div class="portal-header">
            <div class="portal-icon">🏡</div>
            <span class="portal-badge">Rotina & Missões</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Casa</h3>
            <p class="portal-desc">
              Missões do lar, hábitos diários, arrumação do quarto, louça, envio de fotos de comprovação e aprovação familiar.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">⚡ Recompensas em Fichas & XP</span>
            <div class="portal-enter-btn">Entrar no Portal ➜</div>
          </div>
        </div>

        <!-- PORTAL 2: ESTUDOS -->
        <div class="portal-card portal-estudos" id="portal-card-estudos">
          <div class="portal-header">
            <div class="portal-icon">📚</div>
            <span class="portal-badge">Foco & Saber</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Estudos</h3>
            <p class="portal-desc">
              Pomodoro de foco gamificado, lições de casa, matérias escolares, leitura diária e evolução do intelecto.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">🧠 +Inteligência & Bônus de Ouro</span>
            <div class="portal-enter-btn">Entrar no Portal ➜</div>
          </div>
        </div>

        <!-- PORTAL 3: SAÚDE -->
        <div class="portal-card portal-saude" id="portal-card-saude">
          <div class="portal-header">
            <div class="portal-icon">🥗</div>
            <span class="portal-badge">Vitalidade</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Saúde</h3>
            <p class="portal-desc">
              Cardápio das refeições da semana, horários dos pratos, controle de hidratação (água), alarmes e lista de compras saudáveis.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">❤️ +Constituição & Vitalidade</span>
            <div class="portal-enter-btn">Entrar no Portal ➜</div>
          </div>
        </div>

        <!-- PORTAL 4: DIVERSÃO -->
        <div class="portal-card portal-diversao" id="portal-card-diversao">
          <div class="portal-header">
            <div class="portal-icon">🎡</div>
            <span class="portal-badge">Lazer & Conexão</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Diversão</h3>
            <p class="portal-desc">
              Agenda de passeios do fim de semana, noite da pizza, cinema, eventos do clã e resgate de vales com Fichas do Lar.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">🎟️ Vales Especiais do Lar</span>
            <div class="portal-enter-btn">Entrar no Portal ➜</div>
          </div>
        </div>

        <!-- PORTAL 5: JOGOS -->
        <div class="portal-card portal-jogos" id="portal-card-jogos">
          <div class="portal-header">
            <div class="portal-icon">🎮</div>
            <span class="portal-badge">Salão de Jogos</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Jogos</h3>
            <p class="portal-desc">
              Lobby nobre de games: Truco Paulista Mobile, Marvel Zombies RPG, Duelo de Arqueiros 1v1, Esconde-Esconde e Quests.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">🔒 Acesso Autenticado do Clã</span>
            <div class="portal-enter-btn">Entrar no Salão ➜</div>
          </div>
        </div>

        <!-- PORTAL 6: FINANCEIRO -->
        <div class="portal-card portal-financeiro" id="portal-card-financeiro">
          <div class="portal-header">
            <div class="portal-icon">💰</div>
            <span class="portal-badge">Tesouro do Clã</span>
          </div>
          <div class="portal-info">
            <h3 class="cinzel">Financeiro</h3>
            <p class="portal-desc">
              Gestão do tesouro familiar, contas da casa dos pais, cofrinho e mesada dos filhos e grandes sonhos da família.
            </p>
          </div>
          <div class="portal-footer">
            <span class="portal-status-text">🪙 Saldo de Ouro & Fichas</span>
            <div class="portal-enter-btn">Entrar no Portal ➜</div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindSalaoEvents() {
  const setupPortal = (id, targetRoute) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = () => router.navigate(targetRoute);
    }
  };

  // Vínculo dos 6 Portais
  setupPortal('portal-card-casa', 'casa');
  setupPortal('portal-card-estudos', 'estudos');
  setupPortal('portal-card-saude', 'saude');
  setupPortal('portal-card-diversao', 'diversao');
  setupPortal('portal-card-jogos', 'jogos');
  setupPortal('portal-card-financeiro', 'financeiro');

  // Vínculo dos Chips Rápidos
  setupPortal('summary-chip-casa', 'casa');
  setupPortal('summary-chip-saude', 'saude');
  setupPortal('summary-chip-financeiro', 'financeiro');
  setupPortal('summary-chip-whatsapp', 'saude');
}
