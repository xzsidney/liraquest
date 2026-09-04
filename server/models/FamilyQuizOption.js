import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyQuizOption extends Model {}

FamilyQuizOption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    option_text: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O texto da alternativa não pode ser vazio.' },
      },
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'FamilyQuizOption',
    tableName: 'family_quiz_options',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyQuizOption;
