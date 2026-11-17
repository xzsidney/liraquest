/**
 * LiraQuest - Componente HUD do Herói
 */

import { auth } from '../core/auth.js';

export function renderHUD() {
  const user = auth.getUser();
  const character = auth.getCharacter();
  if (!user) return '';

  const gold = character?.gold ?? 0;
  const level = character?.level ?? 1;
  const xp = character?.xp ?? 0;
  const nextXp = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / nextXp) * 100));

  return `
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.8rem;">${character?.avatar_icon || '⚔️'}</span>
        <div>
          <strong style="color: #ffffff; font-size: 1rem;">${character?.hero_name || user.name}</strong>
          <span style="display: block; font-size: 0.75rem; color: #fde047;">Nível ${level} • ${character?.class_name || 'Guardião do Lar'}</span>
        </div>
      </div>

      <div style="flex: 1; max-width: 240px; min-width: 160px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; margin-bottom: 4px;">
          <span>XP</span>
          <span>${xp} / ${nextXp}</span>
        </div>
        <div style="height: 6px; background: rgba(0, 0, 0, 0.5); border-radius: 10px; overflow: hidden;">
          <div style="width: ${xpPercent}%; height: 100%; background: linear-gradient(90deg, #d4af37, #f59e0b);"></div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 0.9rem; font-weight: 800; color: #fde047;">🪙 ${gold} Ouro</span>
      </div>
    </div>
  `;
}
