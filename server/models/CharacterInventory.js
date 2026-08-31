import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class CharacterInventory extends Model {}

CharacterInventory.init(
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
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    is_equipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'CharacterInventory',
    tableName: 'character_inventory',
    timestamps: true,
    underscored: true,
  }
);
