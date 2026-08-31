import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyReward extends Model {}

FamilyReward.init(
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
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título da recompensa é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    token_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
      validate: {
        min: { args: [1], msg: 'O custo deve ser de pelo menos 1 Ficha do Lar.' },
      },
    },
    category: {
      type: DataTypes.ENUM('GASTRONOMY', 'ENTERTAINMENT', 'OUTING', 'GIFT', 'PRIVILEGE'),
      allowNull: false,
      defaultValue: 'ENTERTAINMENT',
    },
    icon: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '🎁',
    },
    allowed_profile: {
      type: DataTypes.ENUM('ALL', 'CHILD', 'PARENT'),
      allowNull: false,
      defaultValue: 'ALL',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyReward',
    tableName: 'family_rewards',
    timestamps: true,
    underscored: true,
  }
);
