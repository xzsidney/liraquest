import {
  DefinitionAttribute,
  DefinitionClass,
  DefinitionSkill,
  DefinitionItem,
  DefinitionMonster,
  DefinitionTask,
} from '../models/index.js';


/**
 * Lista todos os 6 atributos fundamentais do RPG
 */
export const getAttributes = async (req, res) => {
  try {
    const attributes = await DefinitionAttribute.findAll({
      order: [['code', 'ASC']],
    });
    return res.json({
      success: true,
      count: attributes.length,
      attributes,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar atributos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar catálogo de atributos.',
    });
  }
};

/**
 * Lista todas as 6 classes de heróis com seus atributos primários e secundários
 */
export const getClasses = async (req, res) => {
  try {
    const classes = await DefinitionClass.findAll({
      include: [
        { model: DefinitionAttribute, as: 'primary_attribute' },
        { model: DefinitionAttribute, as: 'secondary_attribute' },
        { model: DefinitionSkill, as: 'skills' },
      ],
      order: [['name', 'ASC']],
    });
    return res.json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar catálogo de classes.',
    });
  }
};

/**
 * Lista as habilidades da Árvore de Talentos de uma classe específica
 */
export const getSkillsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const skills = await DefinitionSkill.findAll({
      where: { class_id: classId },
      order: [['tier', 'ASC'], ['name', 'ASC']],
    });
    return res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar habilidades:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar habilidades da classe.',
    });
  }
};

/**
 * Lista itens disponíveis na Loja do Reino
 */
export const getItems = async (req, res) => {
  try {
    const items = await DefinitionItem.findAll({
      order: [['price_gold', 'ASC']],
    });
    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar catálogo de itens.',
    });
  }
};

/**
 * Lista monstros e chefes para batalhas
 */
export const getMonsters = async (req, res) => {
  try {
    const monsters = await DefinitionMonster.findAll({
      order: [['max_hp', 'ASC']],
    });
    return res.json({
      success: true,
      count: monsters.length,
      monsters,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar monstros:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar catálogo de monstros.',
    });
  }
};

/**
 * Lista o catálogo oficial de 42 tarefas padrão do LiraQuest
 */
export const getDefinitionTasks = async (req, res) => {
  try {
    const tasks = await DefinitionTask.findAll({
      order: [['category', 'ASC'], ['difficulty', 'ASC'], ['name', 'ASC']],
    });
    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar catálogo de tarefas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar catálogo de tarefas.',
    });
  }
};


