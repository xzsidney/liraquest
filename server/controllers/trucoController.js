import { Character, DefinitionClass, UserProgress, FamilyUser } from '../models/index.js';

/**
 * GET /api/truco/profile
 * Retorna o perfil do usuário logado, seu herói e saldo de ouro para o módulo de Truco
 */
export const getTrucoProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await FamilyUser.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'profile_photo_url'],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.',
      });
    }

    let character = await Character.findOne({
      where: { user_id: userId },
      include: [{ model: DefinitionClass, as: 'current_class' }],
    });

    let progress = await UserProgress.findOne({ where: { user_id: userId } });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_photo_url: user.profile_photo_url,
      },
      character: character
        ? {
            id: character.id,
            name: character.name,
            level: character.level,
            gold: character.gold,
            current_xp: character.current_xp,
            class_name: character.current_class?.name || 'Guardião do Lar',
          }
        : null,
      progress: progress
        ? {
            adventure_energy: progress.adventure_energy,
            family_tokens: progress.family_tokens,
            streak_days: progress.streak_days,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do Truco:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao carregar perfil do Truco.',
    });
  }
};

/**
 * POST /api/truco/finish
 * Conclui uma partida de Truco, creditando Ouro e XP na conta da família
 */
export const finishTrucoMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_victory = false, game_mode = '4p', player_score = 0, bot_score = 0, bet_value = 1 } = req.body;

    const isVictory = Boolean(is_victory);
    const goldEarned = isVictory ? 40 : 10;
    const xpEarned = isVictory ? 60 : 15;

    let character = await Character.findOne({ where: { user_id: userId } });
    let leveledUp = false;
    let newLevel = 1;

    if (character) {
      await character.increment({
        gold: goldEarned,
        current_xp: xpEarned,
      });
      await character.reload();

      // Checa subida de nível: level * 100 de XP
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
      is_victory: isVictory,
      game_mode,
      player_score,
      bot_score,
      message: isVictory
        ? `🏆 Vitória triunfante no Truco! +${goldEarned} Ouro e +${xpEarned} XP adicionados ao seu Herói!`
        : `Partida encerrada. Valeu pelo jogo! +${goldEarned} Ouro e +${xpEarned} XP pela participação.`,
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
    console.error('❌ Erro ao finalizar partida de Truco:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar recompensas de Truco.',
    });
  }
};
