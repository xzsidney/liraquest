import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('⚠️ ALERTA: DATABASE_URL não foi encontrada nas variáveis de ambiente (.env)!');
}

// Remover query params legados para evitar warnings do mysql2
const cleanDbUrl = databaseUrl ? databaseUrl.split('?')[0] : 'mysql://localhost:3306/liraquest_placeholder';

export const sequelize = new Sequelize(cleanDbUrl, {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});


export const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco MySQL da Hostinger estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Falha ao conectar ao banco de dados MySQL:', error.message);
    return false;
  }
};
