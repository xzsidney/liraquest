import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyMember extends Model {}

FamilyMember.init(
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
    role_in_family: {
      type: DataTypes.ENUM('GUARDIAN', 'MEMBER'),
      defaultValue: 'MEMBER',
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'FamilyMember',
    tableName: 'family_members',
    timestamps: true,
    underscored: true,
  }
);
