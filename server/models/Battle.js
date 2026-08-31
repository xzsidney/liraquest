import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Battle extends Model {}

Battle.init(
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
    monster_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('IN_PROGRESS', 'VICTORY', 'DEFEAT'),
      defaultValue: 'IN_PROGRESS',
      allowNull: false,
    },
    battle_log: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Battle',
    tableName: 'battles',
    timestamps: true,
    underscored: true,
  }
);
