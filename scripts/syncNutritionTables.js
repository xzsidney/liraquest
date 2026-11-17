import { sequelize } from '../server/config/database.js';
import {
  FamilyMealSchedule,
  FamilyMeal,
  FamilyMealItem,
  FamilyMealCheckin,
  FamilyShoppingItem,
} from '../server/models/index.js';

async function run() {
  try {
    console.log('🔄 Sincronizando tabelas aditivas do Módulo Saúde & Nutrição...');
    console.log('1/5 Sincronizando family_meal_schedules...');
    await FamilyMealSchedule.sync({ alter: false });

    console.log('2/5 Sincronizando family_meals...');
    await FamilyMeal.sync({ alter: false });

    console.log('3/5 Sincronizando family_meal_items...');
    await FamilyMealItem.sync({ alter: false });

    console.log('4/5 Sincronizando family_meal_checkins...');
    await FamilyMealCheckin.sync({ alter: false });

    console.log('5/5 Sincronizando family_shopping_items...');
    await FamilyShoppingItem.sync({ alter: false });

    console.log('✅ Todas as 5 tabelas de Saúde & Nutrição foram sincronizadas com sucesso no MySQL!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização das tabelas de nutrição:', err);
    process.exit(1);
  }
}

run();
