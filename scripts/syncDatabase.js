import bcrypt from 'bcryptjs';
import {
  sequelize,
  FamilyUser,
  Family,
  FamilyMember,
  DefinitionAttribute,
  DefinitionClass,
  DefinitionSkill,
  DefinitionItem,
  DefinitionMonster,
  Character,
  CharacterClass,
  CharacterAttribute,
  CharacterSkill,
  CharacterInventory,
  Task,
  TaskSubmission,
  Event,
  Battle,
} from '../server/models/index.js';

async function syncAndSeed() {
  try {
    console.log('🔄 [LiraQuest] Conectando ao MySQL da Hostinger e sincronizando esquema UUID de forma aditiva...');

    // Sincronização aditiva de todas as tabelas (sem force, preservando dados existentes)
    await sequelize.sync({ alter: true });
    console.log('✅ Todas as tabelas sincronizadas com sucesso no banco da Hostinger!');

    // ========================================================
    // 1. SEED: 6 ATRIBUTOS DO RPG (UUID + Code)
    // ========================================================
    console.log('🌱 Semeando catálogo de Atributos com UUID...');
    const defaultAttributes = [
      {
        code: 'str',
        name: 'Força',
        description: 'Poder físico, capacidade de carga e impacto corpo a corpo.',
        combat_role: 'Dano físico corpo a corpo, quebra de escudos e empurrão no grid.',
        real_life_role: 'Desafios de esforço físico, carregar peso e tarefas pesadas de casa.',
      },
      {
        code: 'agi',
        name: 'Agilidade',
        description: 'Velocidade, reflexos e destreza manual.',
        combat_role: 'Iniciativa na ordem de turnos, esquiva/evasão e dano à distância.',
        real_life_role: 'Reflexos rápidos, atividades esportivas e tarefas com tempo limite.',
      },
      {
        code: 'con',
        name: 'Constituição',
        description: 'Vigor, resistência física e perseverança.',
        combat_role: 'Pontos de vida máximos (HP) e resistência a efeitos negativos.',
        real_life_role: 'Vigor, saúde, hábitos consistentes e foco prolongado (Timer AFK).',
      },
      {
        code: 'int',
        name: 'Inteligência',
        description: 'Capacidade analítica, raciocínio lógico e conhecimento.',
        combat_role: 'Dano mágico arcano, reserva máxima de MP e eficiência de táticas.',
        real_life_role: 'Estudos, leitura, lições de casa e resolução de problemas.',
      },
      {
        code: 'cha',
        name: 'Carisma',
        description: 'Empatia, liderança e capacidade de inspiração.',
        combat_role: 'Eficiência de auras, cura, buffs em aliados e descontos no reino.',
        real_life_role: 'Empatia, cooperação familiar, gentileza e comunicação.',
      },
      {
        code: 'luk',
        name: 'Sorte',
        description: 'Fortuna, intuição e acontecimentos improváveis.',
        combat_role: 'Chance de acerto crítico e sobrevivência milagrosa a golpes fatais.',
        real_life_role: 'Taxa de drop de itens raros, recompensas surpresa e gincanas.',
      },
    ];

    const attributeMap = {};
    for (const attr of defaultAttributes) {
      let existing = await DefinitionAttribute.findOne({ where: { code: attr.code } });
      if (!existing) {
        existing = await DefinitionAttribute.create(attr);
      } else {
        await existing.update(attr);
      }
      attributeMap[attr.code] = existing.id;
    }
    console.log('✅ Catálogo de Atributos pronto!');

    // ========================================================
    // 2. SEED: 6 CLASSES DE HERÓIS (UUID + Code + FKs UUID)
    // ========================================================
    console.log('🌱 Semeando catálogo de Classes com UUID...');
    const defaultClasses = [
      {
        code: 'guardiao_do_lar',
        name: 'Guardião do Lar',
        description: 'O protetor incansável da casa que absorve impacto e protege os irmãos.',
        primaryCode: 'con',
        secondaryCode: 'str',
        combat_role: 'Tanque / Protetor',
        real_life_focus: 'Arrumação pesada, limpeza do quarto e cuidado do espaço comum.',
        icon: 'shield',
      },
      {
        code: 'sabio_estrategista',
        name: 'Sábio Estrategista',
        description: 'O mestre dos estudos e feitiços que decifra fraquezas dos monstros.',
        primaryCode: 'int',
        secondaryCode: 'con',
        combat_role: 'Mago / Dano Mágico',
        real_life_focus: 'Estudos, leitura, lições de casa e notas altas.',
        icon: 'book',
      },
      {
        code: 'guardiao_da_harmonia',
        name: 'Guardião da Harmonia',
        description: 'A alma carismática que cura feridas, traz paz e inspira a família.',
        primaryCode: 'cha',
        secondaryCode: 'int',
        combat_role: 'Curandeiro / Suporte',
        real_life_focus: 'Autocuidado, cooperação com os pais e gentileza no dia a dia.',
        icon: 'heart',
      },
      {
        code: 'rastreador_veloz',
        name: 'Rastreador Veloz',
        description: 'O atleta ágil que ataca com extrema velocidade e esquiva de perigos.',
        primaryCode: 'agi',
        secondaryCode: 'luk',
        combat_role: 'Dano Físico / Esquiva',
        real_life_focus: 'Esportes, recados rápidos e brincadeiras ativas.',
        icon: 'zap',
      },
      {
        code: 'artifice_criativo',
        name: 'Artífice Criativo',
        description: 'O inventor habilidoso que constrói geringonças e controla o campo.',
        primaryCode: 'str',
        secondaryCode: 'int',
        combat_role: 'Invocador / Controle',
        real_life_focus: 'Artes, desenhos, montagens e consertos caseiros.',
        icon: 'tool',
      },
      {
        code: 'aventureiro_oportunista',
        name: 'Aventureiro Oportunista',
        description: 'O atirador sortudo que arrisca tudo por golpes críticos devastadores.',
        primaryCode: 'luk',
        secondaryCode: 'agi',
        combat_role: 'Crítico / Longo Alcance',
        real_life_focus: 'Jogos de tabuleiro, novos desafios e missões surpresa.',
        icon: 'dice',
      },
    ];

    const classMap = {};
    for (const cls of defaultClasses) {
      const payload = {
        code: cls.code,
        name: cls.name,
        description: cls.description,
        primary_attribute_id: attributeMap[cls.primaryCode],
        secondary_attribute_id: attributeMap[cls.secondaryCode],
        combat_role: cls.combat_role,
        real_life_focus: cls.real_life_focus,
        icon: cls.icon,
      };

      let existing = await DefinitionClass.findOne({ where: { code: cls.code } });
      if (!existing) {
        existing = await DefinitionClass.create(payload);
      } else {
        await existing.update(payload);
      }
      classMap[cls.code] = existing.id;
    }
    console.log('✅ Catálogo de Classes pronto!');

    // ========================================================
    // 3. SEED: HABILIDADES INICIAIS (UUID + Code + FKs UUID)
    // ========================================================
    console.log('🌱 Semeando catálogo de Habilidades com UUID...');
    const defaultSkills = [
      // Guardião do Lar
      {
        code: 'skill_muralha_domestica',
        classCode: 'guardiao_do_lar',
        tier: 1,
        name: 'Muralha Doméstica',
        description: 'Cria uma barreira protetora que absorve dano direcionado aos aliados.',
        mana_cost: 15,
        cooldown_turns: 2,
        damage_multiplier: 0,
        heal_amount: 0,
        effect_type: 'SHIELD',
        xp_cost_to_unlock: 100,
        icon: 'shield_barrier',
      },
      {
        code: 'skill_postura_firme',
        classCode: 'guardiao_do_lar',
        tier: 1,
        name: 'Postura Firme',
        description: 'Reduz o dano sofrido no próximo turno e atrai a atenção dos inimigos.',
        mana_cost: 10,
        cooldown_turns: 1,
        damage_multiplier: 0.5,
        heal_amount: 0,
        effect_type: 'TAUNT',
        xp_cost_to_unlock: 100,
        icon: 'firm_stance',
      },
      // Sábio Estrategista
      {
        code: 'skill_raio_conhecimento',
        classCode: 'sabio_estrategista',
        tier: 1,
        name: 'Raio de Conhecimento',
        description: 'Disparo mágico elemental concentrado de longo alcance.',
        mana_cost: 20,
        cooldown_turns: 1,
        damage_multiplier: 1.8,
        heal_amount: 0,
        effect_type: 'MAGIC_DAMAGE',
        xp_cost_to_unlock: 100,
        icon: 'arcane_bolt',
      },
      {
        code: 'skill_analise_tatica',
        classCode: 'sabio_estrategista',
        tier: 1,
        name: 'Análise Tática',
        description: 'Analisa fraquezas do chefe, concedendo dano extra a todos no próximo turno.',
        mana_cost: 15,
        cooldown_turns: 3,
        damage_multiplier: 0,
        heal_amount: 0,
        effect_type: 'BUFF_TEAM_DAMAGE',
        xp_cost_to_unlock: 100,
        icon: 'tactical_eye',
      },
      // Guardião da Harmonia
      {
        code: 'skill_abraco_revitalizante',
        classCode: 'guardiao_da_harmonia',
        tier: 1,
        name: 'Abraço Revitalizante',
        description: 'Restaura a saúde de um aliado ferido com energia acolhedora.',
        mana_cost: 20,
        cooldown_turns: 2,
        damage_multiplier: 0,
        heal_amount: 50,
        effect_type: 'HEAL',
        xp_cost_to_unlock: 100,
        icon: 'healing_heart',
      },
      // Rastreador Veloz
      {
        code: 'skill_ataque_relampago',
        classCode: 'rastreador_veloz',
        tier: 1,
        name: 'Ataque Relâmpago',
        description: 'Golpe ultrarrápido com chance de acertar duas vezes seguidas.',
        mana_cost: 15,
        cooldown_turns: 1,
        damage_multiplier: 1.4,
        heal_amount: 0,
        effect_type: 'PHYSICAL_DAMAGE',
        xp_cost_to_unlock: 100,
        icon: 'lightning_strike',
      },
      // Artífice Criativo
      {
        code: 'skill_torre_sucata',
        classCode: 'artifice_criativo',
        tier: 1,
        name: 'Torre de Sucata',
        description: 'Monta uma torreta mecânica que dispara contra o inimigo automaticamente.',
        mana_cost: 25,
        cooldown_turns: 3,
        damage_multiplier: 1.2,
        heal_amount: 0,
        effect_type: 'SUMMON',
        xp_cost_to_unlock: 100,
        icon: 'turret',
      },
      // Aventureiro Oportunista
      {
        code: 'skill_disparo_certeiro',
        classCode: 'aventureiro_oportunista',
        tier: 1,
        name: 'Disparo Certeiro',
        description: 'Tiro de precisão à distância com chance dobrada de acerto crítico.',
        mana_cost: 15,
        cooldown_turns: 1,
        damage_multiplier: 1.6,
        heal_amount: 0,
        effect_type: 'CRITICAL_SHOT',
        xp_cost_to_unlock: 100,
        icon: 'bullseye',
      },
    ];

    for (const skl of defaultSkills) {
      const payload = {
        code: skl.code,
        class_id: classMap[skl.classCode],
        tier: skl.tier,
        name: skl.name,
        description: skl.description,
        mana_cost: skl.mana_cost,
        cooldown_turns: skl.cooldown_turns,
        damage_multiplier: skl.damage_multiplier,
        heal_amount: skl.heal_amount,
        effect_type: skl.effect_type,
        xp_cost_to_unlock: skl.xp_cost_to_unlock,
        icon: skl.icon,
      };

      let existing = await DefinitionSkill.findOne({ where: { code: skl.code } });
      if (!existing) {
        await DefinitionSkill.create(payload);
      } else {
        await existing.update(payload);
      }
    }
    console.log('✅ Catálogo de Habilidades pronto!');

    // ========================================================
    // 4. SEED: ITENS INICIAIS DA LOJA (UUID + Code)
    // ========================================================
    console.log('🌱 Semeando catálogo de Itens com UUID...');
    const defaultItems = [
      {
        code: 'item_espada_madeira',
        name: 'Espada de Treino',
        description: 'Uma espada leve entalhada em carvalho. Aumenta a Força.',
        type: 'WEAPON',
        price_gold: 30,
        stat_bonuses: { str: 2 },
        icon: 'wooden_sword',
      },
      {
        code: 'item_escudo_bronze',
        name: 'Escudo de Bronze',
        description: 'Escudo resistente que eleva a Constituição e sobrevivência.',
        type: 'ARMOR',
        price_gold: 40,
        stat_bonuses: { con: 3 },
        icon: 'bronze_shield',
      },
      {
        code: 'item_livro_antigo',
        name: 'Tomo do Estudioso',
        description: 'Páginas repletas de anotações úteis que expandem a Inteligência.',
        type: 'ACCESSORY',
        price_gold: 35,
        stat_bonuses: { int: 2 },
        icon: 'scholar_book',
      },
      {
        code: 'item_pocao_vida',
        name: 'Poção de Vigor',
        description: 'Restaura 40 pontos de vida instantaneamente em batalha.',
        type: 'POTION',
        price_gold: 15,
        stat_bonuses: {},
        icon: 'health_potion',
      },
      {
        code: 'item_recompensa_cinema',
        name: 'Vale Cinema com Pipoca',
        description: 'Recompensa do Mundo Real: Uma ida ao cinema com a família!',
        type: 'REAL_WORLD',
        price_gold: 200,
        stat_bonuses: {},
        icon: 'ticket',
      },
    ];

    for (const itm of defaultItems) {
      let existing = await DefinitionItem.findOne({ where: { code: itm.code } });
      if (!existing) {
        await DefinitionItem.create(itm);
      } else {
        await existing.update(itm);
      }
    }
    console.log('✅ Catálogo de Itens pronto!');

    // ========================================================
    // 5. SEED: MONSTROS E CHEFES INICIAIS (UUID + Code)
    // ========================================================
    console.log('🌱 Semeando catálogo de Monstros com UUID...');
    const defaultMonsters = [
      {
        code: 'mob_desorganizacao',
        name: 'Gosma da Desorganização',
        description: 'Uma criatura viscosa nascida de roupas espalhadas pelo chão.',
        is_boss: false,
        max_hp: 80,
        attack_power: 12,
        defense: 4,
        speed: 8,
        xp_reward: 40,
        gold_reward: 15,
        sprite_key: 'slime_mess',
      },
      {
        code: 'boss_procrastinacao',
        name: 'Gólem da Procrastinação',
        description: 'Chefe Colossal que tenta fazer os heróis deixarem tudo para amanhã!',
        is_boss: true,
        max_hp: 350,
        attack_power: 28,
        defense: 12,
        speed: 6,
        xp_reward: 250,
        gold_reward: 100,
        sprite_key: 'boss_golem',
      },
    ];

    for (const mob of defaultMonsters) {
      let existing = await DefinitionMonster.findOne({ where: { code: mob.code } });
      if (!existing) {
        await DefinitionMonster.create(mob);
      } else {
        await existing.update(mob);
      }
    }
    console.log('✅ Catálogo de Monstros pronto!');

    // ========================================================
    // 6. SEED: USUÁRIOS DE TESTE
    // ========================================================
    console.log('🌱 Verificando usuários padrão...');
    const defaultUsers = [
      {
        name: 'Mestre Administrador (Sidney)',
        email: 'admin@liraquest.com',
        password: 'admin123',
        role: 'ADMIN',
        school_or_work: 'Desenvolvimento LiraQuest',
        phone: '(11) 99999-0001',
      },
      {
        name: 'Guardião Sidney (Pai)',
        email: 'pai@liraquest.com',
        password: 'pai123',
        role: 'PARENT',
        school_or_work: 'Trabalho / Família',
        phone: '(11) 99999-0002',
      },
      {
        name: 'Jovem Herói Davi (Filho)',
        email: 'filho@liraquest.com',
        password: 'filho123',
        role: 'CHILD',
        school_or_work: 'Escola Reino do Saber - 8º Ano',
        phone: '(11) 99999-0003',
      },
    ];

    for (const u of defaultUsers) {
      const existing = await FamilyUser.findOne({ where: { email: u.email } });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await FamilyUser.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          school_or_work: u.school_or_work,
          phone: u.phone,
        });
        console.log(`👤 Usuário criado: ${u.email} (${u.role})`);
      } else {
        await existing.update({
          school_or_work: existing.school_or_work || u.school_or_work,
          phone: existing.phone || u.phone,
        });
        console.log(`ℹ️ Usuário ${u.email} verificado/atualizado.`);
      }
    }

    console.log('🎉 Sincronização UUID completa e catálogo semeado com sucesso no MySQL da Hostinger!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  }
}

syncAndSeed();
