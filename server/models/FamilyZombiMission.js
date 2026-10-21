import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyZombiMission extends Model {}

FamilyZombiMission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    mission_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: {
        name: 'unique_zombi_mission_code',
        msg: 'Código de missão Zombicide já existente.',
      },
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    location_name: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    rulebook_map_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    tiles_needed: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    map_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    setup_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lore_hero: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lore_zombie: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    inventory_badges: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyZombiMission',
    tableName: 'family_zombi_missions',
    timestamps: true,
    underscored: true,
  }
);
