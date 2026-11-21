import bcrypt from 'bcryptjs';
import { sequelize, testDbConnection } from '../config/database.js';
import { Family } from '../modules/family/Family.js';
import { FamilyMember } from '../modules/family/FamilyMember.js';

export async function runSeed() {
  console.log('🏰 [LiraQuest] Iniciando Seed do Clã Lira...');

  const isConnected = await testDbConnection();
  if (!isConnected) {
    console.error('❌ Não foi possível conectar ao banco para executar o seed.');
    return;
  }

  // 1. Sincronizar tabelas de forma segura e aditiva (sem drop/destruição)
  console.log('🔄 Sincronizando tabelas do módulo Family...');
  await Family.sync();
  await FamilyMember.sync();

  // 2. Criar ou Obter o Clã Lira
  const clanInviteCode = 'LIRA-2026';
  const clanName = 'Clã Lira';

  let clan = await Family.findOne({ where: { invite_code: clanInviteCode } });
  if (!clan) {
    clan = await Family.create({
      name: clanName,
      invite_code: clanInviteCode,
    });
    console.log(`🏰 Família criada: "${clan.name}" [${clan.invite_code}]`);
  } else {
    await clan.update({ name: clanName });
    console.log(`🏰 Família confirmada: "${clan.name}" [${clan.invite_code}]`);
  }

  // Senha padrão para os pais
  const defaultPasswordHash = await bcrypt.hash('LiraQuest@2026', 10);

  // 3. Os 4 Membros Fundadores
  const membersData = [
    {
      name: 'Sidney Lira',
      hero_nickname: 'Paladino Sidney',
      email: 'sidney@liraquest.com',
      password: defaultPasswordHash,
      pin: null,
      role: 'ADMIN',
      class_code: 'guardiao_do_lar',
      skin_code: 'paladino_lira',
      level: 5,
      xp: 240,
      adventure_energy: 10,
      family_tokens: 50,
      gold: 150,
      streak_days: 5,
      str: 15,
      con: 16,
      agi: 10,
      int: 12,
      cha: 12,
      luk: 10,
    },
    {
      name: 'Elaine Lira',
      hero_nickname: 'Mestra Elaine',
      email: 'elaine@liraquest.com',
      password: defaultPasswordHash,
      pin: null,
      role: 'PARENT',
      class_code: 'guardiao_da_harmonia',
      skin_code: 'guardia_harmonia',
      level: 5,
      xp: 220,
      adventure_energy: 10,
      family_tokens: 50,
      gold: 150,
      streak_days: 5,
      str: 10,
      con: 12,
      agi: 10,
      int: 14,
      cha: 16,
      luk: 10,
    },
    {
      name: 'Paulo Lira',
      hero_nickname: 'Sir Paulinho',
      email: 'paulo@liraquest.com',
      password: null,
      pin: '1234',
      role: 'CHILD',
      class_code: 'rastreador_veloz',
      skin_code: 'rastreador_veloz',
      level: 3,
      xp: 135,
      adventure_energy: 10,
      family_tokens: 20,
      gold: 60,
      streak_days: 4,
      str: 12,
      con: 11,
      agi: 16,
      int: 10,
      cha: 10,
      luk: 14,
    },
    {
      name: 'Jennifer Lira',
      hero_nickname: 'Valquíria Jennifer',
      email: 'jennifer@liraquest.com',
      password: null,
      pin: '1234',
      role: 'CHILD',
      class_code: 'artifice_criativo',
      skin_code: 'artifice_criativa',
      level: 3,
      xp: 150,
      adventure_energy: 10,
      family_tokens: 25,
      gold: 75,
      streak_days: 4,
      str: 14,
      con: 12,
      agi: 11,
      int: 16,
      cha: 11,
      luk: 10,
    },
  ];

  for (const item of membersData) {
    let member = await FamilyMember.findOne({
      where: {
        family_id: clan.id,
        [sequelize.Sequelize.Op.or]: [
          { email: item.email },
          { hero_nickname: item.hero_nickname },
        ],
      },
    });

    if (!member) {
      member = await FamilyMember.create({
        ...item,
        family_id: clan.id,
        is_active: true,
      });
      console.log(`👤 Herói criado: ${member.hero_nickname} (${member.name}) - [${member.role}]`);
    } else {
      await member.update({
        ...item,
        is_active: true,
      });
      console.log(`🔄 Herói atualizado: ${member.hero_nickname} (${member.name}) - [${member.role}]`);
    }

    if (item.role === 'ADMIN' && !clan.created_by) {
      await clan.update({ created_by: member.id });
    }
  }

  console.log('✅ Seed do Clã Lira finalizado com sucesso!');
}

// Execução direta se invocado via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
}
