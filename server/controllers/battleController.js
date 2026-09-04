import { randomUUID } from 'crypto';
import {
  Character,
  UserProgress,
  Battle,
  CharacterClass,
} from '../models/index.js';

/**
 * POST /api/battle/start
 * Inicia a batalha consumindo 5 de Energia de Aventura
 */
export const startBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { player_hero = 'cap', opponent = 'cyclops', energy_cost = 5 } = req.body;

    // Verificar e debitar saldo de Energia do Usuário
    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        adventure_energy: 15,
      });
    }

    // Se estiver sem energia para testar, concede recarga cortesia
    if ((progress.adventure_energy || 0) < energy_cost) {
      await progress.increment('adventure_energy', { by: 15 });
      await progress.reload();
    }

    await progress.decrement('adventure_energy', { by: energy_cost });
    await progress.reload();

    // Localizar ou criar personagem
    const character = await Character.findOne({
      where: { user_id: userId },
      include: [{ model: CharacterClass, as: 'class_info' }],
    });

    return res.json({
      success: true,
      message: `Batalha iniciada! -${energy_cost} Energia consumida.`,
      battle_id: randomUUID().toLowerCase(),
      energy_remaining: progress.adventure_energy,
      player_hero,
      opponent,
      character: character
        ? {
            id: character.id,
            name: character.name,
            level: character.level,
            gold: character.gold,
            class_name: character.class_info?.name || 'Guerreiro da Família',
          }
        : null,
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar batalha 2D:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao iniciar batalha.',
    });
  }
};

/**
 * POST /api/battle/finish
 * Conclui a batalha e credita recompensas (XP e Ouro) se vitorioso
 */
export const finishBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { result, player_hero, opponent, turns_count = 1 } = req.body;

    const isVictory = result === 'VICTORY';
    const goldEarned = isVictory ? 50 : 10;
    const xpEarned = isVictory ? 80 : 25;

    let character = await Character.findOne({ where: { user_id: userId } });
    let leveledUp = false;
    let newLevel = 1;

    if (character) {
      await character.increment({
        gold: goldEarned,
        current_xp: xpEarned,
      });
      await character.reload();

      // Cálculo de subida de nível simples (100 * level)
      const xpNeeded = character.level * 100;
      if (character.current_xp >= xpNeeded) {
        await character.increment('level', { by: 1 });
        await character.decrement('current_xp', { by: xpNeeded });
        await character.reload();
        leveledUp = true;
        newLevel = character.level;
      }
    }

    return res.json({
      success: true,
      result: isVictory ? 'VICTORY' : 'DEFEAT',
      message: isVictory
        ? `Vitória triunfante na Arena 2D! +${goldEarned} Ouro, +${xpEarned} XP!`
        : `Combate encerrado. Não desista! +${goldEarned} Ouro, +${xpEarned} XP.`,
      rewards: {
        gold: goldEarned,
        xp: xpEarned,
        leveled_up: leveledUp,
        new_level: newLevel,
      },
      character: character
        ? {
            id: character.id,
            name: character.name,
            level: character.level,
            gold: character.gold,
            current_xp: character.current_xp,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar batalha 2D:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao registrar resultado da batalha.',
    });
  }
};
