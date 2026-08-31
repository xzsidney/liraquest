import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Task extends Model {}

Task.init(
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
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título da tarefa é obrigatório.' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    xp_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: { min: 0 },
    },
    gold_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: { min: 0 },
    },
    category: {
      type: DataTypes.ENUM('DOMESTIC', 'STUDY', 'HEALTH', 'CREATIVE', 'SOCIAL', 'GERAL'),
      defaultValue: 'GERAL',
    },
    // Dificuldade da tarefa — determina quanto de Energia de Aventura é concedida
    difficulty: {
      type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    // ⚡ Energia de Aventura concedida ao herói quando aprovada
    energy_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: { min: 0 },
    },
    // 🏠 Fichas do Lar concedidas ao usuário real quando aprovada
    token_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    // Define quem pode ver e realizar esta tarefa
    allowed_profile: {
      type: DataTypes.ENUM('ALL', 'CHILD_ONLY', 'ADULT_ONLY'),
      allowNull: false,
      defaultValue: 'ALL',
    },
    // Se o filho precisa enviar foto ou texto como comprovação
    requires_proof: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Tempo estimado de execução exibido no card (ex: '15-20 min')
    estimated_time: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
  }
);
