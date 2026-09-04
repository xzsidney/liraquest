import { sequelize } from '../server/config/database.js';

async function syncDungeonSceneImages() {
  try {
    console.log('🔄 Sincronizando adição aditiva da coluna scene_image_url em family_dungeon_scenes...');

    // Adiciona a coluna de forma segura (aditiva)
    await sequelize.query(`
      ALTER TABLE \`family_dungeon_scenes\`
      ADD COLUMN IF NOT EXISTS \`scene_image_url\` VARCHAR(255) NULL AFTER \`scene_icon\`;
    `);

    console.log('✅ Coluna scene_image_url verificada/adicionada com sucesso em family_dungeon_scenes!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna scene_image_url:', error);
    process.exit(1);
  }
}

syncDungeonSceneImages();
