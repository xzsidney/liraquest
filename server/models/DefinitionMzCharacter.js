import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionMzCharacter extends Model {}

DefinitionMzCharacter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: {
        name: 'unique_mz_character_code',
        msg: 'Código de personagem Marvel Zombies já existente.',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    box_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    has_super_hero: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_zombie_hero: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_boss_enemy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    boss_health: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    boss_ability: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profiles: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionMzCharacter',
    tableName: 'definition_mz_characters',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_mz_char_box',
        fields: ['box_name'],
      },
      {
        name: 'idx_mz_char_modes',
        fields: ['has_super_hero', 'has_zombie_hero', 'has_boss_enemy'],
      },
    ],
  }
);
