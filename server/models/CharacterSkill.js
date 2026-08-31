import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class CharacterSkill extends Model {}

CharacterSkill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    character_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    skill_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_equipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    unlocked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CharacterSkill',
    tableName: 'character_skills',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['character_id', 'skill_id'],
        name: 'unique_character_skill',
      },
    ],
  }
);
