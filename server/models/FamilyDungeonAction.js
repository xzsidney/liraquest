import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyDungeonAction extends Model {}

FamilyDungeonAction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    scene_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attribute_code: {
      type: DataTypes.STRING(20),
      allowNull: false, // 'str', 'agi', 'con', 'int', 'cha', 'luk'
    },
    difficulty_dc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
    },
    success_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    failure_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    failure_damage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    bonus_gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'FamilyDungeonAction',
    tableName: 'family_dungeon_actions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['scene_id', 'action_number'],
        name: 'idx_action_scene_number',
      },
    ],
  }
);
