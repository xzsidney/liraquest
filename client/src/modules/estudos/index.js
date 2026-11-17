/**
 * LiraQuest - Módulo 2: Estudos (Sabedoria, Pomodoro AFK & Lições Escolares)
 * Fase 3: Modularização completa integrada aos Portais do Reino
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

// Estado Local do Módulo de Estudos
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let initialSeconds = 25 * 60;
let isRunning = false;
let currentMode = 'focus'; // 'focus', 'deep', 'short_break', 'long_break'
let selectedSubject = 'Matemática & Lógica';
let heroProgressData = null;
let heroCharacterData = null;

// Matérias e Metadados
const SUBJECTS = [
  { name: 'Matemática & Lógica', icon: '📐', color: '#f59e0b' },
  { name: 'Português & Leitura', icon: '📚', color: '#38bdf8' },
  { name: 'Ciências & Biologia', icon: '🔬', color: '#10b981' },
  { name: 'História & Geografia', icon: '🏛️', color: '#a855f7' },
  { name: 'Idiomas & Inglês', icon: '🌍', color: '#ec4899' },
  { name: 'Leitura Livre & Sabedoria', icon: '📖', color: '#d4af37' },
];

// Lições escolares salvas no localStorage da família
function getStoredSchoolTasks() {
  try {
    const raw = localStorage.getItem('liraquest_school_tasks');
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Padrão inicial
  return [
    { id: '1', subject: 'Matemática & Lógica', title: 'Exercícios de frações e tabuada', type: 'Dever', dueDate: 'Hoje', completed: false },
    { id: '2', subject: 'Português & Leitura', title: 'Ler 20 páginas do livro do mês', type: 'Leitura', dueDate: 'Amanhã', completed: false },
    { id: '3', subject: 'Ciências & Biologia', title: 'Resumo sobre o ciclo da água', type: 'Trabalho', dueDate: 'Sexta-feira', completed: true },
  ];
}

function saveStoredSchoolTasks(tasks) {
  try {
    localStorage.setItem('liraquest_school_tasks', JSON.stringify(tasks));
  } catch (e) {}
}

// Síntese de Áudio Web Audio API (Zero lag, fanfarra do reino)
function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'victory') {
      // Fanfarra triunfal
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.12);
        g.gain.setValueAtTime(0.2, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 0.35);
      });
    } else if (type === 'check') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {}
}

/**
 * Carrega dados do herói e progresso
 */
async function loadEstudosData() {
  try {
    const [progRes, charRes] = await Promise.all([
      api.get('/api/progress/me').catch(() => null),
      api.get('/api/character/me').catch(() => null),
    ]);

    if (progRes && progRes.progress) {
      heroProgressData = progRes.progress;
    }
    if (charRes && charRes.character) {
      heroCharacterData = charRes.character;
    }
  } catch (err) {
    console.warn('Erro ao carregar dados de progresso de estudos:', err);
  }
}

/**
 * Renderização Principal da Tela de Estudos
 */
export async function renderEstudosView() {
  await loadEstudosData();

  const user = auth.getUser();
  const character = heroCharacterData || auth.getCharacter();
  const avatar = character?.avatar_icon || '🧙‍♂️';
  const heroName = character?.name || user?.name || 'Herói';
  const energy = heroProgressData?.adventure_energy || 0;
  const gold = character?.gold || 0;
  
  // Buscar valor atual de Inteligência (INT)
  let intValue = 10;
  if (character?.attributes) {
    const intAttr = character.attributes.find(a => a.attribute_info?.code === 'int' || a.attribute_code === 'int');
    if (intAttr) {
      intValue = (intAttr.base_value || 10) + (intAttr.bonus_value || 0);
    }
  }

  const minutes = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
  const seconds = (pomodoroSeconds % 60).toString().padStart(2, '0');
  const schoolTasks = getStoredSchoolTasks();

  return `
    <div class="module-estudos-view" style="animation: fadeIn 0.3s ease;">
      
      <!-- CABEÇALHO NOBRE DO MÓDULO -->
      <div class="module-header-noble" style="border-color: rgba(59, 130, 246, 0.45); margin-bottom: 22px;">
        <div class="module-title-box">
          <span class="icon">📚</span>
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 class="cinzel gold-gradient-text" style="margin: 0;">Módulo Estudos & Sabedoria</h2>
              <span style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd; font-size: 0.75rem; font-weight: 800; padding: 2px 10px; border-radius: 20px;">
                🧠 INT: ${intValue}
              </span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
              Temporizador gamificado de foco Pomodoro, modo AFK de meditação arcana e quadro de lições escolares.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 10px; font-weight: 700; color: #6ee7b7; font-size: 0.82rem;">
            ⚡ ${energy} Energia
          </div>
          <button id="btn-back-salao-estudos" class="btn-noble btn-noble-secondary btn-noble-sm">
            ⬅️ Grande Salão
          </button>
        </div>
      </div>

      <!-- GRID PRINCIPAL: POMODORO AFK + QUADRO DE LIÇÕES -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
        
        <!-- CARD DO CRONÔMETRO POMODORO & MODO AFK -->
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.4); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 30px 24px; text-align: center; position: relative;">
          
          <!-- Seletores de Modo de Foco -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px;">
            <button class="btn-noble ${currentMode === 'focus' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-mode-switch" data-mode="focus" data-sec="${25 * 60}">
              ⏳ Foco (25m)
            </button>
            <button class="btn-noble ${currentMode === 'deep' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-mode-switch" data-mode="deep" data-sec="${50 * 60}">
              🚀 Profundo (50m)
            </button>
            <button class="btn-noble ${currentMode === 'short_break' ? 'btn-noble-gold' : 'btn-noble-secondary'} btn-noble-sm btn-mode-switch" data-mode="short_break" data-sec="${5 * 60}">
              ☕ Pausa (5m)
            </button>
          </div>

          <!-- Matéria Selecionada -->
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Focando na Matéria:</label>
            <select id="select-study-subject" class="noble-input" style="background: #0f172a; color: #fde047; border: 1px solid rgba(212, 175, 55, 0.4); padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 0.9rem;">
              ${SUBJECTS.map(s => `<option value="${s.name}" ${s.name === selectedSubject ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}
            </select>
          </div>

          <!-- MOLDURA DO AVATAR EM MODO AFK -->
          <div style="background: radial-gradient(circle, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.9) 70%); border: 2px solid ${isRunning ? 'rgba(212, 175, 55, 0.6)' : 'rgba(59, 130, 246, 0.3)'}; border-radius: 24px; padding: 20px; width: 100%; max-width: 320px; margin: 12px 0;">
            <div class="${isRunning ? 'afk-avatar-glow' : ''}" style="font-size: 4rem; line-height: 1; margin-bottom: 8px;">
              ${isRunning ? '🧘' : avatar}
            </div>
            <div style="font-size: 0.85rem; font-weight: 800; color: ${isRunning ? '#fde047' : '#93c5fd'};">
              ${isRunning ? `🧘 ${heroName} em Meditação Arcana AFK` : `🛡️ ${heroName} Pronto para Estudar`}
            </div>
            <span style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              ${isRunning ? 'Enquanto você foca nos estudos, seu herói treina e absorve INT!' : 'Inicie o cronômetro para ativar o modo de treino mental.'}
            </span>
          </div>

          <!-- DISPLAY GIGANTE DO TEMPO -->
          <div id="pomodoro-display" class="cinzel" style="font-size: 4.5rem; font-weight: 900; color: #ffffff; letter-spacing: 3px; margin: 6px 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);">
            ${minutes}:${seconds}
          </div>

          <!-- RECOMPENSAS AO FINALIZAR -->
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
            <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; padding: 3px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">
              ⚡ +3 Energia de Aventura
            </span>
            <span style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #93c5fd; padding: 3px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">
              🧠 +1 Inteligência (INT)
            </span>
            <span style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.3); color: #fde047; padding: 3px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">
              🪙 +15 Ouro • ⭐ +40 XP
            </span>
          </div>

          <!-- BOTÕES DE CONTROLE -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            <button id="btn-pomodoro-toggle" class="btn-noble btn-noble-primary" style="padding: 12px 28px; font-size: 1rem;">
              ${isRunning ? '⏸️ Pausar Foco' : '▶️ Iniciar Foco'}
            </button>
            <button id="btn-pomodoro-reset" class="btn-noble btn-noble-secondary btn-noble-sm">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        <!-- QUADRO DE LIÇÕES & PROVAS ESCOLARES -->
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 class="cinzel gold-gradient-text" style="font-size: 1.25rem; margin: 0;">📖 Quadro de Lições & Provas</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Organize seus deveres escolares e ganhe XP ao concluir</span>
              </div>
              <button id="btn-add-school-task" class="btn-noble btn-noble-gold btn-noble-sm">
                ➕ Nova Lição
              </button>
            </div>

            <!-- Lista de Lições -->
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
              ${schoolTasks.length === 0 ? `
                <div style="text-align: center; padding: 32px; color: var(--text-muted); font-size: 0.9rem;">
                  Nenhuma lição pendente! Clique em "➕ Nova Lição" para organizar seu dia escolar.
                </div>
              ` : schoolTasks.map(task => `
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${task.completed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; padding: 12px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="color: ${task.completed ? '#94a3b8' : '#ffffff'}; font-size: 0.92rem; text-decoration: ${task.completed ? 'line-through' : 'none'};">
                          ${task.title}
                        </strong>
                        <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 1px 7px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">
                          ${task.subject}
                        </span>
                      </div>
                      <span style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Entrega: <strong style="color: #fde047;">${task.dueDate}</strong> • Tipo: ${task.type}
                      </span>
                    </div>
                  </div>

                  <button class="btn-noble btn-noble-secondary btn-noble-sm btn-delete-school-task" data-task-id="${task.id}" style="padding: 4px 8px; font-size: 0.75rem; border-color: rgba(239, 68, 68, 0.3); color: #f87171;">
                    🗑️
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dica Pedagógica do Mestre -->
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); background: rgba(30, 58, 138, 0.15); border-radius: 12px; padding: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
            <div style="font-size: 0.85rem; font-weight: 700; color: #93c5fd; margin-bottom: 2px;">💡 Regra de Ouro da Sabedoria:</div>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              A Energia de Aventura gerada nos Estudos recarrega seu herói para disputar partidas de <strong>Truco Paulista</strong>, <strong>Duelo de Arqueiros</strong> e desbravar as <strong>Masmorras em Quest</strong> no Salão de Jogos!
            </p>
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Vinculação dos Eventos Interativos do Módulo de Estudos
 */
export function bindEstudosEvents() {
  // Voltar ao Grande Salão
  const btnBack = document.getElementById('btn-back-salao-estudos');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  // Alternância de Modos do Pomodoro (25m, 50m, 5m)
  document.querySelectorAll('.btn-mode-switch').forEach(btn => {
    btn.onclick = () => {
      if (isRunning) {
        clearInterval(pomodoroTimer);
        isRunning = false;
      }
      currentMode = btn.dataset.mode;
      pomodoroSeconds = parseInt(btn.dataset.sec, 10);
      initialSeconds = pomodoroSeconds;
      router.navigate('estudos');
    };
  });

  // Mudança da Matéria
  const selectSubject = document.getElementById('select-study-subject');
  if (selectSubject) {
    selectSubject.onchange = (e) => {
      selectedSubject = e.target.value;
    };
  }

  // Cronômetro: Iniciar / Pausar
  const btnToggle = document.getElementById('btn-pomodoro-toggle');
  const btnReset = document.getElementById('btn-pomodoro-reset');
  const display = document.getElementById('pomodoro-display');

  const updateDisplay = () => {
    if (!display) return;
    const m = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
    const s = (pomodoroSeconds % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
  };

  if (btnToggle) {
    btnToggle.onclick = () => {
      if (isRunning) {
        clearInterval(pomodoroTimer);
        isRunning = false;
        btnToggle.textContent = '▶️ Retomar Foco';
        showToast('Foco pausado.', 'info');
      } else {
        isRunning = true;
        btnToggle.textContent = '⏸️ Pausar Foco';
        showToast(`Foco iniciado em ${selectedSubject}! Modo AFK ativado.`, 'info');

        pomodoroTimer = setInterval(async () => {
          if (pomodoroSeconds > 0) {
            pomodoroSeconds--;
            updateDisplay();
            if (pomodoroSeconds % 60 === 0) playSound('tick');
          } else {
            // Ciclo Finalizado com Louvor!
            clearInterval(pomodoroTimer);
            isRunning = false;
            playSound('victory');
            await handleFocusSessionFinished();
          }
        }, 1000);
      }
    };
  }

  if (btnReset) {
    btnReset.onclick = () => {
      clearInterval(pomodoroTimer);
      isRunning = false;
      pomodoroSeconds = initialSeconds;
      updateDisplay();
      if (btnToggle) btnToggle.textContent = '▶️ Iniciar Foco';
      showToast('Cronômetro reiniciado.', 'info');
    };
  }

  // Checkbox de Lições Escolares
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.onchange = () => {
      const taskId = cb.dataset.taskId;
      const tasks = getStoredSchoolTasks();
      const target = tasks.find(t => t.id === taskId);
      if (target) {
        target.completed = cb.checked;
        saveStoredSchoolTasks(tasks);
        playSound('check');
        showToast(target.completed ? '🎉 Lição concluída! +10 XP!' : 'Lição marcada como pendente.', 'success');
        router.navigate('estudos');
      }
    };
  });

  // Excluir Lição Escolar
  document.querySelectorAll('.btn-delete-school-task').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.dataset.taskId;
      let tasks = getStoredSchoolTasks();
      tasks = tasks.filter(t => t.id !== taskId);
      saveStoredSchoolTasks(tasks);
      showToast('Lição removida.', 'info');
      router.navigate('estudos');
    };
  });

  // Modal para Adicionar Nova Lição
  const btnAddTask = document.getElementById('btn-add-school-task');
  if (btnAddTask) {
    btnAddTask.onclick = () => {
      showModal({
        title: '➕ Adicionar Nova Lição Escolar',
        contentHtml: `
          <form id="form-school-task" style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Matéria Escolar</label>
              <select id="new-task-subject" class="noble-input" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
                ${SUBJECTS.map(s => `<option value="${s.name}">${s.icon} ${s.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Descrição do Dever / Conteúdo</label>
              <input type="text" id="new-task-title" class="noble-input" placeholder="Ex: Página 42 a 45, exercícios 1 a 6" required style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Tipo de Tarefa</label>
                <select id="new-task-type" class="noble-input" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
                  <option value="Dever">📝 Dever de Casa</option>
                  <option value="Trabalho">📑 Trabalho / Pesquisa</option>
                  <option value="Prova">🎯 Prova / Simulado</option>
                  <option value="Leitura">📖 Leitura Semanal</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 4px;">Data de Entrega</label>
                <input type="text" id="new-task-date" class="noble-input" placeholder="Ex: Amanhã, Quinta, 22/11" style="width: 100%; background: #0f172a; color: #fff; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
              </div>
            </div>
          </form>
        `,
        confirmText: 'Salvar Lição',
        onConfirm: () => {
          const title = document.getElementById('new-task-title')?.value?.trim();
          const subject = document.getElementById('new-task-subject')?.value;
          const type = document.getElementById('new-task-type')?.value || 'Dever';
          const dueDate = document.getElementById('new-task-date')?.value?.trim() || 'Em breve';

          if (!title) {
            showToast('Informe a descrição do dever.', 'warning');
            return false;
          }

          const tasks = getStoredSchoolTasks();
          tasks.unshift({
            id: Date.now().toString(),
            subject,
            title,
            type,
            dueDate,
            completed: false,
          });
          saveStoredSchoolTasks(tasks);
          showToast('Lição cadastrada com sucesso!', 'success');
          router.navigate('estudos');
          return true;
        }
      });
    };
  }
}

/**
 * Conclui a Sessão de Foco: Chama o Backend e Concede Bônus de Energia e INT
 */
async function handleFocusSessionFinished() {
  const minutes = Math.round(initialSeconds / 60);

  try {
    const res = await api.post('/api/progress/focus/finish', {
      minutes,
      subject: selectedSubject,
    });

    showModal({
      title: '🏆 Foco Total Concluído!',
      contentHtml: `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 3.5rem; margin-bottom: 8px;">🎓✨</div>
          <h3 class="cinzel gold-gradient-text" style="margin-bottom: 8px;">Parabéns pela Concentração!</h3>
          <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 16px;">
            Você dedicou <strong>${minutes} minutos</strong> de foco aos estudos em <strong>${selectedSubject}</strong>.
            Seu herói absorveu todo esse conhecimento!
          </p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 12px; border-radius: 12px;">
              <span style="font-size: 0.75rem; color: #6ee7b7; display: block;">Energia de Aventura</span>
              <strong style="font-size: 1.3rem; color: #ffffff;">+3 ⚡</strong>
            </div>
            <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 12px; border-radius: 12px;">
              <span style="font-size: 0.75rem; color: #93c5fd; display: block;">Atributo Inteligência</span>
              <strong style="font-size: 1.3rem; color: #ffffff;">+1 INT 🧠</strong>
            </div>
            <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 12px; border-radius: 12px;">
              <span style="font-size: 0.75rem; color: #fde047; display: block;">Tesouro Real</span>
              <strong style="font-size: 1.3rem; color: #ffffff;">+15 🪙</strong>
            </div>
            <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); padding: 12px; border-radius: 12px;">
              <span style="font-size: 0.75rem; color: #c084fc; display: block;">Experiência de Classe</span>
              <strong style="font-size: 1.3rem; color: #ffffff;">+40 ⭐</strong>
            </div>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
            Agora você tem Energia suficiente para jogar partidas no Salão de Jogos!
          </p>
        </div>
      `,
      confirmText: 'Sensacional! Continuar',
      onConfirm: () => {
        pomodoroSeconds = 5 * 60; // Inicia pausa restauradora de 5 min
        initialSeconds = 5 * 60;
        currentMode = 'short_break';
        router.navigate('estudos');
        return true;
      }
    });

  } catch (err) {
    showToast(err.message || 'Erro ao creditar recompensas do foco.', 'error');
  }
}
