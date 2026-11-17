import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class FamilyBill extends Model {}

FamilyBill.init(
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
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título ou nome da conta é obrigatório.' },
      },
    },
    category: {
      type: DataTypes.ENUM(
        'ENERGY',
        'WATER',
        'INTERNET',
        'HOUSING',
        'SUPERMARKET',
        'STREAMING',
        'EDUCATION',
        'HEALTH',
        'OTHER'
      ),
      allowNull: false,
      defaultValue: 'OTHER',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: { min: 0 },
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'PIX',
    },
    barcode_or_pix: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FamilyBill',
    tableName: 'family_bills',
    timestamps: true,
    underscored: true,
  }
);
