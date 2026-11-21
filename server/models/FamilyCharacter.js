import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyCharacter extends Model {}

FamilyCharacter.init(
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
        name: 'unique_family_character_user',
        msg: 'Cada usuário só pode ter um personagem no clã.',
      },
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'guardiao_do_lar',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    skin_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'default',
    },
  },
  {
    sequelize,
    modelName: 'FamilyCharacter',
    tableName: 'family_characters',
    timestamps: true,
    underscored: true,
  }
);

export default FamilyCharacter;
