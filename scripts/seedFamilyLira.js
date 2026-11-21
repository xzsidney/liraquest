import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  sequelize,
  FamilyUser,
  Family,
  FamilyMember,
  FamilyCharacter,
  Character,
  CharacterAttribute,
  UserProgress,
  DefinitionAttribute,
  DefinitionClass,
} from '../server/models/index.js';

// Função auxiliar para verificar e adicionar colunas aditivas de forma segura no MySQL
async function ensureColumn(tableName, columnName, columnDefinition) {
  const [results] = await sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = '${tableName}' 
      AND COLUMN_NAME = '${columnName}'
  `);

  if (results.length === 0) {
    console.log(`➕ Adicionando coluna '${columnName}' na tabela '${tableName}'...`);
    await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
    console.log(`✅ Coluna '${columnName}' adicionada com sucesso!`);
  } else {
    console.log(`ℹ️ Coluna '${columnName}' já presente em '${tableName}'.`);
  }
}

async function seedFamilyLira() {
  console.log('🏰 [LiraQuest] Iniciando Fase 1: Fundação Multi-Tenant & Seed do Clã Lira...');
  console.log('📡 Conectando ao MySQL da Hostinger de forma aditiva e segura...');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso com o MySQL na Hostinger!');

    // 1. Atualizações Aditivas no Banco de Dados
    console.log('\n--- 1. ESTRUTURA ADITIVA DO BANCO DE DADOS ---');
    
    // Novas colunas em family_users
    await ensureColumn('family_users', 'hero_nickname', 'VARCHAR(100) NULL AFTER name');
    await ensureColumn('family_users', 'pin', 'VARCHAR(10) NULL AFTER password');
    await ensureColumn('family_users', 'family_id', 'CHAR(36) NULL AFTER role');

    // Permitir email nulo para crianças se necessário
    try {
      await sequelize.query('ALTER TABLE `family_users` MODIFY COLUMN `email` VARCHAR(150) NULL');
      await sequelize.query('ALTER TABLE `family_users` MODIFY COLUMN `password` VARCHAR(255) NULL');
    } catch (err) {
      console.warn('Nota sobre colunas de family_users:', err.message);
    }

    // Criar tabela family_characters de forma isolada e aditiva
    console.log('🔄 Sincronizando modelo FamilyCharacter (tabela family_characters)...');
    await FamilyCharacter.sync();
    console.log('✅ Tabela family_characters verificada e pronta!');

    // Colunas de atributos em character_attributes
    await ensureColumn('character_attributes', 'str', 'INT NULL DEFAULT 10');
    await ensureColumn('character_attributes', 'agi', 'INT NULL DEFAULT 10');
    await ensureColumn('character_attributes', 'con', 'INT NULL DEFAULT 10');
    await ensureColumn('character_attributes', 'int', 'INT NULL DEFAULT 10');
    await ensureColumn('character_attributes', 'cha', 'INT NULL DEFAULT 10');
    await ensureColumn('character_attributes', 'luk', 'INT NULL DEFAULT 10');

    // 2. Carregar Catálogo de Classes e Atributos
    console.log('\n--- 2. CATÁLOGO BASE (CLASSES & ATRIBUTOS) ---');
    const attributes = await DefinitionAttribute.findAll();
    const attrMap = {};
    attributes.forEach(a => { attrMap[a.code] = a.id; });

    const classes = await DefinitionClass.findAll();
    const classMap = {};
    classes.forEach(c => { classMap[c.code] = c.id; });
    console.log(`✅ Catálogo carregado: ${attributes.length} atributos e ${classes.length} classes.`);

    // 3. Criar ou Obter o Clã Lira Oficial
    console.log('\n--- 3. CRIAÇÃO DO CLÃ LIRA (LIRA-2026) ---');
    const clanInviteCode = 'LIRA-2026';
    const clanName = 'Clã Lira';

    // Senha padrão forte bcrypt
    const defaultPasswordHash = await bcrypt.hash('LiraQuest@2026', 10);

    // 4. Definição dos 4 Membros Fundadores
    const founderMembers = [
      {
        name: 'Sidney Lira',
        hero_nickname: 'Paladino Sidney',
        email: 'sidney@liraquest.com',
        role: 'ADMIN',
        role_in_family: 'GUARDIAN',
        class_code: 'guardiao_do_lar',
        pin: null,
        stats: { str: 15, con: 16, agi: 10, int: 12, cha: 12, luk: 10 },
        gender: 'MALE',
        skin_code: 'paladino_lira',
      },
      {
        name: 'Elaine Lira',
        hero_nickname: 'Mestra Elaine',
        email: 'elaine@liraquest.com',
        role: 'PARENT',
        role_in_family: 'GUARDIAN',
        class_code: 'guardiao_da_harmonia',
        pin: null,
        stats: { str: 10, con: 12, agi: 10, int: 14, cha: 16, luk: 10 },
        gender: 'FEMALE',
        skin_code: 'guardia_harmonia',
      },
      {
        name: 'Paulo Lira',
        hero_nickname: 'Sir Paulinho',
        email: 'paulo@liraquest.com',
        role: 'CHILD',
        role_in_family: 'MEMBER',
        class_code: 'rastreador_veloz',
        pin: '1234',
        stats: { str: 12, con: 11, agi: 16, int: 10, cha: 10, luk: 14 },
        gender: 'MALE',
        skin_code: 'rastreador_veloz',
      },
      {
        name: 'Jennifer Lira',
        hero_nickname: 'Valquíria Jennifer',
        email: 'jennifer@liraquest.com',
        role: 'CHILD',
        role_in_family: 'MEMBER',
        class_code: 'artifice_criativo',
        pin: '1234',
        stats: { str: 14, con: 12, agi: 11, int: 16, cha: 11, luk: 10 },
        gender: 'FEMALE',
        skin_code: 'artifice_criativa',
      },
    ];

    // Criar primeiro o criador da família (Sidney Lira)
    const sidneyData = founderMembers[0];
    let sidneyUser = await FamilyUser.findOne({ where: { email: sidneyData.email } });
    if (!sidneyUser) {
      sidneyUser = await FamilyUser.create({
        id: randomUUID().toLowerCase(),
        name: sidneyData.name,
        hero_nickname: sidneyData.hero_nickname,
        email: sidneyData.email,
        password: defaultPasswordHash,
        pin: sidneyData.pin,
        role: sidneyData.role,
      });
      console.log(`👤 Usuário criado: ${sidneyData.name} (${sidneyData.email})`);
    } else {
      await sidneyUser.update({
        name: sidneyData.name,
        hero_nickname: sidneyData.hero_nickname,
        password: defaultPasswordHash,
        pin: sidneyData.pin,
        role: sidneyData.role,
      });
      console.log(`🔄 Usuário atualizado: ${sidneyData.name} (${sidneyData.email})`);
    }

    // Criar ou localizar o Clã Lira
    let clan = await Family.findOne({ where: { invite_code: clanInviteCode } });
    if (!clan) {
      clan = await Family.create({
        id: randomUUID().toLowerCase(),
        name: clanName,
        invite_code: clanInviteCode,
        created_by: sidneyUser.id,
      });
      console.log(`🏰 Família criada: "${clan.name}" com código de convite [${clan.invite_code}]!`);
    } else {
      await clan.update({
        name: clanName,
        created_by: sidneyUser.id,
      });
      console.log(`🏰 Família confirmada: "${clan.name}" [${clan.invite_code}]`);
    }

    // Associar Sidney à família
    await sidneyUser.update({ family_id: clan.id });

    // 5. Processar os 4 membros fundadores
    console.log('\n--- 4. SEED DOS 4 MEMBROS FUNDADORES ---');
    const todayStr = new Date().toISOString().split('T')[0];

    for (const member of founderMembers) {
      let user = await FamilyUser.findOne({ where: { email: member.email } });
      if (!user) {
        user = await FamilyUser.create({
          id: randomUUID().toLowerCase(),
          name: member.name,
          hero_nickname: member.hero_nickname,
          email: member.email,
          password: defaultPasswordHash,
          pin: member.pin,
          role: member.role,
          family_id: clan.id,
        });
        console.log(`\n👤 [${member.role}] ${member.name} (${member.hero_nickname}) criado.`);
      } else {
        await user.update({
          name: member.name,
          hero_nickname: member.hero_nickname,
          password: defaultPasswordHash,
          pin: member.pin,
          role: member.role,
          family_id: clan.id,
        });
        console.log(`\n🔄 [${member.role}] ${member.name} (${member.hero_nickname}) atualizado.`);
      }

      // Vínculo na tabela associativa family_members
      let famMember = await FamilyMember.findOne({
        where: { family_id: clan.id, user_id: user.id },
      });
      if (!famMember) {
        await FamilyMember.create({
          id: randomUUID().toLowerCase(),
          family_id: clan.id,
          user_id: user.id,
          role_in_family: member.role_in_family,
          joined_at: new Date(),
        });
      } else {
        await famMember.update({ role_in_family: member.role_in_family });
      }

      // Herói Multi-tenant (family_characters)
      let famChar = await FamilyCharacter.findOne({ where: { user_id: user.id } });
      if (!famChar) {
        famChar = await FamilyCharacter.create({
          id: randomUUID().toLowerCase(),
          user_id: user.id,
          family_id: clan.id,
          class_code: member.class_code,
          level: 1,
          xp: 0,
          skin_code: member.skin_code,
        });
        console.log(`  ⚔️ Herói no clã (family_characters): ${member.hero_nickname} [${member.class_code}] criado.`);
      } else {
        await famChar.update({
          family_id: clan.id,
          class_code: member.class_code,
          skin_code: member.skin_code,
        });
        console.log(`  ⚔️ Herói no clã (family_characters): ${member.hero_nickname} [${member.class_code}] atualizado.`);
      }

      // Herói na tabela legada Character (Retrocompatibilidade)
      const classId = classMap[member.class_code] || null;
      let legacyChar = await Character.findOne({ where: { user_id: user.id } });
      if (!legacyChar) {
        legacyChar = await Character.create({
          id: famChar.id,
          user_id: user.id,
          name: member.hero_nickname,
          gender: member.gender,
          avatar_type: 'SPRITE',
          avatar_value: member.skin_code,
          current_class_id: classId,
          gold: 50,
        });
      } else {
        await legacyChar.update({
          name: member.hero_nickname,
          gender: member.gender,
          avatar_value: member.skin_code,
          current_class_id: classId,
        });
      }

      // Atributos no modelo unificado (character_attributes com str, agi, con, int, cha, luk)
      // Garantir que existe o registro de atributo primário para atender a FK legado de attribute_id
      const primaryAttrCode = member.stats.con > member.stats.agi ? 'con' : 'agi';
      const primaryAttrId = attrMap[primaryAttrCode] || attributes[0].id;

      let charAttr = await CharacterAttribute.findOne({ where: { character_id: legacyChar.id } });
      if (!charAttr) {
        charAttr = await CharacterAttribute.create({
          id: randomUUID().toLowerCase(),
          character_id: legacyChar.id,
          attribute_id: primaryAttrId,
          base_value: 10,
          bonus_value: 0,
          str: member.stats.str,
          agi: member.stats.agi,
          con: member.stats.con,
          int: member.stats.int,
          cha: member.stats.cha,
          luk: member.stats.luk,
        });
        console.log(`  📊 Atributos base configurados: STR ${member.stats.str} | AGI ${member.stats.agi} | CON ${member.stats.con} | INT ${member.stats.int} | CHA ${member.stats.cha} | LUK ${member.stats.luk}`);
      } else {
        await charAttr.update({
          str: member.stats.str,
          agi: member.stats.agi,
          con: member.stats.con,
          int: member.stats.int,
          cha: member.stats.cha,
          luk: member.stats.luk,
        });
        console.log(`  📊 Atributos atualizados: STR ${member.stats.str} | AGI ${member.stats.agi} | CON ${member.stats.con} | INT ${member.stats.int} | CHA ${member.stats.cha} | LUK ${member.stats.luk}`);
      }

      // Sincronizar também os 6 registros individuais de character_attributes para compatibilidade
      for (const [code, val] of Object.entries(member.stats)) {
        const aId = attrMap[code];
        if (aId) {
          let singleAttr = await CharacterAttribute.findOne({
            where: { character_id: legacyChar.id, attribute_id: aId },
          });
          if (!singleAttr) {
            await CharacterAttribute.create({
              id: randomUUID().toLowerCase(),
              character_id: legacyChar.id,
              attribute_id: aId,
              base_value: val,
              bonus_value: 0,
              str: member.stats.str,
              agi: member.stats.agi,
              con: member.stats.con,
              int: member.stats.int,
              cha: member.stats.cha,
              luk: member.stats.luk,
            });
          } else {
            await singleAttr.update({
              base_value: val,
              str: member.stats.str,
              agi: member.stats.agi,
              con: member.stats.con,
              int: member.stats.int,
              cha: member.stats.cha,
              luk: member.stats.luk,
            });
          }
        }
      }

      // Progresso do Usuário (user_progress inicializado com 10 de Energia de Aventura e streak ativa)
      let prog = await UserProgress.findOne({ where: { user_id: user.id } });
      if (!prog) {
        await UserProgress.create({
          id: randomUUID().toLowerCase(),
          user_id: user.id,
          adventure_energy: 10,
          family_tokens: 50,
          tasks_done_total: 0,
          tasks_done_today: 0,
          streak_days: 1,
          best_streak_days: 1,
          last_active_date: todayStr,
        });
        console.log(`  ⚡ user_progress criado: 10 Energia de Aventura, 50 Fichas do Lar, Streak 1 dia.`);
      } else {
        await prog.update({
          adventure_energy: Math.max(prog.adventure_energy || 0, 10),
          streak_days: Math.max(prog.streak_days || 0, 1),
          last_active_date: todayStr,
        });
        console.log(`  ⚡ user_progress atualizado: ${prog.adventure_energy} Energia de Aventura, Streak ${prog.streak_days} dias.`);
      }
    }

    console.log('\n======================================================');
    console.log('🎉 [FASE 1 CONCLUÍDA COM TOTAL SUCESSO]');
    console.log(`🏰 Clã Oficial: "${clanName}" (Código de Convite: ${clanInviteCode})`);
    console.log('👑 Membros Cadastrados:');
    founderMembers.forEach(m => {
      const pinStr = m.pin ? ` | PIN: [${m.pin}]` : '';
      console.log(`  • ${m.name} -> "${m.hero_nickname}" [${m.role}] | Email: ${m.email}${pinStr} | Classe: ${m.class_code}`);
    });
    console.log('🔑 Senha de Acesso: "LiraQuest@2026"');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed da Fase 1:', error);
    process.exit(1);
  }
}

seedFamilyLira();
