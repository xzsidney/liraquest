import sequelize from '../server/config/database';
import '../server/models'; // Executa a inicialização de todos os modelos

async function syncAll() {
  try {
    console.log('🔄 Conectando ao banco de dados da Hostinger...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!');

    console.log('📋 Modelos carregados no Sequelize:', Object.keys(sequelize.models));

    console.log('🚀 Criando/sincronizando todas as tabelas no MySQL da Hostinger (modo seguro)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Sincronização concluída!');

    const [tables] = await sequelize.query('SHOW TABLES;');
    console.log('\n🎉 TABELAS CRIADAS COM SUCESSO NO BANCO DA HOSTINGER:');
    console.table(tables);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    process.exit(1);
  }
}

syncAll();
