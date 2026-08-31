import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class UserProgress extends Model {}

UserProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: {
        name: 'unique_user_progress',
        msg: 'Cada usuário só pode ter um registro de progresso.',
      },
    },
    // Fichas do Lar (Moeda do Mundo Real para trocar na Loja da Família)
    family_tokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Energia de Aventura (Combustível para Masmorras e Raids no Terminal do Avatar)
    adventure_energy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Contagem total de tarefas concluídas e aprovadas
    tasks_done_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Contagem de tarefas concluídas e aprovadas hoje
    tasks_done_today: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Sequência atual de dias consecutivos com tarefas
    streak_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Maior sequência histórica de dias consecutivos
    best_streak_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Última data em que realizou tarefas
    last_active_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserProgress',
    tableName: 'user_progress',
    timestamps: true,
    underscored: true,
  }
);

export default UserProgress;
