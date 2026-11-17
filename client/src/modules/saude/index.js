/**
 * LiraQuest - Módulo 2: Saúde, Nutrição & Hábitos Alimentares (Fase 5)
 * Cardápio dinâmico, Pesos/Gramas, Controle de Horários & Alarmes,
 * Central de WhatsApp do Clã, Validação de Presença dos Heróis e Lista de Compras.
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { socket } from '../../core/socket.js';
import { showToast } from '../../components/Toast.js';
import { renderModuleNavbar, bindModuleNavbarEvents } from '../../components/ModuleNavbar.js';
import { isPushSupported, getPermissionState, subscribeDeviceToPush, unsubscribeDeviceFromPush } from '../../core/pushManager.js';

// Estado Local do Módulo de Saúde
let currentTab = 'cardapio'; // 'cardapio', 'builder', 'validacao', 'compras', 'notificacoes'
let currentSubView = 'today'; // 'today' ou 'week'
let selectedMealType = 'almoco'; // refeição ativa na validação e construtor
let todayData = null;
let weekData = null;
let shoppingData = null;
let whatsappData = null;
let pushStatus = null;
let waterGlasses = parseInt(localStorage.getItem('liraquest_water_count') || '3', 10);

// Nomes e Ícones Amigáveis das Refeições
const MEAL_META = {
  cafe: { name: 'Café da Manhã', icon: '☕', defaultTime: '07:30', tip: 'Frutas, ovos e energia' },
  almoco: { name: 'Almoço dos Heróis', icon: '🥗', defaultTime: '12:00', tip: 'Prato colorido e equilibrado' },
  lanche: { name: 'Lanche da Tarde', icon: '🍎', defaultTime: '16:00', tip: 'Fruta, iogurte e aveia' },
  jantar: { name: 'Jantar do Clã', icon: '🍲', defaultTime: '19:30', tip: 'Grelhado leve e legumes' },
  ceia: { name: 'Ceia & Chá Noturno', icon: '🍵', defaultTime: '21:30', tip: 'Digestão suave e calmante' },
};

// Categorias de Alimentos
const CATEGORY_META = {
  proteina: { name: 'Proteína Magra', color: '#ef4444', icon: '🥩' },
  carboidrato: { name: 'Carboidrato Bom', color: '#f59e0b', icon: '🍚' },
  salada: { name: 'Salada Colorida', color: '#10b981', icon: '🥬' },
  legume: { name: 'Legume no Vapor', color: '#34d399', icon: '🥕' },
  fruta: { name: 'Fruta Fresca', color: '#fbbf24', icon: '🍌' },
  bebida: { name: 'Bebida / Chá', color: '#38bdf8', icon: '🍵' },
  oleaginosa: { name: 'Castanhas / Sementes', color: '#d97706', icon: '🥜' },
};

/**
 * Carrega dados iniciais do backend
 */
async function loadHealthData() {
  try {
    const [todayRes, shoppingRes, pushRes] = await Promise.all([
      api.get('/api/nutrition/today').catch(() => null),
      api.get('/api/nutrition/shopping').catch(() => null),
      api.get('/api/push/status').catch(() => null),
    ]);

    if (todayRes && todayRes.success) {
      todayData = todayRes;
    }
    if (shoppingRes && shoppingRes.success) {
      shoppingData = shoppingRes;
    }
    if (pushRes && pushRes.success) {
      pushStatus = pushRes;
    }
  } catch (err) {
    console.error('Erro ao carregar dados de saúde e push:', err);
  }
}

/**
 * Renderizador Principal da View de Saúde
 */
export async function renderSaudeView() {
  await loadHealthData();

  const isParent = auth.isParent();
  const routineMode = todayData?.routine_mode || 'certinho';
  const isFlexivel = routineMode === 'flexivel';
  const isWaConnected = whatsappData?.is_connected || false;

  const topNavbarHtml = renderModuleNavbar({
    currentModule: 'saude',
    title: 'Módulo Saúde, Nutrição & Hábitos',
    subtitle: 'Cardápio sob medida com gramas, horários de refeição, controle de presença dos filhos e alarmes automáticos.',
    icon: '🥗',
    badges: [
      { label: `${waterGlasses}/8 Copos d'Água`, icon: '💧', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' },
      { label: isFlexivel ? 'Rotina Flexível' : 'Rotina Certinha', icon: '⏰', bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.35)', color: '#fde047' },
      { label: pushStatus?.hasActiveSubscription ? 'Celular Conectado' : `${pushStatus?.totalDevices || 0} Aparelhos no Clã`, icon: '🔔', bg: pushStatus?.hasActiveSubscription ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)', border: pushStatus?.hasActiveSubscription ? 'rgba(16, 185, 129, 0.35)' : 'rgba(212, 175, 55, 0.35)', color: pushStatus?.hasActiveSubscription ? '#34d399' : '#fbbf24' },
    ],
  });

  return `
    <div class="module-saude-view" style="animation: fadeIn 0.3s ease;">
      <!-- BARRA SUPERIOR NOBRE DE NAVEGAÇÃO (FASE 5) -->
      ${topNavbarHtml}

      <!-- Barra de Navegação das 5 Abas Nobres -->
      <div class="saude-tabs-bar" style="display: flex; gap: 10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 6px;">
        <button class="btn-saude-tab ${currentTab === 'cardapio' ? 'active' : ''}" data-tab="cardapio">
          🍽️ Cardápio do Dia & Semana
        </button>
        ${isParent ? `
          <button class="btn-saude-tab ${currentTab === 'builder' ? 'active' : ''}" data-tab="builder">
            ➕ Construtor de Pratos
          </button>
          <button class="btn-saude-tab ${currentTab === 'validacao' ? 'active' : ''}" data-tab="validacao">
            👑 Validação dos Heróis (+30 XP)
          </button>
        ` : `
          <button class="btn-saude-tab ${currentTab === 'validacao' ? 'active' : ''}" data-tab="validacao">
            🛡️ Meu Check-in de Presença
          </button>
        `}
        <button class="btn-saude-tab ${currentTab === 'compras' ? 'active' : ''}" data-tab="compras">
          🛒 Lista de Compras Inteligente
        </button>
        <button class="btn-saude-tab ${currentTab === 'notificacoes' ? 'active' : ''}" data-tab="notificacoes">
          🔔 Notificações do Clã (Web Push)
        </button>
      </div>

      <!-- Conteúdo Dinâmico da Aba Selecionada -->
      <div id="saude-tab-content">
        ${renderCurrentTabContent()}
      </div>
    </div>
  `;
}

/**
 * Renderiza o conteúdo da aba ativa
 */
function renderCurrentTabContent() {
  switch (currentTab) {
    case 'cardapio':
      return renderTabCardapio();
    case 'builder':
      return renderTabBuilder();
    case 'validacao':
      return renderTabValidacao();
    case 'compras':
      return renderTabCompras();
    case 'notificacoes':
      return renderTabNotificacoes();
    default:
      return renderTabCardapio();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA 1: CARDÁPIO DO DIA & SEMANA
// ─────────────────────────────────────────────────────────────────────────────
function renderTabCardapio() {
  const routineMode = todayData?.routine_mode || 'certinho';
  const isFlexivel = routineMode === 'flexivel';
  const meals = todayData?.meals || [];
  const schedules = todayData?.schedules || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">

      <!-- Seletor do Modo do Dia & Guia Nobre da Cozinha -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        
        <!-- CARD DO SELETOR DE MODO (HORÁRIOS CERTINHOS VS FLEXÍVEL) -->
        <div class="noble-card" style="border-color: ${isFlexivel ? 'rgba(59, 130, 246, 0.4)' : 'rgba(212, 175, 55, 0.4)'}; background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 58, 138, 0.25));">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent); font-weight: 800;">
                Ritmo da Família
              </span>
              <h3 class="cinzel" style="color: #ffffff; margin-top: 4px; font-size: 1.25rem;">
                Modo da Rotina Diária
              </h3>
            </div>
            <span style="font-size: 1.8rem;">${isFlexivel ? '🌴' : '⏰'}</span>
          </div>

          <p style="font-size: 0.86rem; color: #cbd5e1; margin-bottom: 16px; line-height: 1.4;">
            ${isFlexivel 
              ? '<strong>Rotina Flexível (Acordei Tarde):</strong> Horários adaptados com janelas estendidas para dias de descanso sem estresse.' 
              : '<strong>Rotina Organizada (Horários Certinhos):</strong> Disciplina imperial com refeições nos horários exatos para máxima energia.'}
          </p>

          <div style="display: flex; gap: 10px;">
            <button id="btn-toggle-routine" class="btn-noble ${isFlexivel ? 'btn-noble-secondary' : 'btn-noble-gold'} btn-noble-sm" style="flex: 1;">
              ${isFlexivel ? '🔄 Mudar p/ Horários Certinhos' : '🔄 Mudar p/ Rotina Flexível'}
            </button>
          </div>
        </div>

        <!-- CARD DO GUIA DA COZINHA NOBRE (AVISOS & PREPARO LEVE) -->
        <div class="noble-card" style="border-color: rgba(128, 0, 32, 0.45); background: linear-gradient(135deg, rgba(74, 14, 23, 0.5), rgba(15, 23, 42, 0.85));">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 1.8rem;">🍳</span>
            <h3 class="cinzel" style="color: #fde047; font-size: 1.15rem; margin: 0;">
              Guia Imperial da Cozinha Nobre
            </h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.82rem; color: #e2e8f0;">
            <div style="background: rgba(0, 0, 0, 0.25); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #f59e0b;">
              <strong>🧅 Cebola e alho batidos:</strong> Invisíveis no molho/arroz para os filhos comerem sem ver pedaços.
            </div>
            <div style="background: rgba(0, 0, 0, 0.25); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #10b981;">
              <strong>🥗 Zero frituras:</strong> Sempre grelhado na antiaderente ou legumes cozidos no vapor.
            </div>
            <div style="background: rgba(0, 0, 0, 0.25); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #38bdf8;">
              <strong>🩺 Vesícula Segura:</strong> Pré-operatório leve, digestão rápida e gorduras boas controladas.
            </div>
            <div style="background: rgba(0, 0, 0, 0.25); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #ec4899;">
              <strong>⚖️ Prato de Ouro:</strong> ½ prato salada, ¼ proteína magra (150g), ¼ carbo bom (80g).
            </div>
          </div>
        </div>

      </div>

      <!-- Barra de Controle de Visualização: Dia de Hoje vs Grade Semanal -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px;">
        <div style="display: flex; gap: 10px;">
          <button id="btn-view-today" class="btn-noble ${currentSubView === 'today' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm">
            📅 Pratos de Hoje (${todayData?.today || 'Hoje'})
          </button>
          <button id="btn-view-week" class="btn-noble ${currentSubView === 'week' ? 'btn-noble-primary' : 'btn-noble-secondary'} btn-noble-sm">
            🗓️ Grade Semanal (Seg - Dom)
          </button>
        </div>
        <span style="font-size: 0.82rem; color: var(--gold); font-weight: 700;">
          5 Refeições Programadas
        </span>
      </div>

      <!-- Exibição de Acordo com SubView (Today vs Week) -->
      ${currentSubView === 'today' ? renderTodayMealsGrid(meals, schedules) : renderWeekMealsGrid()}

      <!-- Card Complementar de Hidratação do Herói -->
      <div class="noble-card" style="border-color: rgba(56, 189, 248, 0.35); text-align: center; padding: 22px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;">
          <span style="font-size: 2rem;">💧</span>
          <h3 class="cinzel" style="color: #ffffff; font-size: 1.25rem; margin: 0;">Hidratação Diária do Clã</h3>
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 14px;">
          Meta: 8 copos d'água (2 litros) para manter a Constituição e Mana em nível máximo!
        </p>

        <div style="font-size: 2rem; font-weight: 900; color: #38bdf8; margin-bottom: 12px;">
          <span id="water-count-val">${waterGlasses}</span> / 8 <span style="font-size: 1.1rem; color: #94a3b8;">copos bebidos</span>
        </div>

        <div id="water-glasses-row" style="display: flex; justify-content: center; gap: 8px; font-size: 1.5rem; margin-bottom: 18px; flex-wrap: wrap;">
          ${Array.from({ length: 8 }, (_, i) => `
            <span style="opacity: ${i < waterGlasses ? '1' : '0.25'}; filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.5)); transition: all 0.2s;">🥤</span>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="btn-add-water" class="btn-noble btn-noble-primary btn-noble-sm" style="background: linear-gradient(135deg, #0284c7, #38bdf8); border-color: #7dd3fc;">
            ➕ Bebi 1 Copo (+5 XP)
          </button>
          <button id="btn-reset-water" class="btn-noble btn-noble-secondary btn-noble-sm">
            ↺ Resetar Copos
          </button>
        </div>
      </div>

    </div>
  `;
}

/**
 * Renderiza os cards das refeições de hoje
 */
function renderTodayMealsGrid(meals, schedules) {
  const mealTypesOrder = ['cafe', 'almoco', 'lanche', 'jantar', 'ceia'];

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 20px;">
      ${mealTypesOrder.map((type) => {
        const meta = MEAL_META[type] || { name: type, icon: '🍽️', defaultTime: '12:00', tip: '' };
        const schedule = schedules.find((s) => s.meal_type === type);
        const scheduledTime = schedule ? schedule.scheduled_time : meta.defaultTime;
        const alertMins = schedule ? schedule.alert_minutes_before : 15;
        const meal = meals.find((m) => m.meal_type === type);

        return `
          <div class="noble-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-color: rgba(212, 175, 55, 0.25);">
            <div>
              <!-- Cabeçalho da Refeição -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.6rem;">${meta.icon}</span>
                  <div>
                    <h4 class="cinzel" style="color: #ffffff; margin: 0; font-size: 1.05rem;">${meta.name}</h4>
                    <span style="font-size: 0.74rem; color: var(--gold); font-weight: 700;">
                      ⏰ Horário: ${scheduledTime} (${alertMins}m antes)
                    </span>
                  </div>
                </div>
                <span style="font-size: 0.72rem; background: rgba(30, 58, 138, 0.4); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); padding: 3px 8px; border-radius: 8px;">
                  Alarme Ativo
                </span>
              </div>

              <!-- Título do Prato -->
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 1rem; color: #fde047; display: block; margin-bottom: 4px;">
                  ${meal?.title || 'Prato Saudável Programado'}
                </strong>
                ${meal?.cooking_notes ? `
                  <p style="font-size: 0.8rem; color: #94a3b8; background: rgba(0, 0, 0, 0.3); padding: 6px 10px; border-radius: 6px; font-style: italic; border-left: 2px solid var(--accent);">
                    💡 Dica: ${meal.cooking_notes}
                  </p>
                ` : ''}
              </div>

              <!-- Lista de Alimentos com Gramas -->
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; font-weight: 800;">
                  Ingredientes & Pesos:
                </span>
                ${meal?.items && meal.items.length > 0 ? meal.items.map((it) => {
                  const cat = CATEGORY_META[it.category] || { name: it.category, color: '#94a3b8', icon: '🔹' };
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; background: rgba(15, 23, 42, 0.6); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span>${cat.icon}</span>
                        <span style="color: #f1f5f9;">${it.name}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #fde047; font-weight: 700; font-size: 0.82rem;">${it.quantity_grams || '100g'}</span>
                        ${it.health_tags ? `
                          <span style="font-size: 0.68rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 1px 5px; border-radius: 4px;">
                            ${it.health_tags.split(',')[0]}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('') : `
                  <span style="font-size: 0.82rem; color: var(--text-dim); font-style: italic;">
                    Alimentos padrão balanceados.
                  </span>
                `}
              </div>
            </div>

            <!-- Botões de Ação -->
            <div style="display: flex; gap: 8px; pt: 8px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <button class="btn-noble btn-noble-secondary btn-noble-sm btn-edit-meal" data-meal-type="${type}" style="flex: 1;">
                ✏️ Editar Prato
              </button>
              <button class="btn-noble btn-noble-primary btn-noble-sm btn-goto-checkin" data-meal-type="${type}" style="flex: 1;">
                👑 Validar Filhos
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renderiza a grade semanal (Segunda a Domingo)
 */
function renderWeekMealsGrid() {
  if (!weekData) {
    return `
      <div class="noble-card" style="text-align: center; padding: 40px;">
        <div style="font-size: 2.5rem; margin-bottom: 12px; animation: pulse 1s infinite;">🗓️</div>
        <p style="color: #cbd5e1;">Carregando grade semanal de pratos...</p>
        <button id="btn-load-week" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-top: 12px;">
          Carregar Grade Agora
        </button>
      </div>
    `;
  }

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const weekDays = weekData.weekDays || [];
  const meals = weekData.meals || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        ${weekDays.map((dateStr, idx) => {
          const dayName = daysOfWeek[idx] || `Dia ${idx + 1}`;
          const dayMeals = meals.filter((m) => m.meal_date === dateStr);
          const isToday = dateStr === (todayData?.today || new Date().toISOString().split('T')[0]);

          return `
            <div class="noble-card" style="border-color: ${isToday ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)'}; background: ${isToday ? 'linear-gradient(135deg, rgba(128, 0, 32, 0.3), rgba(15, 23, 42, 0.9))' : 'var(--bg-card)'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
                <strong style="color: ${isToday ? '#fde047' : '#ffffff'}; font-size: 1rem;">
                  ${dayName} <span style="font-size: 0.78rem; color: var(--text-dim);">(${dateStr.slice(5)})</span>
                </strong>
                ${isToday ? `<span style="font-size: 0.7rem; background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 700;">Hoje</span>` : ''}
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${dayMeals.length === 0 ? `
                  <p style="font-size: 0.8rem; color: var(--text-dim); font-style: italic;">Pratos padrão da família.</p>
                ` : dayMeals.map((m) => {
                  const meta = MEAL_META[m.meal_type] || { icon: '🍽️', name: m.meal_type };
                  return `
                    <div style="font-size: 0.82rem; background: rgba(0, 0, 0, 0.25); padding: 6px 10px; border-radius: 6px;">
                      <span style="color: var(--accent); font-weight: 700;">${meta.icon} ${meta.name}:</span>
                      <span style="color: #cbd5e1; display: block; margin-top: 2px;">${m.title}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA 2: CONSTRUTOR DINÂMICO DE PRATOS
// ─────────────────────────────────────────────────────────────────────────────
function renderTabBuilder() {
  const todayStr = todayData?.today || new Date().toISOString().split('T')[0];

  return `
    <div class="noble-card" style="max-width: 900px; margin: 0 auto; border-color: rgba(212, 175, 55, 0.35); padding: 28px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2rem;">➕</span>
          <div>
            <h3 class="cinzel gold-gradient-text" style="margin: 0; font-size: 1.35rem;">
              Construtor Dinâmico de Pratos Nobres
            </h3>
            <p style="font-size: 0.84rem; color: #94a3b8; margin-top: 2px;">
              Monte o prato adicionando os ingredientes e seus pesos em gramas com 1 clique.
            </p>
          </div>
        </div>
        <span style="font-size: 0.8rem; background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 4px 10px; border-radius: 12px; font-weight: 700;">
          Painel dos Pais
        </span>
      </div>

      <form id="form-meal-builder" style="display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Linha 1: Data e Refeição -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              📅 Data da Refeição:
            </label>
            <input type="date" id="builder-meal-date" value="${todayStr}" class="noble-input" style="width: 100%; padding: 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff;">
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              🍽️ Tipo da Refeição:
            </label>
            <select id="builder-meal-type" class="noble-input" style="width: 100%; padding: 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff;">
              <option value="cafe" ${selectedMealType === 'cafe' ? 'selected' : ''}>☕ Café da Manhã</option>
              <option value="almoco" ${selectedMealType === 'almoco' ? 'selected' : ''}>🥗 Almoço dos Heróis</option>
              <option value="lanche" ${selectedMealType === 'lanche' ? 'selected' : ''}>🍎 Lanche da Tarde</option>
              <option value="jantar" ${selectedMealType === 'jantar' ? 'selected' : ''}>🍲 Jantar do Clã</option>
              <option value="ceia" ${selectedMealType === 'ceia' ? 'selected' : ''}>🍵 Ceia Noturna</option>
            </select>
          </div>
        </div>

        <!-- Linha 2: Nome do Prato -->
        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
            👑 Nome Nobre do Prato:
          </label>
          <input type="text" id="builder-meal-title" placeholder="Ex: Patinho Moído com Cenoura Invisível & Arroz" class="noble-input" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; color: #fff; font-size: 0.95rem;" required>
        </div>

        <!-- Linha 3: Dicas para a Cozinha -->
        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
            💡 Guia de Preparo da Cozinha (Dicas de Ouro):
          </label>
          <textarea id="builder-meal-notes" rows="2" placeholder="Ex: Zero óleo no refogado, cebola e alho batidos no mixer para as crianças não verem pedaços. Cenoura ralada fininha sumindo no molho." style="width: 100%; padding: 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff; font-size: 0.85rem; font-family: inherit;"></textarea>
        </div>

        <!-- Linha 4: Construtor Dinâmico de Ingredientes com Gramas -->
        <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <strong style="color: #fde047; font-size: 0.95rem;">⚖️ Ingredientes, Alimentos & Gramas:</strong>
              <span style="display: block; font-size: 0.75rem; color: #94a3b8;">Adicione os itens do prato com suas porções recomendadas.</span>
            </div>
            <button type="button" id="btn-add-ingredient-row" class="btn-noble btn-noble-secondary btn-noble-sm">
              ➕ Adicionar Alimento
            </button>
          </div>

          <!-- Container de Linhas Dinâmicas -->
          <div id="ingredient-rows-container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Linha Padrão 1 -->
            <div class="ingredient-row" style="display: grid; grid-template-columns: 2fr 1.2fr 1.5fr 1.5fr auto; gap: 8px; align-items: center;">
              <input type="text" placeholder="Nome (ex: Arroz Integral)" class="noble-input ing-name" value="Patinho Bovino Moído" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <input type="text" placeholder="Peso (ex: 80g)" class="noble-input ing-grams" value="150g" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <select class="noble-input ing-category" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
                <option value="proteina" selected>🥩 Proteína Magra</option>
                <option value="carboidrato">🍚 Carboidrato Bom</option>
                <option value="salada">🥬 Salada</option>
                <option value="legume">🥕 Legume no Vapor</option>
                <option value="fruta">🍌 Fruta</option>
                <option value="bebida">🍵 Bebida</option>
              </select>
              <input type="text" placeholder="Tag (ex: vesicula_segura)" class="noble-input ing-tags" value="vesicula_segura, zero_oleo" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <button type="button" class="btn-noble btn-noble-sm btn-remove-row" style="background: rgba(239, 68, 68, 0.3); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); padding: 8px 10px;">🗑️</button>
            </div>

            <!-- Linha Padrão 2 -->
            <div class="ingredient-row" style="display: grid; grid-template-columns: 2fr 1.2fr 1.5fr 1.5fr auto; gap: 8px; align-items: center;">
              <input type="text" placeholder="Nome (ex: Arroz Integral)" class="noble-input ing-name" value="Arroz Integral Cozido" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <input type="text" placeholder="Peso (ex: 80g)" class="noble-input ing-grams" value="80g" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <select class="noble-input ing-category" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
                <option value="proteina">🥩 Proteína Magra</option>
                <option value="carboidrato" selected>🍚 Carboidrato Bom</option>
                <option value="salada">🥬 Salada</option>
                <option value="legume">🥕 Legume no Vapor</option>
                <option value="fruta">🍌 Fruta</option>
                <option value="bebida">🍵 Bebida</option>
              </select>
              <input type="text" placeholder="Tag (ex: vesicula_segura)" class="noble-input ing-tags" value="baixo_indice_glicemico" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
              <button type="button" class="btn-noble btn-noble-sm btn-remove-row" style="background: rgba(239, 68, 68, 0.3); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); padding: 8px 10px;">🗑️</button>
            </div>
          </div>
        </div>

        <!-- Botão Salvar Prato -->
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
          <button type="button" id="btn-cancel-builder" class="btn-noble btn-noble-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn-noble btn-noble-primary" style="padding: 12px 30px; font-size: 1rem;">
            💾 Salvar Prato no Cardápio
          </button>
        </div>

      </form>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA 3: VALIDAÇÃO DOS HERÓIS (MECÂNICA DO PAULINHO)
// ─────────────────────────────────────────────────────────────────────────────
function renderTabValidacao() {
  const isParent = auth.isParent();
  const children = todayData?.children || [];
  const checkins = todayData?.checkins || [];
  const todayStr = todayData?.today || new Date().toISOString().split('T')[0];
  const schedules = todayData?.schedules || [];
  const schedule = schedules.find((s) => s.meal_type === selectedMealType);
  const scheduledTime = schedule ? schedule.scheduled_time : (MEAL_META[selectedMealType]?.defaultTime || '12:00');
  const mealMeta = MEAL_META[selectedMealType] || { name: 'Almoço', icon: '🥗' };

  return `
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 950px; margin: 0 auto;">

      <!-- Seletor Rápido da Refeição a Validar -->
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.35); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent); font-weight: 800; letter-spacing: 1px;">
              Mesa do Clã LiraQuest
            </span>
            <h3 class="cinzel gold-gradient-text" style="margin: 2px 0 0; font-size: 1.25rem;">
              Validação de Presença e Hábitos dos Filhos
            </h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; color: #cbd5e1;">Horário Agendado:</span>
            <strong style="color: #fde047; font-size: 1rem; background: rgba(0, 0, 0, 0.3); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(212, 175, 55, 0.3);">
              ⏰ ${scheduledTime}
            </strong>
          </div>
        </div>

        <!-- Seletor de Refeições com Botões de Pílula -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${Object.keys(MEAL_META).map((type) => {
            const m = MEAL_META[type];
            const isSelected = selectedMealType === type;
            return `
              <button class="btn-noble ${isSelected ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-select-val-meal" data-type="${type}" style="padding: 6px 14px;">
                ${m.icon} ${m.name}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Guia de Pontuação e Recompensas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem;">🌟</span>
          <div>
            <strong style="color: #6ee7b7; font-size: 0.9rem;">No Horário Certo</strong>
            <span style="display: block; font-size: 0.78rem; color: #cbd5e1;">+30 XP, +10 Ouro & Energia 100% cheia</span>
          </div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem;">⚠️</span>
          <div>
            <strong style="color: #fde047; font-size: 0.9rem;">Atrasou para a Mesa</strong>
            <span style="display: block; font-size: 0.78rem; color: #cbd5e1;">Apenas +10 XP (Sem moedas de ouro)</span>
          </div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem;">❌</span>
          <div>
            <strong style="color: #fca5a5; font-size: 0.9rem;">Faltou / Recusou</strong>
            <span style="display: block; font-size: 0.78rem; color: #cbd5e1;">Advertência no histórico do Herói</span>
          </div>
        </div>
      </div>

      <!-- Lista dos Heróis dos Filhos para Validação -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h4 class="cinzel" style="color: #ffffff; font-size: 1.1rem; margin: 0;">
          Heróis da Família para o ${mealMeta.name}:
        </h4>

        ${children.length === 0 ? `
          <div class="noble-card" style="text-align: center; padding: 36px;">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">🛡️</div>
            <h4 class="cinzel" style="color: #ffffff;">Nenhum herói encontrado no clã</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Os membros da família cadastrados aparecerão aqui para validação de refeições.
            </p>
          </div>
        ` : children.map((child) => {
          const character = child.character;
          // Procurar checkin do filho para a refeição selecionada hoje
          const checkin = checkins.find((c) => c.user_id === child.id && c.meal_type === selectedMealType);
          const status = checkin?.status;

          return `
            <div class="noble-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-color: ${status === 'no_horario' ? 'rgba(16, 185, 129, 0.45)' : status === 'atrasado' ? 'rgba(245, 158, 11, 0.45)' : status === 'faltou' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(212, 175, 55, 0.25)'};">
              <!-- Info do Filho e Herói -->
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
                  ${character?.avatar_value?.startsWith('http') ? `<img src="${character.avatar_value}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">` : '🦸‍♂️'}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #ffffff; font-size: 1.05rem;">${child.name}</strong>
                    ${child.role === 'CHILD' ? '<span style="font-size: 0.7rem; background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 2px 6px; border-radius: 6px;">Filho</span>' : ''}
                  </div>
                  <span style="font-size: 0.82rem; color: var(--gold); display: block;">
                    Herói: <strong>${character ? character.name : 'Guerreiro do Lar'}</strong> | Ouro: 🪙 ${character ? character.gold : 0}
                  </span>
                </div>
              </div>

              <!-- Status Atual do Check-in -->
              <div style="text-align: center;">
                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 4px;">Status da Refeição</span>
                ${status === 'no_horario' ? `
                  <span style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid #10b981; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.82rem;">
                    🌟 No Horário (+30 XP) ✓
                  </span>
                ` : status === 'atrasado' ? `
                  <span style="background: rgba(245, 158, 11, 0.25); color: #fde047; border: 1px solid #f59e0b; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.82rem;">
                    ⚠️ Atrasou (+10 XP)
                  </span>
                ` : status === 'faltou' ? `
                  <span style="background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.82rem;">
                    ❌ Faltou (Advertência)
                  </span>
                ` : `
                  <span style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.82rem;">
                    ⏳ Aguardando Mesa
                  </span>
                `}
              </div>

              <!-- Botões de Ação Rápida (1 Clique) -->
              ${isParent ? `
                <div style="display: flex; gap: 8px;">
                  <button class="btn-noble btn-noble-sm btn-do-checkin" data-user-id="${child.id}" data-char-id="${character?.id || ''}" data-status="no_horario" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; border-color: #34d399;" title="No Horário (+30 XP, +10 Ouro, Enche Energia)">
                    🌟 No Horário
                  </button>
                  <button class="btn-noble btn-noble-sm btn-do-checkin" data-user-id="${child.id}" data-char-id="${character?.id || ''}" data-status="atrasado" style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #1a1300; border-color: #fbbf24; font-weight: 800;" title="Atrasou (+10 XP)">
                    ⚠️ Atrasou
                  </button>
                  <button class="btn-noble btn-noble-sm btn-do-checkin" data-user-id="${child.id}" data-char-id="${character?.id || ''}" data-status="faltou" style="background: rgba(239, 68, 68, 0.35); color: #fca5a5; border: 1px solid #ef4444;" title="Faltou (Penalidade no Histórico)">
                    ❌ Faltou
                  </button>
                </div>
              ` : `
                <span style="font-size: 0.78rem; color: var(--text-dim); font-style: italic;">
                  Validado pelos Guardiões
                </span>
              `}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA 4: LISTA DE COMPRAS INTELIGENTE (MÊS & FEIRA)
// ─────────────────────────────────────────────────────────────────────────────
function renderTabCompras() {
  const mensal = shoppingData?.mensal || [];
  const feira = shoppingData?.feira || [];
  const totalCount = shoppingData?.totalCount || (mensal.length + feira.length);
  const purchasedCount = shoppingData?.purchasedCount || 0;
  const percent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">

      <!-- Card do Progresso e Formulário de Adição Rápida -->
      <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.35); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 class="cinzel gold-gradient-text" style="margin: 0; font-size: 1.25rem;">
              🛒 Lista de Compras Inteligente do Clã
            </h3>
            <span style="font-size: 0.82rem; color: #94a3b8;">
              Checklist móvel para mercado e feira com sincronização em tempo real.
            </span>
          </div>
          <div style="text-align: right;">
            <strong style="color: #6ee7b7; font-size: 1.1rem;">${purchasedCount} de ${totalCount} itens</strong>
            <span style="font-size: 0.78rem; color: var(--gold); display: block;">(${percent}% concluído)</span>
          </div>
        </div>

        <!-- Barra de Progresso Dourada -->
        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; margin-bottom: 18px;">
          <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #10b981, #fde047); transition: width 0.3s ease;"></div>
        </div>

        <!-- Formulário de Adição Rápida de Item -->
        <form id="form-add-shopping" style="display: grid; grid-template-columns: 2fr 1fr 1.5fr auto; gap: 10px; align-items: center;">
          <input type="text" id="shop-input-name" placeholder="Item (ex: Patinho moído, Cenouras)" class="noble-input" style="padding: 10px 14px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff; font-size: 0.88rem;" required>
          <input type="text" id="shop-input-qty" placeholder="Qtd (ex: 2kg, 1 dúzia)" class="noble-input" style="padding: 10px 14px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff; font-size: 0.88rem;">
          <select id="shop-input-category" class="noble-input" style="padding: 10px 14px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff; font-size: 0.88rem;">
            <option value="semanal_feira">🥬 Feira da Semana</option>
            <option value="mensal_abastecimento">📦 Abastecimento do Mês</option>
          </select>
          <button type="submit" class="btn-noble btn-noble-gold btn-noble-sm" style="padding: 10px 18px;">
            ➕ Adicionar
          </button>
        </form>
      </div>

      <!-- Duas Colunas Responsivas: Mês e Feira -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
        
        <!-- COLUNA 1: ABASTECIMENTO DO MÊS -->
        <div class="noble-card" style="border-color: rgba(245, 158, 11, 0.35);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.5rem;">📦</span>
              <h4 class="cinzel" style="color: #ffffff; margin: 0; font-size: 1.1rem;">Abastecimento do Mês</h4>
            </div>
            <span style="font-size: 0.76rem; background: rgba(245, 158, 11, 0.2); color: #fde047; padding: 2px 8px; border-radius: 10px; font-weight: 700;">
              ${mensal.filter(i => i.is_purchased).length}/${mensal.length} comprados
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-dim); display: block; margin-bottom: 12px;">
            Carnes magras, grãos, secos, ovos e itens de despensa.
          </span>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${mensal.length === 0 ? `
              <p style="font-size: 0.82rem; color: var(--text-dim); font-style: italic;">Nenhum item mensal cadastrado.</p>
            ` : mensal.map((item) => renderShoppingItemRow(item)).join('')}
          </div>
        </div>

        <!-- COLUNA 2: FEIRA DA SEMANA -->
        <div class="noble-card" style="border-color: rgba(16, 185, 129, 0.35);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.5rem;">🥬</span>
              <h4 class="cinzel" style="color: #ffffff; margin: 0; font-size: 1.1rem;">Feira da Semana</h4>
            </div>
            <span style="font-size: 0.76rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 10px; font-weight: 700;">
              ${feira.filter(i => i.is_purchased).length}/${feira.length} comprados
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-dim); display: block; margin-bottom: 12px;">
            Frutas frescas, verduras orgânicas, legumes para o vapor.
          </span>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${feira.length === 0 ? `
              <p style="font-size: 0.82rem; color: var(--text-dim); font-style: italic;">Nenhum item de feira cadastrado.</p>
            ` : feira.map((item) => renderShoppingItemRow(item)).join('')}
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Renderiza uma linha individual de item de compra
 */
function renderShoppingItemRow(item) {
  return `
    <div class="shopping-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: ${item.is_purchased ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.85)'}; border: 1px solid ${item.is_purchased ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 10px; transition: all 0.2s;">
      <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
        <input type="checkbox" class="shop-toggle-cb" data-id="${item.id}" ${item.is_purchased ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
        <span style="font-size: 0.9rem; color: ${item.is_purchased ? 'var(--text-dim)' : '#ffffff'}; text-decoration: ${item.is_purchased ? 'line-through' : 'none'}; font-weight: ${item.is_purchased ? '400' : '600'};">
          ${item.name}
        </span>
      </label>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 0.82rem; color: ${item.is_purchased ? 'var(--text-dim)' : 'var(--gold)'}; font-weight: 700; background: rgba(0, 0, 0, 0.25); padding: 2px 8px; border-radius: 6px;">
          ${item.quantity || '1 un'}
        </span>
        <button class="btn-noble btn-noble-sm btn-delete-shop-item" data-id="${item.id}" style="padding: 4px 6px; background: transparent; border: none; font-size: 0.85rem; opacity: 0.6; cursor: pointer;" title="Excluir item">
          🗑️
        </button>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA 5: CENTRAL DE NOTIFICAÇÕES DO CLÃ (WEB PUSH - PWA)
// ─────────────────────────────────────────────────────────────────────────────
function renderTabNotificacoes() {
  const isParent = auth.isParent();
  const supported = isPushSupported();
  const hasActiveSub = Boolean(pushStatus?.hasActiveSubscription);
  const totalDevices = pushStatus?.totalDevices || 0;
  const membersWithDevices = pushStatus?.membersWithDevices || 0;

  return `
    <div class="tab-content-notificacoes" style="animation: fadeIn 0.3s ease; display: flex; flex-direction: column; gap: 24px;">

      <!-- BANNER DE STATUS DA CENTRAL DE NOTIFICAÇÕES -->
      <div class="noble-card" style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.95)); border: 1.5px solid rgba(212, 175, 55, 0.4); padding: 22px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
              <span style="font-size: 2.2rem;">🔔</span>
              <h3 class="cinzel gold-gradient-text" style="margin: 0; font-size: 1.45rem;">
                Notificações do Clã no Celular (Web Push)
              </h3>
              <span class="whatsapp-status-pill ${hasActiveSub ? 'connected' : 'waiting'}" style="font-size: 0.8rem; padding: 4px 12px; border-radius: 20px;">
                ${hasActiveSub ? '🟢 Notificações Ativas Neste Aparelho' : '🟡 Aparelho Não Cadastrado'}
              </span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0; max-width: 800px; line-height: 1.5;">
              Receba os alarmes de refeição, avisos de água e convocações dos guardiões direto na tela do seu celular, 
              <strong>mesmo com o navegador fechado e a tela bloqueada</strong>, sem depender de WhatsApp ou apps de terceiros!
            </p>
          </div>

          <div style="background: rgba(0, 0, 0, 0.4); padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.25); text-align: center;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #fde047;">${totalDevices}</div>
            <span style="font-size: 0.78rem; color: #94a3b8;">Aparelhos Ativos no Clã</span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 1: STATUS E CONTROLE DESTE APARELHO -->
      <div class="noble-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); padding: 22px; border-radius: 14px;">
        <h4 class="cinzel" style="color: #ffffff; margin: 0 0 12px 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
          <span>📱</span> Seu Dispositivo Atual
        </h4>

        ${!supported ? `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 10px; padding: 16px; color: #fca5a5; font-size: 0.9rem;">
            ⚠️ Este navegador não possui suporte à tecnologia de Notificações Web Push em segundo plano. 
            Recomendamos utilizar o <strong>Google Chrome</strong> (no Android/PC) ou <strong>Safari</strong> (no iPhone adicionando à Tela de Início).
          </div>
        ` : hasActiveSub ? `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); padding: 16px; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2rem;">🛡️</span>
              <div>
                <strong style="color: #34d399; font-size: 1rem; display: block;">Este celular/computador está conectado com sucesso!</strong>
                <span style="color: #cbd5e1; font-size: 0.85rem;">Ele vibrará e mostrará o aviso do LiraQuest sempre que houver alarme ou convocação.</span>
              </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button id="btn-push-test" class="btn-noble btn-noble-gold btn-noble-sm" style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span>🧪</span>
                <span>Testar Notificação Agora</span>
              </button>
              <button id="btn-push-unsubscribe" class="btn-noble btn-noble-sm" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; cursor: pointer;">
                🔕 Desativar Neste Aparelho
              </button>
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 24px 16px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.25)); border: 1.5px dashed rgba(212, 175, 55, 0.45); border-radius: 12px;">
            <div style="font-size: 2.4rem; margin-bottom: 8px;">📲✨</div>
            <h5 class="cinzel gold-gradient-text" style="margin: 0 0 6px 0; font-size: 1.15rem;">
              Ative os Alarmes do Reino no seu Celular
            </h5>
            <p style="color: #cbd5e1; font-size: 0.88rem; max-width: 540px; margin: 0 auto 16px auto; line-height: 1.5;">
              Toque no botão abaixo e selecione <strong>"Permitir"</strong> no aviso do navegador. É 100% gratuito, não precisa instalar nada de loja de aplicativos e você não perde nenhum almoço ou missão!
            </p>
            <button id="btn-push-subscribe" class="btn-noble btn-noble-gold" style="font-size: 1rem; padding: 12px 28px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
              <span>🔔</span>
              <span>Ativar Notificações no meu Celular</span>
            </button>
          </div>
        `}
      </div>

      <!-- SEÇÃO 2: DISPAROS DOS GUARDIÕES (EXCLUSIVO PARA OS PAIS) -->
      ${isParent ? `
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.4); background: linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.85)); padding: 22px; border-radius: 14px;">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <div>
                <h4 class="cinzel" style="color: #93c5fd; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                  <span>⚔️</span> Central de Convocação Rápida dos Guardiões
                </h4>
                <p style="color: #cbd5e1; font-size: 0.84rem; margin: 4px 0 0 0;">
                  Clique em qualquer botão para fazer o celular de todos os heróis da família apitar e vibrar instantaneamente:
                </p>
              </div>
              <span style="font-size: 0.8rem; color: #fbbf24; background: rgba(0,0,0,0.4); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.25);">
                ${totalDevices} aparelho(s) cadastrados
              </span>
            </div>
          </div>

          <!-- 6 BOTÕES DE CONVOCAÇÃO RÁPIDA -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 20px;">
            
            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="BREAKFAST" style="border-color: rgba(245, 158, 11, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #fbbf24; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">🍳</span> Café da Manhã!
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Mesa de desjejum posta! Energia matinal para os heróis.
              </span>
            </button>

            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="KITCHEN" style="border-color: rgba(217, 119, 6, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #f59e0b; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">👨‍🍳</span> Aviso Cozinha (11h15)
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Faltam 30 min: cebola batida, sem óleo e refeição nutritiva.
              </span>
            </button>

            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="LUNCH" style="border-color: rgba(16, 185, 129, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #34d399; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">⚔️</span> Almoço dos Heróis! (11h45)
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Convocação à mesa antes da escola! Check-in (+30 XP e +10 Ouro).
              </span>
            </button>

            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="SNACK_WATER" style="border-color: rgba(56, 189, 248, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #38bdf8; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">💧</span> Hora da Água & Lanche (16h00)
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Regeneração de mana: 1 copo d'água grande e fruta fresca.
              </span>
            </button>

            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="DINNER" style="border-color: rgba(168, 85, 247, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #c084fc; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">🍲</span> Jantar em Família! (19h45)
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Jantar leve noturno, convívio da família e descanso merecido.
              </span>
            </button>

            <button class="btn-noble btn-noble-secondary btn-push-template" data-template="BEDTIME" style="border-color: rgba(244, 63, 94, 0.4); text-align: left; padding: 12px; display: flex; flex-direction: column; gap: 4px; background: rgba(15, 23, 42, 0.7); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #fda4af; font-size: 0.95rem;">
                <span style="font-size: 1.3rem;">🛏️</span> Hora do Descanso (21h30)
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">
                Missões cumpridas! Desligar telas, escovar dentes e dormir.
              </span>
            </button>

          </div>

          <!-- MENSAGEM LIVRE PERSONALIZADA DO PAI -->
          <div style="background: rgba(0, 0, 0, 0.4); padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <label style="display: block; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 8px; font-weight: 700;">
              ✍️ Ou Escreva um Comunicado Livre Imediato para Todos os Celulares:
            </label>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input 
                type="text" 
                id="input-push-custom-text" 
                class="noble-input" 
                placeholder="Ex: Pessoal, chego em 15 minutos! Aqueçam o jantar dos heróis." 
                style="flex: 1; min-width: 260px; padding: 10px 14px; font-size: 0.9rem; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; color: #ffffff;"
              >
              <button 
                id="btn-push-send-custom" 
                class="btn-noble btn-noble-gold" 
                style="padding: 10px 18px; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer;"
              >
                <span>📢</span>
                <span>Disparar Alerta Imediato</span>
              </button>
            </div>
          </div>

          <!-- FEEDBACK DE ENVIO -->
          <div id="push-dispatch-feedback" style="display: none; margin-top: 14px; padding: 12px 16px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 0.88rem; animation: fadeIn 0.3s ease;"></div>

        </div>
      ` : ''}

      <!-- SEÇÃO 3: CRONOGRAMA DE ALARMES AUTOMÁTICOS DA ROTINA -->
      <div class="noble-card" style="background: rgba(15, 23, 42, 0.5); padding: 20px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <h4 class="cinzel gold-gradient-text" style="margin: 0 0 10px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <span>⏰</span> Alarmes Automáticos Programados no Servidor
        </h4>
        <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.5; margin-bottom: 14px;">
          Além dos disparos manuais acima, o servidor do LiraQuest envia notificações sozinho para todos os celulares nos seguintes horários da rotina familiar:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; border-left: 3px solid #f59e0b;">
            <strong style="color: #fbbf24; font-size: 0.9rem;">11h15 — Aviso da Cozinha</strong>
            <span style="display: block; font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Preparo do almoço e cardápio saudável</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; border-left: 3px solid #10b981;">
            <strong style="color: #34d399; font-size: 0.9rem;">11h45 — Almoço dos Heróis</strong>
            <span style="display: block; font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Convocação à mesa antes da escola</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; border-left: 3px solid #38bdf8;">
            <strong style="color: #38bdf8; font-size: 0.9rem;">16h00 — Água & Mana</strong>
            <span style="display: block; font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Lembrete de hidratação e fruta da tarde</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; border-left: 3px solid #c084fc;">
            <strong style="color: #c084fc; font-size: 0.9rem;">19h45 — Jantar do Clã</strong>
            <span style="display: block; font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Jantar leve noturno e descanso</span>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// BINDINGS DE EVENTOS & INTERATIVIDADE
// ─────────────────────────────────────────────────────────────────────────────
export function bindSaudeEvents() {
  // 1. Barra Superior Nobre de Navegação (Fase 5)
  bindModuleNavbarEvents();

  // 1.1 Voltar ao Grande Salão (compatibilidade)
  const btnBack = document.getElementById('btn-back-salao-saude');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      router.navigate('salao');
    });
  }

  // 2. Alternância de Abas Principais
  document.querySelectorAll('.btn-saude-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab && targetTab !== currentTab) {
        currentTab = targetTab;
        updateView();
      }
    });
  });

  // 3. Alternância entre Pratos de Hoje vs Grade Semanal (Aba Cardápio)
  const btnViewToday = document.getElementById('btn-view-today');
  if (btnViewToday) {
    btnViewToday.addEventListener('click', () => {
      currentSubView = 'today';
      updateView();
    });
  }

  const btnViewWeek = document.getElementById('btn-view-week');
  if (btnViewWeek) {
    btnViewWeek.addEventListener('click', async () => {
      currentSubView = 'week';
      if (!weekData) {
        try {
          const res = await api.get('/api/nutrition/week');
          if (res && res.success) {
            weekData = res;
          }
        } catch (e) {
          showToast('Erro ao carregar cardápio semanal.', 'error');
        }
      }
      updateView();
    });
  }

  const btnLoadWeek = document.getElementById('btn-load-week');
  if (btnLoadWeek) {
    btnLoadWeek.addEventListener('click', async () => {
      try {
        const res = await api.get('/api/nutrition/week');
        if (res && res.success) {
          weekData = res;
          updateView();
        }
      } catch (e) {
        showToast('Erro ao carregar cardápio semanal.', 'error');
      }
    });
  }

  // 4. Toggle Rápido do Modo de Rotina (Certinho vs Flexível)
  const btnToggleRoutine = document.getElementById('btn-toggle-routine');
  if (btnToggleRoutine) {
    btnToggleRoutine.addEventListener('click', async () => {
      const currentMode = todayData?.routine_mode || 'certinho';
      const newMode = currentMode === 'certinho' ? 'flexivel' : 'certinho';

      try {
        const res = await api.put('/api/nutrition/schedule', { routine_mode: newMode });
        if (res && res.success) {
          showToast(`Modo alterado para ${newMode === 'flexivel' ? 'Rotina Flexível 🌴' : 'Rotina Organizada ⏰'}!`, 'success');
          await loadHealthData();
          updateView();
        }
      } catch (err) {
        showToast(err.message || 'Erro ao alterar rotina.', 'error');
      }
    });
  }

  // 5. Botões de Ir para Validação de uma Refeição específica
  document.querySelectorAll('.btn-goto-checkin').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-meal-type');
      if (type) {
        selectedMealType = type;
        currentTab = 'validacao';
        updateView();
      }
    });
  });

  // 6. Botões de Editar Prato no Construtor
  document.querySelectorAll('.btn-edit-meal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-meal-type');
      if (type) {
        selectedMealType = type;
        currentTab = 'builder';
        updateView();
      }
    });
  });

  // 7. Seletor de Refeição na Validação
  document.querySelectorAll('.btn-select-val-meal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type) {
        selectedMealType = type;
        updateView();
      }
    });
  });

  // 8. Validação Rápida com 1 Clique (No Horário, Atrasou, Faltou)
  document.querySelectorAll('.btn-do-checkin').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = btn.getAttribute('data-user-id');
      const characterId = btn.getAttribute('data-char-id');
      const status = btn.getAttribute('data-status');
      const mealDate = todayData?.today || new Date().toISOString().split('T')[0];

      let penaltyNote = null;
      if (status === 'faltou') {
        penaltyNote = prompt('Informe a advertência/motivo da falta na refeição (opcional):') || 'Não compareceu à mesa no horário estipulado';
      }

      try {
        const res = await api.post('/api/nutrition/checkin', {
          user_id: userId,
          character_id: characterId || undefined,
          meal_date: mealDate,
          meal_type: selectedMealType,
          status,
          penalty_note: penaltyNote,
        });

        if (res && res.success) {
          showToast(res.message, status === 'no_horario' ? 'success' : status === 'atrasado' ? 'warning' : 'error');
          await loadHealthData();
          updateView();
        }
      } catch (err) {
        showToast(err.message || 'Erro ao validar presença.', 'error');
      }
    });
  });

  // 9. Construtor de Pratos: Adicionar e Remover Linhas de Alimentos
  const btnAddRow = document.getElementById('btn-add-ingredient-row');
  if (btnAddRow) {
    btnAddRow.addEventListener('click', () => {
      const container = document.getElementById('ingredient-rows-container');
      if (!container) return;

      const newRow = document.createElement('div');
      newRow.className = 'ingredient-row';
      newRow.style.cssText = 'display: grid; grid-template-columns: 2fr 1.2fr 1.5fr 1.5fr auto; gap: 8px; align-items: center;';
      newRow.innerHTML = `
        <input type="text" placeholder="Nome (ex: Cenoura Ralada)" class="noble-input ing-name" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
        <input type="text" placeholder="Peso (ex: 60g)" class="noble-input ing-grams" value="100g" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
        <select class="noble-input ing-category" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
          <option value="proteina">🥩 Proteína Magra</option>
          <option value="carboidrato">🍚 Carboidrato Bom</option>
          <option value="salada">🥬 Salada</option>
          <option value="legume" selected>🥕 Legume no Vapor</option>
          <option value="fruta">🍌 Fruta</option>
          <option value="bebida">🍵 Bebida</option>
        </select>
        <input type="text" placeholder="Tag (ex: vesicula_segura)" class="noble-input ing-tags" value="digestao_facil" style="padding: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 0.82rem;">
        <button type="button" class="btn-noble btn-noble-sm btn-remove-row" style="background: rgba(239, 68, 68, 0.3); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); padding: 8px 10px;">🗑️</button>
      `;
      container.appendChild(newRow);

      newRow.querySelector('.btn-remove-row')?.addEventListener('click', () => {
        newRow.remove();
      });
    });
  }

  // Remover linhas existentes do construtor
  document.querySelectorAll('.btn-remove-row').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('.ingredient-row');
      if (row) row.remove();
    });
  });

  // Salvar Prato no Construtor
  const formMealBuilder = document.getElementById('form-meal-builder');
  if (formMealBuilder) {
    formMealBuilder.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mealDate = document.getElementById('builder-meal-date')?.value;
      const mealType = document.getElementById('builder-meal-type')?.value;
      const title = document.getElementById('builder-meal-title')?.value;
      const notes = document.getElementById('builder-meal-notes')?.value;

      const items = [];
      document.querySelectorAll('#ingredient-rows-container .ingredient-row').forEach((row) => {
        const name = row.querySelector('.ing-name')?.value;
        const grams = row.querySelector('.ing-grams')?.value;
        const category = row.querySelector('.ing-category')?.value;
        const tags = row.querySelector('.ing-tags')?.value;

        if (name && name.trim().length > 0) {
          items.push({
            name: name.trim(),
            quantity_grams: grams || '100g',
            category: category || 'proteina',
            health_tags: tags || '',
          });
        }
      });

      try {
        const res = await api.post('/api/nutrition/meal', {
          meal_date: mealDate,
          meal_type: mealType,
          title: title.trim(),
          cooking_notes: notes,
          items,
        });

        if (res && res.success) {
          showToast('Prato e ingredientes salvos com sucesso no cardápio!', 'success');
          await loadHealthData();
          currentTab = 'cardapio';
          updateView();
        }
      } catch (err) {
        showToast(err.message || 'Erro ao salvar prato.', 'error');
      }
    });
  }

  const btnCancelBuilder = document.getElementById('btn-cancel-builder');
  if (btnCancelBuilder) {
    btnCancelBuilder.addEventListener('click', () => {
      currentTab = 'cardapio';
      updateView();
    });
  }

  // 10. Lista de Compras: Toggle de Comprado
  document.querySelectorAll('.shop-toggle-cb').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const itemId = cb.getAttribute('data-id');
      const isPurchased = cb.checked;

      try {
        const res = await api.post('/api/nutrition/shopping/toggle', {
          itemId,
          is_purchased: isPurchased,
        });

        if (res && res.success) {
          await loadHealthData();
          updateView();
        }
      } catch (err) {
        showToast('Erro ao atualizar item de compras.', 'error');
        cb.checked = !isPurchased;
      }
    });
  });

  // Adicionar Novo Item na Lista de Compras
  const formAddShopping = document.getElementById('form-add-shopping');
  if (formAddShopping) {
    formAddShopping.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('shop-input-name');
      const qtyInput = document.getElementById('shop-input-qty');
      const catInput = document.getElementById('shop-input-category');

      const name = nameInput?.value;
      const quantity = qtyInput?.value;
      const category = catInput?.value;

      if (!name || name.trim().length === 0) return;

      try {
        const res = await api.post('/api/nutrition/shopping', {
          name: name.trim(),
          quantity: quantity ? quantity.trim() : '1 un',
          category,
        });

        if (res && res.success) {
          showToast('Item adicionado à lista de compras!', 'success');
          await loadHealthData();
          updateView();
        }
      } catch (err) {
        showToast(err.message || 'Erro ao adicionar item.', 'error');
      }
    });
  }

  // Excluir Item de Compras
  document.querySelectorAll('.btn-delete-shop-item').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const itemId = btn.getAttribute('data-id');
      if (!itemId) return;

      if (!confirm('Deseja realmente remover este item da lista?')) return;

      try {
        const res = await api.delete(`/api/nutrition/shopping/${itemId}`);
        if (res && res.success) {
          showToast('Item removido da lista!', 'info');
          await loadHealthData();
          updateView();
        }
      } catch (err) {
        showToast(err.message || 'Erro ao remover item.', 'error');
      }
    });
  });

  // 11. Controle de Hidratação
  const btnAddWater = document.getElementById('btn-add-water');
  if (btnAddWater) {
    btnAddWater.addEventListener('click', () => {
      if (waterGlasses < 8) {
        waterGlasses += 1;
        localStorage.setItem('liraquest_water_count', waterGlasses.toString());
        showToast(`💧 Copo d'água registrado! (+5 XP)`, 'success');
        updateView();
      } else {
        showToast('🏆 Parabéns! Meta diária de 8 copos atingida com honra!', 'info');
      }
    });
  }

  const btnResetWater = document.getElementById('btn-reset-water');
  if (btnResetWater) {
    btnResetWater.addEventListener('click', () => {
      waterGlasses = 0;
      localStorage.setItem('liraquest_water_count', '0');
      showToast('Contador de copos d\'água reiniciado para o novo dia.', 'info');
      updateView();
    });
  }

  // 12. Escuta de WebSockets em tempo real para Alarme das Refeições e WhatsApp
  const rawSocket = typeof socket?.getSocket === 'function' ? socket.getSocket() : (socket?.instance || null);
  if (rawSocket) {
    if (typeof rawSocket.off === 'function') {
      rawSocket.off('nutrition:meal_alert');
      rawSocket.off('whatsapp:status');
      rawSocket.off('whatsapp:qr_generated');
      rawSocket.off('whatsapp:message_sent');
    }
    rawSocket.on('nutrition:meal_alert', (alarm) => {
      console.log('🔔 [Alarme de Refeição Recebido]:', alarm);
      showToast(`🔔 ${alarm.title}: ${alarm.message}`, 'warning', 6000);
      loadHealthData().then(updateView);
    });
  }

  // 13. Ativar Notificações Web Push no Dispositivo Atual
  const btnPushSubscribe = document.getElementById('btn-push-subscribe');
  if (btnPushSubscribe) {
    btnPushSubscribe.addEventListener('click', async () => {
      try {
        btnPushSubscribe.disabled = true;
        btnPushSubscribe.textContent = '⏳ Ativando no Navegador...';
        showToast('Solicitando permissão no seu navegador...', 'info');

        const res = await subscribeDeviceToPush();
        showToast('🎉 Notificações do Clã ativadas com sucesso neste aparelho!', 'success');
        await loadHealthData();
        updateView();
      } catch (err) {
        showToast(err.message || 'Erro ao ativar notificações.', 'error');
        btnPushSubscribe.disabled = false;
        btnPushSubscribe.innerHTML = '<span>🔔</span><span>Ativar Notificações no meu Celular</span>';
      }
    });
  }

  // 14. Testar Notificação Imediata
  const btnPushTest = document.getElementById('btn-push-test');
  if (btnPushTest) {
    btnPushTest.addEventListener('click', async () => {
      try {
        btnPushTest.disabled = true;
        showToast('Enviando notificação de teste...', 'info');

        const res = await api.post('/api/push/test', {});
        if (res && res.success) {
          showToast(`✅ ${res.message}`, 'success');
        }
      } catch (err) {
        showToast(err.message || 'Erro ao disparar teste.', 'error');
      } finally {
        btnPushTest.disabled = false;
      }
    });
  }

  // 15. Desativar Notificações no Dispositivo Atual
  const btnPushUnsub = document.getElementById('btn-push-unsubscribe');
  if (btnPushUnsub) {
    btnPushUnsub.addEventListener('click', async () => {
      if (!confirm('Deseja realmente desativar as notificações neste aparelho?')) return;
      try {
        await unsubscribeDeviceFromPush();
        showToast('Notificações desativadas para este aparelho.', 'info');
        await loadHealthData();
        updateView();
      } catch (err) {
        showToast(err.message || 'Erro ao desativar notificações.', 'error');
      }
    });
  }

  // 16. Disparo de Templates Rápidos dos Guardiões
  document.querySelectorAll('.btn-push-template').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const templateCode = btn.getAttribute('data-template');
      if (!templateCode) return;

      try {
        showToast('Disparando alarme para os celulares da família...', 'info');
        const res = await api.post('/api/push/broadcast', { template_code: templateCode });

        if (res && res.success) {
          showToast(`✅ ${res.message}`, 'success');
          const fb = document.getElementById('push-dispatch-feedback');
          if (fb) {
            fb.style.display = 'block';
            fb.innerHTML = `<strong>✅ Disparo Concluído:</strong> Notificação enviada para ${res.details?.sent || 0} celular(es) ativo(s)!`;
            fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch (err) {
        showToast(err.message || 'Erro ao disparar alarme.', 'error');
      }
    });
  });

  // 17. Disparo de Comunicado Livre Personalizado do Pai
  const btnPushSendCustom = document.getElementById('btn-push-send-custom');
  if (btnPushSendCustom) {
    btnPushSendCustom.addEventListener('click', async () => {
      const input = document.getElementById('input-push-custom-text');
      const text = input?.value;

      if (!text || text.trim().length === 0) {
        showToast('Digite uma mensagem antes de disparar o alerta.', 'warning');
        return;
      }

      try {
        btnPushSendCustom.disabled = true;
        showToast('Enviando comunicado para todos os celulares...', 'info');

        const res = await api.post('/api/push/broadcast', { custom_text: text.trim() });
        if (res && res.success) {
          showToast(`✅ ${res.message}`, 'success');
          input.value = '';
          const fb = document.getElementById('push-dispatch-feedback');
          if (fb) {
            fb.style.display = 'block';
            fb.innerHTML = `<strong>📢 Alerta Enviado:</strong> Mensagem recebida em ${res.details?.sent || 0} celular(es) da família!`;
            fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch (err) {
        showToast(err.message || 'Erro ao enviar comunicado.', 'error');
      } finally {
        btnPushSendCustom.disabled = false;
      }
    });
  }
}

/**
 * Atualiza o HTML da tela dinamicamente sem recarregar a página
 */
async function updateView() {
  const container = document.getElementById('app');
  if (container) {
    container.innerHTML = await renderSaudeView();
    bindSaudeEvents();
  }
}
