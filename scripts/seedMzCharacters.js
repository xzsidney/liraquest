import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, DefinitionMzCharacter } from '../server/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeBox(raw) {
  if (!raw) return 'Desconhecida';
  const s = raw.trim();
  if (s.includes('Caixa Base') || s === 'Marvel Zombies Caixa Base') return 'Caixa Base: Marvel Zombies';
  if (s.includes('X-Men Resistance')) return 'Caixa: Marvel Zombies: X-Men Resistance';
  if (s.includes("Heroes' Resistance")) return "Caixa: Marvel Zombies: Heroes' Resistance";
  if (s.includes('Kickstarter Promos')) return 'Caixa Promocional: Kickstarter Promos';
  if (s.includes('Fantastic 4')) return 'Expansão: Fantastic 4: Under Siege';
  if (s.includes('Guardians of the Galaxy')) return 'Expansão: Guardians of the Galaxy Set';
  if (s.includes('Sentinel Strike')) return 'Expansão: Sentinel Strike';
  if (s.includes('Sinister Six')) return 'Expansão: Clash of the Sinister Six';
  if (s.includes('Galactus')) return 'Expansão: Galactus the Devourer';
  if (s.includes("Artist's Special Edition")) return "Expansão: Artist's Special Edition Set";
  if (s.includes('Hydra Resurrection')) return 'Expansão: Hydra Resurrection';
  return s;
}

async function seedMzCharacters() {
  try {
    console.log('🔌 Conectando ao MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão bem-sucedida!');

    console.log('🛠️ Sincronizando tabela definition_mz_characters (modo aditivo seguro)...');
    await DefinitionMzCharacter.sync();
    console.log('✅ Tabela definition_mz_characters pronta no banco de dados!');

    // Carregar arquivos JSON
    const file1Path = path.resolve(__dirname, '../doc/zombi/char/gemini-code-1792618568380.json');
    const file2Path = path.resolve(__dirname, '../doc/zombi/char/gemini-code-1792619790689.json');

    const file1Raw = fs.readFileSync(file1Path, 'utf8');
    const file2Raw = fs.readFileSync(file2Path, 'utf8');

    const parsed1 = JSON.parse(file1Raw);
    const chars1 = Array.isArray(parsed1) ? parsed1 : (parsed1.characters || []);

    const parsed2 = JSON.parse(file2Raw);
    const chars2 = Array.isArray(parsed2) ? parsed2 : (parsed2.characters || []);

    // Consolidar removendo duplicatas
    const charMap = new Map();
    [...chars1, ...chars2].forEach(char => {
      if (char && char.id) {
        charMap.set(char.id, char);
      }
    });

    console.log(`📦 Total de personagens únicos encontrados: ${charMap.size}`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const [code, char] of charMap.entries()) {
      const hasSuperHero = !!char.profiles?.super_hero;
      const hasZombieHero = !!char.profiles?.zombie_hero;
      const hasBossEnemy = !!char.profiles?.boss_enemy;

      const bossHealth = char.profiles?.boss_enemy?.health || null;
      const bossAbility = char.profiles?.boss_enemy?.ability || null;
      const boxName = normalizeBox(char.box);

      const recordData = {
        code: char.id,
        name: char.name,
        box_name: boxName,
        has_super_hero: hasSuperHero,
        has_zombie_hero: hasZombieHero,
        has_boss_enemy: hasBossEnemy,
        boss_health: bossHealth,
        boss_ability: bossAbility,
        profiles: char.profiles,
      };

      const existing = await DefinitionMzCharacter.findOne({ where: { code } });
      if (existing) {
        await existing.update(recordData);
        updatedCount++;
      } else {
        await DefinitionMzCharacter.create(recordData);
        createdCount++;
      }
    }

    console.log(`🎉 Ingestão de Personagens Marvel Zombies concluída com sucesso!`);
    console.log(`   - Criados: ${createdCount}`);
    console.log(`   - Atualizados: ${updatedCount}`);
    console.log(`   - Total no Catálogo: ${charMap.size}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed de personagens Marvel Zombies:', error);
    process.exit(1);
  }
}

seedMzCharacters();
