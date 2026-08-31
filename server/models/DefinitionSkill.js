import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionSkill extends Model {}

DefinitionSkill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_skill_code',
        msg: 'Código de habilidade já existente.',
      },
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 3,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mana_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cooldown_turns: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    required_skill_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    xp_cost_to_unlock: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    damage_multiplier: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
    },
    heal_amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    effect_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionSkill',
    tableName: 'definition_skills',
    timestamps: true,
    underscored: true,
  }
);
