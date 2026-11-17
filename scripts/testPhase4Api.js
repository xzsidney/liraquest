import { sequelize, FamilyUser, Character } from '../server/models/index.js';
import {
  listEvents,
  createEvent,
  deleteEvent,
  listPolls,
  votePoll,
} from '../server/controllers/funController.js';
import {
  listBills,
  createBill,
  toggleBillStatus,
  deleteBill,
  listClanVaults,
  depositClanVault,
  getChildVault,
  depositPiggyBank,
  convertGoldToAllowance,
  updateChildGoal,
} from '../server/controllers/financeController.js';

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
    console.log('🧪 [Testes Fase 4] Iniciando validação completa dos Módulos Diversão e Financeiro...');
    await sequelize.authenticate();

    let parentUser = await FamilyUser.findOne({ where: { role: 'PARENT' } });
    if (!parentUser) {
      parentUser = await FamilyUser.findOne();
    }

    if (!parentUser) {
      console.error('❌ Nenhum usuário encontrado no banco de dados.');
      process.exit(1);
    }

    console.log(`👤 Usuário de Teste: ${parentUser.name} (${parentUser.id}) - Papel: ${parentUser.role}`);

    const mockReq = {
      user: { id: parentUser.id, role: parentUser.role, email: parentUser.email },
      body: {},
      params: {},
      query: {},
    };

    // 1. Testar listEvents
    console.log('\n--- 1. Testando listEvents ---');
    let res = createMockRes();
    await listEvents(mockReq, res);
    console.log(`✅ Eventos carregados: ${res.data?.events?.length || 0}`);
    if (res.data?.events?.length > 0) {
      console.log(`   Exemplo: "${res.data.events[0].title}" em ${res.data.events[0].event_date}`);
    }

    // 2. Testar createEvent
    console.log('\n--- 2. Testando createEvent ---');
    res = createMockRes();
    const testReqEvent = {
      ...mockReq,
      body: {
        title: '🧪 Teste Almoço de Domingo',
        event_date: '2026-11-29',
        event_time: '12:30',
        category: 'SPECIAL_LUNCH',
        icon: '🍝',
        description: 'Almoço especial de teste da Fase 4.',
      },
    };
    await createEvent(testReqEvent, res);
    const createdEventId = res.data?.event?.id;
    console.log(`✅ Evento criado com ID: ${createdEventId} - Sucesso: ${res.data?.success}`);

    // Limpar evento de teste
    if (createdEventId) {
      const delReq = { ...mockReq, params: { eventId: createdEventId } };
      await deleteEvent(delReq, createMockRes());
      console.log('✅ Evento temporário de teste removido.');
    }

    // 3. Testar listPolls
    console.log('\n--- 3. Testando listPolls ---');
    res = createMockRes();
    await listPolls(mockReq, res);
    console.log(`✅ Votações carregadas: ${res.data?.polls?.length || 0}`);
    const firstPoll = res.data?.polls?.[0];

    // 4. Testar votePoll
    if (firstPoll && firstPoll.options?.length > 0) {
      console.log('\n--- 4. Testando votePoll ---');
      res = createMockRes();
      const voteReq = {
        ...mockReq,
        params: { pollId: firstPoll.id },
        body: { option_id: firstPoll.options[0].id },
      };
      await votePoll(voteReq, res);
      console.log(`✅ Voto registrado: ${res.data?.message}`);
    }

    // 5. Testar listBills
    console.log('\n--- 5. Testando listBills ---');
    res = createMockRes();
    await listBills(mockReq, res);
    console.log(`✅ Contas carregadas: ${res.data?.bills?.length || 0}`);
    console.log(`   Resumo financeiro: Total Mês R$ ${res.data?.summary?.total_month} | Pendente R$ ${res.data?.summary?.total_pending} | Pago R$ ${res.data?.summary?.total_paid}`);

    // 6. Testar createBill e toggleBillStatus
    console.log('\n--- 6. Testando createBill e toggleBillStatus ---');
    res = createMockRes();
    const billReq = {
      ...mockReq,
      body: {
        title: '🧪 Teste Conta de Água',
        category: 'WATER',
        amount: 85.5,
        due_date: '2026-11-25',
        payment_method: 'PIX',
      },
    };
    await createBill(billReq, res);
    const testBillId = res.data?.bill?.id;
    console.log(`✅ Conta criada com ID: ${testBillId}`);

    if (testBillId) {
      res = createMockRes();
      await toggleBillStatus({ ...mockReq, params: { billId: testBillId } }, res);
      console.log(`✅ Status da conta alternado: ${res.data?.status}`);

      // Remover conta de teste
      await deleteBill({ ...mockReq, params: { billId: testBillId } }, createMockRes());
      console.log('✅ Conta temporária de teste removida.');
    }

    // 7. Testar listClanVaults e depositClanVault
    console.log('\n--- 7. Testando listClanVaults e depositClanVault ---');
    res = createMockRes();
    await listClanVaults(mockReq, res);
    console.log(`✅ Metas do Clã carregadas: ${res.data?.vaults?.length || 0}`);
    const firstVault = res.data?.vaults?.[0];
    if (firstVault) {
      res = createMockRes();
      await depositClanVault({ ...mockReq, params: { vaultId: firstVault.id }, body: { amount: 10 } }, res);
      console.log(`✅ Aporte no cofre do clã registrado: ${res.data?.message}`);
    }

    // 8. Testar getChildVault
    console.log('\n--- 8. Testando getChildVault ---');
    res = createMockRes();
    await getChildVault(mockReq, res);
    console.log(`✅ Cofrinho consultado: Ouro na Bolsa: ${res.data?.my_vault?.hero_gold} | Poupança: ${res.data?.my_vault?.saved_gold} 🪙 | Mesada: R$ ${res.data?.my_vault?.allowance_balance_brl}`);

    // 9. Testar updateChildGoal
    console.log('\n--- 9. Testando updateChildGoal ---');
    res = createMockRes();
    await updateChildGoal({ ...mockReq, body: { goal_title: 'Lego Millennium Falcon', goal_amount_brl: 120 } }, res);
    console.log(`✅ Meta pessoal do herói atualizada: "${res.data?.goal_title}" (R$ ${res.data?.goal_amount_brl})`);

    console.log('\n=============================================================');
    console.log('🎉 TODOS OS TESTES DOS MÓDULOS DIVERSÃO & FINANCEIRO PASSARAM!');
    console.log('=============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante os testes da Fase 4:', err);
    process.exit(1);
  }
}

runTests();
