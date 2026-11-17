import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyPollVote extends Model {}

FamilyPollVote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    poll_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    option_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyPollVote',
    tableName: 'family_poll_votes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['poll_id', 'user_id'],
        name: 'unique_poll_user_vote',
      },
    ],
  }
);
