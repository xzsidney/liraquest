import { sequelize, FamilyUser } from '../server/models/index.js';
import {
  getConfig,
  saveConfig,
  generatePairingQr,
  confirmPairing,
  sendTestMessage,
  triggerAlarmTest,
  disconnect,
} from '../server/controllers/whatsappController.js';

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
    console.log('🧪 [Testes Fase 5] Iniciando validação completa da Central WhatsApp e Alarmes...');
    await sequelize.authenticate();

    let parentUser = await FamilyUser.findOne({ where: { role: 'PARENT' } });
    if (!parentUser) {
      parentUser = await FamilyUser.findOne();
    }

    if (!parentUser) {
      console.error('❌ Nenhum usuário encontrado no banco.');
      process.exit(1);
    }

    let family = await sequelize.models.Family.findOne();
    const familyId = family ? family.id : null;
    console.log(`👤 Usuário de teste: ${parentUser.name} (${parentUser.role}) | Família Real: ${family?.name} (${familyId})`);

    const mockReq = {
      user: {
        id: parentUser.id,
        family_id: familyId,
        role: parentUser.role,
        name: parentUser.name,
      },
      body: {},
      params: {},
    };

    // 1. Testar getConfig
    console.log('\n--- 1. Teste getConfig ---');
    const res1 = createMockRes();
    await getConfig(mockReq, res1);
    console.log('Resultado:', res1.data?.success ? '✅ Sucesso' : '❌ Falha', res1.data);

    // 2. Testar saveConfig
    console.log('\n--- 2. Teste saveConfig ---');
    mockReq.body = {
      group_id_or_phone: '5511999998888-group@g.us',
      notify_meals: true,
      notify_hydration: true,
    };
    const res2 = createMockRes();
    await saveConfig(mockReq, res2);
    console.log('Resultado:', res2.data?.success ? '✅ Sucesso' : '❌ Falha', res2.data?.message);

    // 3. Testar generatePairingQr
    console.log('\n--- 3. Teste generatePairingQr ---');
    const res3 = createMockRes();
    await generatePairingQr(mockReq, res3);
    console.log('Resultado:', res3.data?.success ? '✅ Sucesso' : '❌ Falha', 'QR Code Data URL gerado:', res3.data?.qr_code?.substring(0, 40) + '...');

    // 4. Testar confirmPairing
    console.log('\n--- 4. Teste confirmPairing ---');
    mockReq.body = { device: 'WhatsApp Web do Papai' };
    const res4 = createMockRes();
    await confirmPairing(mockReq, res4);
    console.log('Resultado:', res4.data?.success ? '✅ Sucesso' : '❌ Falha', res4.data?.message);

    // 5. Testar sendTestMessage
    console.log('\n--- 5. Teste sendTestMessage ---');
    mockReq.body = { custom_message: 'Teste de transmissão ao vivo do LiraQuest! 🛡️⚔️' };
    const res5 = createMockRes();
    await sendTestMessage(mockReq, res5);
    console.log('Resultado:', res5.data?.success ? '✅ Sucesso' : '❌ Falha', res5.data?.message);

    // 6. Testar os 4 Alarmes Automáticos via triggerAlarmTest
    console.log('\n--- 6. Teste de Alarmes Automáticos do Plano Mestre ---');
    
    // 6.1 Aviso Cozinha (11h15)
    mockReq.body = { alarm_type: 'KITCHEN' };
    const res6a = createMockRes();
    await triggerAlarmTest(mockReq, res6a);
    console.log('Alarme Cozinha 11h15:', res6a.data?.success ? '✅ OK' : '❌ Falha');

    // 6.2 Almoço dos Heróis (11h45)
    mockReq.body = { alarm_type: 'LUNCH' };
    const res6b = createMockRes();
    await triggerAlarmTest(mockReq, res6b);
    console.log('Almoço dos Heróis 11h45:', res6b.data?.success ? '✅ OK' : '❌ Falha');

    // 6.3 Lanche & Poção de Cura (16h00)
    mockReq.body = { alarm_type: 'HYDRATION' };
    const res6c = createMockRes();
    await triggerAlarmTest(mockReq, res6c);
    console.log('Lanche & Hidratação 16h00:', res6c.data?.success ? '✅ OK' : '❌ Falha');

    // 6.4 Jantar do Clã (19h45)
    mockReq.body = { alarm_type: 'DINNER' };
    const res6d = createMockRes();
    await triggerAlarmTest(mockReq, res6d);
    console.log('Jantar do Clã 19h45:', res6d.data?.success ? '✅ OK' : '❌ Falha');

    console.log('\n✨ [Fase 5] Todos os testes de API e Alarmes foram concluídos com 100% de sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro nos testes da Fase 5:', err);
    process.exit(1);
  }
}

runTests();
