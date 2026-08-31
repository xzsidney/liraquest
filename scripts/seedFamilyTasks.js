import { randomUUID } from 'node:crypto';
import {
  sequelize,
  Family,
  FamilyMember,
  Task,
  DefinitionTask,
} from '../server/models/index.js';

export async function populateDefaultTasksForFamily(familyId, creatorId) {
  try {
    const existingCount = await Task.count({ where: { family_id: familyId } });
    if (existingCount > 0) {
      console.log(`ℹ️ Família ${familyId} já possui ${existingCount} tarefas cadastradas.`);
      return;
    }

    const defaultDefs = await DefinitionTask.findAll();
    if (!defaultDefs || defaultDefs.length === 0) {
      console.log('⚠️ Nenhuma tarefa encontrada no catálogo definition_tasks.');
      return;
    }

    const newTasks = defaultDefs.map((d) => ({
      id: randomUUID().toLowerCase(),
      family_id: familyId,
      created_by: creatorId,
      assigned_to: null,
      title: d.name,
      description: d.description,
      category: d.category,
      difficulty: d.difficulty || 'MEDIUM',
      allowed_profile: d.allowed_profile || 'ALL',
      xp_reward: d.reward_xp || 50,
      gold_reward: d.reward_gold || 10,
      energy_reward: d.reward_energy || (d.difficulty === 'EASY' ? 1 : d.difficulty === 'HARD' ? 4 : 2),
      token_reward: d.difficulty === 'EASY' ? 5 : d.difficulty === 'HARD' ? 30 : 15,
      estimated_time: d.estimated_time || '15-20 min',
      requires_proof: d.requires_proof !== false,
      is_active: true,
    }));

    await Task.bulkCreate(newTasks);
    console.log(`✅ [LiraQuest] ${newTasks.length} missões padrão inseridas na família ${familyId}!`);
  } catch (error) {
    console.error(`❌ Erro ao popular missões na família ${familyId}:`, error);
  }
}

async function runSeed() {
  try {
    console.log('🔄 Verificando famílias para sincronizar missões padrão...');
    const families = await Family.findAll();

    if (families.length === 0) {
      console.log('ℹ️ Nenhuma família cadastrada no banco ainda.');
      process.exit(0);
    }

    for (const fam of families) {
      await populateDefaultTasksForFamily(fam.id, fam.created_by);
    }

    console.log('🎉 Sincronização de missões das famílias finalizada com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed de tarefas da família:', err);
    process.exit(1);
  }
}

// Se executado diretamente pelo terminal
if (process.argv[1] && process.argv[1].endsWith('seedFamilyTasks.js')) {
  runSeed();
}
