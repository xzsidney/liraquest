import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyMealSchedule extends Model {}

FamilyMealSchedule.init(
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
    meal_type: {
      type: DataTypes.ENUM('cafe', 'almoco', 'lanche', 'jantar', 'ceia'),
      allowNull: false,
    },
    scheduled_time: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '12:00',
    },
    routine_mode: {
      type: DataTypes.ENUM('certinho', 'flexivel'),
      allowNull: false,
      defaultValue: 'certinho',
    },
    alert_minutes_before: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyMealSchedule',
    tableName: 'family_meal_schedules',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyMealSchedule;
