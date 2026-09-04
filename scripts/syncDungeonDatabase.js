import { sequelize } from '../server/config/database.js';
import {
  FamilyDungeonAdventure,
  FamilyDungeonScene,
  FamilyDungeonAction,
  FamilyDungeonRun,
} from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabelas do Livro-Jogo de Masmorras no MySQL de produção...');
    
    await FamilyDungeonAdventure.sync({ alter: false });
    console.log('  ✅ Tabela "family_dungeon_adventures" verificada/criada.');

    await FamilyDungeonScene.sync({ alter: false });
    console.log('  ✅ Tabela "family_dungeon_scenes" verificada/criada.');

    await FamilyDungeonAction.sync({ alter: false });
    console.log('  ✅ Tabela "family_dungeon_actions" verificada/criada.');

    await FamilyDungeonRun.sync({ alter: false });
    console.log('  ✅ Tabela "family_dungeon_runs" verificada/criada.');

    console.log('🎉 Todas as tabelas de Aventuras em Quest foram sincronizadas com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização das tabelas de masmorra:', err);
    process.exit(1);
  }
}

run();
