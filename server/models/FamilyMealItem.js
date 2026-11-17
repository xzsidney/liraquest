import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyMealItem extends Model {}

FamilyMealItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    meal_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do alimento/item é obrigatório.' },
      },
    },
    quantity_grams: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '100g',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'proteina', // proteina, carboidrato, salada, legume, bebida, outros
    },
    health_tags: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyMealItem',
    tableName: 'family_meal_items',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyMealItem;
