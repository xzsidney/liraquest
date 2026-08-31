import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyUser extends Model {
  // Método auxiliar para ocultar a senha nas respostas
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

FamilyUser.init(
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
        notEmpty: { msg: 'O nome é obrigatório.' },
        len: { args: [2, 100], msg: 'O nome deve ter entre 2 e 100 caracteres.' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        name: 'unique_user_email',
        msg: 'Este e-mail já está cadastrado no sistema.',
      },
      validate: {
        isEmail: { msg: 'Forneça um e-mail válido.' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'A senha é obrigatória.' },
      },
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'PARENT', 'CHILD'),
      allowNull: false,
      defaultValue: 'CHILD',
      validate: {
        isIn: {
          args: [['ADMIN', 'PARENT', 'CHILD']],
          msg: 'Perfil inválido. Escolha entre ADMIN, PARENT ou CHILD.',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    school_or_work: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    profile_photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyUser',
    tableName: 'family_users',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyUser;
