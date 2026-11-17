import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyWhatsappConfig extends Model {}

FamilyWhatsappConfig.init(
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
    group_id_or_phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '',
    },
    is_connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notify_meals: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notify_hydration: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    session_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyWhatsappConfig',
    tableName: 'family_whatsapp_configs',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyWhatsappConfig;
