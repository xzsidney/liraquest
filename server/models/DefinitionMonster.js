import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionMonster extends Model {}

DefinitionMonster.init(
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
        name: 'unique_monster_code',
        msg: 'Código de monstro já existente.',
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
    is_boss: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    max_hp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    attack_power: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    defense: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    xp_reward: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    gold_reward: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
    sprite_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionMonster',
    tableName: 'definition_monsters',
    timestamps: true,
    underscored: true,
  }
);
