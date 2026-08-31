import { sequelize } from '../config/database.js';
import { FamilyUser } from './FamilyUser.js';
import { Family } from './Family.js';
import { FamilyMember } from './FamilyMember.js';
import { UserProgress } from './UserProgress.js';
import { DefinitionAttribute } from './DefinitionAttribute.js';
import { DefinitionClass } from './DefinitionClass.js';
import { DefinitionSkill } from './DefinitionSkill.js';
import { DefinitionItem } from './DefinitionItem.js';
import { DefinitionMonster } from './DefinitionMonster.js';
import { DefinitionTask } from './DefinitionTask.js';
import { Character } from './Character.js';

import { CharacterClass } from './CharacterClass.js';
import { CharacterAttribute } from './CharacterAttribute.js';
import { CharacterSkill } from './CharacterSkill.js';
import { CharacterInventory } from './CharacterInventory.js';
import { Task } from './Task.js';
import { TaskSubmission } from './TaskSubmission.js';
import { Event } from './Event.js';
import { Battle } from './Battle.js';

// ==========================================
// 1. Associações de Usuário & Família
// ==========================================

// Progresso do Terminal do Usuário (1:1)
FamilyUser.hasOne(UserProgress, { foreignKey: 'user_id', as: 'progress' });
UserProgress.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

FamilyUser.hasOne(Character, { foreignKey: 'user_id', as: 'character' });
Character.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

FamilyUser.hasMany(Family, { foreignKey: 'created_by', as: 'created_families' });
Family.belongsTo(FamilyUser, { foreignKey: 'created_by', as: 'creator' });

Family.hasMany(FamilyMember, { foreignKey: 'family_id', as: 'members' });
FamilyMember.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyUser.hasMany(FamilyMember, { foreignKey: 'user_id', as: 'family_memberships' });
FamilyMember.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

// ==========================================
// 2. Associações de Definições / Catálogo
// ==========================================
DefinitionClass.belongsTo(DefinitionAttribute, { foreignKey: 'primary_attribute_id', as: 'primary_attribute' });
DefinitionClass.belongsTo(DefinitionAttribute, { foreignKey: 'secondary_attribute_id', as: 'secondary_attribute' });

DefinitionClass.hasMany(DefinitionSkill, { foreignKey: 'class_id', as: 'skills' });
DefinitionSkill.belongsTo(DefinitionClass, { foreignKey: 'class_id', as: 'hero_class' });

// ==========================================
// 3. Associações do Personagem
// ==========================================
Character.belongsTo(DefinitionClass, { foreignKey: 'current_class_id', as: 'current_class' });

Character.hasMany(CharacterClass, { foreignKey: 'character_id', as: 'classes_progress' });
CharacterClass.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterClass.belongsTo(DefinitionClass, { foreignKey: 'class_id', as: 'class_info' });

Character.hasMany(CharacterAttribute, { foreignKey: 'character_id', as: 'attributes' });
CharacterAttribute.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterAttribute.belongsTo(DefinitionAttribute, { foreignKey: 'attribute_id', as: 'attribute_info' });

Character.hasMany(CharacterSkill, { foreignKey: 'character_id', as: 'skills' });
CharacterSkill.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterSkill.belongsTo(DefinitionSkill, { foreignKey: 'skill_id', as: 'skill_info' });

Character.hasMany(CharacterInventory, { foreignKey: 'character_id', as: 'inventory' });
CharacterInventory.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });
CharacterInventory.belongsTo(DefinitionItem, { foreignKey: 'item_id', as: 'item_info' });

// ==========================================
// 4. Associações de Gameplay (Tarefas e Provas)
// ==========================================
Family.hasMany(Task, { foreignKey: 'family_id', as: 'tasks' });
Task.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyUser.hasMany(Task, { foreignKey: 'created_by', as: 'created_tasks' });
Task.belongsTo(FamilyUser, { foreignKey: 'created_by', as: 'creator' });

FamilyUser.hasMany(Task, { foreignKey: 'assigned_to', as: 'assigned_tasks' });
Task.belongsTo(FamilyUser, { foreignKey: 'assigned_to', as: 'assignee' });

Task.hasMany(TaskSubmission, { foreignKey: 'task_id', as: 'submissions' });
TaskSubmission.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

FamilyUser.hasMany(TaskSubmission, { foreignKey: 'user_id', as: 'submitted_proofs' });
TaskSubmission.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'submitter' });

Character.hasMany(TaskSubmission, { foreignKey: 'character_id', as: 'hero_submissions' });
TaskSubmission.belongsTo(Character, { foreignKey: 'character_id', as: 'character' });

FamilyUser.hasMany(TaskSubmission, { foreignKey: 'reviewed_by', as: 'reviewed_proofs' });
TaskSubmission.belongsTo(FamilyUser, { foreignKey: 'reviewed_by', as: 'reviewer' });

// ==========================================
// 5. Associações de Eventos e Batalhas
// ==========================================
Family.hasMany(Event, { foreignKey: 'family_id', as: 'events' });
Event.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

Family.hasMany(Battle, { foreignKey: 'family_id', as: 'battles' });
Battle.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
Battle.belongsTo(DefinitionMonster, { foreignKey: 'monster_id', as: 'monster' });

export {
  sequelize,
  FamilyUser,
  UserProgress,
  Family,
  FamilyMember,
  DefinitionAttribute,
  DefinitionClass,
  DefinitionSkill,
  DefinitionItem,
  DefinitionMonster,
  DefinitionTask,
  Character,
  CharacterClass,
  CharacterAttribute,
  CharacterSkill,
  CharacterInventory,
  Task,
  TaskSubmission,
  Event,
  Battle,
};
