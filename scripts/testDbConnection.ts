import sequelize from '../server/config/database';
import * as models from '../server/models';

async function testConnection() {
  try {
    console.log('🔄 Testando autenticação com o MySQL da Hostinger...');
    await sequelize.authenticate();
    console.log('✅ Autenticação realizada com sucesso no banco u328169675_liraquest!');

    const [results] = await sequelize.query('SHOW TABLES;');
    console.log('📋 Tabelas encontradas no banco:', results);

    // Sincronização segura e aditiva (sem force e sem drop)
    console.log('🔄 Sincronizando modelos com o banco (modo aditivo / seguro)...');
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados com sucesso!');

    const [updatedTables] = await sequelize.query('SHOW TABLES;');
    console.log('📋 Lista atualizada de tabelas:', updatedTables);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error);
    process.exit(1);
  }
}

testConnection();
