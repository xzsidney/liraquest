import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class CharacterAttribute extends Model {}

CharacterAttribute.init(
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
    attribute_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    base_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    bonus_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    str: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
    agi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
    con: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
    int: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
    cha: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
    luk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
    },
  },
  {
    sequelize,
    modelName: 'CharacterAttribute',
    tableName: 'character_attributes',
    timestamps: true,
    underscored: true,
  }
);

export default CharacterAttribute;
