import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Family } from './Family.js';

export class FamilyMember extends Model {}

FamilyMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'families',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome real é obrigatório.' },
      },
    },
    hero_nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O apelido heroico é obrigatório.' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: {
        name: 'unique_family_member_email',
        msg: 'Já existe um membro cadastrado com este e-mail.',
      },
      validate: {
        isEmail: { msg: 'Formato de e-mail inválido.' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pin: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'PARENT', 'CHILD'),
      allowNull: false,
      defaultValue: 'CHILD',
    },
    class_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'guardiao_do_lar',
    },
    skin_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'default',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    adventure_energy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    family_tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    streak_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    str: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    agi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    con: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    int: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    cha: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    luk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyMember',
    tableName: 'family_members',
    timestamps: true,
    underscored: true,
  }
);

// Relacionamentos
Family.hasMany(FamilyMember, { foreignKey: 'family_id', as: 'members' });
FamilyMember.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });

export default FamilyMember;
