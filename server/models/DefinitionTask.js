import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionTask extends Model {}

DefinitionTask.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_task_slug',
        msg: 'Slug de tarefa de catálogo já existente.',
      },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome da missão é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('DOMESTIC', 'STUDY', 'HEALTH', 'CREATIVE', 'SOCIAL'),
      allowNull: false,
      defaultValue: 'DOMESTIC',
    },
    difficulty: {
      type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
      allowNull: false,
      defaultValue: 'EASY',
    },
    allowed_profile: {
      type: DataTypes.ENUM('ALL', 'CHILD_ONLY', 'ADULT_ONLY'),
      allowNull: false,
      defaultValue: 'ALL',
    },
    reward_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    reward_gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    reward_energy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    estimated_time: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    requires_proof: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionTask',
    tableName: 'definition_tasks',
    timestamps: true,
    underscored: true,
  }
);

export default DefinitionTask;
