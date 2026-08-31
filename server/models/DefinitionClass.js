import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class DefinitionClass extends Model {}

DefinitionClass.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true, // 'guardiao_do_lar', 'sabio_estrategista', etc.
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    primary_attribute_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    secondary_attribute_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    combat_role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    real_life_focus: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DefinitionClass',
    tableName: 'definition_classes',
    timestamps: true,
    underscored: true,
  }
);
