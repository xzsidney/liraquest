import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { sequelize, DefinitionMzCharacter } from '../server/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAR_DIR = path.resolve(__dirname, '../doc/zombi/char');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message} - Data: ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1') // [[Link|Label]] -> Label
    .replace(/'''?/g, '') // bold/italic
    .replace(/<[^>]+>/g, '') // HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/1\*/g, '1 Poder')
    .replace(/2\*/g, '2 Poderes')
    .replace(/3\*/g, '3 Poderes')
    .replace(/4\*/g, '4 Poderes')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBoxName(boxName) {
  if (!boxName) return 'Outros';
  const b = boxName.trim();
  if (b.includes('Marvel Zombies: A Zombicide Game') || b === 'Marvel Zombies core box') return 'Caixa Base: Marvel Zombies';
  if (b.includes('X-Men Resistance')) return 'Caixa: Marvel Zombies: X-Men Resistance';
  if (b.includes("Heroes Resistance") || b.includes("Heroes' Resistance")) return "Caixa: Marvel Zombies: Heroes' Resistance";
  if (b.includes('Fantastic 4')) return 'Expansão: Fantastic 4: Under Siege';
  if (b.includes('Guardians of the Galaxy')) return 'Expansão: Guardians of the Galaxy Set';
  if (b.includes('HYDRA Resurrection')) return 'Expansão: Hydra Resurrection';
  if (b.includes('Sentinel Strike')) return 'Expansão: Sentinel Strike';
  if (b.includes('Sinister Six')) return 'Expansão: Clash of the Sinister Six';
  if (b.includes('Galactus')) return 'Expansão: Galactus the Devourer';
  if (b.includes("Artist's Special Edition")) return "Expansão: Artist's Special Edition Set";
  if (b.includes('Kickstarter Promos')) return 'Caixa Promocional: Kickstarter Promos';
  if (b.includes('Agent Coulson') || b.includes('Wong Promo')) return 'Promos Exclusivas';
  return b;
}

function parseHeroPageWikitext(wikitext, heroName, defaultBox) {
  const result = {
    code: heroName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
    name: heroName,
    box_name: normalizeBoxName(defaultBox),
    profiles: {},
    has_super_hero: false,
    has_zombie_hero: false,
    has_boss_enemy: false,
    boss_health: null,
    boss_ability: null
  };

  // Find boxes in infobox if available
  const boxMatch = wikitext.match(/\|box=([^\n|}]+)/i);
  if (boxMatch) {
    result.box_name = normalizeBoxName(boxMatch[1]);
  }

  // Split tables
  const tableRegex = /\{\| class="article-table"([\s\S]*?)\|\}/g;
  let match;
  while ((match = tableRegex.exec(wikitext)) !== null) {
    const tableContent = match[1];

    // Check if Hero table
    const isHero = /===Hero===|==Hero==/i.test(tableContent) || (tableContent.includes('!Blue') && !tableContent.includes('===Zombie===') && !tableContent.includes('Devour'));
    const isZombie = /===Zombie===|==Zombie==/i.test(tableContent) || tableContent.includes('Devour');
    const isSpawn = /Hero Spawn|Zombie Spawn/i.test(tableContent);

    // Extract Skills (Blue, Yellow, Orange, Red)
    if (isHero || isZombie) {
      const modeKey = isZombie ? 'zombie_hero' : 'super_hero';
      if (!result.profiles[modeKey]) {
        result.profiles[modeKey] = {
          attack: { name: 'Ataque Padrão', range: '0', dice: 3, accuracy: 4 },
          skills: { blue: '', yellow: '+1 Ação', orange: '', red: '' }
        };
      }

      // Find skills row: usually follows !Blue \n !Yellow \n !Orange \n !Red
      const skillRowMatch = tableContent.match(/!(?:Blue|Azul)[\s\S]*?\n\|([\s\S]*?)\n\|([\s\S]*?)\n\|([\s\S]*?)\n\|([\s\S]*?)(?:\n|\|-)/i);
      if (skillRowMatch) {
        result.profiles[modeKey].skills.blue = cleanText(skillRowMatch[1]);
        result.profiles[modeKey].skills.yellow = cleanText(skillRowMatch[2]) || '+1 Ação';
        result.profiles[modeKey].skills.orange = cleanText(skillRowMatch[3]);
        result.profiles[modeKey].skills.red = cleanText(skillRowMatch[4]);
      }

      // Find Attack Ability (e.g. ====Ability : Vibranium Shield====)
      const abilityMatch = tableContent.match(/====(?:'''?)?(?:Ability\s*:?\s*)?([^='|\n]+)(?:'''?)?====/i);
      if (abilityMatch) {
        result.profiles[modeKey].attack.name = cleanText(abilityMatch[1]);
      }

      // Find Attack Stats row (Type \n Range \n Dice \n Accuracy)
      const statsMatch = tableContent.match(/!(?:Type|Tipo)[\s\S]*?!(?:Range|Faixa|Alcance)[\s\S]*?!(?:Dice|Dados)[\s\S]*?!(?:Accuracy|Precisão)[\s\S]*?\n\|([^\n|]+)\n\|([^\n|]+)\n\|([^\n|]+)\n\|([^\n|]+)/i);
      if (statsMatch) {
        result.profiles[modeKey].attack.range = cleanText(statsMatch[2]);
        result.profiles[modeKey].attack.dice = parseInt(cleanText(statsMatch[3]), 10) || 3;
        result.profiles[modeKey].attack.accuracy = parseInt(cleanText(statsMatch[4]).replace(/[^0-9]/g, ''), 10) || 4;
      }

      if (isHero) result.has_super_hero = true;
      if (isZombie) result.has_zombie_hero = true;
    }

    // Extract Spawn Table
    if (isSpawn) {
      // Find rows with numbers for RP and text for Ability
      const spawnRows = tableContent.match(/\|\s*(\d+)\s*\n\|([^\n|]+)/g);
      if (spawnRows && spawnRows.length > 0) {
        const lastSpawn = spawnRows[0].match(/\|\s*(\d+)\s*\n\|([\s\S]*)/);
        if (lastSpawn) {
          result.boss_health = parseInt(lastSpawn[1], 10);
          result.boss_ability = cleanText(lastSpawn[2]);
          result.has_boss_enemy = true;
          result.profiles.boss_enemy = {
            health: result.boss_health,
            ability: result.boss_ability
          };
        }
      }
    }
  }

  // Fallback: If no boss_enemy yet but isZombie, default health 4
  if (result.has_zombie_hero && !result.has_boss_enemy) {
    result.has_boss_enemy = true;
    result.boss_health = 4;
    result.boss_ability = 'Ativa na fase dos inimigos e executa suas habilidades de zumbi.';
    result.profiles.boss_enemy = {
      health: 4,
      ability: result.boss_ability
    };
  }

  return result;
}

async function scrapeAll() {
  console.log('🚀 Iniciando Robô de Extração da Fandom Wiki de Marvel Zombies...');
  console.log('🔌 Conectando ao MySQL...');
  await sequelize.authenticate();
  console.log('✅ Banco MySQL conectado com sucesso!\n');

  // Step 1: Obter a lista de caixas e personagens da página principal
  console.log('📥 Baixando índice mestre: Marvel_Zombies_Heroes...');
  const masterData = await fetchJson('https://zombicide.fandom.com/api.php?action=parse&page=Marvel_Zombies_Heroes&prop=wikitext&format=json');
  const wikitext = masterData.parse?.wikitext?.['*'] || '';

  const setRegex = /\{\{SetSurvivorTable[\s\S]*?\|name=([^\n|]+)[\s\S]*?\|survivorHeadshots=([\s\S]*?)\n\}\}/g;
  let setMatch;
  const boxes = [];

  while ((setMatch = setRegex.exec(wikitext)) !== null) {
    const rawBoxName = setMatch[1].trim();
    const content = setMatch[2];
    const headshotRegex = /\{\{SurvivorHeadshot\s*\|name=([^\n|]+)(?:\|link=([^\n|]+))?/g;
    let hMatch;
    const heroes = [];
    while ((hMatch = headshotRegex.exec(content)) !== null) {
      heroes.push({
        name: hMatch[1].trim(),
        page: hMatch[2] ? hMatch[2].trim() : hMatch[1].trim()
      });
    }
    boxes.push({ boxName: rawBoxName, heroes });
  }

  console.log(`📦 Encontradas ${boxes.length} caixas/conjuntos na Fandom Wiki:\n`);
  boxes.forEach((b, i) => console.log(`   ${i + 1}. ${b.boxName} (${b.heroes.length} heróis)`));
  console.log('\n--------------------------------------------------------------');

  let totalScraped = 0;
  let totalSaved = 0;

  for (let bIdx = 0; bIdx < boxes.length; bIdx++) {
    const box = boxes[bIdx];
    const boxSlug = box.boxName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const jsonFileName = `box_${String(bIdx + 1).padStart(2, '0')}_${boxSlug}.json`;
    const jsonFilePath = path.join(CHAR_DIR, jsonFileName);

    console.log(`\n▶️ [Lote ${bIdx + 1}/${boxes.length}] Processando: "${box.boxName}" (${box.heroes.length} heróis)...`);
    const boxResults = [];

    for (const hero of box.heroes) {
      try {
        const pageTitle = encodeURIComponent(hero.page.replace(/ /g, '_'));
        const pageUrl = `https://zombicide.fandom.com/api.php?action=parse&page=${pageTitle}&prop=wikitext&format=json`;
        
        const heroData = await fetchJson(pageUrl);
        const heroWt = heroData.parse?.wikitext?.['*'] || '';

        if (!heroWt) {
          console.warn(`   ⚠️ Página vazia ou não encontrada para: ${hero.name} (${hero.page})`);
          continue;
        }

        const parsed = parseHeroPageWikitext(heroWt, hero.name, box.boxName);
        boxResults.push(parsed);
        totalScraped++;

        // Atualizar no MySQL
        const existing = await DefinitionMzCharacter.findOne({ where: { code: parsed.code } });
        if (existing) {
          await existing.update(parsed);
        } else {
          await DefinitionMzCharacter.create(parsed);
        }
        totalSaved++;

        console.log(`   ✅ ${parsed.name} (Hero: ${parsed.has_super_hero ? 'Sim' : 'Não'} | Zombie: ${parsed.has_zombie_hero ? 'Sim' : 'Não'} | Boss HP: ${parsed.boss_health || 'N/A'})`);

        // Pequena pausa para respeitar a API da Fandom
        await new Promise(r => setTimeout(r, 600));
      } catch (err) {
        console.error(`   ❌ Erro ao processar ${hero.name}:`, err.message);
      }
    }

    // Salvar JSON do lote
    fs.writeFileSync(jsonFilePath, JSON.stringify(boxResults, null, 2), 'utf8');
    console.log(`📁 Lote salvo em arquivo: doc/zombi/char/${jsonFileName} (${boxResults.length} heróis gravados)`);
  }

  console.log('\n==============================================================');
  console.log(`🎉 EXTRAÇÃO E INGESTÃO COMPLETA FINALIZADA COM SUCESSO!`);
  console.log(`   - Total de Heróis Extraídos: ${totalScraped}`);
  console.log(`   - Total Gravados no Banco MySQL: ${totalSaved}`);
  console.log(`   - Todos os arquivos JSON por lote foram salvos em: doc/zombi/char/`);
  console.log('==============================================================\n');
}

scrapeAll().catch(err => {
  console.error('❌ Falha fatal no scraper:', err);
  process.exit(1);
});
