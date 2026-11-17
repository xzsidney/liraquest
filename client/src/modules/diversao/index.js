/**
 * LiraQuest - Módulo 4: Diversão (Passeios, Eventos & Vales da Família)
 */

import { router } from '../../core/router.js';
import { api } from '../../core/api.js';
import { showToast } from '../../components/Toast.js';
import { showModal } from '../../components/Modal.js';

export async function renderDiversaoView() {
  let rewards = [];
  try {
    const res = await api.get('/api/rewards/list').catch(() => null);
    if (res && res.rewards) rewards = res.rewards;
  } catch (e) {
    console.error('Erro ao buscar vales:', e);
  }

  return `
    <div class="module-diversao-view">
      <!-- Cabeçalho do Módulo -->
      <div class="module-header-noble" style="border-color: rgba(236, 72, 153, 0.4);">
        <div class="module-title-box">
          <span class="icon">🎡</span>
          <div>
            <h2 class="cinzel gold-gradient-text">Módulo Diversão & Vales da Família</h2>
            <p>Agenda de passeios do fim de semana, eventos do clã e resgate de vales com Fichas do Lar.</p>
          </div>
        </div>
        <button id="btn-back-salao-diversao" class="btn-noble btn-noble-secondary btn-noble-sm">
          ⬅️ Voltar ao Grande Salão
        </button>
      </div>

      <!-- SEÇÃO 1: AGENDA DE PASSEIOS E EVENTOS DO CLÃ -->
      <div class="noble-card" style="margin-bottom: 24px; border-color: rgba(236, 72, 153, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="cinzel" style="font-size: 1.25rem; color: #ffffff; margin: 0;">📅 Próximos Eventos do Clã</h3>
          <span style="font-size: 0.78rem; background: rgba(236, 72, 153, 0.2); color: #f472b6; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Momentos Especiais</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; border-radius: 14px;">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">🍕🎲</div>
            <h4 style="color: #ffffff; font-size: 1.05rem; margin-bottom: 4px;">Noite da Pizza & Jogos</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">Sexta-feira às 20h • Rodízio caseiro e partidas no Salão de Jogos.</p>
            <span style="color: #fde047; font-size: 0.75rem; font-weight: 700;">Meta do Clã: 90% das tarefas cumpridas</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; border-radius: 14px;">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">🌳🚴‍♂️</div>
            <h4 style="color: #ffffff; font-size: 1.05rem; margin-bottom: 4px;">Passeio no Parque / Pedalada</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">Domingo de manhã • Piquenique ao ar livre e descanso familiar.</p>
            <span style="color: #4ade80; font-size: 0.75rem; font-weight: 700;">Confirmado em Família ✓</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; border-radius: 14px;">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">🍿🎬</div>
            <h4 style="color: #ffffff; font-size: 1.05rem; margin-bottom: 4px;">Sessão Cinema Família</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">Sábado às 19h • Filme escolhido por quem tiver maior sequência de hábitos.</p>
            <span style="color: #60a5fa; font-size: 0.75rem; font-weight: 700;">Votação aberta na sexta</span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: VALES DA LOJA DO LAR PARA RESGATE -->
      <div class="portais-section-header">
        <h3 class="cinzel gold-gradient-text">
          <span>🎟️</span> Vales Especiais do Lar (Resgate com Fichas)
        </h3>
        <span style="font-size: 0.82rem; color: var(--text-muted);">Troque as Fichas do Lar ganhas em tarefas por benefícios reais</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px;">
        ${rewards.length === 0 ? `
          <!-- Vales Padrão de Exemplo -->
          <div class="noble-card" style="border-color: rgba(236, 72, 153, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 2rem;">🎮</span>
              <span style="background: rgba(212, 175, 55, 0.2); color: #fde047; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">20 Fichas</span>
            </div>
            <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">1 Hora Extra de Videogame</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Válido no fim de semana após os deveres escolares estarem finalizados.</p>
            <button class="btn-noble btn-noble-primary btn-noble-sm" style="width: 100%;" onclick="window.redeemDemoVale('1 Hora Extra de Videogame', 20)">
              🎟️ Resgatar Vale
            </button>
          </div>

          <div class="noble-card" style="border-color: rgba(236, 72, 153, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 2rem;">🍦</span>
              <span style="background: rgba(212, 175, 55, 0.2); color: #fde047; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">15 Fichas</span>
            </div>
            <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">Escolher a Sobremesa / Sorvete</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Direito de escolher o sabor da sobremesa do almoço de domingo.</p>
            <button class="btn-noble btn-noble-primary btn-noble-sm" style="width: 100%;" onclick="window.redeemDemoVale('Escolher a Sobremesa', 15)">
              🎟️ Resgatar Vale
            </button>
          </div>

          <div class="noble-card" style="border-color: rgba(236, 72, 153, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 2rem;">🛌</span>
              <span style="background: rgba(212, 175, 55, 0.2); color: #fde047; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">30 Fichas</span>
            </div>
            <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">Dormir 30min Mais Tarde</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Pode ficar acordado até mais tarde na sexta ou sábado à noite.</p>
            <button class="btn-noble btn-noble-primary btn-noble-sm" style="width: 100%;" onclick="window.redeemDemoVale('Dormir 30min Mais Tarde', 30)">
              🎟️ Resgatar Vale
            </button>
          </div>
        ` : rewards.map(r => `
          <div class="noble-card" style="border-color: rgba(236, 72, 153, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 2rem;">${r.icon || '🎁'}</span>
              <span style="background: rgba(212, 175, 55, 0.2); color: #fde047; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">${r.cost_tokens || 10} Fichas</span>
            </div>
            <h4 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 4px;">${r.title}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">${r.description || 'Vale especial do clã.'}</p>
            <button class="btn-noble btn-noble-primary btn-noble-sm" style="width: 100%;" onclick="window.redeemRealVale('${r.id}', '${r.title}', ${r.cost_tokens})">
              🎟️ Resgatar Vale
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function bindDiversaoEvents() {
  const btnBack = document.getElementById('btn-back-salao-diversao');
  if (btnBack) {
    btnBack.onclick = () => router.navigate('salao');
  }

  window.redeemDemoVale = (title, cost) => {
    showModal({
      title: `🎟️ Confirmar Resgate: ${title}`,
      contentHtml: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 10px;">🎁</div>
          <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 12px;">
            Deseja resgatar este vale utilizando <strong>${cost} Fichas do Lar</strong>?
          </p>
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            Seus pais receberão o pedido de resgate e liberarão seu vale na vida real!
          </span>
        </div>
      `,
      confirmText: 'Confirmar Resgate',
      onConfirm: () => {
        showToast(`Pedido de resgate para "${title}" enviado aos pais! 🍕🎉`, 'success');
        return true;
      }
    });
  };

  window.redeemRealVale = (rewardId, title, cost) => {
    showModal({
      title: `🎟️ Confirmar Resgate: ${title}`,
      contentHtml: `
        <p style="color: #cbd5e1;">Custo: <strong>${cost} Fichas do Lar</strong>. Confirmar resgate com o mestre?</p>
      `,
      confirmText: 'Resgatar',
      onConfirm: async () => {
        try {
          await api.post('/api/rewards/redeem', { reward_id: rewardId });
          showToast(`Vale "${title}" resgatado com sucesso!`, 'success');
          router.navigate('diversao');
          return true;
        } catch (err) {
          showToast(err.message, 'error');
          return false;
        }
      }
    });
  };
}
