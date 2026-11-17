import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyMeal extends Model {}

FamilyMeal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    meal_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    meal_type: {
      type: DataTypes.ENUM('cafe', 'almoco', 'lanche', 'jantar', 'ceia'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do prato/refeição é obrigatório.' },
      },
    },
    cooking_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    routine_mode: {
      type: DataTypes.ENUM('certinho', 'flexivel'),
      allowNull: false,
      defaultValue: 'certinho',
    },
  },
  {
    sequelize,
    modelName: 'FamilyMeal',
    tableName: 'family_meals',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyMeal;
