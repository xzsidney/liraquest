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
import { FamilyCharacter } from './FamilyCharacter.js';
import { CharacterAttribute } from './CharacterAttribute.js';
import { Task } from './Task.js';
import { TaskSubmission } from './TaskSubmission.js';
import { FamilyReward } from './FamilyReward.js';
import { FamilyRewardRedemption } from './FamilyRewardRedemption.js';
import { FamilyQuizQuestion } from './FamilyQuizQuestion.js';
import { FamilyQuizOption } from './FamilyQuizOption.js';
import { FamilyZombiCampaign } from './FamilyZombiCampaign.js';
import { FamilyZombiMission } from './FamilyZombiMission.js';
import { FamilyZombiToken } from './FamilyZombiToken.js';
import { DefinitionMzCharacter } from './DefinitionMzCharacter.js';
import { FamilyMealSchedule } from './FamilyMealSchedule.js';
import { FamilyMeal } from './FamilyMeal.js';
import { FamilyMealItem } from './FamilyMealItem.js';
import { FamilyMealCheckin } from './FamilyMealCheckin.js';
import { FamilyShoppingItem } from './FamilyShoppingItem.js';
import { FamilyEvent } from './FamilyEvent.js';
import { FamilyWhatsappConfig } from './FamilyWhatsappConfig.js';
import { FamilyPushSubscription } from './FamilyPushSubscription.js';

// ==========================================
// 1. Associações de Usuário & Família
// ==========================================

// Inscrições de Web Push Notifications
FamilyUser.hasMany(FamilyPushSubscription, { foreignKey: 'user_id', as: 'pushSubscriptions' });
FamilyPushSubscription.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

Family.hasMany(FamilyPushSubscription, { foreignKey: 'family_id', as: 'pushSubscriptions' });
FamilyPushSubscription.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

// Progresso do Terminal do Usuário (1:1)
FamilyUser.hasOne(UserProgress, { foreignKey: 'user_id', as: 'progress' });
UserProgress.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

FamilyMember.hasMany(Family, { foreignKey: 'created_by', as: 'created_families', constraints: false });
Family.belongsTo(FamilyMember, { foreignKey: 'created_by', as: 'creator', constraints: false });

Family.hasMany(FamilyMember, { foreignKey: 'family_id', as: 'members' });
FamilyMember.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

// Vínculo Multi-tenant Direto
FamilyUser.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
Family.hasMany(FamilyUser, { foreignKey: 'family_id', as: 'users' });

// ==========================================
// 2. Associações do Herói do Clã (FamilyCharacter)
// ==========================================
FamilyUser.hasOne(FamilyCharacter, { foreignKey: 'user_id', as: 'family_character' });
FamilyCharacter.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

// Alias de retrocompatibilidade para que includes 'character' continuem funcionando
FamilyUser.hasOne(FamilyCharacter, { foreignKey: 'user_id', as: 'character' });

Family.hasMany(FamilyCharacter, { foreignKey: 'family_id', as: 'family_characters' });
FamilyCharacter.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyCharacter.hasOne(CharacterAttribute, { foreignKey: 'character_id', as: 'attributes_direct', constraints: false });
CharacterAttribute.belongsTo(FamilyCharacter, { foreignKey: 'character_id', as: 'family_character', constraints: false });

// ==========================================
// 3. Associações de Definições / Catálogo
// ==========================================
DefinitionClass.belongsTo(DefinitionAttribute, { foreignKey: 'primary_attribute_id', as: 'primary_attribute', constraints: false });
DefinitionClass.belongsTo(DefinitionAttribute, { foreignKey: 'secondary_attribute_id', as: 'secondary_attribute', constraints: false });

DefinitionClass.hasMany(DefinitionSkill, { foreignKey: 'class_id', as: 'skills' });
DefinitionSkill.belongsTo(DefinitionClass, { foreignKey: 'class_id', as: 'hero_class' });

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

FamilyCharacter.hasMany(TaskSubmission, { foreignKey: 'character_id', as: 'hero_submissions' });
TaskSubmission.belongsTo(FamilyCharacter, { foreignKey: 'character_id', as: 'character' });

FamilyUser.hasMany(TaskSubmission, { foreignKey: 'reviewed_by', as: 'reviewed_proofs' });
TaskSubmission.belongsTo(FamilyUser, { foreignKey: 'reviewed_by', as: 'reviewer' });

// ==========================================
// 5. Associações da Loja do Lar (Recompensas Reais)
// ==========================================
Family.hasMany(FamilyReward, { foreignKey: 'family_id', as: 'rewards' });
FamilyReward.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyUser.hasMany(FamilyReward, { foreignKey: 'created_by', as: 'created_rewards' });
FamilyReward.belongsTo(FamilyUser, { foreignKey: 'created_by', as: 'creator' });

FamilyReward.hasMany(FamilyRewardRedemption, { foreignKey: 'reward_id', as: 'redemptions' });
FamilyRewardRedemption.belongsTo(FamilyReward, { foreignKey: 'reward_id', as: 'reward' });

FamilyUser.hasMany(FamilyRewardRedemption, { foreignKey: 'user_id', as: 'reward_redemptions' });
FamilyRewardRedemption.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

FamilyUser.hasMany(FamilyRewardRedemption, { foreignKey: 'reviewed_by', as: 'reviewed_redemptions' });
FamilyRewardRedemption.belongsTo(FamilyUser, { foreignKey: 'reviewed_by', as: 'reviewer' });

// ==========================================
// 6. Associações do Quiz & Perguntas Educativas
// ==========================================
FamilyQuizQuestion.hasMany(FamilyQuizOption, { foreignKey: 'question_id', as: 'options', onDelete: 'CASCADE' });
FamilyQuizOption.belongsTo(FamilyQuizQuestion, { foreignKey: 'question_id', as: 'question' });

// ==========================================
// 7. Associações da Campanha Investigativa Marvel Zombies
// ==========================================
FamilyZombiCampaign.hasMany(FamilyZombiMission, { foreignKey: 'campaign_id', as: 'missions', onDelete: 'CASCADE' });
FamilyZombiMission.belongsTo(FamilyZombiCampaign, { foreignKey: 'campaign_id', as: 'campaign' });

FamilyZombiMission.hasMany(FamilyZombiToken, { foreignKey: 'mission_id', as: 'tokens', onDelete: 'CASCADE' });
FamilyZombiToken.belongsTo(FamilyZombiMission, { foreignKey: 'mission_id', as: 'mission' });

// ==========================================
// 8. Associações de Saúde, Nutrição & Compras
// ==========================================
Family.hasMany(FamilyMealSchedule, { foreignKey: 'family_id', as: 'meal_schedules' });
FamilyMealSchedule.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

Family.hasMany(FamilyMeal, { foreignKey: 'family_id', as: 'meals' });
FamilyMeal.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyMeal.hasMany(FamilyMealItem, { foreignKey: 'meal_id', as: 'items', onDelete: 'CASCADE' });
FamilyMealItem.belongsTo(FamilyMeal, { foreignKey: 'meal_id', as: 'meal' });

FamilyMeal.hasMany(FamilyMealCheckin, { foreignKey: 'meal_id', as: 'checkins' });
FamilyMealCheckin.belongsTo(FamilyMeal, { foreignKey: 'meal_id', as: 'meal' });

Family.hasMany(FamilyMealCheckin, { foreignKey: 'family_id', as: 'meal_checkins' });
FamilyMealCheckin.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyUser.hasMany(FamilyMealCheckin, { foreignKey: 'user_id', as: 'meal_checkins' });
FamilyMealCheckin.belongsTo(FamilyUser, { foreignKey: 'user_id', as: 'user' });

FamilyUser.hasMany(FamilyMealCheckin, { foreignKey: 'validated_by', as: 'validated_checkins' });
FamilyMealCheckin.belongsTo(FamilyUser, { foreignKey: 'validated_by', as: 'validator' });

Family.hasMany(FamilyShoppingItem, { foreignKey: 'family_id', as: 'shopping_items' });
FamilyShoppingItem.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

// ==========================================
// 9. Associações de Eventos do Clã
// ==========================================
Family.hasMany(FamilyEvent, { foreignKey: 'family_id', as: 'clan_events' });
FamilyEvent.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyUser.hasMany(FamilyEvent, { foreignKey: 'created_by', as: 'created_clan_events' });
FamilyEvent.belongsTo(FamilyUser, { foreignKey: 'created_by', as: 'creator' });

// ==========================================
// 10. Associações de Comunicação & WhatsApp
// ==========================================
Family.hasOne(FamilyWhatsappConfig, { foreignKey: 'family_id', as: 'whatsapp_config' });
FamilyWhatsappConfig.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

// Alias de retrocompatibilidade
const Character = FamilyCharacter;

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
  FamilyCharacter,
  Character,
  CharacterAttribute,
  Task,
  TaskSubmission,
  FamilyReward,
  FamilyRewardRedemption,
  FamilyQuizQuestion,
  FamilyQuizOption,
  FamilyZombiCampaign,
  FamilyZombiMission,
  FamilyZombiToken,
  DefinitionMzCharacter,
  FamilyMealSchedule,
  FamilyMeal,
  FamilyMealItem,
  FamilyMealCheckin,
  FamilyShoppingItem,
  FamilyEvent,
  FamilyWhatsappConfig,
  FamilyPushSubscription,
};
