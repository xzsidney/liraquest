import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionAttribute extends Model {}

DefinitionAttribute.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: 'unique_attribute_code',
        msg: 'Código de atributo já existente.',
      },
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
