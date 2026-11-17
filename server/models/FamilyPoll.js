import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyPoll extends Model {}

FamilyPoll.init(
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
        notEmpty: { msg: 'A pergunta ou título da votação é obrigatória.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // Array de { id: string, title: string, description: string, icon: string }
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    closes_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    winner_option_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyPoll',
    tableName: 'family_polls',
    timestamps: true,
    underscored: true,
  }
);
