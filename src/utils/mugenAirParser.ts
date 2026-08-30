export interface MugenFrame {
  group: number;
  image: number;
  offsetX: number;
  offsetY: number;
  ticks: number;
  flags: string[];
  filename: string;
}

export interface MugenAnimation {
  actionId: number;
  name: string;
  frames: MugenFrame[];
}

export interface MugenCharacterAnimations {
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

export function parseMugenAir(airContent: string, existingFiles?: Set<string>): MugenCharacterAnimations {
  const lines = airContent.split(/\r?\n/);
  const actions: Record<number, MugenFrame[]> = {};
  let currentActionId: number | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';')) continue;

    // Detecta [Begin Action XXX]
    const actionMatch = line.match(/^\[Begin Action\s+(\d+)\]/i);
    if (actionMatch) {
      currentActionId = parseInt(actionMatch[1], 10);
      actions[currentActionId] = [];
      continue;
    }

    if (currentActionId !== null) {
      // Ignora linhas de colisão Clsn
      if (line.startsWith('Clsn') || line.startsWith('Loopstart')) continue;

      // Linhas de frame: grupo, imagem, offsetX, offsetY, ticks, [flags]
      // Ex: 0, 0, 0, 0, 3, H
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 5) {
        const group = parseInt(parts[0], 10);
        const image = parseInt(parts[1], 10);
        const offsetX = parseInt(parts[2], 10) || 0;
        const offsetY = parseInt(parts[3], 10) || 0;
        const ticks = parseInt(parts[4], 10) || 4;
        const flags = parts.slice(5);

        if (!isNaN(group) && !isNaN(image)) {
          const filename = `${group}-${image}.png`;
          // Se a lista de arquivos existentes foi fornecida, confere se existe
          if (!existingFiles || existingFiles.has(filename)) {
            actions[currentActionId].push({
              group,
              image,
              offsetX,
              offsetY,
              ticks,
              flags,
              filename,
            });
          }
        }
      }
    }
  }

  const allActions: Record<number, string[]> = {};
  for (const [idStr, frames] of Object.entries(actions)) {
    const id = parseInt(idStr, 10);
    if (frames.length > 0) {
      allActions[id] = frames.map(f => f.filename);
    }
  }

  // Mapeia ações padrão do MUGEN
  const getActionFrames = (id: number): string[] => allActions[id] || [];

  const idle = getActionFrames(0);
  const walk = getActionFrames(20).length > 0 ? getActionFrames(20) : idle;
  const walkBack = getActionFrames(21);
  const attackLight = getActionFrames(200).length > 0 ? getActionFrames(200) : (getActionFrames(201) || idle);
  const attackMedium = getActionFrames(210);
  const attackHeavy = getActionFrames(220).length > 0 ? getActionFrames(220) : (getActionFrames(202) || attackLight);
  
  // Especiais: Procura por ações 1000, 100, 10000, 1200, 1300, etc.
  let special = getActionFrames(1000);
  if (special.length === 0) special = getActionFrames(100);
  if (special.length === 0) special = getActionFrames(10000);
  if (special.length === 0) special = attackHeavy;

  // Hit: Ação 5000 (head/face hit) ou 5010 (body hit) ou 5001/5002
  let hit = getActionFrames(5000);
  if (hit.length === 0) hit = getActionFrames(5010);
  if (hit.length === 0) hit = getActionFrames(5001);
  if (hit.length === 0) hit = idle.slice(0, 2);

  // Win: Ação 180 ou 181
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
