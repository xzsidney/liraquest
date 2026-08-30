import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';

let sequelize: Sequelize;

if (databaseUrl) {
  const url = new URL(databaseUrl);
  sequelize = new Sequelize(
    url.pathname.slice(1),
    url.username,
    decodeURIComponent(url.password),
    {
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
      },
    }
  );
} else {
  sequelize = new Sequelize('liraquest', 'root', '', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  });
}

export default sequelize;
