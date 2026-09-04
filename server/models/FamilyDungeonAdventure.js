import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyDungeonAdventure extends Model {}

FamilyDungeonAdventure.init(
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
        name: 'unique_adventure_code',
        msg: 'Código de aventura já existente.',
      },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '📜',
    },
    difficulty_level: {
      type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    energy_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    base_gold_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    base_xp_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyDungeonAdventure',
    tableName: 'family_dungeon_adventures',
    timestamps: true,
    underscored: true,
  }
);
