import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Family } from '../family/Family.js';
import { FamilyMember } from '../family/FamilyMember.js';

export class FamilyTask extends Model {}

FamilyTask.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'families',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título da tarefa é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'LAR',
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'family_members',
        key: 'id',
      },
    },
    frequency: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'ONCE'),
      allowNull: false,
      defaultValue: 'DAILY',
    },
    reward_str_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25,
    },
    reward_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    reward_gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    reward_tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyTask',
    tableName: 'family_tasks',
    timestamps: true,
    underscored: true,
  }
);

// Associações
Family.hasMany(FamilyTask, { foreignKey: 'family_id', as: 'tasks' });
FamilyTask.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyMember.hasMany(FamilyTask, { foreignKey: 'assigned_to', as: 'assignedTasks' });
FamilyTask.belongsTo(FamilyMember, { foreignKey: 'assigned_to', as: 'assignee' });

export default FamilyTask;
