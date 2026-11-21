import bcrypt from 'bcryptjs';
import { sequelize } from '../server/config/database.js';
import { Family } from '../server/models/Family.js';
import { FamilyMember } from '../server/models/FamilyMember.js';
import { DefinitionAttribute } from '../server/models/DefinitionAttribute.js';
import { DefinitionClass } from '../server/models/DefinitionClass.js';

async function syncAndSeedCore() {
  console.log('🚀 [CORE V2] Iniciando sincronização das novas tabelas e seed oficial...');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco MySQL Hostinger confirmada.');

    // 1. Sincronizar tabelas Core (aditivas)
    console.log('📦 Sincronizando tabelas no MySQL...');
    await DefinitionAttribute.sync({ alter: false });
    console.log('   ✅ Tabela definition_attributes pronta.');

    await DefinitionClass.sync({ alter: false });
    console.log('   ✅ Tabela definition_classes pronta.');

    await Family.sync({ alter: false });
    console.log('   ✅ Tabela families pronta.');

    await FamilyMember.sync({ alter: false });
    console.log('   ✅ Tabela family_members pronta.');

    // 2. Seed de Atributos Base
    console.log('\n📊 Populando Atributos Fundamentais de RPG (definition_attributes)...');
    const attributes = [
      {
        code: 'str',
        name: 'Força',
        description: 'Poder físico e vigor para tarefas pesadas do lar.',
        combat_role: 'Dano Físico e Impacto',
        real_life_role: 'Tarefas do Lar',
      },
      {
        code: 'agi',
        name: 'Agilidade',
        description: 'Velocidade de reflexos e tempo de resposta.',
        combat_role: 'Esquiva e Precisão',
        real_life_role: 'Pontualidade e Prontidão',
      },
      {
        code: 'con',
        name: 'Constituição',
        description: 'Resistência biológica, imunidade e energia vital.',
        combat_role: 'Pontos de Vida (HP) e Resistência',
        real_life_role: 'Saúde e Alimentação',
      },
      {
        code: 'int',
        name: 'Inteligência',
        description: 'Capacidade analítica, raciocínio lógico e sabedoria.',
        combat_role: 'Poder Arcano e Táticas',
        real_life_role: 'Estudos e Leitura',
      },
      {
        code: 'cha',
        name: 'Carisma',
        description: 'Liderança, diplomacia e harmonia familiar.',
        combat_role: 'Suporte e Buffs',
        real_life_role: 'Convivência e Cooperação',
      },
      {
        code: 'luk',
        name: 'Sorte',
        description: 'Favorecimento dos dados e recompensas raras.',
        combat_role: 'Críticos e Esquiva Improvável',
        real_life_role: 'Sorteios e Bônus',
      },
    ];

    for (const attr of attributes) {
      const [record, created] = await DefinitionAttribute.findOrCreate({
        where: { code: attr.code },
        defaults: attr,
      });
      console.log(`   ${created ? '✨ Criado' : 'ℹ️ Existente'}: Atributo [${record.code}] ${record.name}`);
    }

    // 3. Seed de Classes de Heróis
    console.log('\n🛡️ Populando Classes Heroicas (definition_classes)...');
    const classes = [
      {
        code: 'guardiao_do_lar',
        name: 'Guardião do Lar',
        description: 'Paladino protetor da fortaleza familiar, inabalável no dever e na liderança.',
        combat_role: 'Tanque / Líder',
        real_life_focus: 'Tarefas do Lar & Liderança',
        icon: 'shield',
      },
      {
        code: 'guardiao_da_harmonia',
        name: 'Guardiã da Harmonia',
        description: 'Mestra curandeira que mantém a paz, nutrição e o equilíbrio do clã.',
        combat_role: 'Suporte / Cura',
        real_life_focus: 'Harmonia & Saúde Familiar',
        icon: 'heart',
      },
      {
        code: 'rastreador_veloz',
        name: 'Rastreador Veloz',
        description: 'Ladino e explorador ágil, focado em cumprir objetivos com rapidez.',
        combat_role: 'Dano Rápido / Flanqueador',
        real_life_focus: 'Velocidade & Missões Rápidas',
        icon: 'feather',
      },
      {
        code: 'artifice_criativo',
        name: 'Artífice Criativo',
        description: 'Valquíria e inventora perspicaz, mestre da criação e inovação.',
        combat_role: 'Engenharia / Estratégia',
        real_life_focus: 'Estudos & Criatividade',
        icon: 'hammer',
      },
      {
        code: 'mago_ancestral',
        name: 'Mago Ancestral',
        description: 'Estudioso dos mistérios arcanos e saberes profundos.',
        combat_role: 'Dano em Área',
        real_life_focus: 'Estudos & Conhecimento',
        icon: 'wand',
      },
      {
        code: 'arqueiro_guardiao',
        name: 'Arqueiro Guardião',
        description: 'Vigilante atento de pontaria infalível.',
        combat_role: 'Dano à Distância',
        real_life_focus: 'Foco & Disciplina',
        icon: 'bow',
      },
    ];

    for (const cls of classes) {
      const [record, created] = await DefinitionClass.findOrCreate({
        where: { code: cls.code },
        defaults: cls,
      });
      console.log(`   ${created ? '✨ Criado' : 'ℹ️ Existente'}: Classe [${record.code}] ${record.name}`);
    }

    // 4. Seed da Família Fundadora (Clã Lira)
    console.log('\n👑 Criando Família Fundadora: "Clã Lira" (LIRA-2026)...');
    let [clanLira, clanCreated] = await Family.findOrCreate({
      where: { invite_code: 'LIRA-2026' },
      defaults: {
        name: 'Clã Lira',
        invite_code: 'LIRA-2026',
      },
    });
    console.log(`   ${clanCreated ? '✨ Criada' : 'ℹ️ Existente'}: Família "${clanLira.name}" [${clanLira.invite_code}] (ID: ${clanLira.id})`);

    // 5. Seed dos 4 Membros Fundadores
    console.log('\n⚔️ Cadastrando Membros Oficiais do Clã Lira...');
    const salt = await bcrypt.genSalt(10);
    const parentPasswordHash = await bcrypt.hash('LiraQuest@2026', salt);

    const membersToSeed = [
      {
        name: 'Sidney Lira',
        hero_nickname: 'Paladino Sidney',
        role: 'ADMIN',
        email: 'sidney@liraquest.com',
        password: parentPasswordHash,
        pin: null,
        class_code: 'guardiao_do_lar',
        skin_code: 'paladino_lira',
        level: 1,
        xp: 0,
        adventure_energy: 10,
        family_tokens: 10,
        gold: 100,
        streak_days: 1,
        str: 14,
        agi: 10,
        con: 12,
        int: 10,
        cha: 12,
        luk: 10,
      },
      {
        name: 'Elaine Lira',
        hero_nickname: 'Mestra Elaine',
        role: 'PARENT',
        email: 'elaine@liraquest.com',
        password: parentPasswordHash,
        pin: null,
        class_code: 'guardiao_da_harmonia',
        skin_code: 'mestra_harmonia',
        level: 1,
        xp: 0,
        adventure_energy: 10,
        family_tokens: 10,
        gold: 100,
        streak_days: 1,
        str: 10,
        agi: 10,
        con: 12,
        int: 12,
        cha: 14,
        luk: 10,
      },
      {
        name: 'Paulo Lira',
        hero_nickname: 'Sir Paulinho',
        role: 'CHILD',
        email: null,
        password: null,
        pin: '1234',
        class_code: 'rastreador_veloz',
        skin_code: 'rastreador_paulo',
        level: 1,
        xp: 0,
        adventure_energy: 10,
        family_tokens: 0,
        gold: 50,
        streak_days: 1,
        str: 10,
        agi: 14,
        con: 10,
        int: 10,
        cha: 10,
        luk: 12,
      },
      {
        name: 'Jennifer Lira',
        hero_nickname: 'Valquíria Jennifer',
        role: 'CHILD',
        email: null,
        password: null,
        pin: '1234',
        class_code: 'artifice_criativo',
        skin_code: 'valquiria_jennifer',
        level: 1,
        xp: 0,
        adventure_energy: 10,
        family_tokens: 0,
        gold: 50,
        streak_days: 1,
        str: 10,
        agi: 12,
        con: 10,
        int: 14,
        cha: 10,
        luk: 10,
      },
    ];

    let sidneyMemberId = null;

    for (const m of membersToSeed) {
      let existing = null;
      if (m.email) {
        existing = await FamilyMember.findOne({ where: { email: m.email } });
      } else {
        existing = await FamilyMember.findOne({
          where: {
            family_id: clanLira.id,
            hero_nickname: m.hero_nickname,
          },
        });
      }

      if (existing) {
        await existing.update({
          ...m,
          family_id: clanLira.id,
          is_active: true,
        });
        console.log(`   🔄 Atualizado: ${m.name} (${m.hero_nickname}) [${m.role}] - Classe: ${m.class_code}`);
        if (m.email === 'sidney@liraquest.com') sidneyMemberId = existing.id;
      } else {
        const created = await FamilyMember.create({
          ...m,
          family_id: clanLira.id,
          is_active: true,
        });
        console.log(`   ✨ Criado: ${m.name} (${m.hero_nickname}) [${m.role}] - Classe: ${m.class_code}`);
        if (m.email === 'sidney@liraquest.com') sidneyMemberId = created.id;
      }
    }

    if (sidneyMemberId) {
      await clanLira.update({ created_by: sidneyMemberId });
      console.log(`\n👑 Guardião Fundador vinculado como criador do Clã Lira.`);
    }

    // 6. Resumo das tabelas ativas no MySQL
    const [tables] = await sequelize.query('SHOW TABLES;');
    const tableNames = tables.map((r) => Object.values(r)[0]);
    console.log(`\n📋 Status Atual do Banco (${tableNames.length} tabelas ativas):`);
    tableNames.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));

    console.log('\n🎉 SINCRONIZAÇÃO E SEED DO MÓDULO CORE FINALIZADOS COM SUCESSO!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Falha na sincronização ou seed:', error);
    process.exit(1);
  }
}

syncAndSeedCore();
