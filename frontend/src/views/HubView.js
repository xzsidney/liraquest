/**
 * LiraQuest - Grande Salão Oficial Pós-Login (#/hub)
 * Ficha Ilustrada D&D 5e adaptada para Filhos (Missões & Metas) e Guardiões (Fila 1-Clique & Clã)
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';
import {
  escapeHtml,
  formatFrequencyLabel,
  showToast,
  showFanfareModal,
  openSubmitProofModal,
  openNewTaskModal,
  openImagePreviewModal,
} from '../components/TaskModals.js';

const FIXED_HERO_PORTRAIT = '/src/assets/heroes/paladin_lira.jpg';

const STAT_META = [
  { key: 'str', short: 'STR', label: 'FORÇA', posClass: 'pos-str', flagClass: 'flag-str' },
  { key: 'agi', short: 'AGI', label: 'AGILIDADE', posClass: 'pos-agi', flagClass: 'flag-agi' },
  { key: 'con', short: 'CON', label: 'CONSTIT.', posClass: 'pos-con', flagClass: 'flag-con' },
  { key: 'int', short: 'INT', label: 'INTELIG.', posClass: 'pos-int', flagClass: 'flag-int' },
  { key: 'cha', short: 'CHA', label: 'CARISMA', posClass: 'pos-cha', flagClass: 'flag-cha' },
  { key: 'luk', short: 'LUK', label: 'SORTE', posClass: 'pos-luk', flagClass: 'flag-luk' },
];

const REWARD_GOALS = [
  { icon: '🎬', title: 'Escolha do Filme do Sábado', cost: 15 },
  { icon: '🎮', title: '+1 Hora Extra de Videogame', cost: 20 },
  { icon: '🍕', title: 'Noite da Pizza em Família', cost: 30 },
];

let cachedTasks = [];
let cachedPending = [];
let cachedMembers = [];
let cachedChildren = [];
let selectedStat = 'str';
let lastRollText = 'Toque em um atributo e role o D20!';

function getMod(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : String(mod);
}

function resolveClassLabel(classCode) {
  if (classCode === 'rastreador_veloz') return 'Rastreador Veloz';
  if (classCode === 'artifice_criativo') return 'Artífice Criativa';
  if (classCode === 'guerreiro_disciplina') return 'Guerreiro da Disciplina';
  if (classCode === 'guardiao_da_harmonia') return 'Guardiã da Harmonia';
  return 'Guardião do Lar';
}

function resolveRoleLabel(role) {
  if (role === 'ADMIN') return 'Mestre Guardião';
  if (role === 'PARENT') return 'Guardião Familiar';
  return 'Herói Aventureiro';
}

function renderGuardianBottomPanels(member, heroStats, xpInfo) {
  const { maxVitality, activeStatMeta, activeStatScore, activeStatXp } = heroStats;
  const { level, xp, nextXp, xpPct, gold, tokens, energy } = xpInfo;

  return `
    <!-- Coluna 1 (Guardião): Fila de Aprovação 1-Clique -->
    <div class="sheet-panel" id="hub-pending-queue">
      <div class="sheet-panel-header">👑 Fila de Aprovação (${cachedPending.length})</div>
      <div class="sheet-panel-body">
        ${cachedPending.length === 0 ? `
          <div style="text-align: center; padding: 24px 10px; color: var(--sh-ink-muted); font-size: 0.8rem; font-weight: 700;">
            🛡️✨ Nenhuma comprovação pendente no clã agora!
          </div>
        ` : `
          <div class="sheet-pending-list">
            ${cachedPending.map(sub => `
              <div class="sheet-pending-item">
                <div class="sheet-pending-top">
                  ${sub.proof_image ? `
                    <img
                      src="${escapeHtml(sub.proof_image)}"
                      alt="Prova"
                      class="sheet-pending-thumb hub-proof-thumb"
                      data-img="${escapeHtml(sub.proof_image)}"
                      title="Toque para ampliar a foto"
                    />
                  ` : `
                    <div class="sheet-pending-thumb" style="display: flex; align-items: center; justify-content: center; background: var(--sh-panel); font-size: 1.4rem;">📷</div>
                  `}
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 0.68rem; font-weight: 900; color: var(--sh-ruby); text-transform: uppercase;">
                      ${escapeHtml(sub.member?.hero_nickname || sub.member?.name || 'Herói')} • STR ${sub.member?.str ?? 10}
                    </div>
                    <div style="font-size: 0.8rem; font-weight: 800; color: var(--sh-ink); line-height: 1.2;">
                      ${escapeHtml(sub.task?.title || 'Missão do Lar')}
                    </div>
                    ${sub.member_notes ? `
                      <div style="font-size: 0.71rem; font-style: italic; color: var(--sh-ink-muted); margin-top: 2px;">
                        "${escapeHtml(sub.member_notes)}"
                      </div>
                    ` : ''}
                    <div style="font-size: 0.68rem; font-weight: 800; color: var(--sh-ink-muted); margin-top: 2px;">
                      💪 +${sub.task?.reward_str_xp ?? 25} STR • 💰 +${sub.task?.reward_gold ?? 10}g • 🎟️ +${sub.task?.reward_tokens ?? 1}
                    </div>
                  </div>
                </div>
                <div class="sheet-pending-actions">
                  <button
                    type="button"
                    class="sheet-approve-btn btn-hub-approve"
                    data-id="${escapeHtml(sub.id)}"
                    data-hero="${escapeHtml(sub.member?.hero_nickname || 'Herói')}"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    type="button"
                    class="sheet-reject-btn btn-hub-reject"
                    data-id="${escapeHtml(sub.id)}"
                  >
                    ❌ Devolver
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <button type="button" id="btn-hub-panel-tasks" class="sheet-cta-btn" style="width: 100%;">
          📋 Abrir Tela Completa de Tarefas
        </button>
      </div>
    </div>

    <!-- Coluna 2 (Guardião): Heróis do Clã -->
    <div class="sheet-panel">
      <div class="sheet-panel-header">🏰 Heróis do Clã (${cachedMembers.length})</div>
      <div class="sheet-panel-body">
        ${cachedMembers.length === 0 ? `
          <div style="text-align: center; padding: 24px 10px; color: var(--sh-ink-muted); font-size: 0.8rem; font-weight: 700;">
            Compartilhe o código do clã para os heróis entrarem na equipe!
          </div>
        ` : `
          <div class="sheet-clan-list">
            ${cachedMembers.map(m => {
              const roleIcon = m.role === 'ADMIN' ? '🛡️' : (m.role === 'PARENT' ? '👑' : '⚔️');
              const xpStr = Math.min(100, m.xp_str ?? 0);
              return `
                <div class="sheet-clan-row">
                  <div class="sheet-clan-top">
                    <span>${roleIcon} ${escapeHtml(m.hero_nickname || m.name)}</span>
                    <span>Nv. ${m.level ?? 1} • STR ${m.str ?? 10}</span>
                  </div>
                  <div class="sheet-clan-sub">
                    <span>${escapeHtml(resolveRoleLabel(m.role))}</span>
                    <span>💰 ${m.gold ?? 0} • 🎟️ ${m.family_tokens ?? 0}</span>
                  </div>
                  <div class="sheet-mini-bar" title="Mestria STR: ${xpStr}/100 XP">
                    <div class="sheet-mini-bar-fill" style="width: ${xpStr}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--sh-ink-muted); text-align: center;">
          Código de convite do clã: <strong>${escapeHtml(member?.family?.invite_code || 'LIRA-2026')}</strong>
        </div>
      </div>
    </div>

    <!-- Coluna 3 (Guardião): Minha Vitalidade, Tesouro & D20 -->
    <div class="sheet-panel">
      <div class="sheet-panel-header">❤️ Minha Vitalidade, Tesouro &amp; D20</div>
      <div class="sheet-panel-body">
        <div class="sheet-hp-box">
          <div>
            <div class="sheet-meta-label">Vitalidade Máx (CON)</div>
            <div class="sheet-hp-num">${maxVitality} <span style="font-size: 0.78rem; color: var(--sh-ink-muted);">HP</span></div>
          </div>
          <div style="text-align: right;">
            <div class="sheet-meta-label">Nível Geral</div>
            <div class="sheet-hp-num">Nv. ${level}</div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 800;">
            <span>EXPERIÊNCIA</span>
            <span>${xp} / ${nextXp} XP (${xpPct}%)</span>
          </div>
          <div class="sheet-xp-track">
            <div class="sheet-xp-fill" style="width: ${xpPct}%;"></div>
          </div>
        </div>

        <div class="sheet-treasury-grid">
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">💰 ${gold}</div>
            <div class="sheet-treasure-lbl">Ouro</div>
          </div>
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">🎟️ ${tokens}</div>
            <div class="sheet-treasure-lbl">Fichas</div>
          </div>
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">⚡ ${energy}</div>
            <div class="sheet-treasure-lbl">Energia</div>
          </div>
        </div>

        <div class="sheet-trait-item" id="sheet-selected-mastery-line">
          <strong>Atributo (${activeStatMeta.label}):</strong> Valor <strong>${activeStatScore}</strong> (${formatMod(getMod(activeStatScore))}) • Mestria <strong>${activeStatXp}/100 XP</strong>.
        </div>

        <div class="sheet-d20-box">
          <div class="sheet-d20-result" id="sheet-d20-readout">${escapeHtml(lastRollText)}</div>
          <button type="button" id="btn-hub-roll-d20" class="sheet-cta-btn">
            🎲 Rolar D20 (${activeStatMeta.short})
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderChildBottomPanels(hero, heroStats, xpInfo) {
  const { maxVitality, activeStatMeta, activeStatScore, activeStatXp } = heroStats;
  const { level, xp, nextXp, xpPct, gold, tokens, energy } = xpInfo;

  return `
    <!-- Coluna 1 (Filho): Metas & Recompensas -->
    <div class="sheet-panel">
      <div class="sheet-panel-header">🎁 Metas &amp; Recompensas</div>
      <div class="sheet-panel-body">
        <div class="sheet-clan-list">
          ${REWARD_GOALS.map(goal => {
            const pct = Math.min(100, Math.round((tokens / goal.cost) * 100));
            const ready = tokens >= goal.cost;
            return `
              <div class="sheet-clan-row">
                <div class="sheet-clan-top">
                  <span>${goal.icon} ${escapeHtml(goal.title)}</span>
                  <span>${ready ? '✅ Disponível' : `${tokens}/${goal.cost}`}</span>
                </div>
                <div class="sheet-clan-sub">
                  <span>Custo: 🎟️ ${goal.cost} Fichas do Lar</span>
                  <span>${pct}%</span>
                </div>
                <div class="sheet-mini-bar">
                  <div class="sheet-mini-bar-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button type="button" id="btn-hub-open-shop" class="sheet-cta-btn" style="width: 100%;">
          🏪 Ir para a Loja do Lar (Vales Reais)
        </button>
      </div>
    </div>

    <!-- Coluna 2 (Filho): Vitalidade, Tesouro & Evolução -->
    <div class="sheet-panel">
      <div class="sheet-panel-header">❤️ Vitalidade, Tesouro &amp; Nível</div>
      <div class="sheet-panel-body">
        <div class="sheet-hp-box">
          <div>
            <div class="sheet-meta-label">Vitalidade Máxima (CON)</div>
            <div class="sheet-hp-num">${maxVitality} <span style="font-size: 0.78rem; color: var(--sh-ink-muted);">HP</span></div>
          </div>
          <div style="text-align: right;">
            <div class="sheet-meta-label">Nível Geral</div>
            <div class="sheet-hp-num">Nv. ${level}</div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 800;">
            <span>EXPERIÊNCIA DO NÍVEL</span>
            <span>${xp} / ${nextXp} XP (${xpPct}%)</span>
          </div>
          <div class="sheet-xp-track">
            <div class="sheet-xp-fill" style="width: ${xpPct}%;"></div>
          </div>
        </div>

        <div class="sheet-treasury-grid">
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">💰 ${gold}</div>
            <div class="sheet-treasure-lbl">Ouro</div>
          </div>
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">🎟️ ${tokens}</div>
            <div class="sheet-treasure-lbl">Fichas</div>
          </div>
          <div class="sheet-treasure-box">
            <div class="sheet-treasure-val">⚡ ${energy}</div>
            <div class="sheet-treasure-lbl">Energia</div>
          </div>
        </div>

        <div style="text-align: center; padding-top: 2px;">
          <div class="sheet-meta-label">Selos de Constância (${hero.streak_days} dias)</div>
          <div class="sheet-seals-row">
            ${[1, 2, 3, 4, 5].map(day => `
              <span class="sheet-seal-pip ${hero.streak_days >= day ? 'lit' : ''}">${hero.streak_days >= day ? '★' : day}</span>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Coluna 3 (Filho): Traços, Mestria & Dado D20 -->
    <div class="sheet-panel">
      <div class="sheet-panel-header">📜 Traços &amp; Mestria Orgânica</div>
      <div class="sheet-panel-body">
        <div class="sheet-traits-lines">
          <div class="sheet-trait-item">
            <strong>Eu sou o Herói:</strong> Cumprindo suas missões diárias com foto, você ganha Ouro, Fichas e evolui seus atributos reais!
          </div>
          <div class="sheet-trait-item">
            <strong>Mestria Orgânica:</strong> Ao atingir <strong>100 XP</strong> em um atributo, ele sobe <strong>+1 permanente</strong> mantendo o excedente.
          </div>
          <div class="sheet-trait-item" id="sheet-selected-mastery-line">
            <strong>Atributo Selecionado (${activeStatMeta.label}):</strong> Valor <strong>${activeStatScore}</strong> (${formatMod(getMod(activeStatScore))}) • Mestria <strong>${activeStatXp}/100 XP</strong>.
          </div>
        </div>

        <div class="sheet-d20-box">
          <div class="sheet-d20-result" id="sheet-d20-readout">${escapeHtml(lastRollText)}</div>
          <button type="button" id="btn-hub-roll-d20" class="sheet-cta-btn">
            🎲 Rolar D20 (${activeStatMeta.short})
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function renderHubView() {
  const member = auth.getMember() || {};
  const isParent = auth.isParent();
  const hasClan = Boolean(member?.family_id || member?.family);

  cachedTasks = [];
  cachedPending = [];
  cachedMembers = [];
  cachedChildren = [];

  if (hasClan) {
    try {
      const tasksRes = await api.get('/api/tasks');
      cachedTasks = tasksRes?.tasks || [];
    } catch (err) {
      console.warn('Erro ao buscar tarefas no Hub:', err.message);
    }

    if (isParent) {
      try {
        const pendingRes = await api.get('/api/tasks/submissions/pending');
        cachedPending = pendingRes?.submissions || [];
      } catch (err) {
        console.warn('Erro ao buscar pendências no Hub:', err.message);
      }

      try {
        const membersRes = await api.get('/api/family/members');
        cachedMembers = membersRes?.members || [];
      } catch (err) {
        console.warn('Erro ao buscar membros do clã no Hub:', err.message);
      }

      try {
        const childrenRes = await api.get('/api/family/children');
        cachedChildren = childrenRes?.children || [];
      } catch (err) {
        console.warn('Erro ao buscar filhos do clã no Hub:', err.message);
      }
    }
  }

  const hero = {
    name: member.name || 'Herói',
    hero_nickname: member.hero_nickname || member.name || 'Aventureiro',
    role: member.role || 'CHILD',
    class_code: member.class_code || 'guardiao_do_lar',
    class_label: resolveClassLabel(member.class_code),
    origin_label: resolveRoleLabel(member.role),
    family_name: member.family?.name
      ? `${member.family.name}${member.family.invite_code ? ` (${member.family.invite_code})` : ''}`
      : 'Sem Clã Vinculado',
    level: member.level ?? 1,
    xp: member.xp ?? 0,
    adventure_energy: member.adventure_energy ?? 10,
    family_tokens: member.family_tokens ?? 0,
    gold: member.gold ?? 50,
    streak_days: member.streak_days ?? 1,
    str: member.str ?? 10,
    agi: member.agi ?? 10,
    con: member.con ?? 10,
    int: member.int ?? 10,
    cha: member.cha ?? 10,
    luk: member.luk ?? 10,
    xp_str: member.xp_str ?? 0,
    xp_agi: member.xp_agi ?? 0,
    xp_con: member.xp_con ?? 0,
    xp_int: member.xp_int ?? 0,
    xp_cha: member.xp_cha ?? 0,
    xp_luk: member.xp_luk ?? 0,
  };

  const nextXp = (hero.level || 1) * 100;
  const xpPct = Math.min(100, Math.round(((hero.xp || 0) / nextXp) * 100));
  const profBonus = 2 + Math.floor(((hero.level || 1) - 1) / 4);
  const defenseScore = 10 + getMod(hero.agi) + getMod(hero.con);
  const maxVitality = 100 + (hero.con || 10) * 5;
  const passiveVision = 10 + getMod(hero.int) + profBonus;
  const activeStatMeta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
  const activeStatScore = hero[activeStatMeta.key] ?? 10;
  const activeStatXp = hero[`xp_${activeStatMeta.key}`] ?? 0;

  const heroStats = { maxVitality, activeStatMeta, activeStatScore, activeStatXp };
  const xpInfo = {
    level: hero.level,
    xp: hero.xp,
    nextXp,
    xpPct,
    gold: hero.gold,
    tokens: hero.family_tokens,
    energy: hero.adventure_energy,
  };

  return `
    <div class="lq-sheet-page" id="lq-sheet-root" data-sheet-theme="parchment">

      <!-- Banner de Ingressar no Clã (quando o usuário ainda não tem clã) -->
      ${!hasClan ? `
        <div class="sheet-join-banner" id="join-clan-card">
          <div>
            <div class="sheet-join-kicker">🏰 Escolha seu Clã Familiar</div>
            <h3 class="cinzel gold-gradient-text" style="font-size: 1.25rem; margin-bottom: 4px;">
              Vincule-se ao Clã dos seus Pais
            </h3>
            <p style="color: #cbd5e1; font-size: 0.85rem; max-width: 580px; line-height: 1.45;">
              Digite o <strong>Código do Clã</strong> (ex: <code>LIRA-2026</code>) fornecido pelos seus pais para liberar suas missões e recompensas!
            </p>
            <div id="hub-clan-feedback-msg" style="display: none; margin-top: 8px; font-size: 0.82rem; font-weight: 700;"></div>
          </div>

          <div class="sheet-join-controls">
            <input
              type="text"
              id="input-hub-clan-code"
              class="sheet-join-input"
              placeholder="EX: LIRA-2026"
            />
            <button type="button" id="btn-hub-join-clan" class="btn-noble btn-noble-gold btn-noble-sm" style="min-height: 44px;">
              🛡️ Ingressar no Clã
            </button>
          </div>
        </div>
      ` : ''}

      <!-- FICHA ILUSTRADA OFICIAL D&D 5e -->
      <section class="sheet-canvas" aria-label="Ficha Oficial do Herói">

        <!-- Alerta de Pendências para Guardiões -->
        ${isParent && cachedPending.length > 0 ? `
          <div class="sheet-pending-alert">
            <div class="sheet-pending-alert-text">
              <span>🔔</span>
              <span>Há <strong>${cachedPending.length}</strong> comprovação(ões) aguardando sua aprovação!</span>
            </div>
            <button type="button" id="btn-scroll-pending" class="sheet-cta-btn">
              👑 Avaliar Agora ↓
            </button>
          </div>
        ` : ''}

        <!-- 1. Cabeçalho Superior -->
        <header class="sheet-header-grid">
          <div class="sheet-name-plaque">
            <h1 class="sheet-hero-name">${escapeHtml(hero.hero_nickname)}</h1>
          </div>

          <div class="sheet-scroll-banner">
            <div class="sheet-meta-grid">
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.class_label)} (Nv. ${hero.level})</div>
                <div class="sheet-meta-label">Classe &amp; Nível</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.origin_label)}</div>
                <div class="sheet-meta-label">Papel no Clã</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.name)}</div>
                <div class="sheet-meta-label">Nome Real</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.family_name)}</div>
                <div class="sheet-meta-label">Clã Familiar</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">Reforço Positivo</div>
                <div class="sheet-meta-label">Tendência</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${hero.xp} / ${nextXp} XP</div>
                <div class="sheet-meta-label">Experiência Atual</div>
              </div>
            </div>
          </div>
        </header>

        <!-- 2. Faixa de Medalhões & Coroa dos 6 Atributos -->
        <div class="sheet-medallions-row">
          <div class="sheet-medallions-left">
            <div class="sheet-ribbon-pill" title="Sequência de hábitos cumpridos">
              <div class="sheet-ribbon-circle">🔥${hero.streak_days}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">Sequência</span>
                <span class="sheet-ribbon-sub">${hero.streak_days} Dias seguidos</span>
              </div>
            </div>

            <div class="sheet-ribbon-pill" title="Bônus de Mestria pelo Nível">
              <div class="sheet-ribbon-circle">+${profBonus}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">Bônus Mestria</span>
                <span class="sheet-ribbon-sub">Nível ${hero.level}</span>
              </div>
            </div>

            <div class="sheet-pillars-crown" title="Modificadores D20 dos 6 Atributos">
              <div class="sheet-crown-title">👑 Coroa dos 6 Atributos (Modificadores)</div>
              <div class="sheet-crown-flags">
                ${STAT_META.map(s => {
                  const mod = getMod(hero[s.key]);
                  return `
                    <div class="sheet-flag">
                      <div class="sheet-flag-val">${formatMod(mod)}</div>
                      <div class="sheet-flag-ribbon ${s.flagClass}">${s.short}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="sheet-medallions-right">
            <div class="sheet-ribbon-pill" title="Energia disponível">
              <div class="sheet-ribbon-circle">⚡${hero.adventure_energy}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">Energia</span>
                <span class="sheet-ribbon-sub">${hero.adventure_energy} / 10</span>
              </div>
            </div>

            <div class="sheet-ac-crest" title="Poder Defensivo (10 + AGI + CON)">
              <span class="sheet-ac-val">${defenseScore}</span>
              <span class="sheet-ac-label">Poder CA</span>
            </div>
          </div>
        </div>

        <!-- 3. Área Central: Grimório de Missões Reais (Esquerda) + Retrato & Arco (Direita) -->
        <div class="sheet-main-grid">

          <aside class="sheet-grimoire">
            <span class="sheet-grimoire-clasp clasp-top" aria-hidden="true"></span>
            <span class="sheet-grimoire-clasp clasp-bottom" aria-hidden="true"></span>

            <div>
              <h2 class="sheet-grimoire-title">
                ${isParent ? '👑 Grimório do Guardião' : '📖 Missões do Dia'}
              </h2>

              <!-- 4 Portais do LiraQuest -->
              <div class="sheet-portals-mini">
                <button type="button" class="sheet-portal-btn" data-portal-route="tasks">🧹 Tarefas</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="study">📚 Estudos</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="health">🥗 Saúde</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="shop">🎡 Empório</button>
              </div>

              ${isParent && hasClan ? `
                <button type="button" id="btn-hub-new-task" class="sheet-cta-btn" style="width: 100%; margin-bottom: 10px;">
                  ➕ Nova Missão Familiar
                </button>
              ` : ''}

              <!-- Lista de Tarefas Reais com Botão 📸 Concluir / Anexar Foto -->
              <div class="sheet-missions-list">
                ${!hasClan ? `
                  <div style="text-align: center; padding: 18px 8px; color: var(--sh-ink-muted); font-size: 0.78rem; font-weight: 700;">
                    🛡️ Vincule-se a um clã acima para visualizar e enviar suas missões!
                  </div>
                ` : cachedTasks.length === 0 ? `
                  <div style="text-align: center; padding: 18px 8px; color: var(--sh-ink-muted); font-size: 0.78rem; font-weight: 700;">
                    Nenhuma missão ativa encontrada. ${isParent ? 'Clique em "➕ Nova Missão Familiar"!' : ''}
                  </div>
                ` : cachedTasks.map(task => {
                  const rejectedSub = !task.today_pending && !task.today_approved && task.latest_submission?.status === 'REJECTED'
                    ? task.latest_submission
                    : null;
                  const dotClass = task.today_approved
                    ? 'dot-done'
                    : (task.today_pending ? 'dot-pending' : (rejectedSub ? 'dot-rejected' : ''));

                  return `
                    <div class="sheet-mission-item">
                      <div class="sheet-mission-row">
                        <div class="sheet-mission-main">
                          <span class="sheet-mission-dot ${dotClass}"></span>
                          <div style="min-width: 0;">
                            <div class="sheet-mission-title">${escapeHtml(task.title)}</div>
                            <div class="sheet-mission-sub">
                              ${formatFrequencyLabel(task.frequency)} • 💪 +${task.reward_str_xp ?? 25} • 💰 +${task.reward_gold ?? 10}g • 🎟️ +${task.reward_tokens ?? 1}${task.assignee ? ` • 👤 ${escapeHtml(task.assignee.hero_nickname || task.assignee.name)}` : ''}
                            </div>
                          </div>
                        </div>

                        ${task.today_pending ? `
                          <span class="sheet-mission-pill pill-pending">⏳ Pendente</span>
                        ` : (task.today_approved ? `
                          <span class="sheet-mission-pill pill-done">✅ Feita</span>
                        ` : `
                          <button
                            type="button"
                            class="sheet-mission-btn btn-hub-submit-proof"
                            data-task-id="${escapeHtml(task.id)}"
                            data-task-title="${escapeHtml(task.title)}"
                          >
                            ${rejectedSub ? '📸 Reenviar' : '📸 Concluir'}
                          </button>
                        `)}
                      </div>

                      ${rejectedSub ? `
                        <div class="sheet-mission-feedback">
                          💬 Pais: "${escapeHtml(rejectedSub.parent_feedback || 'Capriche mais e reenvie!')}"
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="sheet-grimoire-footer">
              <span>🛡️ Bônus: +${profBonus}</span>
              <button type="button" id="btn-hub-open-tasks" class="sheet-link-btn">
                Ver Mural Completo →
              </button>
            </div>
          </aside>

          <!-- Palco do Herói com Círculo Arcano + Retrato Fixo + 6 Atributos -->
          <div class="sheet-hero-stage">

            <svg class="sheet-astrolabe-svg" viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="186" fill="none" stroke="var(--sh-astrolabe)" stroke-width="2" />
              <circle cx="200" cy="200" r="172" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1" stroke-dasharray="6 5" />
              <circle cx="200" cy="200" r="138" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1.5" />
              <circle cx="200" cy="200" r="98" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1" stroke-dasharray="3 4" />
              <polygon points="200,18 357,109 357,291 200,382 43,291 43,109" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1.2" />
              <polygon points="200,40 338,280 62,280" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1" />
              <polygon points="200,360 338,120 62,120" fill="none" stroke="var(--sh-astrolabe)" stroke-width="1" />
              <line x1="200" y1="8" x2="200" y2="392" stroke="var(--sh-astrolabe)" stroke-width="0.9" />
              <line x1="8" y1="200" x2="392" y2="200" stroke="var(--sh-astrolabe)" stroke-width="0.9" />
            </svg>

            <svg class="sheet-arc-svg" viewBox="0 0 760 555" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 185 52 C 380 12, 620 68, 638 250 C 646 340, 616 420, 560 462" fill="none" stroke="var(--sh-gold)" stroke-width="5" stroke-linecap="round" opacity="0.55" />
              <path d="M 185 52 C 380 12, 620 68, 638 250 C 646 340, 616 420, 560 462" fill="none" stroke="var(--sh-gold-bright)" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.85" />
            </svg>

            <div class="sheet-hero-portrait-wrap">
              <img
                src="${FIXED_HERO_PORTRAIT}"
                alt="Retrato de ${escapeHtml(hero.hero_nickname)}"
                class="sheet-hero-portrait"
              />
            </div>

            <div class="sheet-stats-arc">
              ${STAT_META.map(stat => {
                const score = hero[stat.key] ?? 10;
                const xpAttr = hero[`xp_${stat.key}`] ?? 0;
                const mod = getMod(score);
                const isSelected = selectedStat === stat.key;
                return `
                  <button
                    type="button"
                    class="sheet-stat-orb ${stat.posClass} ${isSelected ? 'selected' : ''}"
                    data-stat-key="${stat.key}"
                    title="Selecionar ${stat.label} (${xpAttr}/100 XP de Mestria)"
                  >
                    <div class="sheet-stat-ring">
                      <span class="sheet-stat-mod">${formatMod(mod)}</span>
                      <span class="sheet-stat-val">${score}</span>
                      <span class="sheet-stat-xp">${xpAttr}% XP</span>
                    </div>
                    <span class="sheet-stat-banner">${stat.label}</span>
                    <div class="sheet-stat-bar">
                      <div class="sheet-stat-bar-fill" style="width: ${Math.min(100, xpAttr)}%;"></div>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="sheet-passive-eye" title="Visão Passiva (10 + INT + Proficiência)">
              <div class="sheet-eye-badge">${passiveVision}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">👁️ Visão Passiva</span>
                <span class="sheet-ribbon-sub">Atenção no Lar</span>
              </div>
            </div>

            <div class="sheet-speed-tag" title="Ritmo de Constância">
              <div class="sheet-ribbon-title">🥾 Deslocamento</div>
              <div class="sheet-ribbon-sub">30 ft • ${hero.streak_days}d Foco</div>
            </div>

          </div>
        </div>

        <!-- 4. Painéis Inferiores em 3 Colunas -->
        <div class="sheet-bottom-wrap">
          <svg class="sheet-sword-deco" viewBox="0 0 36 320" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#94a3b8" />
                <stop offset="50%" stop-color="#f8fafc" />
                <stop offset="100%" stop-color="#64748b" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="14" r="7" fill="#d4af37" stroke="#5c3a10" stroke-width="1.5" />
            <rect x="14" y="20" width="8" height="36" rx="2" fill="#800020" stroke="#d4af37" stroke-width="1.2" />
            <path d="M 3 56 Q 18 64 33 56 L 30 64 Q 18 70 6 64 Z" fill="#d4af37" stroke="#5c3a10" stroke-width="1.2" />
            <polygon points="12,66 24,66 22,292 18,314 14,292" fill="url(#bladeGrad)" stroke="#475569" stroke-width="1" />
            <line x1="18" y1="70" x2="18" y2="294" stroke="#800020" stroke-width="1.4" opacity="0.65" />
          </svg>

          <div class="sheet-bottom-grid">
            ${isParent
              ? renderGuardianBottomPanels(member, heroStats, xpInfo)
              : renderChildBottomPanels(hero, heroStats, xpInfo)}
          </div>
        </div>

      </section>

      <!-- Ponto de Montagem de Modais do Hub -->
      <div id="hub-modal-mount"></div>
    </div>
  `;
}

export function bindHubEvents() {
  // 1. Ingresso no Clã (quando sem clã)
  const btnJoinClan = document.getElementById('btn-hub-join-clan');
  const inputClanCode = document.getElementById('input-hub-clan-code');
  const msgEl = document.getElementById('hub-clan-feedback-msg');

  if (btnJoinClan && inputClanCode) {
    btnJoinClan.onclick = async () => {
      const code = inputClanCode.value?.trim();
      if (!code) {
        if (msgEl) {
          msgEl.textContent = 'Digite o código do clã dos seus pais!';
          msgEl.style.display = 'block';
          msgEl.style.color = '#f87171';
        }
        return;
      }

      try {
        btnJoinClan.textContent = '⏳ Ingressando...';
        const res = await api.post('/api/family/join', { invite_code: code });

        if (res.token) {
          auth.state.token = res.token;
          localStorage.setItem('liraquest_token', res.token);
          localStorage.setItem('token', res.token);
        }

        const member = res.member || res.user;
        if (member) {
          auth.state.user = member;
          localStorage.setItem('liraquest_user', JSON.stringify(member));
          auth.notify();
        }

        if (msgEl) {
          msgEl.textContent = res.message || '🎉 Vinculado com sucesso!';
          msgEl.style.display = 'block';
          msgEl.style.color = '#4ade80';
        }

        setTimeout(() => {
          router.navigate('hub');
        }, 600);
      } catch (err) {
        btnJoinClan.textContent = '🛡️ Ingressar no Clã';
        if (msgEl) {
          msgEl.textContent = err.message || 'Código do clã inválido.';
          msgEl.style.display = 'block';
          msgEl.style.color = '#f87171';
        }
      }
    };
  }

  // 2. Scroll rápido para Fila de Aprovação
  const btnScrollPending = document.getElementById('btn-scroll-pending');
  if (btnScrollPending) {
    btnScrollPending.onclick = () => {
      document.getElementById('hub-pending-queue')?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // 3. Portais do Grimório & Navegações
  document.querySelectorAll('[data-portal-route]').forEach(btn => {
    btn.onclick = () => {
      const route = btn.getAttribute('data-portal-route');
      if (route) router.navigate(route);
    };
  });

  const btnOpenTasks = document.getElementById('btn-hub-open-tasks');
  if (btnOpenTasks) btnOpenTasks.onclick = () => router.navigate('tasks');

  const btnPanelTasks = document.getElementById('btn-hub-panel-tasks');
  if (btnPanelTasks) btnPanelTasks.onclick = () => router.navigate('tasks');

  const btnOpenShop = document.getElementById('btn-hub-open-shop');
  if (btnOpenShop) btnOpenShop.onclick = () => router.navigate('shop');

  // 4. Botão 📸 Concluir / Reenviar Missão direto do Grimório
  document.querySelectorAll('.btn-hub-submit-proof').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.dataset.taskId;
      const taskTitle = btn.dataset.taskTitle;
      openSubmitProofModal({
        mountId: 'hub-modal-mount',
        taskId,
        taskTitle,
        onSuccess: () => router.navigate('hub'),
      });
    };
  });

  // 5. Botão ➕ Nova Missão (Guardiões)
  const btnNewTask = document.getElementById('btn-hub-new-task');
  if (btnNewTask) {
    btnNewTask.onclick = () => {
      openNewTaskModal({
        mountId: 'hub-modal-mount',
        children: cachedChildren,
        onSuccess: () => router.navigate('hub'),
      });
    };
  }

  // 6. Ampliar foto na Fila de Aprovação
  document.querySelectorAll('.hub-proof-thumb').forEach(img => {
    img.onclick = () => openImagePreviewModal('hub-modal-mount', img.dataset.img);
  });

  // 7. Aprovação 1-Clique na Fila dos Pais
  document.querySelectorAll('.btn-hub-approve').forEach(btn => {
    btn.onclick = async () => {
      const submissionId = btn.dataset.id;
      const heroName = btn.dataset.hero;
      btn.disabled = true;
      btn.textContent = '⏳...';

      try {
        const res = await api.post(`/api/tasks/submissions/${submissionId}/approve`);
        await auth.checkSession();

        if (res.str_leveled_up) {
          showFanfareModal('hub-modal-mount', heroName, res.new_str, res.old_str, () => router.navigate('hub'));
        } else {
          showToast(res.message || 'Missão aprovada com sucesso!', 'success');
          setTimeout(() => router.navigate('hub'), 700);
        }
      } catch (err) {
        showToast(err.message || 'Erro ao aprovar submissão', 'danger');
        btn.disabled = false;
        btn.textContent = '✅ Aprovar';
      }
    };
  });

  // 8. Rejeição com Feedback na Fila dos Pais
  document.querySelectorAll('.btn-hub-reject').forEach(btn => {
    btn.onclick = async () => {
      const submissionId = btn.dataset.id;
      const feedback = prompt('Orientação para o herói caprichar mais (opcional):', 'Precisa organizar melhor os cantinhos!');
      if (feedback === null) return;

      btn.disabled = true;
      btn.textContent = '⏳...';

      try {
        await api.post(`/api/tasks/submissions/${submissionId}/reject`, { feedback });
        showToast('Submissão devolvida ao herói com orientação.', 'gold');
        setTimeout(() => router.navigate('hub'), 700);
      } catch (err) {
        showToast(err.message || 'Erro ao devolver submissão', 'danger');
        btn.disabled = false;
        btn.textContent = '❌ Devolver';
      }
    };
  });

  // 9. Seleção de Atributo + Rolador D20
  const member = auth.getMember() || {};
  document.querySelectorAll('[data-stat-key]').forEach(btn => {
    btn.onclick = () => {
      selectedStat = btn.getAttribute('data-stat-key') || 'str';
      document.querySelectorAll('[data-stat-key]').forEach(orb => {
        orb.classList.toggle('selected', orb.getAttribute('data-stat-key') === selectedStat);
      });

      const meta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
      const score = member[meta.key] ?? 10;
      const xpAttr = member[`xp_${meta.key}`] ?? 0;

      const masteryEl = document.getElementById('sheet-selected-mastery-line');
      if (masteryEl) {
        masteryEl.innerHTML = `<strong>Atributo Selecionado (${meta.label}):</strong> Valor <strong>${score}</strong> (${formatMod(getMod(score))}) • Mestria <strong>${xpAttr}/100 XP</strong>.`;
      }

      const rollBtn = document.getElementById('btn-hub-roll-d20');
      if (rollBtn) {
        rollBtn.textContent = `🎲 Rolar D20 (${meta.short})`;
      }
    };
  });

  const rollBtn = document.getElementById('btn-hub-roll-d20');
  const readout = document.getElementById('sheet-d20-readout');
  if (rollBtn) {
    rollBtn.onclick = () => {
      const meta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
      const mod = getMod(member[meta.key] ?? 10);
      const die = Math.floor(Math.random() * 20) + 1;
      const total = die + mod;
      const suffix = die === 20 ? ' 🌟 CRÍTICO!' : (die === 1 ? ' 💀 FALHA!' : '');
      lastRollText = `🎲 ${meta.short}: d20(${die}) ${formatMod(mod)} = ${total}${suffix}`;
      if (readout) readout.textContent = lastRollText;
    };
  }
}

export default { renderHubView, bindHubEvents };
