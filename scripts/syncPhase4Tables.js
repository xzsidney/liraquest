import { sequelize } from '../server/config/database.js';
import {
  FamilyEvent,
  FamilyPoll,
  FamilyPollVote,
  FamilyBill,
  FamilyClanVault,
  FamilyChildVault,
} from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabelas aditivas da FASE 4 (Diversão & Financeiro)...');
    
    console.log('1/6 Sincronizando family_events...');
    await FamilyEvent.sync({ alter: false });

    console.log('2/6 Sincronizando family_polls...');
    await FamilyPoll.sync({ alter: false });

    console.log('3/6 Sincronizando family_poll_votes...');
    await FamilyPollVote.sync({ alter: false });

    console.log('4/6 Sincronizando family_bills...');
    await FamilyBill.sync({ alter: false });

    console.log('5/6 Sincronizando family_clan_vaults...');
    await FamilyClanVault.sync({ alter: false });

    console.log('6/6 Sincronizando family_child_vaults...');
    await FamilyChildVault.sync({ alter: false });

    console.log('✅ Todas as 6 tabelas da FASE 4 foram criadas/sincronizadas com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização das tabelas da Fase 4:', err);
    process.exit(1);
  }
}

run();
