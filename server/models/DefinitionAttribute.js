import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionAttribute extends Model {}

DefinitionAttribute.init(
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true, // 'str', 'agi', 'con', 'int', 'cha', 'luk'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    combat_role: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    real_life_role: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionAttribute',
    tableName: 'definition_attributes',
    timestamps: true,
    underscored: true,
  }
);
