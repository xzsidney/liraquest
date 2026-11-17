import { sequelize } from '../server/config/database.js';
import { FamilyWhatsappConfig } from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabela aditiva da FASE 5: family_whatsapp_configs...');
    await FamilyWhatsappConfig.sync({ alter: false });
    console.log('✅ Tabela family_whatsapp_configs sincronizada com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização da tabela de WhatsApp:', err);
    process.exit(1);
  }
}

run();
