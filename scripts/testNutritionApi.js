import jwt from 'jsonwebtoken';
import { sequelize, FamilyUser, Character, CharacterClass } from '../server/models/index.js';
import {
  getTodayMenu,
  getWeekMenu,
  saveMeal,
  checkinMeal,
  getShoppingList,
  toggleShoppingItem,
  addShoppingItem,
  getSchedules,
  updateSchedules,
} from '../server/controllers/nutritionController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liraquest_family_rpg_secret_key_2026';

// Helper mock para res do Express
function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

async function runTests() {
  try {
    console.log('🧪 [Testes Fase 2] Iniciando validação completa das rotas e lógica do Módulo Saúde...');
    await sequelize.authenticate();

    // 1. Encontrar ou usar um usuário pai/admin para o teste
    let parentUser = await FamilyUser.findOne({ where: { role: 'PARENT' } });
    if (!parentUser) {
      parentUser = await FamilyUser.findOne();
    }

    if (!parentUser) {
      console.error('❌ Nenhum usuário encontrado para executar o teste.');
      process.exit(1);
    }

    console.log(`👤 Usuário de Teste (Guardião): ${parentUser.name} (${parentUser.id})`);

    const mockReq = {
      user: { id: parentUser.id, role: parentUser.role, email: parentUser.email },
      body: {},
      params: {},
      query: {},
    };

    // 2. Testar GET /api/nutrition/today
    console.log('\n--- 1. Testando getTodayMenu ---');
    let res = createMockRes();
    await getTodayMenu(mockReq, res);
    console.log(`Status: ${res.statusCode}, Sucesso: ${res.data?.success}, Refeições: ${res.data?.meals?.length}, Horários: ${res.data?.schedules?.length}`);
    if (!res.data?.success) throw new Error('Falha em getTodayMenu');

    // 3. Testar GET /api/nutrition/week
    console.log('\n--- 2. Testando getWeekMenu ---');
    res = createMockRes();
    await getWeekMenu(mockReq, res);
    console.log(`Status: ${res.statusCode}, Sucesso: ${res.data?.success}, Dias: ${res.data?.weekDays?.length}`);
    if (!res.data?.success) throw new Error('Falha em getWeekMenu');

    // 4. Testar POST /api/nutrition/meal
    console.log('\n--- 3. Testando saveMeal com pesos e ingredientes ---');
    res = createMockRes();
    mockReq.body = {
      meal_date: new Date().toISOString().split('T')[0],
      meal_type: 'almoco',
      title: 'Patinho Moído Especial com Cenoura Invisível & Purê',
      cooking_notes: 'Zero óleo, cebola batida no mixer, cenoura ralada bem fina',
      routine_mode: 'certinho',
      items: [
        { name: 'Patinho Moído', quantity_grams: '150g', category: 'proteina', health_tags: 'vesicula_segura' },
        { name: 'Arroz Integral', quantity_grams: '80g', category: 'carboidrato', health_tags: 'baixo_indice_glicemico' },
        { name: 'Salada Verde', quantity_grams: 'À vontade', category: 'salada', health_tags: 'antioxidante' },
      ],
    };
    await saveMeal(mockReq, res);
    console.log(`Status: ${res.statusCode}, Sucesso: ${res.data?.success}, Prato Salvo: ${res.data?.meal?.title}, Itens: ${res.data?.meal?.items?.length}`);
    if (!res.data?.success) throw new Error('Falha em saveMeal');

    // 5. Testar POST /api/nutrition/checkin (Mecânica do Paulinho)
    console.log('\n--- 4. Testando checkinMeal (No Horário: +30 XP, +10 Ouro, Energia) ---');
    // Pegar o próprio usuário ou primeiro filho
    res = createMockRes();
    mockReq.body = {
      user_id: parentUser.id,
      meal_type: 'almoco',
      status: 'no_horario',
    };
    await checkinMeal(mockReq, res);
    console.log(`Status: ${res.statusCode}, Sucesso: ${res.data?.success}, Mensagem: ${res.data?.message}`);
    console.log(`Recompensas creditadas: XP: +${res.data?.rewards?.xp}, Ouro: +${res.data?.rewards?.gold}`);
    if (!res.data?.success || res.data?.rewards?.xp !== 30) throw new Error('Falha em checkinMeal no_horario');

    // Testar status 'atrasado'
    res = createMockRes();
    mockReq.body.status = 'atrasado';
    await checkinMeal(mockReq, res);
    console.log(`Check-in Atrasado: Status: ${res.statusCode}, XP: +${res.data?.rewards?.xp}, Ouro: +${res.data?.rewards?.gold}`);
    if (res.data?.rewards?.xp !== 10) throw new Error('Falha em checkinMeal atrasado');

    // Testar status 'faltou'
    res = createMockRes();
    mockReq.body.status = 'faltou';
    mockReq.body.penalty_note = 'Não quis almoçar no horário';
    await checkinMeal(mockReq, res);
    console.log(`Check-in Faltou: Status: ${res.statusCode}, XP: +${res.data?.rewards?.xp}, Penalidade: ${res.data?.checkin?.penalty_note}`);
    if (res.data?.rewards?.xp !== 0) throw new Error('Falha em checkinMeal faltou');

    // 6. Testar Lista de Compras (GET, POST, TOGGLE)
    console.log('\n--- 5. Testando Lista de Compras Inteligente ---');
    res = createMockRes();
    await getShoppingList(mockReq, res);
    console.log(`Lista: ${res.statusCode}, Mensal: ${res.data?.mensal?.length}, Feira: ${res.data?.feira?.length}`);

    // Adicionar item
    res = createMockRes();
    mockReq.body = { name: 'Brócolis Ninja Teste', quantity: '2 un', category: 'semanal_feira' };
    await addShoppingItem(mockReq, res);
    const newItemId = res.data?.item?.id;
    console.log(`Item adicionado: ${res.data?.item?.name} (${newItemId})`);

    // Toggle item
    res = createMockRes();
    mockReq.body = { itemId: newItemId, is_purchased: true };
    await toggleShoppingItem(mockReq, res);
    console.log(`Item toggle comprado: ${res.data?.item?.is_purchased}`);
    if (!res.data?.item?.is_purchased) throw new Error('Falha em toggleShoppingItem');

    // 7. Testar Schedules (GET & PUT)
    console.log('\n--- 6. Testando Horários e Modo de Rotina ---');
    res = createMockRes();
    await getSchedules(mockReq, res);
    console.log(`Modo atual: ${res.data?.routine_mode}, Horários: ${res.data?.schedules?.length}`);

    // Alterar para flexivel e voltar para certinho
    res = createMockRes();
    mockReq.body = { routine_mode: 'flexivel' };
    await updateSchedules(mockReq, res);
    console.log(`Modo alterado para: ${res.data?.routine_mode}`);

    res = createMockRes();
    mockReq.body = { routine_mode: 'certinho' };
    await updateSchedules(mockReq, res);
    console.log(`Modo retornado para: ${res.data?.routine_mode}`);

    console.log('\n🎉 [TESTES CONCLUÍDOS COM 100% DE SUCESSO]');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no teste de nutrição:', err);
    process.exit(1);
  }
}

runTests();
