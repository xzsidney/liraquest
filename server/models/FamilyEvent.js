import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyEvent extends Model {}

FamilyEvent.init(
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
        notEmpty: { msg: 'O título do evento é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    event_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: '12:00',
    },
    category: {
      type: DataTypes.ENUM('BIRTHDAY', 'FAMILY_OUTING', 'MEETING', 'PARTY', 'SPECIAL_LUNCH', 'OTHER'),
      allowNull: false,
      defaultValue: 'FAMILY_OUTING',
    },
    icon: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '📅',
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#f59e0b',
    },
    is_recurring_yearly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyEvent',
    tableName: 'family_events',
    timestamps: true,
    underscored: true,
  }
);
