import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyPushSubscription extends Model {}

FamilyPushSubscription.init(
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
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    p256dh: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    auth: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyPushSubscription',
    tableName: 'family_push_subscriptions',
    timestamps: true,
    underscored: true,
  }
);
