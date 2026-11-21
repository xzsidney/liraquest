/**
 * LiraQuest - Estudos & Foco Pomodoro (frontend/src/views/StudyView.js)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { renderHeroHUD } from '../components/HeroHUD.js';

let pomodoroSeconds = 25 * 60;
let timerInterval = null;

export function renderStudyView() {
  const mins = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
  const secs = (pomodoroSeconds % 60).toString().padStart(2, '0');

  return `
    <div style="animation: fadeIn 0.3s ease-out;">
      ${renderHeroHUD()}

      <div style="margin-bottom: 20px;">
        <button id="btn-back-hub" class="btn-noble btn-noble-secondary btn-noble-sm" style="margin-bottom: 8px;">
          ⬅️ Voltar ao Salão
        </button>
        <h2 class="cinzel gold-gradient-text" style="font-size: 1.8rem;">📚 Estudos, Pomodoro & Conhecimento</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Concentre-se nos estudos escolares e leitura para evoluir a Inteligência (INT) e ganhar Ouro.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <!-- Pomodoro Nobre -->
        <div class="noble-card" style="text-align: center;">
          <h3 class="cinzel" style="color: #fff; margin-bottom: 12px;">⏳ Pomodoro do Sábio</h3>
          <div style="font-size: 4rem; font-weight: 900; font-family: monospace; color: #fde047; margin: 16px 0;" id="pomodoro-timer-display">
            ${mins}:${secs}
          </div>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <button id="btn-start-pomodoro" class="btn-noble btn-noble-gold">
              ▶️ Iniciar Foco (25 min)
            </button>
            <button id="btn-reset-pomodoro" class="btn-noble btn-noble-secondary">
              🔄 Reiniciar
            </button>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 14px;">
            Sem distrações! Ao completar o ciclo de 25 min, ganhe +25 XP e +5 Ouro.
          </p>
        </div>

        <!-- Missões Escolares -->
        <div class="noble-card">
          <h3 class="cinzel" style="color: #fff; margin-bottom: 12px;">📝 Missões do Saber</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: rgba(255, 255, 255, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.2);">
              <strong style="color: #fff; font-size: 0.95rem;">📖 Leitura Diária (20 páginas)</strong>
              <p style="color: var(--text-muted); font-size: 0.8rem;">Livro de aventura ou matéria escolar.</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.2);">
              <strong style="color: #fff; font-size: 0.95rem;">✍️ Lição de Casa e Revisão</strong>
              <p style="color: var(--text-muted); font-size: 0.8rem;">Caderno em dia e dever de matemática/português.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindStudyEvents() {
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) btnBack.onclick = () => router.navigate('hub');

  const btnStart = document.getElementById('btn-start-pomodoro');
  const btnReset = document.getElementById('btn-reset-pomodoro');
  const timerDisplay = document.getElementById('pomodoro-timer-display');

  if (btnStart) {
    btnStart.onclick = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btnStart.textContent = '▶️ Retomar Foco';
      } else {
        btnStart.textContent = '⏸️ Pausar Foco';
        timerInterval = setInterval(() => {
          if (pomodoroSeconds > 0) {
            pomodoroSeconds--;
            const mins = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
            const secs = (pomodoroSeconds % 60).toString().padStart(2, '0');
            if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
          } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('🎉 Ciclo Pomodoro concluído com honra! +25 XP para o seu Herói!');
            btnStart.textContent = '▶️ Iniciar Foco (25 min)';
          }
        }, 1000);
      }
    };
  }

  if (btnReset) {
    btnReset.onclick = () => {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      pomodoroSeconds = 25 * 60;
      if (timerDisplay) timerDisplay.textContent = '25:00';
      if (btnStart) btnStart.textContent = '▶️ Iniciar Foco (25 min)';
    };
  }
}

export default { renderStudyView, bindStudyEvents };
