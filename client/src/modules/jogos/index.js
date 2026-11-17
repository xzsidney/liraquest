/**
 * LiraQuest - Módulo 3: Salão de Jogos (Arcade Nobre do Reino)
 * Fase 3: Modularização completa integrada aos Portais do Reino
 * Hub Central com Truco Paulista, Marvel Zombies, Duelo 1v1, Arqueiro, Quests e Arena 2D
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';
import { renderModuleNavbar, bindModuleNavbarEvents } from '../../components/ModuleNavbar.js';

// Estado Local do Módulo de Jogos
let selectedGameCategory = 'TODOS'; // 'TODOS', 'CARTAS', 'SABER', 'COMBATE'
let currentEnergy = 0;
let currentGold = 0;
let currentLevel = 1;
let currentXP = 0;

/**
 * Carrega saldos de energia e moedas do herói
 */
async function loadJogosUserData() {
  try {
    const [progRes, charRes] = await Promise.all([
      api.get('/api/progress/me').catch(() => null),
      api.get('/api/character/me').catch(() => null),
    ]);

    if (progRes && progRes.progress) {
      currentEnergy = progRes.progress.adventure_energy || 0;
    }
    if (charRes && charRes.character) {
      currentGold = charRes.character.gold || 0;
      currentLevel = charRes.character.level || 1;
      currentXP = charRes.character.current_xp || 0;
    }
  } catch (err) {
    console.warn('Erro ao carregar dados para o salão de jogos:', err);
  }
}

/**
 * Renderização Principal do Lobby do Salão de Jogos
 */
export async function renderJogosView() {
  await loadJogosUserData();

  const user = auth.getUser();
  const character = auth.getCharacter();

  const topNavbarHtml = renderModuleNavbar({
    currentModule: 'jogos',
    title: 'Salão de Jogos & Arcade do Reino',
    subtitle: 'Lobby nobre de games familiares. Consomem ⚡ Energia de Aventura gerada nos hábitos e estudos e creditam 💰 Ouro e ⭐ XP!',
    icon: '🎮',
    badges: [
      { label: `${currentEnergy} Energia`, icon: '⚡', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' },
      { label: `${currentGold} Ouro`, icon: '🪙', bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.4)', color: '#fde047' },
      { label: '7 Jogos Conectados', icon: '🕹️', bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' },
    ],
  });

  return `
    <div class="module-jogos-view" style="animation: fadeIn 0.3s ease;">
      
      <!-- BARRA SUPERIOR NOBRE DE NAVEGAÇÃO (FASE 5) -->
      ${topNavbarHtml}

      <!-- BANNER DE ALERTA SE ENERGIA ESTIVER BAIXA -->
      ${currentEnergy < 3 ? `
        <div style="background: linear-gradient(135deg, rgba(128, 0, 32, 0.4), rgba(30, 58, 138, 0.3)); border: 1.5px solid var(--accent); border-radius: 16px; padding: 14px 20px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.8rem;">⚡🔋</span>
            <div>
              <strong style="color: #fde047; font-size: 0.95rem; display: block;">Sua Energia de Aventura está baixa (${currentEnergy} ⚡)!</strong>
              <span style="font-size: 0.82rem; color: #cbd5e1;">Cumpra tarefas no <strong>Módulo Casa</strong> ou faça uma sessão de foco no <strong>Módulo Estudos</strong> para recarregar suas energias!</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.navigateToModule('casa')" class="btn-noble btn-noble-gold btn-noble-sm">
              🏡 Ir para Casa
            </button>
            <button onclick="window.navigateToModule('estudos')" class="btn-noble btn-noble-primary btn-noble-sm">
              📚 Focar nos Estudos
            </button>
          </div>
        </div>
      ` : ''}

      <!-- FILTRO DE CATEGORIAS DO SALÃO -->
      <div style="display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap;">
        <button class="btn-noble ${selectedGameCategory === 'TODOS' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-filter-game" data-cat="TODOS">
          🎮 Todos os Games (7)
        </button>
        <button class="btn-noble ${selectedGameCategory === 'CARTAS' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-filter-game" data-cat="CARTAS">
          🃏 Cartas & Tabuleiro
        </button>
        <button class="btn-noble ${selectedGameCategory === 'SABER' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-filter-game" data-cat="SABER">
          🏹 Quiz & Sabedoria
        </button>
        <button class="btn-noble ${selectedGameCategory === 'COMBATE' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-filter-game" data-cat="COMBATE">
          ⚔️ Combate & RPG
        </button>
      </div>

      <!-- GRID NOBRE DOS 7 JOGOS DO REINO -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        
        <!-- JOGO 1: TRUCO PAULISTA MOBILE -->
        ${shouldShowGame('CARTAS') ? `
          <div class="arcade-card" style="border-color: rgba(245, 158, 11, 0.45);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">🃏</span>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 100% OPERACIONAL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Truco Paulista Mobile</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Mão de 11, vira, manilhas e blefe tático! Jogue partidas em duplas ou solo contra bots cooperativos e acumule Ouro e XP para seu herói!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +40 Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⭐ +60 XP</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 3 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-gold btn-play-game" data-game="truco" data-cost="3" style="width: 100%;">
              🃏 Jogar Truco Paulista (3 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 2: MARVEL ZOMBIES RPG (ZOMBICIDE) -->
        ${shouldShowGame('CARTAS') ? `
          <div class="arcade-card" style="border-color: rgba(239, 68, 68, 0.45);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">🧟</span>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 100% OPERACIONAL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Marvel Zombies RPG</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Companheiro digital de campanha pós-apocalíptica investigativa: 82 fichas de heróis, dados D6, keypad de senha e sincronização MySQL.
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🦸 82 Heróis Vivos/Zumbis</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">📜 5 Capítulos RPG</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 3 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-primary btn-play-game" data-game="zombi" data-cost="3" style="width: 100%; border-color: rgba(239, 68, 68, 0.6);">
              🧟 Acessar Marvel Zombies (3 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 3: DUELO DE ARQUEIROS 1v1 REALTIME -->
        ${shouldShowGame('SABER') ? `
          <div class="arcade-card" style="border-color: rgba(59, 130, 246, 0.45);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">⚔️🏹</span>
                <span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  ⚡ MULTIPLAYER 1v1
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Duelo de Arqueiros (1v1)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Partidas em tempo real via Socket.IO entre membros da família no Canvas 2D! Responda quizzes curriculares com reflexo e supere seu oponente!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +50 Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🧠 +2 INT</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 4 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-secondary btn-play-game" data-game="duel" data-cost="4" style="width: 100%;">
              🏹 Entrar no Duelo 1v1 (4 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 4: O ARQUEIRO DO SABER (QUIZ SOLO) -->
        ${shouldShowGame('SABER') ? `
          <div class="arcade-card" style="border-color: rgba(212, 175, 55, 0.45);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">🎯🏹</span>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 100% OPERACIONAL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">O Arqueiro do Saber (Solo)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Quiz educativo com disparo de flechas em alvos flutuantes no Canvas 2D. Acerte as respostas corretas, capture o Pássaro Dourado e turbine seu intelecto!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +35 Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🧠 +1 INT</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 4 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-gold btn-play-game" data-game="archer" data-cost="4" style="width: 100%;">
              🎯 Disparar Flechas Solo (4 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 5: AVENTURAS EM QUEST (LIVRO-JOGO MASMORRA) -->
        ${shouldShowGame('COMBATE') ? `
          <div class="arcade-card" style="border-color: rgba(128, 0, 32, 0.5);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">📜🎲</span>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 100% OPERACIONAL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Aventuras em Quest (Masmorras)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                RPG narrativo interativo com rolagem animada de dado D20 contra os monstros da casa: enfrente o Goblin da Sujeira e o Titã da Procrastinação!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +70 Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🛡️ +1 Atributo Permanente</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 5 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-primary btn-play-game" data-game="dungeon" data-cost="5" style="width: 100%;">
              📜 Desbravar Masmorra (5 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 6: ARENA DE BATALHA 2D (RPG CTB) -->
        ${shouldShowGame('COMBATE') ? `
          <div class="arcade-card" style="border-color: rgba(212, 175, 55, 0.4);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">⚔️🛡️</span>
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 100% OPERACIONAL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Arena de Batalha 2D (CTB)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Combate tático por turnos estilo RPG clássico com sprites 2D da era de ouro (Capitão, Wolverine, Ciclope), feixes de luz WebGL e fila visual de turnos!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +50 Ouro</span>
                <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⭐ +80 XP</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 5 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-secondary btn-play-game" data-game="battle" data-cost="5" style="width: 100%;">
              ⚔️ Entrar na Arena 2D (5 ⚡)
            </button>
          </div>
        ` : ''}

        <!-- JOGO 7: ESCONDE-ESCONDE CAMALEÃO -->
        ${shouldShowGame('COMBATE') ? `
          <div class="arcade-card" style="border-color: rgba(16, 185, 129, 0.45);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span style="font-size: 2.8rem;">🔦🦎</span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
                  🟢 DISPONÍVEL
                </span>
              </div>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-bottom: 6px;">Esconde-Esconde Camaleão</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                Camufle-se ficando sobre pisos da mesma cor e desvie do facho de luz da lanterna da patrulha para sobreviver aos 45 segundos de adrenalina!
              </p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Agilidade</span>
                <span style="background: rgba(212, 175, 55, 0.15); color: #fde047; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">🪙 +30 Ouro</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">⚡ Custa 3 Energia</span>
              </div>
            </div>
            <button class="btn-noble btn-noble-secondary btn-play-game" data-game="chameleon" data-cost="3" style="width: 100%;">
              🔦 Jogar Camaleão (3 ⚡)
            </button>
          </div>
        ` : ''}

      </div>

    </div>
  `;
}

// Auxiliar de filtro
function shouldShowGame(cat) {
  if (selectedGameCategory === 'TODOS') return true;
  return selectedGameCategory === cat;
}

/**
 * Vinculação dos Eventos Interativos do Salão de Jogos
 */
export function bindJogosEvents() {
  // Barra Superior Nobre de Navegação (Fase 5)
  bindModuleNavbarEvents();

  // Voltar ao Grande Salão (compatibilidade)
  const btnBack = document.getElementById('btn-back-salao-jogos');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Atalho global para navegação entre módulos
  window.navigateToModule = (target) => {
    router.navigate(target);
  };

  // Filtros de Categoria
  document.querySelectorAll('.btn-filter-game').forEach(btn => {
    btn.onclick = () => {
      selectedGameCategory = btn.dataset.cat;
      router.navigate('jogos');
    };
  });

  // Launcher Unificado de Jogos com Validação de Autenticação e Energia
  document.querySelectorAll('.btn-play-game').forEach(btn => {
    btn.onclick = () => {
      const game = btn.dataset.game;
      const cost = parseInt(btn.dataset.cost || '3', 10);

      // 1. Validar autenticação
      if (!auth.isAuthenticated()) {
        showToast('Acesso restrito: Faça login para jogar.', 'error');
        router.navigate('login');
        return;
      }

      // 2. Validar energia
      if (currentEnergy < cost) {
        showModal({
          title: '⚡ Energia Insuficiente',
          contentHtml: `
            <div style="text-align: center; padding: 12px 0;">
              <div style="font-size: 3rem; margin-bottom: 10px;">⚡🪫</div>
              <h3 class="cinzel gold-gradient-text" style="margin-bottom: 8px;">Você precisa de ${cost} Energias de Aventura!</h3>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin-bottom: 16px;">
                Seu saldo atual é de <strong>${currentEnergy} ⚡</strong>.
                Para ganhar mais energia, você pode:
              </p>
              <div style="display: flex; flex-direction: column; gap: 8px; text-align: left; margin-bottom: 16px;">
                <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 10px 14px; font-size: 0.85rem; color: #fde047;">
                  🏡 <strong>Módulo Casa:</strong> Cumpra missões do lar (+2 a +4 ⚡)
                </div>
                <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 10px 14px; font-size: 0.85rem; color: #93c5fd;">
                  📚 <strong>Módulo Estudos:</strong> Complete um ciclo de foco Pomodoro (+3 ⚡)
                </div>
              </div>
            </div>
          `,
          confirmText: '🏡 Ir para Casa',
          cancelText: '📚 Ir para Estudos',
          onConfirm: () => {
            router.navigate('casa');
            return true;
          },
          onCancel: () => {
            router.navigate('estudos');
          }
        });
        return;
      }

      // 3. Redirecionamento Autenticado
      launchGame(game);
    };
  });
}

/**
 * Disparo e Inicialização de Cada Jogo
 */
function launchGame(game) {
  // Garante que o token JWT esteja gravado em localStorage com as chaves padrão
  const token = auth.state.token;
  if (token) {
    localStorage.setItem('liraquest_token', token);
    localStorage.setItem('token', token);
  }

  showToast('Iniciando jogo...', 'info');

  switch (game) {
    case 'truco':
      window.location.href = '/truco';
      break;
    case 'zombi':
      window.location.href = '/zombi';
      break;
    case 'duel':
      window.location.href = '/duel.html';
      break;
    case 'archer':
      window.location.href = '/archer.html';
      break;
    case 'dungeon':
      window.location.href = '/dungeon.html';
      break;
    case 'battle':
      window.location.href = '/battle.html';
      break;
    case 'chameleon':
      try { localStorage.setItem('liraquest_avatar_tab', 'arcade'); } catch(e) {}
      window.location.href = '/duel.html';
      break;
    default:
      showToast('Jogo selecionado não encontrado.', 'error');
  }
}
