import { sequelize } from '../server/config/database.js';

/**
 * Script de Faxina e Padronização do Banco de Dados LiraQuest (V2 Oficial)
 * Remove as tabelas legadas/duplicadas preservando os dados essenciais do Clã Lira.
 */

const TABLES_TO_DROP = [
  'battles',
  'characters',
  'character_classes',
  'character_inventory',
  'character_skills',
  'events',
  'family_bills',
  'family_child_vaults',
  'family_clan_vaults',
  'family_polls',
  'family_poll_votes',
  'family_dungeon_actions',
  'family_dungeon_adventures',
  'family_dungeon_runs',
  'family_dungeon_scenes'
];

const TABLES_TO_PRESERVE = [
  'families',
  'family_users',
  'family_members',
  'family_characters',
  'character_attributes',
  'user_progress',
  'tasks',
  'task_submissions',
  'family_tasks',
  'family_task_submissions',
  'definition_attributes',
  'definition_classes',
  'definition_tasks',
  'definition_items'
];

async function runCleanup() {
  console.log('🧹 [LiraQuest] Iniciando script de faxina V2...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com MySQL Hostinger.');

    // 1. Desativar verificações de Foreign Key temporariamente
    console.log('🔒 Desativando FOREIGN_KEY_CHECKS...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Executar DROP TABLE IF EXISTS para cada tabela do escopo
    console.log('\n🗑️ Removendo tabelas legadas:');
    for (const table of TABLES_TO_DROP) {
      await sequelize.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      console.log(`   ❌ Tabela removida: ${table}`);
    }

    // 3. Reativar verificações de Foreign Key
    console.log('\n🔓 Reativando FOREIGN_KEY_CHECKS...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 4. Listar tabelas restantes no banco
    console.log('\n📋 Consultando tabelas ativas no banco...');
    const [results] = await sequelize.query('SHOW TABLES;');
    const remainingTables = results.map(row => Object.values(row)[0]);

    console.log(`\n🎉 FAXINA CONCLUÍDA! O banco agora possui ${remainingTables.length} tabelas ativas:`);
    remainingTables.forEach((tbl, idx) => {
      const isPreserved = TABLES_TO_PRESERVE.includes(tbl) ? '🛡️ (Oficial)' : 'ℹ️';
      console.log(`   ${idx + 1}. ${tbl} ${isPreserved}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na execução da faxina:', err);
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (_) {}
    process.exit(1);
  }
}

runCleanup();
