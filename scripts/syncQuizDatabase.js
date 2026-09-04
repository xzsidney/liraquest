import { sequelize } from '../server/config/database.js';
import { FamilyQuizQuestion, FamilyQuizOption } from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabelas do Quiz Educativo (family_quiz_questions e family_quiz_options)...');
    await FamilyQuizQuestion.sync({ alter: false });
    await FamilyQuizOption.sync({ alter: false });
    console.log('✅ Tabelas do Quiz criadas/verificadas com sucesso no MySQL de produção!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização das tabelas de quiz:', err);
    process.exit(1);
  }
}

run();
