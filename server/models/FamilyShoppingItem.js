import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyShoppingItem extends Model {}

FamilyShoppingItem.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do item de compra é obrigatório.' },
      },
    },
    quantity: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '1 un',
    },
    category: {
      type: DataTypes.ENUM('mensal_abastecimento', 'semanal_feira'),
      allowNull: false,
      defaultValue: 'semanal_feira',
    },
    is_purchased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyShoppingItem',
    tableName: 'family_shopping_items',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyShoppingItem;
