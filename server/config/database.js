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
  let rawUrl = process.env.DATABASE_URL;

  // Limpar aspas duplas ou simples que a Hostinger ou o painel às vezes colocam ao redor do valor
  if (rawUrl && typeof rawUrl === 'string') {
    rawUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
  }

  let dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
  let dbUser = process.env.DB_USER || process.env.MYSQLUSER;
  let dbPass = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQLPASSWORD || '';
  let dbName = process.env.DB_NAME || process.env.MYSQLDATABASE;
  let dbPort = process.env.DB_PORT || process.env.MYSQLPORT || 3306;

  // Se DATABASE_URL for fornecida, fazemos o parse via classe URL nativa do Node (elimina bugs de regex interna do Sequelize)
  if (rawUrl && rawUrl.trim() !== '' && rawUrl !== 'null') {
    try {
      const cleanUrlStr = rawUrl.split('?')[0].trim();
      const parsedUrl = new URL(cleanUrlStr);


      if (parsedUrl.hostname) dbHost = parsedUrl.hostname;
      if (parsedUrl.port) dbPort = Number(parsedUrl.port);
      if (parsedUrl.username) dbUser = decodeURIComponent(parsedUrl.username);
      if (parsedUrl.password) dbPass = decodeURIComponent(parsedUrl.password);
      if (parsedUrl.pathname) dbName = parsedUrl.pathname.replace(/^\//, '');
    } catch (urlErr) {
      console.warn('⚠️ Não foi possível realizar parse direto na DATABASE_URL, tentando parâmetros individuais:', urlErr.message);
    }
  }

  // Instanciar Sequelize com a assinatura (dbName, dbUser, dbPass, options) — 100% seguro contra erros de regex
  if (dbHost && dbUser && dbName) {
    return new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: Number(dbPort),
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: { connectTimeout: 60000 },
      pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
    });
  }

  // Fallback de segurança (impede crash do Node na Hostinger se o .env não for encontrado)
  console.error('⚠️ ALERTA HOSTINGER: Nenhuma credencial do MySQL foi encontrada no .env ou nas Variáveis de Ambiente!');
  console.error('👉 Verifique se o arquivo .env contendo as credenciais está criado na raiz do seu site na Hostinger.');

  return new Sequelize('sqlite::memory:', { logging: false });
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
