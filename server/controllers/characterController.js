import { randomUUID } from 'node:crypto';
import {
  Character,
  CharacterClass,
  CharacterAttribute,
  CharacterSkill,
  CharacterInventory,
  DefinitionClass,
  DefinitionAttribute,
  DefinitionSkill,
  DefinitionItem,
  FamilyUser,
} from '../models/index.js';

/**
 * Retorna os dados completos do herói do usuário autenticado
 */
export const getMyCharacter = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar perfil completo do usuário
    const user = await FamilyUser.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'phone', 'school_or_work', 'profile_photo_url', 'created_at'],
    });

    const character = await Character.findOne({
      where: { user_id: userId },
      include: [
        {
          model: DefinitionClass,
          as: 'current_class',
          include: [
            { model: DefinitionAttribute, as: 'primary_attribute' },
            { model: DefinitionAttribute, as: 'secondary_attribute' },
          ],
        },
        {
          model: CharacterClass,
          as: 'classes_progress',
          include: [{ model: DefinitionClass, as: 'class_info' }],
        },
        {
          model: CharacterAttribute,
          as: 'attributes',
          include: [{ model: DefinitionAttribute, as: 'attribute_info' }],
        },
        {
          model: CharacterSkill,
          as: 'skills',
          include: [{ model: DefinitionSkill, as: 'skill_info' }],
        },
        {
          model: CharacterInventory,
          as: 'inventory',
          include: [{ model: DefinitionItem, as: 'item_info' }],
        },
      ],
    });

    if (!character) {
      return res.json({
        success: true,
        hasCharacter: false,
        user,
        message: 'Usuário ainda não criou seu personagem.',
      });
    }

    return res.json({
      success: true,
      hasCharacter: true,
      user,
      character,
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
 * Cria o personagem inicial do usuário com classe e atributos base
 */
export const createCharacter = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, avatar_type, avatar_value, initial_class_id } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'O nome do herói é obrigatório (mínimo de 2 caracteres).',
      });
    }

    // Verificar se já possui personagem
    const existing = await Character.findOne({ where: { user_id: userId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui um herói criado!',
        character: existing,
      });
    }

    // Validar se a classe escolhida existe
    const selectedClass = await DefinitionClass.findByPk(initial_class_id, {
      include: [
        { model: DefinitionAttribute, as: 'primary_attribute' },
        { model: DefinitionAttribute, as: 'secondary_attribute' },
        { model: DefinitionSkill, as: 'skills' },
      ],
    });

    if (!selectedClass) {
      return res.status(400).json({
        success: false,
        message: 'Classe inicial inválida ou inexistente.',
      });
    }

    // 1. Criar o Personagem
    const newCharacter = await Character.create({
      id: randomUUID().toLowerCase(),
      user_id: userId,
      name: name.trim(),
      gender: gender || 'MALE',
      avatar_type: avatar_type || 'SPRITE',
      avatar_value: avatar_value || 'default_hero',
      current_class_id: selectedClass.id,
      gold: 50, // Ouro inicial para boas-vindas
    });

    // 2. Criar o registro de progressão da classe inicial
    await CharacterClass.create({
      id: randomUUID().toLowerCase(),
      character_id: newCharacter.id,
      class_id: selectedClass.id,
      level: 1,
      xp: 0,
    });

    // 3. Inicializar os 6 atributos com bônus de classe
    const allAttributes = await DefinitionAttribute.findAll();
    for (const attr of allAttributes) {
      let baseVal = 10;
      let bonusVal = 0;

      if (attr.id === selectedClass.primary_attribute_id) {
        bonusVal += 3; // +3 no atributo principal da classe
      }
      if (attr.id === selectedClass.secondary_attribute_id) {
        bonusVal += 2; // +2 no atributo secundário
      }

      await CharacterAttribute.create({
        id: randomUUID().toLowerCase(),
        character_id: newCharacter.id,
        attribute_id: attr.id,
        base_value: baseVal,
        bonus_value: bonusVal,
      });
    }

    // 4. Desbloquear habilidades iniciais (Tier 1) da classe
    const starterSkills = await DefinitionSkill.findAll({
      where: { class_id: selectedClass.id, tier: 1 },
    });

    for (const skill of starterSkills) {
      await CharacterSkill.create({
        id: randomUUID().toLowerCase(),
        character_id: newCharacter.id,
        skill_id: skill.id,
        is_equipped: true,
      });
    }

    // 5. Retornar personagem completo
    const fullCharacter = await Character.findByPk(newCharacter.id, {
      include: [
        {
          model: DefinitionClass,
          as: 'current_class',
          include: [
            { model: DefinitionAttribute, as: 'primary_attribute' },
            { model: DefinitionAttribute, as: 'secondary_attribute' },
          ],
        },
        {
          model: CharacterClass,
          as: 'classes_progress',
          include: [{ model: DefinitionClass, as: 'class_info' }],
        },
        {
          model: CharacterAttribute,
          as: 'attributes',
          include: [{ model: DefinitionAttribute, as: 'attribute_info' }],
        },
        {
          model: CharacterSkill,
          as: 'skills',
          include: [{ model: DefinitionSkill, as: 'skill_info' }],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: `⚔️ O Herói "${fullCharacter.name}" (${selectedClass.name}) nasceu no reino de LiraQuest!`,
      character: fullCharacter,
    });
  } catch (error) {
    console.error('❌ Erro ao criar personagem:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao criar personagem.',
    });
  }
};

/**
 * Atualiza os dados do perfil do usuário no mundo real (Telefone, Escola/Trabalho, Foto)
 */
export const updateRealProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, school_or_work, profile_photo_url } = req.body;

    const user = await FamilyUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    await user.update({
      name: name ? name.trim() : user.name,
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
 * Troca de classe ativa do herói (Multi-Classe)
 */
export const changeHeroClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { class_id } = req.body;

    const character = await Character.findOne({ where: { user_id: userId } });
    if (!character) {
      return res.status(404).json({ success: false, message: 'Personagem não encontrado.' });
    }

    const targetClass = await DefinitionClass.findByPk(class_id);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Classe destino inexistente.' });
    }

    // Verificar se o herói já jogou essa classe antes
    let classProgress = await CharacterClass.findOne({
      where: { character_id: character.id, class_id: targetClass.id },
    });

    // Se é a primeira vez jogando essa classe, inicializa level 1 e habilidades iniciais
    if (!classProgress) {
      classProgress = await CharacterClass.create({
        id: randomUUID().toLowerCase(),
        character_id: character.id,
        class_id: targetClass.id,
        level: 1,
        xp: 0,
      });

      const starterSkills = await DefinitionSkill.findAll({
        where: { class_id: targetClass.id, tier: 1 },
      });

      for (const skill of starterSkills) {
        const existingSkill = await CharacterSkill.findOne({
          where: { character_id: character.id, skill_id: skill.id },
        });
        if (!existingSkill) {
          await CharacterSkill.create({
            id: randomUUID().toLowerCase(),
            character_id: character.id,
            skill_id: skill.id,
            is_equipped: true,
          });
        }
      }
    }

    // Atualizar classe atual do herói
    await character.update({ current_class_id: targetClass.id });

    // Atualizar bônus de atributos para a classe ativa
    const characterAttributes = await CharacterAttribute.findAll({
      where: { character_id: character.id },
    });

    for (const charAttr of characterAttributes) {
      let bonusVal = 0;
      if (charAttr.attribute_id === targetClass.primary_attribute_id) {
        bonusVal += 3;
      }
      if (charAttr.attribute_id === targetClass.secondary_attribute_id) {
        bonusVal += 2;
      }
      await charAttr.update({ bonus_value: bonusVal });
    }

    return res.json({
      success: true,
      message: `Classe alterada para "${targetClass.name}" com sucesso!`,
      current_class: targetClass,
      class_progress: classProgress,
    });
  } catch (error) {
    console.error('❌ Erro ao trocar classe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao trocar classe do herói.',
    });
  }
};
