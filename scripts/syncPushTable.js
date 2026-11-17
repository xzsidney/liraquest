import { sequelize } from '../server/config/database.js';
import { FamilyPushSubscription } from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabela aditiva: family_push_subscriptions...');
    await FamilyPushSubscription.sync({ alter: false });
    console.log('✅ Tabela family_push_subscriptions sincronizada com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização da tabela de Push:', err);
    process.exit(1);
  }
}

run();
