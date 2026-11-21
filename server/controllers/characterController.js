import { randomUUID } from 'node:crypto';
import {
  FamilyCharacter,
  CharacterAttribute,
  DefinitionClass,
  DefinitionAttribute,
  DefinitionSkill,
  FamilyUser,
  UserProgress,
} from '../models/index.js';

/**
 * Retorna os dados completos do herói do usuário autenticado (V2 Oficial)
 */
export const getMyCharacter = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar perfil completo do usuário
    const user = await FamilyUser.findByPk(userId, {
      attributes: ['id', 'name', 'hero_nickname', 'email', 'role', 'phone', 'school_or_work', 'profile_photo_url', 'created_at'],
    });

    let character = await FamilyCharacter.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CharacterAttribute,
          as: 'attributes_direct',
        },
      ],
    });

    if (!character) {
      return res.json({
        success: true,
        hasCharacter: false,
        user,
        message: 'Usuário ainda não possui personagem ativo no clã.',
      });
    }

    const attrs = character.attributes_direct || {
      str: 10,
      agi: 10,
      con: 10,
      int: 10,
      cha: 10,
      luk: 10,
    };

    return res.json({
      success: true,
      hasCharacter: true,
      user,
      character: {
        id: character.id,
        user_id: character.user_id,
        family_id: character.family_id,
        name: user?.hero_nickname || user?.name || 'Aventureiro',
        class_code: character.class_code,
        skin_code: character.skin_code,
        level: character.level || 1,
        xp: character.xp || 0,
        gold: 100,
        attributes: {
          str: attrs.str ?? 10,
          agi: attrs.agi ?? 10,
          con: attrs.con ?? 10,
          int: attrs.int ?? 10,
          cha: attrs.cha ?? 10,
          luk: attrs.luk ?? 10,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar personagem:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar dados do personagem.',
    });
  }
};

/**
 * Cria ou atualiza o personagem do clã para o usuário
 */
export const createCharacter = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, class_code, skin_code } = req.body;

    const user = await FamilyUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    if (name && name.trim().length >= 2) {
      await user.update({ hero_nickname: name.trim() });
    }

    let character = await FamilyCharacter.findOne({ where: { user_id: userId } });
    if (!character) {
      character = await FamilyCharacter.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        family_id: user.family_id || randomUUID().toLowerCase(),
        class_code: class_code || 'guardiao_do_lar',
        skin_code: skin_code || 'default',
        level: 1,
        xp: 0,
      });

      await CharacterAttribute.create({
        id: randomUUID().toLowerCase(),
        character_id: character.id,
        attribute_id: randomUUID().toLowerCase(),
        base_value: 10,
        bonus_value: 0,
        str: 12,
        agi: 10,
        con: 12,
        int: 10,
        cha: 10,
        luk: 10,
      });
    }

    return res.status(201).json({
      success: true,
      message: `⚔️ Herói do Clã configurado com sucesso!`,
      character,
    });
  } catch (error) {
    console.error('❌ Erro ao criar/configurar personagem:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao criar personagem.',
    });
  }
};

/**
 * Atualiza os dados do perfil do usuário no mundo real
 */
export const updateRealProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, hero_nickname, phone, school_or_work, profile_photo_url } = req.body;

    const user = await FamilyUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    await user.update({
      name: name ? name.trim() : user.name,
      hero_nickname: hero_nickname !== undefined ? hero_nickname.trim() : user.hero_nickname,
      phone: phone !== undefined ? phone.trim() : user.phone,
      school_or_work: school_or_work !== undefined ? school_or_work.trim() : user.school_or_work,
      profile_photo_url: profile_photo_url !== undefined ? profile_photo_url.trim() : user.profile_photo_url,
    });

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar perfil.',
    });
  }
};

/**
 * Troca de classe ativa do herói
 */
export const changeHeroClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { class_code, skin_code } = req.body;

    const character = await FamilyCharacter.findOne({ where: { user_id: userId } });
    if (!character) {
      return res.status(404).json({ success: false, message: 'Personagem não encontrado.' });
    }

    await character.update({
      class_code: class_code || character.class_code,
      skin_code: skin_code || character.skin_code,
    });

    return res.json({
      success: true,
      message: `Classe do herói atualizada para ${character.class_code}!`,
      character,
    });
  } catch (error) {
    console.error('❌ Erro ao trocar classe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao trocar classe do herói.',
    });
  }
};

/**
 * Inicia uma partida do mini-game Esconde-Esconde Camaleão consumindo Energia de Aventura
 */
export const startChameleonGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const ENERGY_COST = 5;

    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        adventure_energy: 10,
      });
    }

    if ((progress.adventure_energy || 0) < ENERGY_COST) {
      await progress.increment('adventure_energy', { by: 15 });
      await progress.reload();
    }

    await progress.decrement('adventure_energy', { by: ENERGY_COST });
    await progress.reload();

    return res.json({
      success: true,
      message: `Partida iniciada! -${ENERGY_COST} Energia de Aventura.`,
      energy_remaining: progress.adventure_energy,
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar partida de Esconde-Esconde:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao iniciar mini-game.',
    });
  }
};

/**
 * Conclui a partida e credita recompensas de XP e Ouro
 */
export const completeChameleonGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { survivedSeconds = 0, crystalsCollected = 0, isVictory = false } = req.body;

    const character = await FamilyCharacter.findOne({ where: { user_id: userId } });
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Herói não encontrado.',
      });
    }

    let goldEarned = 0;
    let xpEarned = 0;

    if (!isVictory) {
      goldEarned = Math.min(10, Math.floor(survivedSeconds / 5)) + (crystalsCollected * 2);
      xpEarned = Math.min(15, Math.floor(survivedSeconds / 3));
    } else {
      const baseGold = 30;
      const crystalBonusGold = Math.min(25, crystalsCollected * 5);
      goldEarned = baseGold + crystalBonusGold;
      xpEarned = 50;
    }

    let cXP = (character.xp || 0) + xpEarned;
    let cLevel = character.level || 1;
    let reqXP = cLevel * 100;
    let leveledUp = false;

    while (cXP >= reqXP) {
      cXP -= reqXP;
      cLevel += 1;
      leveledUp = true;
      reqXP = cLevel * 100;
    }

    await character.update({ xp: cXP, level: cLevel });

    return res.json({
      success: true,
      isVictory,
      reward: {
        goldEarned,
        xpEarned,
        currentGold: 100 + goldEarned,
        newLevel: cLevel,
        leveledUp,
      },
      message: isVictory
        ? `🎉 VITÓRIA ÉPICA! Você sobreviveu à patrulha da lanterna e faturou 💰 +${goldEarned} Ouro e ⭐ +${xpEarned} XP!`
        : `Você foi capturado! Mas sua coragem garantiu 💰 +${goldEarned} Ouro e ⭐ +${xpEarned} XP de consolação!`,
    });
  } catch (error) {
    console.error('❌ Erro ao concluir partida de Esconde-Esconde:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar recompensas do mini-game.',
    });
  }
};
