import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyDungeonScene extends Model {}

FamilyDungeonScene.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adventure_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    scene_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    narrative_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scene_icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '🏛️',
    },
    is_final_scene: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyDungeonScene',
    tableName: 'family_dungeon_scenes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['adventure_id', 'step_order'],
        name: 'idx_scene_adventure_step',
      },
    ],
  }
);
