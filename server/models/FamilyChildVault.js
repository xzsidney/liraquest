import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyChildVault extends Model {}

FamilyChildVault.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    character_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    saved_gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    allowance_balance_brl: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: { min: 0 },
    },
    gold_to_brl_rate: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 10.0, // 10 moedas de ouro = R$ 1,00
    },
    goal_title: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: 'Meu Sonho / Brinquedo',
    },
    goal_amount_brl: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50.0,
    },
    total_withdrawn_brl: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyChildVault',
    tableName: 'family_child_vaults',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['family_id', 'user_id'],
        name: 'unique_family_child_vault',
      },
    ],
  }
);
