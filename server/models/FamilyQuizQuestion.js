import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyQuizQuestion extends Model {}

FamilyQuizQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O enunciado da pergunta é obrigatório.' },
      },
    },
    discipline: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'geral',
    },
    education_stage: {
      type: DataTypes.ENUM('fundamental_1', 'fundamental_2', 'ensino_medio', 'superior'),
      allowNull: false,
      defaultValue: 'fundamental_1',
    },
    school_year: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    difficulty_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10,
      },
    },
    explanation: {
      type: DataTypes.TEXT,
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
    modelName: 'FamilyQuizQuestion',
    tableName: 'family_quiz_questions',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyQuizQuestion;
