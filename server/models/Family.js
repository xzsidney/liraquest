import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Family extends Model {}

Family.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome da família/clã é obrigatório.' },
        len: { args: [2, 100], msg: 'O nome deve ter entre 2 e 100 caracteres.' },
      },
    },
    invite_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: {
        name: 'unique_family_invite_code',
        msg: 'Código de convite já existente.',
      },
      validate: {
        notEmpty: { msg: 'O código de convite é obrigatório.' },
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Family',
    tableName: 'families',
    timestamps: true,
    underscored: true,
  }
);
