import { randomUUID } from 'crypto';
import { sequelize } from '../config/database.js';
import {
  FamilyQuizQuestion,
  FamilyQuizOption,
  UserProgress,
  Character,
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

    // Se estiver sem energia em ambiente de teste/arcade, concede energia inicial para jogar
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
 * Finaliza a partida, credita Ouro, XP e aprimora o atributo INT do personagem
 */
export const finishQuizSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hits = 0, misses = 0, max_combo = 0, score = 0, stage = 'fundamental_1' } = req.body;

    const parsedHits = Math.max(0, parseInt(hits, 10) || 0);
    const parsedCombo = Math.max(0, parseInt(max_combo, 10) || 0);

    // Multiplicador por nível escolar
    const stageMultipliers = {
      fundamental_1: 1.0,
      fundamental_2: 1.2,
      ensino_medio: 1.4,
      superior: 1.6,
    };
    const mult = stageMultipliers[stage] || 1.0;

    // Cálculo das recompensas
    const goldEarned = Math.round(Math.max(10, parsedHits * 4 + parsedCombo * 3) * mult);
    const xpEarned = Math.round(Math.max(25, parsedHits * 7 + 20) * mult);

    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
      });
    }

    await progress.increment({
      gold_virtual: goldEarned,
      hero_xp: xpEarned,
    });
    await progress.reload();

    // Aprimoramento de Inteligência (INT) do Personagem
    let intBoosted = false;
    const character = await Character.findOne({ where: { user_id: userId } });
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
        await charAttr.increment('bonus_value', { by: 1 });
        intBoosted = true;
      }
    }

    return res.json({
      success: true,
      message: 'Partida concluída com sucesso!',
      rewards: {
        gold_earned: goldEarned,
        xp_earned: xpEarned,
        int_boosted: intBoosted,
        current_gold: progress.gold_virtual,
        current_xp: progress.hero_xp,
        adventure_energy: progress.adventure_energy,
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
