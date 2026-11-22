/**
 * LiraQuest - Página Inicial Oficial (frontend/src/views/HomeView.js)
 * Apresentação do Reino, Menu de Navegação, Login e Cadastro
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export function renderHomeView() {
  const isLogged = auth.isAuthenticated();
  const user = auth.getUser();

  return `
    <div style="animation: fadeIn 0.4s ease-out; max-width: 1100px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- ==========================================
           1. HERO BANNER PRINCIPAL
           ========================================== -->
      <section style="text-align: center; padding: 40px 16px 30px;">
        <!-- Emblema do Castelo Real -->
        <div style="width: 90px; height: 90px; margin: 0 auto 20px; border-radius: 24px; background: linear-gradient(135deg, #800020, #1e3a8a); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 3rem; box-shadow: 0 0 35px var(--gold-glow);">
          🏰✨
        </div>

        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 6px 18px; border-radius: 30px; font-size: 0.82rem; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px;">
          ⚔️ RPG FAMILIAR GAMIFICADO
        </div>

        <h1 class="cinzel gold-gradient-text" style="font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1.15; margin-bottom: 16px; font-weight: 900;">
          A Vida Familiar Transformada em uma Jornada Épica
        </h1>

        <p style="color: #cbd5e1; font-size: clamp(1rem, 2vw, 1.2rem); line-height: 1.6; max-width: 760px; margin: 0 auto 30px;">
          Elimine o atrito doméstico e engaje seus filhos nos hábitos do dia a dia. No <strong>LiraQuest</strong>, arrumar a cama, estudar e comer bem geram o combustível para desbravar masmorras e resgatar recompensas na vida real.
        </p>

        <!-- MENU DE AÇÕES PRINCIPAIS (ACESSO RÁPIDO) -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 40px;">
          ${isLogged ? `
            <button id="home-btn-go-hub" class="btn-noble btn-noble-gold" style="padding: 16px 36px; font-size: 1.1rem;">
              🏰 Entrar no Salão do Herói (${user?.hero_nickname || user?.name || 'Aventureiro'})
            </button>
          ` : `
            <button id="home-btn-login" class="btn-noble btn-noble-gold" style="padding: 16px 34px; font-size: 1.05rem;">
              🔑 Acessar Conta (Fazer Login)
            </button>
            <button id="home-btn-register" class="btn-noble btn-noble-secondary" style="padding: 16px 34px; font-size: 1.05rem;">
              ✨ Cadastrar Novo Herói (Filho)
            </button>
          `}
        </div>

        <!-- Indicador de Status / Família Fundadora -->
        <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 20px; border-radius: 20px; font-size: 0.85rem; color: var(--text-muted);">
          <span>🛡️ <strong>Clã Lira Oficial</strong> ativo</span>
          <span>•</span>
          <span style="color: #4ade80;">🟢 Servidor Fullstack Online</span>
          <span>•</span>
          <span>🎲 Sistema D20 Habilitado</span>
        </div>
      </section>

      <!-- ==========================================
           2. OS 4 PILARES DA VIDA FAMILIAR
           ========================================== -->
      <section style="margin: 30px 0 50px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 class="cinzel gold-gradient-text" style="font-size: 2rem; margin-bottom: 8px;">
            Os Quatro Pilares do Reino
          </h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            A vida real é o combustível direto do jogo. Conheça as quatro forças do lar:
          </p>
        </div>

        <div class="pilares-grid">
          
          <!-- Pilar 1: Tarefas do Lar -->
          <div class="pilar-card pilar-tarefas" id="home-card-tasks">
            <div class="pilar-icon-box">🧹</div>
            <h3 class="cinzel pilar-title">1. Tarefas do Lar</h3>
            <p class="pilar-desc">
              Arrumar a cama, organizar o quarto, lavar louça e deveres cotidianos com comprovação por foto e visto dos pais.
            </p>
            <div class="pilar-footer">
              <span class="pilar-bonus">💪 +FORÇA (STR) & 🎟️ FICHAS</span>
              <span class="pilar-action">Ver Mais ➜</span>
            </div>
          </div>

          <!-- Pilar 2: Estudos -->
          <div class="pilar-card pilar-estudos" id="home-card-study">
            <div class="pilar-icon-box">📚</div>
            <h3 class="cinzel pilar-title">2. Estudos & Saber</h3>
            <p class="pilar-desc">
              Pomodoro gamificado do Sábio (25 minutos de foco total), lições escolares, leitura diária e expansão intelectual.
            </p>
            <div class="pilar-footer">
              <span class="pilar-bonus">🧠 +INTELIGÊNCIA (INT)</span>
              <span class="pilar-action">Ver Mais ➜</span>
            </div>
          </div>

          <!-- Pilar 3: Saúde -->
          <div class="pilar-card pilar-saude" id="home-card-health">
            <div class="pilar-icon-box">🥗</div>
            <h3 class="cinzel pilar-title">3. Saúde & Corpo</h3>
            <p class="pilar-desc">
              Alimentação saudável planejada, controle de porções limpas e registro diário da meta de 2L de água para o herói.
            </p>
            <div class="pilar-footer">
              <span class="pilar-bonus">❤️ +CONSTITUIÇÃO (CON)</span>
              <span class="pilar-action">Ver Mais ➜</span>
            </div>
          </div>

          <!-- Pilar 4: Empório & Lazer -->
          <div class="pilar-card pilar-lazer" id="home-card-shop">
            <div class="pilar-icon-box">🎡</div>
            <h3 class="cinzel pilar-title">4. Empório & RPG</h3>
            <p class="pilar-desc">
              Troque suas Fichas do Lar por vales da vida real (noite da pizza, filmes, tempo extra) ou gaste Energia em masmorras D20.
            </p>
            <div class="pilar-footer">
              <span class="pilar-bonus">🎟️ FICHAS & 💰 OURO</span>
              <span class="pilar-action">Ver Mais ➜</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ==========================================
           3. O CONCEITO "EU SOU O HERÓI"
           ========================================== -->
      <section class="noble-card" style="margin-bottom: 40px; padding: 36px 28px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; align-items: center;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">
              FILOSOFIA DA ENTIDADE UNIFICADA
            </div>
            <h3 class="cinzel gold-gradient-text" style="font-size: 1.8rem; line-height: 1.2; margin-bottom: 14px;">
              "Eu Não Controlo um Avatar. Eu Sou o Próprio Herói."
            </h3>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">
              No LiraQuest eliminamos personagens distantes. A criança e os pais são os protagonistas da casa. Cada membro possui sua ficha viva com os 6 atributos clássicos de D&D:
            </p>
            <ul style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.8; list-style: none; padding-left: 0;">
              <li>⚔️ <strong>Força (STR):</strong> Alimentada pelas tarefas do lar e organização.</li>
              <li>🧠 <strong>Inteligência (INT):</strong> Evoluída pelos ciclos de estudo e leitura.</li>
              <li>❤️ <strong>Constituição (CON):</strong> Fortalecida pela hidratação e refeições balanceadas.</li>
              <li>🏹 <strong>Agilidade & Carisma:</strong> Reflexos rápidos e harmonia familiar.</li>
            </ul>
          </div>

          <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 18px; padding: 24px; text-align: center;">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">🛡️👑⚔️</div>
            <h4 class="cinzel" style="color: #fff; font-size: 1.2rem; margin-bottom: 8px;">Pronto para Começar?</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
              Acesse sua conta existente ou desperte seu herói para ingressar no clã da sua família.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button id="home-card-btn-login" class="btn-noble btn-noble-primary" style="width: 100%;">
                🔑 Entrar no Grande Salão
              </button>
              <button id="home-card-btn-register" class="btn-noble btn-noble-secondary" style="width: 100%;">
                ✨ Cadastrar Novo Herói (Filho)
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  `;
}

export function bindHomeEvents() {
  const navigateTo = (route) => {
    router.navigate(route);
  };

  const btnLogin = document.getElementById('home-btn-login');
  if (btnLogin) btnLogin.onclick = () => navigateTo('login');

  const btnReg = document.getElementById('home-btn-register');
  if (btnReg) btnReg.onclick = () => navigateTo('register');

  const btnGoHub = document.getElementById('home-btn-go-hub');
  if (btnGoHub) btnGoHub.onclick = () => navigateTo('hub');

  const cardBtnLogin = document.getElementById('home-card-btn-login');
  if (cardBtnLogin) cardBtnLogin.onclick = () => navigateTo('login');

  const cardBtnReg = document.getElementById('home-card-btn-register');
  if (cardBtnReg) cardBtnReg.onclick = () => navigateTo('register');

  // Cards dos 4 pilares navegam para suas respectivas áreas (ou login se deslogado)
  const isAuth = auth.isAuthenticated();
  const setupPilarCard = (id, target) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = () => navigateTo(isAuth ? target : 'login');
    }
  };

  setupPilarCard('home-card-tasks', 'tasks');
  setupPilarCard('home-card-study', 'study');
  setupPilarCard('home-card-health', 'health');
  setupPilarCard('home-card-shop', 'shop');
}

export default { renderHomeView, bindHomeEvents };
