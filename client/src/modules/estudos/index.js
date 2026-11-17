/**
 * LiraQuest - Módulo 2: Estudos (Pomodoro Gamificado, Lições & Matérias)
 */

import { router } from '../../core/router.js';
import { showToast } from '../../components/Toast.js';

let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let isRunning = false;
let currentMode = 'focus'; // 'focus' (25min) ou 'break' (5min)

export function renderEstudosView() {
  const minutes = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
  const seconds = (pomodoroSeconds % 60).toString().padStart(2, '0');

  return `
    <div class="module-estudos-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(59, 130, 246, 0.4);">
        <div class="module-title-box">
          <span class="icon">📚</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Estudos & Sabedoria</h2>
            <p>Pomodoro gamificado de foco, lições de casa, matérias escolares e evolução do intelecto.</p>
          </div>
        </div>
        <button id="btn-back-salao-estudos" class="btn-noble btn-noble-secondary btn-noble-sm">
          ⬅️ Voltar ao Grande Salão
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
        <!-- CARD DO POMODORO DE FOCO -->
        <div class="noble-card" style="text-align: center; border-color: rgba(59, 130, 246, 0.35); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 20px;">
          <div style="font-size: 0.85rem; color: #93c5fd; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 8px;">
            ${currentMode === 'focus' ? '⏳ Sessão de Foco Total (25m)' : '☕ Pausa Restauradora (5m)'}
          </div>

          <div id="pomodoro-display" class="cinzel" style="font-size: 4.5rem; font-weight: 900; color: #ffffff; letter-spacing: 2px; margin: 12px 0;">
            ${minutes}:${seconds}
          </div>

          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 320px; margin-bottom: 24px;">
            ${currentMode === 'focus' ? 'Concentre-se nos seus livros ou dever de casa sem distrações. Ao terminar, ganhe +25 XP e +10 Ouro!' : 'Respire fundo, beba água e relaxe antes do próximo ciclo de sabedoria.'}
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
            <button id="btn-pomodoro-toggle" class="btn-noble btn-noble-primary" style="padding: 12px 28px; font-size: 1rem;">
              ${isRunning ? '⏸️ Pausar' : '▶️ Iniciar Foco'}
            </button>
            <button id="btn-pomodoro-reset" class="btn-noble btn-noble-secondary btn-noble-sm">
              🔄 Reiniciar
            </button>
          </div>
        </div>

        <!-- CARD DE LIÇÕES & MATÉRIAS -->
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin: 0;">📖 Matérias & Deveres</h3>
            <span style="font-size: 0.78rem; background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Ano Letivo</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.95rem;">📐 Matemática & Lógica</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Exercícios de frações e tabuada</span>
              </div>
              <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">Em Dia</span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.95rem;">📚 Português & Leitura</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Ler 20 páginas do livro da semana</span>
              </div>
              <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">Hoje</span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff; font-size: 0.95rem;">🔬 Ciências & História</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">Revisão para o desafio quinzenal</span>
              </div>
              <span style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">Amanhã</span>
            </div>
          </div>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              💡 Dica do Guardião: Cada ciclo completo de Pomodoro desbloqueia energia para duelos no Salão de Jogos!
            </span>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindEstudosEvents() {
  const btnBack = document.getElementById('btn-back-salao-estudos');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  const btnToggle = document.getElementById('btn-pomodoro-toggle');
  const btnReset = document.getElementById('btn-pomodoro-reset');
  const display = document.getElementById('pomodoro-display');

  const updateDisplay = () => {
    if (!display) return;
    const minutes = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
    const seconds = (pomodoroSeconds % 60).toString().padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
  };

  if (btnToggle) {
    btnToggle.onclick = () => {
      if (isRunning) {
        clearInterval(pomodoroTimer);
        isRunning = false;
        btnToggle.textContent = '▶️ Retomar Foco';
      } else {
        isRunning = true;
        btnToggle.textContent = '⏸️ Pausar';
        pomodoroTimer = setInterval(() => {
          if (pomodoroSeconds > 0) {
            pomodoroSeconds--;
            updateDisplay();
          } else {
            clearInterval(pomodoroTimer);
            isRunning = false;
            if (currentMode === 'focus') {
              showToast('🏆 Ciclo de Foco Concluído! Parabéns! +25 XP e +10 Ouro!', 'success');
              currentMode = 'break';
              pomodoroSeconds = 5 * 60;
            } else {
              showToast('☕ Pausa finalizada! Pronto para o próximo ciclo!', 'info');
              currentMode = 'focus';
              pomodoroSeconds = 25 * 60;
            }
            router.navigate('estudos');
          }
        }, 1000);
      }
    };
  }

  if (btnReset) {
    btnReset.onclick = () => {
      clearInterval(pomodoroTimer);
      isRunning = false;
      pomodoroSeconds = currentMode === 'focus' ? 25 * 60 : 5 * 60;
      updateDisplay();
      if (btnToggle) btnToggle.textContent = '▶️ Iniciar Foco';
      showToast('Cronômetro reiniciado.', 'info');
    };
  }
}
