import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Character extends Model {}

Character.init(
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
        name: 'unique_user_character',
        msg: 'Cada usuário só pode ter um personagem principal.',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do herói é obrigatório.' },
        len: { args: [2, 100], msg: 'O nome do herói deve ter entre 2 e 100 caracteres.' },
      },
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: false,
      defaultValue: 'MALE',
    },
    avatar_type: {
      type: DataTypes.ENUM('PHOTO', 'SPRITE'),
      allowNull: false,
      defaultValue: 'SPRITE',
    },
    avatar_value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'default_hero',
    },
    current_class_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    gold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    is_in_infirmary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    infirmary_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Character',
    tableName: 'characters',
    timestamps: true,
    underscored: true,
  }
);
