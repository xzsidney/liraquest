import { sequelize } from '../server/config/database.js';
import { DefinitionSkill, DefinitionClass, Character, CharacterSkill } from '../server/models/index.js';

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected');
    
    // Check columns of definition_skills
    const [cols] = await sequelize.query('SHOW COLUMNS FROM definition_skills');
    console.log('definition_skills columns:', cols.map(c => c.Field));

    const classes = await DefinitionClass.findAll({ attributes: ['id', 'code', 'name'] });
    console.log('Classes found:', classes.map(c => ({ id: c.id, code: c.code, name: c.name })));

    const skillsCount = await DefinitionSkill.count();
    console.log(`Total definition_skills count: ${skillsCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error checking DB:', err);
    process.exit(1);
  }
}

check();
