import { randomUUID } from 'crypto';
import {
  Character,
  UserProgress,
  Battle,
  CharacterClass,
  CharacterAttribute,
  DefinitionAttribute,
  CharacterSkill,
  DefinitionSkill,
  CharacterInventory,
  DefinitionItem,
  DefinitionClass,
} from '../models/index.js';

/**
 * POST /api/battle/start
 * Inicia a batalha 2D consumindo 5 de Energia de Aventura e vinculando os atributos da Ficha
 */
export const startBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { player_hero = 'cap', opponent = 'cyclops', energy_cost = 5 } = req.body;

    // 1. Verificar e debitar saldo de Energia do Usuário
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

    // 2. Localizar personagem completo com Atributos, Habilidades e Equipamentos
    let character = await Character.findOne({
      where: { user_id: userId },
      include: [
        { model: DefinitionClass, as: 'current_class' },
        {
          model: CharacterAttribute,
          as: 'attributes',
          include: [{ model: DefinitionAttribute, as: 'attribute_info' }],
        },
        {
          model: CharacterSkill,
          as: 'skills',
          where: { is_equipped: true },
          required: false,
          include: [{ model: DefinitionSkill, as: 'skill_info' }],
        },
        {
          model: CharacterInventory,
          as: 'inventory',
          where: { is_equipped: true },
          required: false,
          include: [{ model: DefinitionItem, as: 'item_info' }],
        },
      ],
    });

    // Se o usuário ainda não criou personagem, cria um herói padrão
    if (!character) {
      const defaultClass = await DefinitionClass.findOne();
      character = await Character.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        name: 'Herói Lendário',
        level: 1,
        current_xp: 0,
        gold: 100,
        current_class_id: defaultClass ? defaultClass.id : null,
      });
      character = await Character.findByPk(character.id, {
        include: [
          { model: DefinitionClass, as: 'current_class' },
          {
            model: CharacterAttribute,
            as: 'attributes',
            include: [{ model: DefinitionAttribute, as: 'attribute_info' }],
          },
          { model: CharacterSkill, as: 'skills', include: [{ model: DefinitionSkill, as: 'skill_info' }] },
          { model: CharacterInventory, as: 'inventory', include: [{ model: DefinitionItem, as: 'item_info' }] },
        ],
      });
    }

    // 3. Mapear Atributos (FOR, CON, INT, AGI, CAR, SOR)
    const attrMap = { str: 10, con: 10, int: 10, agi: 10, cha: 10, luk: 10 };
    if (character.attributes && character.attributes.length > 0) {
      character.attributes.forEach(attr => {
        const code = attr.attribute_info?.code?.toLowerCase();
        if (code && attrMap[code] !== undefined) {
          attrMap[code] = (attr.base_value || 10) + (attr.bonus_value || 0);
        }
      });
    }

    // Bônus de Equipamentos
    let weaponBonus = 0;
    let armorBonus = 0;
    if (character.inventory && character.inventory.length > 0) {
      character.inventory.forEach(inv => {
        const item = inv.item_info;
        if (item && item.stat_bonuses) {
          if (item.stat_bonuses.atk) weaponBonus += item.stat_bonuses.atk;
          if (item.stat_bonuses.str) weaponBonus += item.stat_bonuses.str * 2;
          if (item.stat_bonuses.def) armorBonus += item.stat_bonuses.def;
          if (item.stat_bonuses.con) armorBonus += item.stat_bonuses.con * 2;
        }
      });
    }

    const level = character.level || 1;

    // 4. Calcular Estatísticas de Combate com base na Ficha do Herói
    const maxHp = 180 + (attrMap.con * 18) + (level * 25);
    const maxMp = 70 + (attrMap.int * 8) + (level * 6);
    const atkPhys = 30 + Math.floor(attrMap.str * 3.2) + weaponBonus;
    const atkMagic = 35 + Math.floor(attrMap.int * 3.5);
    const defense = Math.floor(attrMap.con * 1.5) + armorBonus;
    const speedAtb = 10 + Math.floor(attrMap.agi * 0.9);
    const critChance = Math.min(0.5, 0.05 + (attrMap.luk * 0.007));

    // 5. Obter Habilidades Equipadas (máximo 3) ou carregar as habilidades do arquétipo
    let equippedSkills = [];
    if (character.skills && character.skills.length > 0) {
      equippedSkills = character.skills
        .filter(s => s.skill_info)
        .slice(0, 3)
        .map(s => s.skill_info);
    }

    // Se tiver menos de 3 habilidades equipadas, busca as do arquétipo para preencher os 3 slots
    if (equippedSkills.length < 3) {
      const targetCodes = player_hero === 'cap'
        ? ['skill_shield_slash', 'skill_stars_stripes', 'skill_charging_star']
        : ['skill_optic_blast', 'skill_optic_sweep', 'skill_gene_splice'];

      const fallbackSkills = await DefinitionSkill.findAll({
        where: { code: targetCodes },
        order: [['tier', 'ASC']],
      });

      equippedSkills = fallbackSkills.slice(0, 3);
    }

    // Montar o Deck Tático de 4 Ações (1 Básico + 3 Habilidades)
    const isCap = player_hero === 'cap';
    const basicAction = {
      id: 'basic_attack',
      name: isCap ? 'Soco Direto' : 'Cyclone Kick',
      cost: 0,
      mp_gain: 15,
      fury_gain: 12,
      damage_multiplier: 1.0,
      animation_id: 100, // 100 = Ataque Físico Avançado
      desc: isCap ? 'Combo de socos nobres. Gera +15 MP.' : 'Chute acrobático giratório. Gera +15 MP.',
    };

    const actionDeck = [
      basicAction,
      ...equippedSkills.map((sk, idx) => ({
        id: `skill_${idx + 1}`,
        code: sk.code,
        name: sk.name,
        cost: sk.mana_cost || 15,
        damage_multiplier: sk.damage_multiplier || 1.5,
        animation_id: sk.animation_id || (idx + 1),
        desc: sk.description || '',
        icon: sk.icon || '⚔️',
      })),
    ];

    // Estatísticas Calibradas do Oponente
    const opponentHp = Math.floor(maxHp * 0.95);
    const opponentMp = maxMp;
    const opponentAtk = Math.floor(atkPhys * 0.9);
    const opponentDef = Math.floor(defense * 0.9);

    return res.json({
      success: true,
      message: `Batalha iniciada! -${energy_cost} Energia consumida.`,
      battle_id: randomUUID().toLowerCase(),
      energy_remaining: progress.adventure_energy,
      player_hero,
      opponent,
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        gold: character.gold,
        class_name: character.current_class?.name || 'Guardião Lendário',
        attributes: attrMap,
      },
      player_battle_stats: {
        max_hp: maxHp,
        max_mp: maxMp,
        atk_phys: atkPhys,
        atk_magic: atkMagic,
        defense: defense,
        speed_atb: speedAtb,
        crit_chance: critChance,
      },
      opponent_battle_stats: {
        max_hp: opponentHp,
        max_mp: opponentMp,
        atk_phys: opponentAtk,
        atk_magic: opponentAtk,
        defense: opponentDef,
        speed_atb: speedAtb,
      },
      action_deck: actionDeck,
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
 * Conclui a batalha e credita recompensas (XP e Ouro) na Ficha do Herói
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
