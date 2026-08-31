import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class CharacterClass extends Model {}

CharacterClass.init(
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
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: 'CharacterClass',
    tableName: 'character_classes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['character_id', 'class_id'],
        name: 'unique_character_class',
      },
    ],
  }
);
