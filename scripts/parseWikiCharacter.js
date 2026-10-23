import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, DefinitionMzCharacter } from '../server/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/1\*/g, '1 Poder')
    .replace(/2\*/g, '2 Poderes')
    .replace(/3\*/g, '3 Poderes')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBox(raw) {
  if (!raw) return 'Caixa Base: Marvel Zombies';
  const s = raw.trim();
  if (s.includes('básica') || s.includes('Caixa Base') || s.includes('Marvel Zombies')) return 'Caixa Base: Marvel Zombies';
  if (s.includes('X-Men Resistance') || s.includes('Resistência dos X-Men')) return 'Caixa: Marvel Zombies: X-Men Resistance';
  if (s.includes("Heroes' Resistance") || s.includes('Resistência dos Heróis')) return "Caixa: Marvel Zombies: Heroes' Resistance";
  if (s.includes('Kickstarter') || s.includes('Promos')) return 'Caixa Promocional: Kickstarter Promos';
  if (s.includes('Fantastic 4') || s.includes('Quarteto')) return 'Expansão: Fantastic 4: Under Siege';
  if (s.includes('Guardians') || s.includes('Guardiões')) return 'Expansão: Guardians of the Galaxy Set';
  if (s.includes('Sentinel Strike') || s.includes('Sentinela')) return 'Expansão: Sentinel Strike';
  if (s.includes('Sinister Six') || s.includes('Sexteto')) return 'Expansão: Clash of the Sinister Six';
  if (s.includes('Galactus')) return 'Expansão: Galactus the Devourer';
  if (s.includes('Artist') || s.includes('Artista')) return "Expansão: Artist's Special Edition Set";
  if (s.includes('Hydra')) return 'Expansão: Hydra Resurrection';
  return s;
}

export async function parseWikiCharacterFile() {
  const filePath = path.resolve(__dirname, '../doc/zombi/char/elemento_Persoangem.txt');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    return null;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Extrair Nome
  let name = '';
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    name = cleanHtml(h1Match[1]);
  } else {
    const titleMatch = html.match(/data-source="title1"[^>]*>([\s\S]*?)<\/h2>/i);
    if (titleMatch) name = cleanHtml(titleMatch[1]);
  }

  // 2. Extrair Caixa
  let boxName = 'Caixa Base: Marvel Zombies';
  const boxMatch = html.match(/data-source="box"[\s\S]*?<div class="pi-data-value[^"]*">([\s\S]*?)<\/div>/i);
  if (boxMatch) {
    boxName = normalizeBox(cleanHtml(boxMatch[1]));
  }

  // Slug code
  const code = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  console.log(`📋 Analisando Personagem: "${name}" (${code})`);
  console.log(`📦 Caixa Principal: "${boxName}"`);

  // 3. Procurar tabelas de habilidades
  const tables = html.match(/<table class="article-table"[\s\S]*?<\/table>/gi) || [];
  console.log(`📊 Tabelas de habilidades encontradas: ${tables.length}`);

  let heroAttack = { name: 'Ataque Padrão', range: '0', dice: 3, accuracy: 4 };
  let heroSkills = { blue: '', yellow: '+1 Ação', orange: '', red: '' };

  let zombieAttack = null;
  let zombieSkills = null;

  let bossHp = 4;
  let bossAbility = '';

  tables.forEach((tableHtml, idx) => {
    const tableText = cleanHtml(tableHtml);

    // Identificar se a tabela é de Herói, Herói Zumbi ou Spawn
    const isZombie = /Herói Zumbi|Zombie Hero/i.test(tableHtml);
    const isSpawn = /Geração de Heróis|Hero Spawn/i.test(tableHtml);

    // Extrair Ataque da tabela
    const abilityMatch = tableHtml.match(/Habilidade:\s*([^<]+)/i) || tableHtml.match(/Ability:\s*([^<]+)/i);
    const attackName = abilityMatch ? cleanHtml(abilityMatch[1]) : 'Ataque';

    // Extrair Linha de Valores de Ataque (Tipo, Faixa/Range, Dados/Dice, Precisão/Accuracy)
    const attackRows = tableHtml.match(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/gi);
    let parsedRange = '0';
    let parsedDice = 3;
    let parsedAcc = 4;

    if (attackRows && attackRows.length > 0) {
      const lastRow = attackRows[attackRows.length - 1];
      const cells = lastRow.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (cells.length >= 4) {
        parsedRange = cleanHtml(cells[1]).replace(/[^0-9\-]/g, '') || '0';
        parsedDice = parseInt(cleanHtml(cells[2]), 10) || 3;
        parsedAcc = parseInt(cleanHtml(cells[3]).replace(/[^0-9]/g, ''), 10) || 4;
      }
    }

    // Extrair Habilidades por Cor (Azul, Amarelo, Laranja, Vermelho)
    const skillRowMatch = tableHtml.match(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/i);
    let blueText = '';
    let yellowText = '+1 Ação';
    let orangeText = '';
    let redText = '';

    if (skillRowMatch) {
      const cells = skillRowMatch[0].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (cells.length >= 4) {
        blueText = cleanHtml(cells[0]);
        yellowText = cleanHtml(cells[1]);
        orangeText = cleanHtml(cells[2]);
        redText = cleanHtml(cells[3]);
      }
    }

    if (isSpawn) {
      // Spawn table
      const hpMatch = tableText.match(/(?:RP|Vida|HP)\s*(\d+)/i) || tableText.match(/(\d+)\s*(?:Aparece|Surge|Spawn)/i);
      if (hpMatch) bossHp = parseInt(hpMatch[1], 10);
      const abilityCells = tableHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (abilityCells.length > 0) {
        bossAbility = cleanHtml(abilityCells[abilityCells.length - 1]);
      }
    } else if (isZombie) {
      zombieAttack = { name: attackName, range: parsedRange, dice: parsedDice, accuracy: parsedAcc };
      zombieSkills = { blue: blueText, yellow: yellowText, orange: orangeText, red: redText };
    } else if (idx === 0) {
      // Primeira tabela geralmente é Herói Vivo principal
      heroAttack = { name: attackName, range: parsedRange, dice: parsedDice, accuracy: parsedAcc };
      heroSkills = { blue: blueText, yellow: yellowText, orange: orangeText, red: redText };
    }
  });

  // Checar se o texto da página diz explicitamente que não tem versão zumbi
  const hasZombie = !/não possui uma versão zumbi|does not have a zombie version|sem versão zumbi/i.test(html) && !!zombieAttack;
  const hasHero = !!heroSkills.blue;
  const hasBoss = !!bossAbility || hasZombie;

  const profiles = {};
  if (hasHero) {
    profiles.super_hero = {
      attack: heroAttack,
      skills: heroSkills,
    };
  }
  if (hasZombie && zombieAttack) {
    profiles.zombie_hero = {
      attack: zombieAttack,
      skills: zombieSkills,
    };
  }
  if (hasBoss && bossAbility) {
    profiles.boss_enemy = {
      health: bossHp,
      ability: bossAbility,
    };
  }

  const result = {
    code,
    name,
    box_name: boxName,
    has_super_hero: hasHero,
    has_zombie_hero: hasZombie,
    has_boss_enemy: hasBoss,
    boss_health: hasBoss ? bossHp : null,
    boss_ability: hasBoss ? bossAbility : null,
    profiles,
  };

  return result;
}

// Se executado diretamente pelo terminal
if (process.argv[1] && process.argv[1].endsWith('parseWikiCharacter.js')) {
  (async () => {
    try {
      console.log('🚀 Iniciando leitura de elemento_Persoangem.txt...');
      const char = await parseWikiCharacterFile();
      if (!char) return;

      console.log('\n📄 Dados Extraídos com Sucesso:');
      console.log(JSON.stringify(char, null, 2));

      console.log('\n🔌 Conectando ao MySQL...');
      await sequelize.authenticate();

      const existing = await DefinitionMzCharacter.findOne({ where: { code: char.code } });
      if (existing) {
        await existing.update(char);
        console.log(`🔄 Personagem '${char.name}' (${char.code}) ATUALIZADO no banco de dados!`);
      } else {
        await DefinitionMzCharacter.create(char);
        console.log(`✨ Personagem '${char.name}' (${char.code}) CRIADO no banco de dados!`);
      }

      // Atualizar arquivo de curadoria
      const curPath = path.resolve(__dirname, '../doc/zombi/char/curated_characters.json');
      let curated = {};
      if (fs.existsSync(curPath)) {
        try { curated = JSON.parse(fs.readFileSync(curPath, 'utf8')); } catch(e) {}
      }
      curated[char.code] = {
        id: char.code,
        name: char.name,
        box: char.box_name,
        profiles: char.profiles,
      };
      fs.writeFileSync(curPath, JSON.stringify(curated, null, 2), 'utf8');
      console.log(`💾 Registrado em doc/zombi/char/curated_characters.json`);

      process.exit(0);
    } catch (err) {
      console.error('❌ Erro:', err);
      process.exit(1);
    }
  })();
}
