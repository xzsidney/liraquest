import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyMealCheckin extends Model {}

FamilyMealCheckin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    meal_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    family_id: {
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
    meal_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    meal_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'almoco',
    },
    status: {
      type: DataTypes.ENUM('no_horario', 'atrasado', 'faltou'),
      allowNull: false,
      defaultValue: 'no_horario',
    },
    xp_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    gold_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    penalty_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyMealCheckin',
    tableName: 'family_meal_checkins',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyMealCheckin;
