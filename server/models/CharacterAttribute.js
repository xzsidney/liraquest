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
  },
  {
    sequelize,
    modelName: 'CharacterAttribute',
    tableName: 'character_attributes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['character_id', 'attribute_id'],
        name: 'unique_character_attribute',
      },
    ],
  }
);
