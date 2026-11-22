/**
 * LiraQuest - Ficha Ilustrada do Herói (Página Teste /home/teste)
 * Inspirada na estética clássica D&D 5e com Pergaminho Clássico e Grimório Real LiraQuest
 */

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { api } from '../core/api.js';

let currentTheme = 'parchment'; // 'parchment' | 'obsidian'
let selectedPreset = null;      // null -> 'real' se logado, senão 'paladin'
let selectedStat = 'str';
let lastRollText = 'Clique em um atributo e role o D20!';

const HERO_PRESETS = {
  paladin: {
    key: 'paladin',
    name: 'Sidney Lira',
    hero_nickname: 'Paladino Sidney',
    role: 'ADMIN',
    class_code: 'guardiao_do_lar',
    class_label: 'Guardião do Lar',
    origin_label: 'Mestre Guardião',
    alignment_label: 'Honra & Disciplina',
    family_name: 'Clã Lira (LIRA-2026)',
    level: 5,
    xp: 240,
    adventure_energy: 10,
    family_tokens: 50,
    gold: 150,
    streak_days: 5,
    str: 15,
    agi: 10,
    con: 16,
    int: 12,
    cha: 12,
    luk: 10,
    xp_str: 65,
    xp_agi: 20,
    xp_con: 45,
    xp_int: 30,
    xp_cha: 50,
    xp_luk: 10,
    portrait: '/src/assets/heroes/paladin_lira.jpg',
  },
  valkyrie: {
    key: 'valkyrie',
    name: 'Jennifer Lira',
    hero_nickname: 'Valquíria Jennifer',
    role: 'CHILD',
    class_code: 'artifice_criativo',
    class_label: 'Artífice Criativa',
    origin_label: 'Herói Aventureiro',
    alignment_label: 'Criatividade & Saber',
    family_name: 'Clã Lira (LIRA-2026)',
    level: 3,
    xp: 150,
    adventure_energy: 10,
    family_tokens: 25,
    gold: 75,
    streak_days: 4,
    str: 14,
    agi: 11,
    con: 12,
    int: 16,
    cha: 11,
    luk: 10,
    xp_str: 40,
    xp_agi: 35,
    xp_con: 25,
    xp_int: 75,
    xp_cha: 30,
    xp_luk: 20,
    portrait: '/src/assets/heroes/valkyrie_artificer.jpg',
  },
  newbie: {
    key: 'newbie',
    name: 'Novo Herói',
    hero_nickname: 'Aprendiz do Clã',
    role: 'CHILD',
    class_code: 'guerreiro_disciplina',
    class_label: 'Guerreiro da Disciplina',
    origin_label: 'Herói Recém-Desperto',
    alignment_label: 'Base Equilibrada (Todos 10)',
    family_name: 'Aguardando Clã',
    level: 1,
    xp: 0,
    adventure_energy: 10,
    family_tokens: 0,
    gold: 50,
    streak_days: 1,
    str: 10,
    agi: 10,
    con: 10,
    int: 10,
    cha: 10,
    luk: 10,
    xp_str: 0,
    xp_agi: 0,
    xp_con: 0,
    xp_int: 0,
    xp_cha: 0,
    xp_luk: 0,
    portrait: '/src/assets/heroes/paladin_lira.jpg',
  },
};

const SAMPLE_MISSIONS = [
  { title: 'Arrumar a Cama e Quarto', reward_str_xp: 25, reward_gold: 10, reward_tokens: 1, today_approved: true },
  { title: 'Lavar e Guardar a Louça', reward_str_xp: 30, reward_gold: 15, reward_tokens: 1, today_pending: true },
  { title: 'Recolher o Lixo da Casa', reward_str_xp: 20, reward_gold: 10, reward_tokens: 1 },
  { title: 'Organizar Mesa de Estudos', reward_str_xp: 15, reward_gold: 10, reward_tokens: 1 },
];

const SKILL_DEFINITIONS = [
  { name: 'Organização do Lar', attr: 'str', attrLabel: 'FOR', profClasses: ['guardiao_do_lar', 'guerreiro_disciplina'] },
  { name: 'Esforço & Vigor', attr: 'str', attrLabel: 'FOR', profClasses: ['guardiao_do_lar', 'guerreiro_disciplina'] },
  { name: 'Pontualidade Ágil', attr: 'agi', attrLabel: 'AGI', profClasses: ['rastreador_veloz'] },
  { name: 'Reflexos & Ordem', attr: 'agi', attrLabel: 'AGI', profClasses: ['rastreador_veloz', 'guerreiro_disciplina'] },
  { name: 'Hidratação (2L)', attr: 'con', attrLabel: 'CON', profClasses: ['guardiao_do_lar', 'guardiao_da_harmonia'] },
  { name: 'Alimentação Limpa', attr: 'con', attrLabel: 'CON', profClasses: ['guardiao_da_harmonia'] },
  { name: 'Estudos & Foco', attr: 'int', attrLabel: 'INT', profClasses: ['artifice_criativo'] },
  { name: 'Leitura & Saber', attr: 'int', attrLabel: 'INT', profClasses: ['artifice_criativo'] },
  { name: 'Empatia Familiar', attr: 'cha', attrLabel: 'CAR', profClasses: ['guardiao_da_harmonia'] },
  { name: 'Cooperação no Clã', attr: 'cha', attrLabel: 'CAR', profClasses: ['guardiao_da_harmonia', 'guardiao_do_lar'] },
  { name: 'Bônus & Tesouros', attr: 'luk', attrLabel: 'SOR', profClasses: ['rastreador_veloz', 'artifice_criativo'] },
  { name: 'Desafios D20', attr: 'luk', attrLabel: 'SOR', profClasses: ['guerreiro_disciplina', 'rastreador_veloz'] },
];

const STAT_META = [
  { key: 'str', short: 'STR', label: 'FORÇA', posClass: 'pos-str', flagClass: 'flag-str' },
  { key: 'agi', short: 'AGI', label: 'AGILIDADE', posClass: 'pos-agi', flagClass: 'flag-agi' },
  { key: 'con', short: 'CON', label: 'CONSTIT.', posClass: 'pos-con', flagClass: 'flag-con' },
  { key: 'int', short: 'INT', label: 'INTELIG.', posClass: 'pos-int', flagClass: 'flag-int' },
  { key: 'cha', short: 'CHA', label: 'CARISMA', posClass: 'pos-cha', flagClass: 'flag-cha' },
  { key: 'luk', short: 'LUK', label: 'SORTE', posClass: 'pos-luk', flagClass: 'flag-luk' },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

function resolvePortrait(classCode) {
  if (classCode === 'artifice_criativo' || classCode === 'guardiao_da_harmonia') {
    return '/src/assets/heroes/valkyrie_artificer.jpg';
  }
  return '/src/assets/heroes/paladin_lira.jpg';
}

function resolveActiveHero() {
  const isLogged = auth.isAuthenticated();
  const mode = selectedPreset || (isLogged ? 'real' : 'paladin');

  if (mode === 'real' && isLogged) {
    const m = auth.getMember() || {};
    return {
      key: 'real',
      name: m.name || 'Herói',
      hero_nickname: m.hero_nickname || m.name || 'Aventureiro',
      role: m.role || 'CHILD',
      class_code: m.class_code || 'guardiao_do_lar',
      class_label: resolveClassLabel(m.class_code),
      origin_label: m.role === 'ADMIN' ? 'Mestre Guardião' : (m.role === 'PARENT' ? 'Guardião Familiar' : 'Herói Aventureiro'),
      alignment_label: 'Reforço Positivo',
      family_name: m.family?.name ? `${m.family.name} (${m.family.invite_code})` : 'Sem Clã Vinculado',
      level: m.level ?? 1,
      xp: m.xp ?? 0,
      adventure_energy: m.adventure_energy ?? 10,
      family_tokens: m.family_tokens ?? 0,
      gold: m.gold ?? 50,
      streak_days: m.streak_days ?? 1,
      str: m.str ?? 10,
      agi: m.agi ?? 10,
      con: m.con ?? 10,
      int: m.int ?? 10,
      cha: m.cha ?? 10,
      luk: m.luk ?? 10,
      xp_str: m.xp_str ?? 0,
      xp_agi: m.xp_agi ?? 0,
      xp_con: m.xp_con ?? 0,
      xp_int: m.xp_int ?? 0,
      xp_cha: m.xp_cha ?? 0,
      xp_luk: m.xp_luk ?? 0,
      portrait: resolvePortrait(m.class_code),
    };
  }

  return HERO_PRESETS[mode] || HERO_PRESETS.paladin;
}

export async function renderSheetTestView() {
  const isLogged = auth.isAuthenticated();
  const hero = resolveActiveHero();
  const activeMode = hero.key;

  let missions = SAMPLE_MISSIONS;
  if (isLogged && activeMode === 'real') {
    try {
      const res = await api.get('/api/tasks');
      if (Array.isArray(res?.tasks) && res.tasks.length > 0) {
        missions = res.tasks.slice(0, 4);
      }
    } catch {
      missions = SAMPLE_MISSIONS;
    }
  }

  const nextXp = (hero.level || 1) * 100;
  const xpPct = Math.min(100, Math.round(((hero.xp || 0) / nextXp) * 100));
  const profBonus = 2 + Math.floor(((hero.level || 1) - 1) / 4);
  const defenseScore = 10 + getMod(hero.agi) + getMod(hero.con);
  const maxVitality = 100 + (hero.con || 10) * 5;
  const passiveVision = 10 + getMod(hero.int) + profBonus;
  const activeStatMeta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
  const activeStatScore = hero[activeStatMeta.key] ?? 10;
  const activeStatXp = hero[`xp_${activeStatMeta.key}`] ?? 0;

  return `
    <div class="lq-sheet-page" id="lq-sheet-root" data-sheet-theme="${currentTheme}">
      
      <!-- Barra de Controle do Preview /home/teste -->
      <div class="sheet-preview-bar">
        <div class="sheet-preview-group">
          <span class="sheet-preview-label">Estilo:</span>
          <button type="button" class="sheet-ctrl-btn ${currentTheme === 'parchment' ? 'active' : ''}" data-sheet-theme-btn="parchment">
            📜 Pergaminho Clássico
          </button>
          <button type="button" class="sheet-ctrl-btn ${currentTheme === 'obsidian' ? 'active' : ''}" data-sheet-theme-btn="obsidian">
            🌌 Grimório LiraQuest
          </button>
        </div>

        <div class="sheet-preview-group">
          <span class="sheet-preview-label">Herói:</span>
          ${isLogged ? `
            <button type="button" class="sheet-ctrl-btn ${activeMode === 'real' ? 'active' : ''}" data-sheet-preset="real">
              👤 Meu Herói Real
            </button>
          ` : ''}
          <button type="button" class="sheet-ctrl-btn ${activeMode === 'paladin' ? 'active' : ''}" data-sheet-preset="paladin">
            🛡️ Paladino Sidney
          </button>
          <button type="button" class="sheet-ctrl-btn ${activeMode === 'valkyrie' ? 'active' : ''}" data-sheet-preset="valkyrie">
            🎨 Valquíria Jennifer
          </button>
          <button type="button" class="sheet-ctrl-btn ${activeMode === 'newbie' ? 'active' : ''}" data-sheet-preset="newbie">
            ✨ Novo Herói (Todos 10)
          </button>
        </div>

        <button type="button" id="btn-sheet-back" class="sheet-ctrl-btn">
          ⬅️ ${isLogged ? 'Voltar ao Salão' : 'Página Inicial'}
        </button>
      </div>

      <!-- FICHA ILUSTRADA D&D 5e -->
      <section class="sheet-canvas" aria-label="Ficha Ilustrada do Herói">
        
        <!-- 1. Cabeçalho Superior (Placa + Pergaminho Enrolado) -->
        <header class="sheet-header-grid">
          <div class="sheet-name-plaque">
            <div class="sheet-plaque-kicker">LiraQuest • Ficha Viva D20</div>
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
                <div class="sheet-meta-label">Nome do Jogador</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.family_name)}</div>
                <div class="sheet-meta-label">Clã Familiar</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${escapeHtml(hero.alignment_label)}</div>
                <div class="sheet-meta-label">Tendência</div>
              </div>
              <div class="sheet-meta-cell">
                <div class="sheet-meta-value">${hero.xp} / ${nextXp} XP</div>
                <div class="sheet-meta-label">Experiência Atual</div>
              </div>
            </div>
          </div>
        </header>

        <!-- 2. Faixa de Medalhões, Coroa dos 6 Pilares e Escudo CA -->
        <div class="sheet-medallions-row">
          <div class="sheet-medallions-left">
            <div class="sheet-ribbon-pill" title="Sequência de hábitos cumpridos">
              <div class="sheet-ribbon-circle">🔥${hero.streak_days}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">Inspiração / Foco</span>
                <span class="sheet-ribbon-sub">${hero.streak_days} Dias seguidos</span>
              </div>
            </div>

            <div class="sheet-ribbon-pill" title="Bônus de Proficiência pelo Nível">
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
            <div class="sheet-ribbon-pill" title="Energia disponível para missões RPG">
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

        <!-- 3. Área Central: Grimório de Perícias (Esquerda) + Retrato & Arco de Atributos (Direita) -->
        <div class="sheet-main-grid">
          
          <!-- Grimório de Perícias e Portais -->
          <aside class="sheet-grimoire">
            <span class="sheet-grimoire-clasp clasp-top" aria-hidden="true"></span>
            <span class="sheet-grimoire-clasp clasp-bottom" aria-hidden="true"></span>

            <div>
              <h2 class="sheet-grimoire-title">📖 Grimório &amp; Perícias</h2>

              <div class="sheet-portals-mini">
                <button type="button" class="sheet-portal-btn" data-portal-route="tasks">🧹 Tarefas</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="study">📚 Estudos</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="health">🥗 Saúde</button>
                <button type="button" class="sheet-portal-btn" data-portal-route="shop">🎡 Empório</button>
              </div>

              <div class="sheet-skills-list">
                ${SKILL_DEFINITIONS.map(skill => {
                  const isProf = skill.profClasses.includes(hero.class_code);
                  const mod = getMod(hero[skill.attr]) + (isProf ? profBonus : 0);
                  return `
                    <div class="sheet-skill-row">
                      <div class="sheet-skill-left">
                        <span class="sheet-skill-dot ${isProf ? 'proficient' : ''}" title="${isProf ? 'Proficiente' : 'Básico'}"></span>
                        <span>${skill.name} <span class="sheet-skill-attr">(${skill.attrLabel})</span></span>
                      </div>
                      <span class="sheet-skill-mod">${formatMod(mod)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="sheet-grimoire-footer">
              <span>🛡️ Bônus Proficiência: +${profBonus}</span>
              <span>🎲 Sistema D20</span>
            </div>
          </aside>

          <!-- Palco do Herói com Círculo Arcano + Retrato + Arco dos 6 Medalhões -->
          <div class="sheet-hero-stage">
            
            <!-- Círculo Astrolábio SVG ao Fundo -->
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

            <!-- Arco Ornamental Dourado Conectando os 6 Medalhões -->
            <svg class="sheet-arc-svg" viewBox="0 0 760 555" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 185 52 C 380 12, 620 68, 638 250 C 646 340, 616 420, 560 462" fill="none" stroke="var(--sh-gold)" stroke-width="5" stroke-linecap="round" opacity="0.55" />
              <path d="M 185 52 C 380 12, 620 68, 638 250 C 646 340, 616 420, 560 462" fill="none" stroke="var(--sh-gold-bright)" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.85" />
            </svg>

            <!-- Retrato Ilustrado do Herói -->
            <div class="sheet-hero-portrait-wrap">
              <img
                src="${hero.portrait}"
                alt="Retrato de ${escapeHtml(hero.hero_nickname)}"
                class="sheet-hero-portrait"
              />
            </div>

            <!-- 6 Medalhões dos Atributos (Clicáveis) -->
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

            <!-- Visão Passiva (Inferior Esquerdo) -->
            <div class="sheet-passive-eye" title="Percepção Passiva (10 + INT + Proficiência)">
              <div class="sheet-eye-badge">${passiveVision}</div>
              <div class="sheet-ribbon-text">
                <span class="sheet-ribbon-title">👁️ Visão Passiva</span>
                <span class="sheet-ribbon-sub">Atenção no Lar</span>
              </div>
            </div>

            <!-- Ritmo / Deslocamento (Inferior Direito) -->
            <div class="sheet-speed-tag" title="Ritmo de Evolução e Constância">
              <div class="sheet-ribbon-title">🥾 Deslocamento</div>
              <div class="sheet-ribbon-sub">30 ft • ${hero.streak_days}d Foco</div>
            </div>

          </div>
        </div>

        <!-- 4. Painéis Inferiores (3 Colunas Ornamentadas + Espada Decorativa) -->
        <div class="sheet-bottom-wrap">
          
          <!-- Espada Decorativa Vertical à Esquerda -->
          <svg class="sheet-sword-deco" viewBox="0 0 36 320" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#94a3b8" />
                <stop offset="50%" stop-color="#f8fafc" />
                <stop offset="100%" stop-color="#64748b" />
              </linearGradient>
            </defs>
            <!-- Pomo e Cabo -->
            <circle cx="18" cy="14" r="7" fill="#d4af37" stroke="#5c3a10" stroke-width="1.5" />
            <rect x="14" y="20" width="8" height="36" rx="2" fill="#800020" stroke="#d4af37" stroke-width="1.2" />
            <!-- Guarda Cruzada -->
            <path d="M 3 56 Q 18 64 33 56 L 30 64 Q 18 70 6 64 Z" fill="#d4af37" stroke="#5c3a10" stroke-width="1.2" />
            <!-- Lâmina -->
            <polygon points="12,66 24,66 22,292 18,314 14,292" fill="url(#bladeGrad)" stroke="#475569" stroke-width="1" />
            <line x1="18" y1="70" x2="18" y2="294" stroke="#800020" stroke-width="1.4" opacity="0.65" />
          </svg>

          <div class="sheet-bottom-grid">
            
            <!-- Coluna 1: Missões & Ações do Dia -->
            <div class="sheet-panel">
              <div class="sheet-panel-header">⚔️ Missões &amp; Ações do Dia</div>
              <div class="sheet-panel-body">
                <div>
                  <div class="sheet-table-row sheet-table-head">
                    <span>Missão</span>
                    <span>Recompensa</span>
                    <span style="text-align: right;">Status</span>
                  </div>
                  ${missions.map(m => {
                    const statusClass = m.today_approved ? 'tag-done' : (m.today_pending ? 'tag-pending' : 'tag-ready');
                    const statusLabel = m.today_approved ? 'Concluída' : (m.today_pending ? 'Pendente' : 'Disponível');
                    return `
                      <div class="sheet-table-row">
                        <strong style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</strong>
                        <span>+${m.reward_str_xp ?? 25} STR / +${m.reward_gold ?? 10}g</span>
                        <span style="text-align: right;"><span class="sheet-status-tag ${statusClass}">${statusLabel}</span></span>
                      </div>
                    `;
                  }).join('')}
                </div>

                <button type="button" id="btn-sheet-open-tasks" class="sheet-cta-btn" style="width: 100%;">
                  🧹 Abrir Mural de Missões (Enviar Prova)
                </button>
              </div>
            </div>

            <!-- Coluna 2: Vitalidade, Tesouro & Evolução -->
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
                    <div class="sheet-hp-num">Nv. ${hero.level}</div>
                  </div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 800;">
                    <span>EXPERIÊNCIA DO NÍVEL</span>
                    <span>${hero.xp} / ${nextXp} XP (${xpPct}%)</span>
                  </div>
                  <div class="sheet-xp-track">
                    <div class="sheet-xp-fill" style="width: ${xpPct}%;"></div>
                  </div>
                </div>

                <div class="sheet-treasury-grid">
                  <div class="sheet-treasure-box">
                    <div class="sheet-treasure-val">💰 ${hero.gold}</div>
                    <div class="sheet-treasure-lbl">Ouro</div>
                  </div>
                  <div class="sheet-treasure-box">
                    <div class="sheet-treasure-val">🎟️ ${hero.family_tokens}</div>
                    <div class="sheet-treasure-lbl">Fichas</div>
                  </div>
                  <div class="sheet-treasure-box">
                    <div class="sheet-treasure-val">⚡ ${hero.adventure_energy}</div>
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

            <!-- Coluna 3: Traços & Poderes do Herói + Rolador D20 -->
            <div class="sheet-panel">
              <div class="sheet-panel-header">📜 Traços &amp; Mestria Orgânica</div>
              <div class="sheet-panel-body">
                <div class="sheet-traits-lines">
                  <div class="sheet-trait-item">
                    <strong>Eu sou o Herói:</strong> Ficha unificada em <code>family_members</code>. Suas ações reais evoluem seus atributos.
                  </div>
                  <div class="sheet-trait-item">
                    <strong>Mestria Orgânica:</strong> Ao atingir <strong>100 XP</strong> na barra de um atributo, ele sobe <strong>+1 permanente</strong> mantendo o excedente.
                  </div>
                  <div class="sheet-trait-item" id="sheet-selected-mastery-line">
                    <strong>Atributo Selecionado (${activeStatMeta.label}):</strong> Valor <strong>${activeStatScore}</strong> (${formatMod(getMod(activeStatScore))}) • Mestria <strong>${activeStatXp}/100 XP</strong>.
                  </div>
                </div>

                <div class="sheet-d20-box">
                  <div class="sheet-d20-result" id="sheet-d20-readout">${escapeHtml(lastRollText)}</div>
                  <button type="button" id="btn-sheet-roll-d20" class="sheet-cta-btn">
                    🎲 Rolar D20 (${activeStatMeta.short})
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  `;
}

export function bindSheetTestEvents() {
  const root = document.getElementById('lq-sheet-root');

  // 1. Alternador de Tema (Pergaminho Clássico vs Grimório Escuro)
  document.querySelectorAll('[data-sheet-theme-btn]').forEach(btn => {
    btn.onclick = () => {
      const nextTheme = btn.getAttribute('data-sheet-theme-btn');
      if (!nextTheme) return;
      currentTheme = nextTheme;
      if (root) root.setAttribute('data-sheet-theme', nextTheme);
      document.querySelectorAll('[data-sheet-theme-btn]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-sheet-theme-btn') === nextTheme);
      });
    };
  });

  // 2. Alternador de Herói de Exemplo / Herói Real
  document.querySelectorAll('[data-sheet-preset]').forEach(btn => {
    btn.onclick = () => {
      selectedPreset = btn.getAttribute('data-sheet-preset');
      lastRollText = 'Clique em um atributo e role o D20!';
      router.navigate('home/teste');
    };
  });

  // 3. Seleção de Atributo nos 6 Medalhões do Arco
  const hero = resolveActiveHero();
  document.querySelectorAll('[data-stat-key]').forEach(btn => {
    btn.onclick = () => {
      selectedStat = btn.getAttribute('data-stat-key') || 'str';
      document.querySelectorAll('[data-stat-key]').forEach(orb => {
        orb.classList.toggle('selected', orb.getAttribute('data-stat-key') === selectedStat);
      });

      const meta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
      const score = hero[meta.key] ?? 10;
      const xpAttr = hero[`xp_${meta.key}`] ?? 0;

      const masteryEl = document.getElementById('sheet-selected-mastery-line');
      if (masteryEl) {
        masteryEl.innerHTML = `<strong>Atributo Selecionado (${meta.label}):</strong> Valor <strong>${score}</strong> (${formatMod(getMod(score))}) • Mestria <strong>${xpAttr}/100 XP</strong>.`;
      }

      const rollBtn = document.getElementById('btn-sheet-roll-d20');
      if (rollBtn) {
        rollBtn.textContent = `🎲 Rolar D20 (${meta.short})`;
      }
    };
  });

  // 4. Rolador D20 Integrado com o Atributo Selecionado
  const rollBtn = document.getElementById('btn-sheet-roll-d20');
  const readout = document.getElementById('sheet-d20-readout');
  if (rollBtn) {
    rollBtn.onclick = () => {
      const meta = STAT_META.find(s => s.key === selectedStat) || STAT_META[0];
      const mod = getMod(hero[meta.key] ?? 10);
      const die = Math.floor(Math.random() * 20) + 1;
      const total = die + mod;
      const suffix = die === 20 ? ' 🌟 CRÍTICO!' : (die === 1 ? ' 💀 FALHA!' : '');
      lastRollText = `🎲 ${meta.short}: d20(${die}) ${formatMod(mod)} = ${total}${suffix}`;
      if (readout) readout.textContent = lastRollText;
    };
  }

  // 5. Navegação dos Portais do Grimório e Botões
  document.querySelectorAll('[data-portal-route]').forEach(btn => {
    btn.onclick = () => {
      const target = btn.getAttribute('data-portal-route');
      if (target) router.navigate(auth.isAuthenticated() ? target : 'login');
    };
  });

  const btnOpenTasks = document.getElementById('btn-sheet-open-tasks');
  if (btnOpenTasks) {
    btnOpenTasks.onclick = () => router.navigate(auth.isAuthenticated() ? 'tasks' : 'login');
  }

  const btnBack = document.getElementById('btn-sheet-back');
  if (btnBack) {
    btnBack.onclick = () => router.navigate(auth.isAuthenticated() ? 'hub' : 'home');
  }
}

export default { renderSheetTestView, bindSheetTestEvents };
