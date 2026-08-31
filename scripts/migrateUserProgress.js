import { sequelize, FamilyUser, UserProgress } from '../server/models/index.js';

async function migrateExistingUsers() {
  try {
    console.log('🔄 Verificando e criando UserProgress para todos os usuários existentes...');
    await sequelize.authenticate();

    const users = await FamilyUser.findAll();
    let createdCount = 0;

    for (const user of users) {
      const [progress, created] = await UserProgress.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          adventure_energy: 0,
          family_tokens: 0,
          tasks_done_total: 0,
          tasks_done_today: 0,
          streak_days: 0,
          best_streak_days: 0,
          last_active_date: null,
        },
      });

      if (created) {
        createdCount++;
        console.log(`✅ Progresso criado para o usuário: ${user.name} (${user.email})`);
      }
    }

    console.log(`🎉 Migração concluída! Total de registros criados: ${createdCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a migração de UserProgress:', error);
    process.exit(1);
  }
}

migrateExistingUsers();
