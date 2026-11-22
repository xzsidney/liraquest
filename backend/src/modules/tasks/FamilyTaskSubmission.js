import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Family } from '../family/Family.js';
import { FamilyMember } from '../family/FamilyMember.js';
import { FamilyTask } from './FamilyTask.js';

export class FamilyTaskSubmission extends Model {}

FamilyTaskSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'family_tasks',
        key: 'id',
      },
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'families',
        key: 'id',
      },
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'family_members',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    proof_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    member_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'family_members',
        key: 'id',
      },
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    parent_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyTaskSubmission',
    tableName: 'family_task_submissions',
    timestamps: true,
    underscored: true,
  }
);

// Associações
FamilyTask.hasMany(FamilyTaskSubmission, { foreignKey: 'task_id', as: 'submissions' });
FamilyTaskSubmission.belongsTo(FamilyTask, { foreignKey: 'task_id', as: 'task' });

Family.hasMany(FamilyTaskSubmission, { foreignKey: 'family_id', as: 'taskSubmissions' });
FamilyTaskSubmission.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

FamilyMember.hasMany(FamilyTaskSubmission, { foreignKey: 'member_id', as: 'submissions' });
FamilyTaskSubmission.belongsTo(FamilyMember, { foreignKey: 'member_id', as: 'member' });

FamilyMember.hasMany(FamilyTaskSubmission, { foreignKey: 'reviewed_by', as: 'reviewedSubmissions' });
FamilyTaskSubmission.belongsTo(FamilyMember, { foreignKey: 'reviewed_by', as: 'reviewer' });

export default FamilyTaskSubmission;
