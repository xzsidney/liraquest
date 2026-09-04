import { randomUUID } from 'crypto';
import { sequelize } from '../config/database.js';
import {
  FamilyQuizQuestion,
  FamilyQuizOption,
  UserProgress,
  Character,
  CharacterClass,
  CharacterAttribute,
  DefinitionAttribute,
} from '../models/index.js';

// Embaralhar array utilitário (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * GET /api/quiz/questions/random
 * Busca perguntas aleatórias filtradas por etapa escolar (Fundamental 1 até Superior)
 */
export const getRandomQuestions = async (req, res) => {
  try {
    const { stage = 'fundamental_1', discipline, limit = 10 } = req.query;
    const maxLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);

    const where = { is_active: true };
    if (stage && ['fundamental_1', 'fundamental_2', 'ensino_medio', 'superior'].includes(stage)) {
      where.education_stage = stage;
    }
    if (discipline) {
      where.discipline = discipline;
    }

    let questions = await FamilyQuizQuestion.findAll({
      where,
      include: [
        {
          model: FamilyQuizOption,
          as: 'options',
          attributes: ['id', 'option_text', 'is_correct'],
        },
      ],
      order: sequelize.random(),
      limit: maxLimit,
    });

    // Se o filtro específico não tiver perguntas suficientes, busca quaisquer ativas
    if (questions.length < 3) {
      questions = await FamilyQuizQuestion.findAll({
        where: { is_active: true },
        include: [
          {
            model: FamilyQuizOption,
            as: 'options',
            attributes: ['id', 'option_text', 'is_correct'],
          },
        ],
        order: sequelize.random(),
        limit: maxLimit,
      });
    }

    // Embaralhar as 4 opções de cada pergunta para que a resposta certa não fique na mesma posição
    const formattedQuestions = questions.map((q) => {
      const plain = q.toJSON();
      plain.options = shuffleArray(plain.options || []);
      return plain;
    });

    return res.json({
      success: true,
      stage,
      total: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perguntas aleatórias do quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar perguntas do quiz.',
    });
  }
};

/**
 * POST /api/quiz/start
 * Inicia a partida do Arqueiro do Saber e consome a Energia de Aventura (4 ⚡)
 */
export const startQuizSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const ENERGY_COST = 4;

    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        adventure_energy: 15,
      });
    }

    // Se estiver sem energia em ambiente de teste/arcade, concede bônus de boas-vindas para permitir jogar
    if ((progress.adventure_energy || 0) < ENERGY_COST) {
      await progress.increment('adventure_energy', { by: 12 });
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
    console.error('❌ Erro ao iniciar sessão de quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao iniciar partida de tiro ao alvo.',
    });
  }
};

/**
 * POST /api/quiz/finish
 * Finaliza a partida, credita Ouro no Herói, XP na Classe Ativa e aprimora o atributo INT
 */
export const finishQuizSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      hits = 0,
      misses = 0,
      max_combo = 0,
      score = 0,
      stage = 'fundamental_1',
      difficulty = 'facil',
    } = req.body;

    const parsedHits = Math.max(0, parseInt(hits, 10) || 0);
    const parsedCombo = Math.max(0, parseInt(max_combo, 10) || 0);

    // Multiplicador por etapa escolar
    const stageMultipliers = {
      fundamental_1: 1.0,
      fundamental_2: 1.2,
      ensino_medio: 1.4,
      superior: 1.6,
    };
    const stageMult = stageMultipliers[stage] || 1.0;

    // Multiplicador por dificuldade de pontaria
    const diffMultipliers = {
      facil: 1.0,
      medio: 1.25,
      dificil: 1.5,
    };
    const diffMult = diffMultipliers[difficulty] || 1.0;

    const totalMult = stageMult * diffMult;

    // Cálculo das recompensas
    const goldEarned = Math.round(Math.max(10, parsedHits * 4 + parsedCombo * 3) * totalMult);
    const xpEarned = Math.round(Math.max(25, parsedHits * 7 + 20) * totalMult);

    // 1. Atualizar Ouro do Herói
    let currentGold = 0;
    const character = await Character.findOne({ where: { user_id: userId } });
    if (character) {
      await character.update({
        gold: (character.gold || 0) + goldEarned,
      });
      currentGold = character.gold;
    }

    // 2. Atualizar XP e Nível da Classe Ativa do Herói
    let newLevel = 1;
    let newXP = 0;
    let leveledUp = false;

    if (character && character.current_class_id) {
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

    // 3. Aprimoramento de Inteligência (INT) do Personagem
    let intBoosted = false;
    if (character && parsedHits >= 4) {
      const intAttrDef = await DefinitionAttribute.findOne({ where: { code: 'int' } });
      if (intAttrDef) {
        const [charAttr] = await CharacterAttribute.findOrCreate({
          where: {
            character_id: character.id,
            attribute_id: intAttrDef.id,
          },
          defaults: {
            id: randomUUID().toLowerCase(),
            base_value: 10,
            bonus_value: 0,
          },
        });
        const bonusIncrement = difficulty === 'dificil' ? 2 : 1;
        await charAttr.increment('bonus_value', { by: bonusIncrement });
        intBoosted = true;
      }
    }

    const progress = await UserProgress.findOne({ where: { user_id: userId } });

    return res.json({
      success: true,
      message: 'Partida concluída com sucesso!',
      rewards: {
        gold_earned: goldEarned,
        xp_earned: xpEarned,
        int_boosted: intBoosted,
        current_gold: currentGold,
        current_xp: newXP,
        current_level: newLevel,
        leveled_up: leveledUp,
        adventure_energy: progress ? progress.adventure_energy : 0,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar sessão do Arqueiro do Saber:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao salvar pontuação e recompensas.',
    });
  }
};

/**
 * POST /api/quiz/duel/finish
 * Finaliza o Duelo 1v1, concedendo Ouro, XP e bônus de Inteligência conforme vitória, empate ou vice
 */
export const finishDuelSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      isWinner = false,
      isTie = false,
      score = 0,
      hits = 0,
      opponentName = 'Adversário',
      stage = 'fundamental_1',
    } = req.body;

    const parsedHits = Math.max(0, parseInt(hits, 10) || 0);

    // Recompensas baseadas no resultado
    let goldEarned = 25;
    let xpEarned = 40;
    let intBoost = 1;

    if (isWinner) {
      goldEarned = 50;
      xpEarned = 80;
      intBoost = 2;
    } else if (isTie) {
      goldEarned = 35;
      xpEarned = 60;
      intBoost = 1;
    }

    // Bônus adicional por volume de acertos
    goldEarned += parsedHits * 2;
    xpEarned += parsedHits * 3;

    // 1. Atualizar Ouro no Herói
    let currentGold = 0;
    const character = await Character.findOne({ where: { user_id: userId } });
    if (character) {
      await character.update({
        gold: (character.gold || 0) + goldEarned,
      });
      currentGold = character.gold;
    }

    // 2. Atualizar XP e Level da Classe Ativa
    let newLevel = 1;
    let newXP = 0;
    let leveledUp = false;

    if (character && character.current_class_id) {
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

    // 3. Aprimoramento de Inteligência (INT)
    let intBoosted = false;
    if (character) {
      const intAttrDef = await DefinitionAttribute.findOne({ where: { code: 'int' } });
      if (intAttrDef) {
        const [charAttr] = await CharacterAttribute.findOrCreate({
          where: {
            character_id: character.id,
            attribute_id: intAttrDef.id,
          },
          defaults: {
            id: randomUUID().toLowerCase(),
            base_value: 10,
            bonus_value: 0,
          },
        });
        await charAttr.increment('bonus_value', { by: intBoost });
        intBoosted = true;
      }
    }

    return res.json({
      success: true,
      message: isWinner
        ? 'Vitória gloriosa no Duelo Familiar!'
        : isTie
        ? 'Empate épico entre valorosos arqueiros!'
        : 'Duelo disputado com bravura!',
      rewards: {
        isWinner,
        isTie,
        gold_earned: goldEarned,
        xp_earned: xpEarned,
        int_boosted: intBoosted,
        int_bonus_added: intBoost,
        current_gold: currentGold,
        current_xp: newXP,
        current_level: newLevel,
        leveled_up: leveledUp,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar duelo de quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao registrar resultado do duelo.',
    });
  }
};

