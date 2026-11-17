import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyClanVault extends Model {}

FamilyClanVault.init(
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título do sonho ou meta do clã é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('TRIP', 'RENOVATION', 'PURCHASE', 'EXPERIENCE', 'SAVINGS', 'OTHER'),
      allowNull: false,
      defaultValue: 'TRIP',
    },
    icon: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '🏖️',
    },
    target_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1000.0,
      validate: { min: 1 },
    },
    current_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: { min: 0 },
    },
    target_tasks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    current_tasks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    target_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ACHIEVED', 'PAUSED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    modelName: 'FamilyClanVault',
    tableName: 'family_clan_vaults',
    timestamps: true,
    underscored: true,
  }
);
