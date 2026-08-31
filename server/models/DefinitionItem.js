import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionItem extends Model {}

DefinitionItem.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('WEAPON', 'ARMOR', 'ACCESSORY', 'POTION', 'REAL_WORLD'),
      allowNull: false,
      defaultValue: 'WEAPON',
    },
    price_gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    stat_bonuses: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionItem',
    tableName: 'definition_items',
    timestamps: true,
    underscored: true,
  }
);
