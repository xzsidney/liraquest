import sequelize from '../config/database';
import { initUser, User } from './User';
import { initFamilyCharacter, FamilyCharacter } from './FamilyCharacter';
import { initFamilyTask, FamilyTask } from './FamilyTask';
import { initFamilyTaskLog, FamilyTaskLog } from './FamilyTaskLog';
import { initFamilyShopItem, FamilyShopItem } from './FamilyShopItem';
import { initFamilyBattle, FamilyBattle } from './FamilyBattle';
import { initFamilyBattleParticipant, FamilyBattleParticipant } from './FamilyBattleParticipant';
import { initFamilyClassSkill, FamilyClassSkill } from './FamilyClassSkill';
import { initFamilyCharacterSkill, FamilyCharacterSkill } from './FamilyCharacterSkill';
import { initFamilyActiveMission, FamilyActiveMission } from './FamilyActiveMission';
import { initFamilyAchievement, FamilyAchievement } from './FamilyAchievement';
import { initFamilyLocation, FamilyLocation } from './FamilyLocation';
import { initFamilyStoryAdventure, FamilyStoryAdventure } from './FamilyStoryAdventure';
import { initFamilyStoryNode, FamilyStoryNode } from './FamilyStoryNode';
import { initFamilyStoryChoice, FamilyStoryChoice } from './FamilyStoryChoice';

// 1. Inicialização dos Modelos com o Sequelize
initUser(sequelize);
initFamilyCharacter(sequelize);
initFamilyTask(sequelize);
initFamilyTaskLog(sequelize);
initFamilyShopItem(sequelize);
initFamilyBattle(sequelize);
initFamilyBattleParticipant(sequelize);
initFamilyClassSkill(sequelize);
initFamilyCharacterSkill(sequelize);
initFamilyActiveMission(sequelize);
initFamilyAchievement(sequelize);
initFamilyLocation(sequelize);
initFamilyStoryAdventure(sequelize);
initFamilyStoryNode(sequelize);
initFamilyStoryChoice(sequelize);

// 2. Relacionamentos
User.hasMany(FamilyCharacter, { foreignKey: 'userId', as: 'familyCharacters' });
FamilyCharacter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

FamilyCharacter.hasMany(FamilyTask, { foreignKey: 'assignedTo', as: 'assignedTasks' });
FamilyTask.belongsTo(FamilyCharacter, { foreignKey: 'assignedTo', as: 'assignee' });

FamilyCharacter.hasMany(FamilyTaskLog, { foreignKey: 'characterId', as: 'taskLogs' });
FamilyTaskLog.belongsTo(FamilyCharacter, { foreignKey: 'characterId', as: 'character' });

FamilyTask.hasMany(FamilyTaskLog, { foreignKey: 'taskId', as: 'logs' });
FamilyTaskLog.belongsTo(FamilyTask, { foreignKey: 'taskId', as: 'task' });

FamilyCharacter.hasMany(FamilyCharacterSkill, { foreignKey: 'characterId', as: 'characterSkills' });
FamilyCharacterSkill.belongsTo(FamilyCharacter, { foreignKey: 'characterId', as: 'character' });

FamilyClassSkill.hasMany(FamilyCharacterSkill, { foreignKey: 'skillId', as: 'skillOwners' });
FamilyCharacterSkill.belongsTo(FamilyClassSkill, { foreignKey: 'skillId', as: 'skill' });

FamilyCharacter.hasMany(FamilyActiveMission, { foreignKey: 'characterId', as: 'activeMissions' });
FamilyActiveMission.belongsTo(FamilyCharacter, { foreignKey: 'characterId', as: 'character' });

FamilyBattle.hasMany(FamilyBattleParticipant, { foreignKey: 'battleId', as: 'participants' });
FamilyBattleParticipant.belongsTo(FamilyBattle, { foreignKey: 'battleId', as: 'battle' });

FamilyCharacter.hasMany(FamilyBattleParticipant, { foreignKey: 'characterId', as: 'battles' });
FamilyBattleParticipant.belongsTo(FamilyCharacter, { foreignKey: 'characterId', as: 'character' });

FamilyStoryAdventure.hasMany(FamilyStoryNode, { foreignKey: 'adventureId', as: 'nodes' });
FamilyStoryNode.belongsTo(FamilyStoryAdventure, { foreignKey: 'adventureId', as: 'adventure' });

FamilyStoryNode.hasMany(FamilyStoryChoice, { foreignKey: 'nodeId', as: 'choices' });
FamilyStoryChoice.belongsTo(FamilyStoryNode, { foreignKey: 'nodeId', as: 'node' });

export {
  sequelize,
  User,
  FamilyCharacter,
  FamilyTask,
  FamilyTaskLog,
  FamilyShopItem,
  FamilyBattle,
  FamilyBattleParticipant,
  FamilyClassSkill,
  FamilyCharacterSkill,
  FamilyActiveMission,
  FamilyAchievement,
  FamilyLocation,
  FamilyStoryAdventure,
  FamilyStoryNode,
  FamilyStoryChoice,
};
