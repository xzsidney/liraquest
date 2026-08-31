import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar arquivo .env (tanto do diretório atual quanto da raiz do projeto)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function createSequelizeInstance() {
  const databaseUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
  const dbUser = process.env.DB_USER || process.env.MYSQLUSER;
  const dbPass = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQLPASSWORD;
  const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE;
  const dbPort = process.env.DB_PORT || process.env.MYSQLPORT || 3306;

  // 1. Se DATABASE_URL estiver definida e for uma string válida (não "null" nem vazia)
  if (databaseUrl && typeof databaseUrl === 'string' && databaseUrl.trim() !== '' && databaseUrl !== 'null') {
    const cleanDbUrl = databaseUrl.split('?')[0].trim();
    return new Sequelize(cleanDbUrl, {
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: { connectTimeout: 60000 },
      pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
    });
  }

  // 2. Se variáveis de ambiente individuais estiverem definidas
  if (dbHost && dbUser && dbName) {
    return new Sequelize(dbName, dbUser, dbPass || '', {
      host: dbHost,
      port: Number(dbPort),
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: { connectTimeout: 60000 },
      pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
    });
  }

  // 3. Fallback de segurança (impede crash do Node na Hostinger se o .env não for encontrado)
  console.error('⚠️ ALERTA HOSTINGER: Nenhuma credencial do MySQL foi encontrada no .env ou nas Variáveis de Ambiente!');
  console.error('👉 Verifique se o arquivo .env contendo DATABASE_URL está criado na raiz do seu site na Hostinger.');

  return new Sequelize('sqlite::memory:', {
    logging: false,
  });
}

export const sequelize = createSequelizeInstance();

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
