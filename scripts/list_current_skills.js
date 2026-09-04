import { sequelize } from '../server/config/database.js';
import { DefinitionSkill } from '../server/models/index.js';

async function run() {
  const skills = await DefinitionSkill.findAll();
  console.log(JSON.stringify(skills.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    class_id: s.class_id,
    mana_cost: s.mana_cost,
    damage_multiplier: s.damage_multiplier,
    effect_type: s.effect_type
  })), null, 2));
  process.exit(0);
}

run();
