import { randomUUID } from 'crypto';
import {
  FamilyDungeonAdventure,
  FamilyDungeonScene,
  FamilyDungeonAction,
  FamilyDungeonRun,
  UserProgress,
  Character,
  CharacterClass,
  CharacterAttribute,
  DefinitionAttribute,
} from '../models/index.js';

/**
 * GET /api/dungeon/adventures
 * Retorna todas as aventuras/livros-jogos ativos disponíveis
 */
export const getAdventures = async (req, res) => {
  try {
    const adventures = await FamilyDungeonAdventure.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'code',
        'title',
        'description',
        'cover_icon',
        'difficulty_level',
        'energy_cost',
        'base_gold_reward',
        'base_xp_reward',
      ],
      order: [['base_gold_reward', 'ASC']],
    });

    return res.json({
      success: true,
      adventures,
    });
  } catch (error) {
    console.error('❌ Erro ao listar aventuras da masmorra:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao listar aventuras.',
    });
  }
};

/**
 * GET /api/dungeon/adventures/:id
 * Retorna os detalhes completos da aventura com todas as suas cenas ordenadas e as 3 ações
 */
export const getAdventureDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const adventure = await FamilyDungeonAdventure.findOne({
      where: { id },
      include: [
        {
          model: FamilyDungeonScene,
          as: 'scenes',
          include: [
            {
              model: FamilyDungeonAction,
              as: 'actions',
            },
          ],
        },
      ],
      order: [
        [{ model: FamilyDungeonScene, as: 'scenes' }, 'step_order', 'ASC'],
        [
          { model: FamilyDungeonScene, as: 'scenes' },
          { model: FamilyDungeonAction, as: 'actions' },
          'action_number',
          'ASC',
        ],
      ],
    });

    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Aventura de masmorra não encontrada.',
      });
    }

    return res.json({
      success: true,
      adventure,
    });
  } catch (error) {
    console.error('❌ Erro ao carregar detalhes da masmorra:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao carregar aventura.',
    });
  }
};

/**
 * POST /api/dungeon/start
 * Inicia a expedição consumindo a Energia de Aventura (padrão 5 ⚡) e gerando o registro da run
 */
export const startDungeonRun = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adventure_id } = req.body;

    if (!adventure_id) {
      return res.status(400).json({
        success: false,
        message: 'ID da aventura é obrigatório.',
      });
    }

    const adventure = await FamilyDungeonAdventure.findByPk(adventure_id);
    if (!adventure) {
      return res.status(404).json({
        success: false,
        message: 'Aventura não encontrada.',
      });
    }

    const energyCost = adventure.energy_cost || 5;

    // Verificar e debitar saldo de Energia do Usuário
    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        adventure_energy: 15,
      });
    }

    // Se estiver sem energia em ambiente de teste/arcade, concede bônus de boas-vindas
    if ((progress.adventure_energy || 0) < energyCost) {
      await progress.increment('adventure_energy', { by: 15 });
      await progress.reload();
    }

    await progress.decrement('adventure_energy', { by: energyCost });
    await progress.reload();

    // Localizar personagem do usuário
    const character = await Character.findOne({ where: { user_id: userId } });

    // Criar nova run
    const run = await FamilyDungeonRun.create({
      id: randomUUID().toLowerCase(),
      user_id: userId,
      character_id: character ? character.id : null,
      adventure_id: adventure.id,
      status: 'IN_PROGRESS',
      final_hp: 30,
      choices_log: [],
      rewards_collected: {},
    });

    return res.json({
      success: true,
      message: `Expedição iniciada em "${adventure.title}"! -${energyCost} Energia.`,
      run_id: run.id,
      energy_remaining: progress.adventure_energy,
      character: character
        ? {
            id: character.id,
            name: character.name,
            gold: character.gold,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar expedição de masmorra:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao iniciar expedição.',
    });
  }
};

/**
 * POST /api/dungeon/finish
 * Finaliza a expedição, credita Ouro no Herói, XP na Classe Ativa, verifica Level Up
 * e concede bônus de atributo (+1 no atributo de destaque)
 */
export const finishDungeonRun = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      run_id,
      adventure_id,
      is_victory = false,
      final_hp = 0,
      primary_attribute_used = 'int',
      choices_summary = [],
      bonus_gold_collected = 0,
    } = req.body;

    const adventure = await FamilyDungeonAdventure.findByPk(adventure_id);
    const character = await Character.findOne({ where: { user_id: userId } });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Personagem não encontrado.',
      });
    }

    let goldEarned = 0;
    let xpEarned = 0;
    let attributeBoosted = false;
    let boostedAttributeName = '';

    if (is_victory) {
      // Recompensas de Vitória com o Baú Épico
      const baseGold = adventure ? adventure.base_gold_reward : 50;
      const baseXP = adventure ? adventure.base_xp_reward : 80;
      goldEarned = baseGold + Math.max(0, parseInt(bonus_gold_collected, 10) || 0);
      xpEarned = baseXP;

      // Aprimoramento de Atributo (+1 no atributo mais utilizado com sucesso)
      const attrCode = String(primary_attribute_used).toLowerCase();
      const attrDef = await DefinitionAttribute.findOne({ where: { code: attrCode } });

      if (attrDef) {
        const [charAttr] = await CharacterAttribute.findOrCreate({
          where: {
            character_id: character.id,
            attribute_id: attrDef.id,
          },
          defaults: {
            id: randomUUID().toLowerCase(),
            base_value: 10,
            bonus_value: 0,
          },
        });
        await charAttr.increment('bonus_value', { by: 1 });
        attributeBoosted = true;
        boostedAttributeName = attrDef.name;
      }
    } else {
      // Recompensa de Consolação (Resgate da Guarda Real - sem punição severa)
      goldEarned = 15;
      xpEarned = 25;
    }

    // 1. Atualizar Ouro do Herói
    await character.update({ gold: (character.gold || 0) + goldEarned });

    // 2. Atualizar XP e Level da Classe Ativa do Herói
    let newLevel = 1;
    let newXP = 0;
    let leveledUp = false;

    if (character.current_class_id) {
      const classProgress = await CharacterClass.findOne({
        where: { character_id: character.id, class_id: character.current_class_id },
      });

      if (classProgress) {
        let currentXP = (classProgress.xp || 0) + xpEarned;
        let currentLevel = classProgress.level || 1;
        let reqXP = currentLevel * 100;

        while (currentXP >= reqXP) {
          currentXP -= reqXP;
          currentLevel += 1;
          leveledUp = true;
          reqXP = currentLevel * 100;
        }

        await classProgress.update({ xp: currentXP, level: currentLevel });
        newLevel = currentLevel;
        newXP = currentXP;
      }
    }

    // 3. Atualizar registro da Run
    if (run_id) {
      const run = await FamilyDungeonRun.findByPk(run_id);
      if (run) {
        await run.update({
          status: is_victory ? 'VICTORY' : 'DEFEAT',
          final_hp: Math.max(0, parseInt(final_hp, 10) || 0),
          choices_log: choices_summary,
          rewards_collected: {
            gold: goldEarned,
            xp: xpEarned,
            attribute_boosted: attributeBoosted ? boostedAttributeName : null,
          },
        });
      }
    }

    const progress = await UserProgress.findOne({ where: { user_id: userId } });

    return res.json({
      success: true,
      is_victory,
      rewards: {
        gold_earned: goldEarned,
        xp_earned: xpEarned,
        current_gold: character.gold,
        current_xp: newXP,
        current_level: newLevel,
        leveled_up: leveledUp,
        attribute_boosted: attributeBoosted,
        boosted_attribute: boostedAttributeName,
        adventure_energy: progress ? progress.adventure_energy : 0,
      },
      message: is_victory
        ? `🎉 BAÚ ÉPICO CONQUISTADO! Você completou a masmorra e faturou 💰 +${goldEarned} Ouro, ⭐ +${xpEarned} XP${attributeBoosted ? ` e +1 permanente em ${boostedAttributeName}!` : '!'}`
        : `🛡️ A Guarda Real resgatou você em segurança! Sua bravura rendeu 💰 +${goldEarned} Ouro e ⭐ +${xpEarned} XP de consolação!`,
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar expedição de masmorra:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao registrar recompensas da masmorra.',
    });
  }
};
