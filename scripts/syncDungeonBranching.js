import { sequelize } from '../server/config/database.js';

async function run() {
  try {
    console.log('🔄 Atualizando tabela family_dungeon_actions com suporte a ramificação Causa e Consequência...');

    // Adicionar colunas se não existirem
    await sequelize.query(`
      ALTER TABLE family_dungeon_actions 
      ADD COLUMN IF NOT EXISTS success_scene_code VARCHAR(50) NULL AFTER bonus_gold,
      ADD COLUMN IF NOT EXISTS failure_scene_code VARCHAR(50) NULL AFTER success_scene_code;
    `);

    console.log('✅ Colunas success_scene_code e failure_scene_code adicionadas com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização das colunas de ramificação:', err);
    process.exit(1);
  }
}

run();
