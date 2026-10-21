import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyZombiToken extends Model {}

FamilyZombiToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_role: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tile_location: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    crop_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    initial_status: {
      type: DataTypes.ENUM('AVAILABLE', 'LOCKED'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    requires_flags: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    lock_banner_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unlock_action_label: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    room_desc_hero: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    room_desc_zombie: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    modal_lore_hero: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    modal_lore_zombie: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    actions_json: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyZombiToken',
    tableName: 'family_zombi_tokens',
    timestamps: true,
    underscored: true,
  }
);
