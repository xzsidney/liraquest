import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spritesDir = path.resolve(__dirname, '../public/sprites');
const outputJsonPath = path.resolve(__dirname, '../src/data/mugenRegistry.json');

interface MugenCharacterAnimations {
  idle: string[];
  walk: string[];
  walkBack?: string[];
  attackLight: string[];
  attackMedium?: string[];
  attackHeavy: string[];
  special: string[];
  hit: string[];
  win?: string[];
  allActions: Record<number, string[]>;
}

function parseAirFile(airPath: string, characterDir: string): MugenCharacterAnimations | null {
  if (!fs.existsSync(airPath)) return null;

  const content = fs.readFileSync(airPath, 'utf-8');
  const existingFiles = new Set(fs.readdirSync(characterDir));

  const lines = content.split(/\r?\n/);
  const actions: Record<number, string[]> = {};
  let currentActionId: number | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';')) continue;

    const actionMatch = line.match(/^\[Begin Action\s+(\d+)\]/i);
    if (actionMatch) {
      currentActionId = parseInt(actionMatch[1], 10);
      if (!actions[currentActionId]) actions[currentActionId] = [];
      continue;
    }

    if (currentActionId !== null) {
      if (line.startsWith('Clsn') || line.startsWith('Loopstart')) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 5) {
        const group = parseInt(parts[0], 10);
        const image = parseInt(parts[1], 10);

        if (!isNaN(group) && !isNaN(image)) {
          const filename = `${group}-${image}.png`;
          if (existingFiles.has(filename)) {
            actions[currentActionId].push(filename);
          }
        }
      }
    }
  }

  const allActions: Record<number, string[]> = {};
  for (const [idStr, frames] of Object.entries(actions)) {
    const id = parseInt(idStr, 10);
    if (frames.length > 0) {
      allActions[id] = frames;
    }
  }

  const getActionFrames = (id: number): string[] => allActions[id] || [];

  const idle = getActionFrames(0);
  const walk = getActionFrames(20).length > 0 ? getActionFrames(20) : idle;
  const walkBack = getActionFrames(21);
  const attackLight = getActionFrames(200).length > 0 ? getActionFrames(200) : (getActionFrames(201) || idle);
  const attackMedium = getActionFrames(210);
  const attackHeavy = getActionFrames(220).length > 0 ? getActionFrames(220) : (getActionFrames(202) || attackLight);

  let special = getActionFrames(1000);
  if (special.length === 0) special = getActionFrames(100);
  if (special.length === 0) special = getActionFrames(10000);
  if (special.length === 0) special = attackHeavy;

  let hit = getActionFrames(5000);
  if (hit.length === 0) hit = getActionFrames(5010);
  if (hit.length === 0) hit = getActionFrames(5001);
  if (hit.length === 0) hit = idle.slice(0, 2);

  let win = getActionFrames(180);
  if (win.length === 0) win = getActionFrames(181);

  return {
    idle: idle.length > 0 ? idle : ['0-0.png'],
    walk,
    walkBack: walkBack.length > 0 ? walkBack : undefined,
    attackLight,
    attackMedium: attackMedium.length > 0 ? attackMedium : undefined,
    attackHeavy,
    special,
    hit,
    win: win.length > 0 ? win : undefined,
    allActions,
  };
}

function generateRegistry() {
  if (!fs.existsSync(spritesDir)) {
    console.error(`Diretório de sprites não encontrado: ${spritesDir}`);
    return;
  }

  const registry: Record<string, MugenCharacterAnimations> = {};
  const entries = fs.readdirSync(spritesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const charFolder = entry.name;
      const charPath = path.join(spritesDir, charFolder);
      const airFiles = fs.readdirSync(charPath).filter(f => f.toLowerCase().endsWith('.air'));

      if (airFiles.length > 0) {
        const airFile = path.join(charPath, airFiles[0]);
        console.log(`Lendo arquivo .AIR para ${charFolder}: ${airFile}`);
        const parsed = parseAirFile(airFile, charPath);
        if (parsed) {
          registry[charFolder.toLowerCase()] = parsed;
          console.log(`✅ ${charFolder}: ${Object.keys(parsed.allActions).length} ações mapeadas!`);
        }
      }
    }
  }

  const outputDir = path.dirname(outputJsonPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputJsonPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`🎉 mugenRegistry.json gerado com sucesso em: ${outputJsonPath}`);
}

generateRegistry();
