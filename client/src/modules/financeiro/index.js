/**
 * LiraQuest - Módulo 6: Financeiro (Contas dos Pais, Cofre dos Filhos & Sonhos do Clã)
 */

import { auth } from '../../core/auth.js';
import { router } from '../../core/router.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

export function renderFinanceiroView() {
  const isParent = auth.isParent();
  const character = auth.getCharacter();
  const userGold = character?.gold || 0;

  return `
    <div class="module-financeiro-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(212, 175, 55, 0.4);">
        <div class="module-title-box">
          <span class="icon">💰</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Tesouro & Finanças do Clã</h2>
            <p>Contas e provisões dos pais, cofre e mesada dos filhos e metas de grandes sonhos da família.</p>
          </div>
        </div>
        <button id="btn-back-salao-financeiro" class="btn-noble btn-noble-secondary btn-noble-sm">
          ⬅️ Voltar ao Grande Salão
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
        <!-- CARD 1: COFRE DOS FILHOS / MESADA GAMIFICADA -->
        <div class="noble-card" style="border-color: rgba(212, 175, 55, 0.35);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <span style="font-size: 0.8rem; color: var(--accent); text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Economia do Herói</span>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-top: 2px;">Cofre do Aventureiro</h3>
            </div>
            <span style="font-size: 2.2rem;">🪙</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(212, 175, 55, 0.3); padding: 18px; border-radius: 16px; margin-bottom: 18px; text-align: center;">
            <span style="font-size: 0.82rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Saldo Acumulado de Ouro</span>
            <div style="font-size: 2.4rem; font-weight: 900; color: #fde047;">${userGold} <span style="font-size: 1.2rem;">Ouro</span></div>
            <span style="font-size: 0.75rem; color: #94a3b8;">Conversão: Cada 100 Ouro = R$ 10,00 na vida real (ou vales da casa)</span>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px;">
            O ouro conquistado cumprindo tarefas e jogando pode ser guardado no cofrinho para resgates de médio e longo prazo!
          </p>

          <button id="btn-deposit-piggybank" class="btn-noble btn-noble-gold btn-noble-sm" style="width: 100%;">
            🏦 Guardar no Cofrinho de Poupança
          </button>
        </div>

        <!-- CARD 2: GRANDE SONHO DO CLÃ (META COLETIVA) -->
        <div class="noble-card" style="border-color: rgba(59, 130, 246, 0.35);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <span style="font-size: 0.8rem; color: #93c5fd; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Meta da Família</span>
              <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-top: 2px;">Sonho do Clã: Parque Temático</h3>
            </div>
            <span style="font-size: 2.2rem;">🏰🎢</span>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 6px;">
              <span>Progresso Familiar (Missões & Economia)</span>
              <strong style="color: #60a5fa;">72% Atingido</strong>
            </div>
            <div style="height: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 10px; overflow: hidden; border: 1px solid rgba(59, 130, 246, 0.4);">
              <div style="width: 72%; height: 100%; background: linear-gradient(90deg, #2563eb, #60a5fa);"></div>
            </div>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 18px;">
            Quando toda a família alcança 500 tarefas aprovadas juntas, desbloqueia a viagem de férias do clã! Faltam apenas 140 tarefas!
          </p>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 58, 138, 0.25); border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 0.82rem; color: #93c5fd;">🎯 Meta: 500 Missões</span>
            <span style="font-size: 0.82rem; font-weight: 800; color: #ffffff;">360 / 500</span>
          </div>
        </div>

        <!-- CARD 3: GESTÃO DO MESTRE (CONTAS DA CASA - EXCLUSIVO PAIS) -->
        ${isParent ? `
          <div class="noble-card" style="border-color: rgba(128, 0, 32, 0.4); grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span style="font-size: 0.8rem; color: #f87171; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Gestão dos Guardiões</span>
                <h3 class="cinzel" style="font-size: 1.35rem; color: #ffffff; margin-top: 2px;">Planejamento & Contas do Lar</h3>
              </div>
              <span style="font-size: 2rem;">📊📑</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px;">
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">💡 Energia & Água</span>
                <strong style="color: #4ade80; font-size: 1.05rem;">Economia de 12% este mês</strong>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px;">
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">🛒 Mercado & Feira</span>
                <strong style="color: #fde047; font-size: 1.05rem;">Orçamento Balanceado</strong>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 12px;">
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">🏦 Reserva da Família</span>
                <strong style="color: #60a5fa; font-size: 1.05rem;">Fundo de Segurança Ativo</strong>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
}

export function bindFinanceiroEvents() {
  const btnBack = document.getElementById('btn-back-salao-financeiro');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  const btnPiggy = document.getElementById('btn-deposit-piggybank');
  if (btnPiggy) {
    btnPiggy.onclick = () => {
      showModal({
        title: '🏦 Cofrinho do Aventureiro',
        contentHtml: `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🐷🪙</div>
            <p style="color: #cbd5e1; font-size: 0.92rem; margin-bottom: 12px;">
              Guardar ouro no cofrinho ajuda você a atingir seus objetivos maiores na vida real!
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button class="btn-noble btn-noble-gold btn-noble-sm" onclick="showToast('Ouro depositado na poupança do herói!', 'success')">
                Depositar +50 Ouro
              </button>
            </div>
          </div>
        `,
        confirmText: 'Entendido',
        onConfirm: () => true
      });
    };
  }
}
