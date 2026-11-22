/**
 * LiraQuest - Componente HeroHUD Nobre (frontend/src/components/HeroHUD.js)
 */

import { auth } from '../core/auth.js';

export function renderHeroHUD() {
  const member = auth.getMember();
  if (!member) return '';

  const heroName = member.hero_nickname || member.name || 'Herói';
  const level = member.level || 1;
  const xp = member.xp || 0;
  const nextXp = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / nextXp) * 100));

  const energy = member.adventure_energy !== undefined ? member.adventure_energy : 10;
  const tokens = member.family_tokens !== undefined ? member.family_tokens : 0;
  const gold = member.gold !== undefined ? member.gold : 50;
  const streak = member.streak_days !== undefined ? member.streak_days : 1;

  // Ícone temático conforme classe
  let avatarIcon = '🛡️';
  let classTitle = 'Guardião do Lar';

  if (member.class_code === 'guardiao_da_harmonia') {
    avatarIcon = '👑';
    classTitle = 'Guardiã da Harmonia';
  } else if (member.class_code === 'rastreador_veloz') {
    avatarIcon = '🏹';
    classTitle = 'Rastreador Veloz';
  } else if (member.class_code === 'artifice_criativo') {
    avatarIcon = '🎨';
    classTitle = 'Artífice Criativa';
  } else if (member.class_code === 'guerreiro_disciplina') {
    avatarIcon = '⚔️';
    classTitle = 'Guerreiro da Disciplina';
  } else if (member.role === 'ADMIN') {
    avatarIcon = '🛡️';
    classTitle = 'Mestre Guardião';
  }

  return `
    <div class="hero-hud-container">
      
      <!-- Avatar & Identidade -->
      <div class="hero-avatar-area">
        <div class="hero-hud-avatar">${avatarIcon}</div>
        <div class="hero-identity">
          <h2 class="cinzel gold-gradient-text">${heroName}</h2>
          <span class="hero-class-tag">
            ⭐ Nível ${level} • ${classTitle}
          </span>
        </div>
      </div>

      <!-- Barra de Experiência (XP) -->
      <div class="hero-xp-area">
        <div class="hero-xp-header">
          <span>EXPERIÊNCIA</span>
          <span>${xp} / ${nextXp} XP</span>
        </div>
        <div class="hero-xp-track">
          <div class="hero-xp-fill" style="width: ${xpPercent}%;"></div>
        </div>
      </div>

      <!-- Fichas & Recursos Vitais -->
      <div class="hero-stats-chips">
        <div class="stat-chip stat-chip-energy" title="Energia de Aventura">
          <span>⚡</span>
          <span>${energy}/10 Energia</span>
        </div>

        <div class="stat-chip stat-chip-tokens" title="Fichas do Lar (Resgate de Vales)">
          <span>🎟️</span>
          <span>${tokens} Fichas</span>
        </div>

        <div class="stat-chip stat-chip-gold" title="Ouro do Herói">
          <span>💰</span>
          <span>${gold} Ouro</span>
        </div>

        <div class="stat-chip stat-chip-streak" title="Sequência de Hábitos Cumpridos">
          <span>🔥</span>
          <span>${streak} Dias</span>
        </div>
      </div>

    </div>
  `;
}

export default { renderHeroHUD };
