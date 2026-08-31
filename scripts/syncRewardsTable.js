import { sequelize } from '../server/config/database.js';
import { FamilyReward, FamilyRewardRedemption } from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabelas da Loja do Lar (family_rewards e family_reward_redemptions)...');
    await FamilyReward.sync({ alter: false });
    await FamilyRewardRedemption.sync({ alter: false });
    console.log('✅ Tabelas criadas com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização:', err);
    process.exit(1);
  }
}

run();
