import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class TaskSubmission extends Model {}

TaskSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    character_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    proof_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proof_photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TaskSubmission',
    tableName: 'task_submissions',
    timestamps: true,
    underscored: true,
  }
);
