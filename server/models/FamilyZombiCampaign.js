import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyZombiCampaign extends Model {}

FamilyZombiCampaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: {
        name: 'unique_zombi_campaign_code',
        msg: 'Código de campanha Zombicide já existente.',
      },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    premise_hero: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    premise_zombie: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    current_mission_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    active_mode: {
      type: DataTypes.ENUM('HERO', 'ZOMBIE'),
      allowNull: false,
      defaultValue: 'HERO',
    },
    campaign_state: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyZombiCampaign',
    tableName: 'family_zombi_campaigns',
    timestamps: true,
    underscored: true,
  }
);
