import { sequelize } from '../server/config/database.js';
import { randomUUID } from 'crypto';

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco MySQL Hostinger estabelecida.');

    // 1. Adicionar coluna animation_id se não existir
    const [columns] = await sequelize.query('SHOW COLUMNS FROM definition_skills LIKE "animation_id"');
    if (columns.length === 0) {
      console.log('Adicionando coluna animation_id em definition_skills...');
      await sequelize.query('ALTER TABLE definition_skills ADD COLUMN animation_id INT NOT NULL DEFAULT 1 AFTER icon;');
      console.log('✅ Coluna animation_id adicionada com sucesso!');
    } else {
      console.log('ℹ️ Coluna animation_id já existe.');
    }

    // 2. Atualizar habilidades existentes com animation_id coerente
    await sequelize.query('UPDATE definition_skills SET animation_id = 1 WHERE code = "skill_muralha_domestica" OR code = "skill_postura_firme";');
    await sequelize.query('UPDATE definition_skills SET animation_id = 2 WHERE code = "skill_raio_conhecimento" OR code = "skill_disparo_certeiro";');
    await sequelize.query('UPDATE definition_skills SET animation_id = 3 WHERE code = "skill_ataque_relampago";');

    // 3. Cadastrar as novas habilidades dos 2 Campeões (Capitão e Ciclope)
    const [classes] = await sequelize.query('SELECT id, code FROM definition_classes');
    const guardiaoClass = classes.find(c => c.code === 'guardiao_do_lar') || classes[0];
    const sabioClass = classes.find(c => c.code === 'sabio_estrategista') || classes[0];

    const newSkills = [
      {
        code: 'skill_shield_slash',
        class_id: guardiaoClass.id,
        tier: 1,
        name: 'Shield Slash',
        description: 'Arremesso giratório do escudo de vibranium. Ignora 30% da armadura inimiga.',
        mana_cost: 15,
        cooldown_turns: 1,
        damage_multiplier: 1.5,
        heal_amount: 0,
        effect_type: 'PROJECTILE_PHYSICAL',
        icon: '🛡️',
        animation_id: 1, // Arremesso de Projétil
      },
      {
        code: 'skill_stars_stripes',
        class_id: guardiaoClass.id,
        tier: 2,
        name: 'Stars & Stripes',
        description: 'Gancho ascendente com escudo e rastro de poeira estelar. 45% de chance de atordoar (Stun).',
        mana_cost: 25,
        cooldown_turns: 2,
        damage_multiplier: 1.9,
        heal_amount: 0,
        effect_type: 'STUN_ATTACK',
        icon: '⭐',
        animation_id: 3, // Gancho Aéreo Ascendente
      },
      {
        code: 'skill_charging_star',
        class_id: guardiaoClass.id,
        tier: 3,
        name: 'Charging Star',
        description: 'Investida supersônica com barreira de vibranium. Causa alto dano e concede postura defensiva.',
        mana_cost: 35,
        cooldown_turns: 3,
        damage_multiplier: 2.3,
        heal_amount: 0,
        effect_type: 'CHARGE_SHIELD',
        icon: '🚀',
        animation_id: 4, // Investida com Escudo
      },
      {
        code: 'skill_optic_blast',
        class_id: sabioClass.id,
        tier: 1,
        name: 'Optic Blast',
        description: 'Disparo concentrado de feixe de laser pelo visor em linha reta. Alto dano mágico contínuo.',
        mana_cost: 15,
        cooldown_turns: 1,
        damage_multiplier: 1.55,
        heal_amount: 0,
        effect_type: 'LASER_BEAM',
        icon: '🔴',
        animation_id: 2, // Feixe Laser Horizontal
      },
      {
        code: 'skill_optic_sweep',
        class_id: sabioClass.id,
        tier: 2,
        name: 'Optic Sweep',
        description: 'Varredura óptica rasteira que atinge o solo levantando faíscas e atrasando o turno do adversário.',
        mana_cost: 25,
        cooldown_turns: 2,
        damage_multiplier: 1.8,
        heal_amount: 0,
        effect_type: 'GROUND_BEAM',
        icon: '🔻',
        animation_id: 5, // Varredura Óptica
      },
      {
        code: 'skill_gene_splice',
        class_id: sabioClass.id,
        tier: 3,
        name: 'Gene Splice',
        description: 'Gancho aéreo devastador envolto por uma cápsula de plasma vermelho com alta taxa crítica.',
        mana_cost: 35,
        cooldown_turns: 3,
        damage_multiplier: 2.4,
        heal_amount: 0,
        effect_type: 'PLASMA_UPPERCUT',
        icon: '⚡',
        animation_id: 3, // Gancho com Plasma
      },
    ];

    for (const sk of newSkills) {
      const [existing] = await sequelize.query('SELECT id FROM definition_skills WHERE code = :code', {
        replacements: { code: sk.code }
      });
      if (existing.length === 0) {
        await sequelize.query(`
          INSERT INTO definition_skills (id, code, class_id, tier, name, description, mana_cost, cooldown_turns, damage_multiplier, heal_amount, effect_type, icon, animation_id, created_at, updated_at)
          VALUES (:id, :code, :class_id, :tier, :name, :description, :mana_cost, :cooldown_turns, :damage_multiplier, :heal_amount, :effect_type, :icon, :animation_id, NOW(), NOW())
        `, {
          replacements: {
            id: randomUUID().toLowerCase(),
            ...sk
          }
        });
        console.log(`✅ Habilidade cadastrada: ${sk.name} (Anim ID: ${sk.animation_id})`);
      } else {
        await sequelize.query('UPDATE definition_skills SET animation_id = :animation_id WHERE code = :code', {
          replacements: { code: sk.code, animation_id: sk.animation_id }
        });
        console.log(`ℹ️ Habilidade atualizada: ${sk.name} (Anim ID: ${sk.animation_id})`);
      }
    }

    console.log('🎉 Migração aditiva de animation_id concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
