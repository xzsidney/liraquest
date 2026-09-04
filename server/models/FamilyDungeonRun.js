import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyDungeonRun extends Model {}

FamilyDungeonRun.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    character_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    adventure_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('IN_PROGRESS', 'VICTORY', 'DEFEAT'),
      allowNull: false,
      defaultValue: 'IN_PROGRESS',
    },
    final_hp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    choices_log: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rewards_collected: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyDungeonRun',
    tableName: 'family_dungeon_runs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'status'],
        name: 'idx_dungeon_runs_user_status',
      },
    ],
  }
);
