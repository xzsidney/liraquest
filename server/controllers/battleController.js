import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  FamilyCharacter,
  FamilyUser,
  UserProgress,
  CharacterAttribute,
  DefinitionSkill,
} from '../models/index.js';

/**
 * POST /api/battle/start
 * Inicia a batalha 2D consumindo 5 de Energia de Aventura e vinculando os atributos da Ficha
 */
export const startBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { player_hero = 'cap', opponent = 'cyclops', energy_cost = 5 } = req.body;

    // 1. Verificar e debitar saldo de Energia do Usuário
    let progress = await UserProgress.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = await UserProgress.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        adventure_energy: 15,
      });
    }

    if ((progress.adventure_energy || 0) < energy_cost) {
      await progress.increment('adventure_energy', { by: 15 });
      await progress.reload();
    }

    await progress.decrement('adventure_energy', { by: energy_cost });
    await progress.reload();

    // 2. Localizar personagem e usuário
    const user = await FamilyUser.findByPk(userId);
    let character = await FamilyCharacter.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CharacterAttribute,
          as: 'attributes_direct',
        },
      ],
    });

    if (!character) {
      character = await FamilyCharacter.create({
        id: randomUUID().toLowerCase(),
        user_id: userId,
        family_id: user?.family_id || randomUUID().toLowerCase(),
        class_code: 'guardiao_do_lar',
        skin_code: 'default',
        level: 1,
        xp: 0,
      });
    }

    // 3. Mapear Atributos (FOR, CON, INT, AGI, CAR, SOR)
    const attrs = character.attributes_direct || {};
    const attrMap = {
      str: attrs.str ?? 12,
      con: attrs.con ?? 12,
      int: attrs.int ?? 10,
      agi: attrs.agi ?? 10,
      cha: attrs.cha ?? 10,
      luk: attrs.luk ?? 10,
    };

    const level = character.level || 1;

    // 4. Calcular Estatísticas de Combate com base na Ficha do Herói
    const maxHp = 180 + (attrMap.con * 18) + (level * 25);
    const maxMp = 70 + (attrMap.int * 8) + (level * 6);
    const atkPhys = 30 + Math.floor(attrMap.str * 3.2);
    const atkMagic = 35 + Math.floor(attrMap.int * 3.5);
    const defense = Math.floor(attrMap.con * 1.5);
    const speedAtb = 10 + Math.floor(attrMap.agi * 0.9);
    const critChance = Math.min(0.5, 0.05 + (attrMap.luk * 0.007));

    // Nomes e descrições temáticas por lutador
    const HERO_THEMES = {
      cap: {
        basicName: 'Soco Direto',
        basicDesc: 'Combo de socos nobres. Gera +15 MP.',
        skills: [
          { name: 'Shield Slash', icon: '🛡️', animId: 1, desc: 'Arremesso giratório do escudo com ricochete.' },
          { name: 'Stars & Stripes', icon: '⭐', animId: 3, desc: 'Gancho ascendente com poeira estelar (Stun).' },
          { name: 'Charging Star', icon: '⚡', animId: 4, desc: 'Investida rápida que quebra a postura inimiga.' },
        ]
      },
      cyclops: {
        basicName: 'Cyclone Kick',
        basicDesc: 'Chute acrobático giratório. Gera +15 MP.',
        skills: [
          { name: 'Optic Blast', icon: '🔴', animId: 2, desc: 'Feixe laser óptico contínuo de alta intensidade.' },
          { name: 'Optic Sweep', icon: '🔻', animId: 5, desc: 'Varredura rasteira de plasma que atrasa o turno.' },
          { name: 'Gene Splice', icon: '✨', animId: 3, desc: 'Gancho aéreo ascendente energizado com plasma.' },
        ]
      },
      spiderman: {
        basicName: 'Combo Aranha',
        basicDesc: 'Sequência veloz de socos e chutes ágeis. Gera +15 MP.',
        skills: [
          { name: 'Web Ball', icon: '🕸️', animId: 1, desc: 'Disparo concentrado de teia que imobiliza o alvo.' },
          { name: 'Web Swing', icon: '🕷️', animId: 4, desc: 'Balanço acrobático na teia com voadora de impacto.' },
          { name: 'Spider Sting', icon: '⚡', animId: 3, desc: 'Gancho duplo com salto acrobático perfurante.' },
        ]
      },
      wolverine: {
        basicName: 'Corte de Adamantium',
        basicDesc: 'Golpe fulminante de garras. Gera +15 MP.',
        skills: [
          { name: 'Berserker Barrage', icon: '🐺', animId: 4, desc: 'Investida furiosa retalhando com faíscas incandescentes.' },
          { name: 'Tornado Claw', icon: '🌪️', animId: 3, desc: 'Gancho ascendente giratório rasgando o ar.' },
          { name: 'Drill Claw', icon: '⚔️', animId: 1, desc: 'Mergulho em parafuso cortante em alta velocidade.' },
        ]
      },
      gambit: {
        basicName: 'Golpe de Bastão Bo',
        basicDesc: 'Ataque tático com bastão telescópico. Gera +15 MP.',
        skills: [
          { name: 'Kinetic Card', icon: '🃏', animId: 1, desc: 'Arremesso de cartas cinéticas carregadas com explosão mágica.' },
          { name: 'Cajun Slash', icon: '💜', animId: 4, desc: 'Salto e golpe descendente com bastão energizado.' },
          { name: 'Cajun Strike', icon: '✨', animId: 3, desc: 'Investida rápida seguida de descarga de energia cinética.' },
        ]
      }
    };

    const currentTheme = HERO_THEMES[player_hero] || HERO_THEMES.cap;

    const basicAction = {
      id: 'basic_attack',
      name: currentTheme.basicName,
      cost: 0,
      mp_gain: 15,
      fury_gain: 12,
      damage_multiplier: 1.0,
      animation_id: 100,
      desc: currentTheme.basicDesc,
      icon: '👊',
    };

    const actionDeck = [
      basicAction,
      ...currentTheme.skills.map((sk, idx) => ({
        id: `skill_${idx + 1}`,
        code: `skill_${player_hero}_${idx + 1}`,
        name: sk.name,
        cost: 15 + (idx * 5),
        damage_multiplier: 1.4 + (idx * 0.3),
        animation_id: sk.animId,
        desc: sk.desc,
        icon: sk.icon,
      })),
    ];

    const opponentHp = Math.floor(maxHp * 0.95);
    const opponentMp = maxMp;
    const opponentAtk = Math.floor(atkPhys * 0.9);
    const opponentDef = Math.floor(defense * 0.9);

    return res.json({
      success: true,
      message: `Batalha iniciada! -${energy_cost} Energia consumida.`,
      battle_id: randomUUID().toLowerCase(),
      energy_remaining: progress.adventure_energy,
      player_hero,
      opponent,
      character: {
        id: character.id,
        name: user?.hero_nickname || user?.name || 'Guardião Lendário',
        level: character.level,
        gold: 100,
        class_name: character.class_code || 'Guardião Lendário',
        attributes: attrMap,
      },
      player_battle_stats: {
        max_hp: maxHp,
        max_mp: maxMp,
        atk_phys: atkPhys,
        atk_magic: atkMagic,
        defense: defense,
        speed_atb: speedAtb,
        crit_chance: critChance,
      },
      opponent_battle_stats: {
        max_hp: opponentHp,
        max_mp: opponentMp,
        atk_phys: opponentAtk,
        atk_magic: opponentAtk,
        defense: opponentDef,
        speed_atb: speedAtb,
      },
      action_deck: actionDeck,
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar batalha 2D:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao iniciar batalha.',
    });
  }
};

/**
 * POST /api/battle/finish
 * Conclui a batalha e credita recompensas (XP e Ouro) na Ficha do Herói
 */
export const finishBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { result, turns_count = 1 } = req.body;

    const isVictory = result === 'VICTORY';
    const goldEarned = isVictory ? 50 : 10;
    const xpEarned = isVictory ? 80 : 25;

    let character = await FamilyCharacter.findOne({ where: { user_id: userId } });
    const user = await FamilyUser.findByPk(userId);
    let leveledUp = false;
    let newLevel = 1;

    if (character) {
      let cXP = (character.xp || 0) + xpEarned;
      let cLevel = character.level || 1;
      let reqXP = cLevel * 100;

      while (cXP >= reqXP) {
        cXP -= reqXP;
        cLevel += 1;
        leveledUp = true;
        reqXP = cLevel * 100;
      }

      await character.update({ xp: cXP, level: cLevel });
      newLevel = cLevel;
    }

    return res.json({
      success: true,
      result: isVictory ? 'VICTORY' : 'DEFEAT',
      message: isVictory
        ? `Vitória triunfante na Arena 2D! +${goldEarned} Ouro, +${xpEarned} XP!`
        : `Combate encerrado. Não desista! +${goldEarned} Ouro, +${xpEarned} XP.`,
      rewards: {
        gold: goldEarned,
        xp: xpEarned,
        leveled_up: leveledUp,
        new_level: newLevel,
      },
      character: character
        ? {
            id: character.id,
            name: user?.hero_nickname || user?.name || 'Guardião Lendário',
            level: character.level,
            gold: 100 + goldEarned,
            current_xp: character.xp,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar batalha 2D:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao registrar resultado da batalha.',
    });
  }
};

/**
 * GET /api/battle/manifest/:hero
 */
export const getHeroManifest = async (req, res) => {
  try {
    const hero = req.params.hero?.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const charDir = path.join(__dirname, '..', '..', 'public', 'assets', 'characters', hero);

    if (!fs.existsSync(charDir)) {
      return res.status(404).json({ success: false, message: `Herói '${hero}' não encontrado em assets.` });
    }

    const manifestPath = path.join(charDir, 'manifest.json');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    const availablePngs = fs.readdirSync(charDir)
      .filter(f => f.toLowerCase().endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
      });

    return res.json({
      success: true,
      hero,
      manifest,
      available_sprites: availablePngs,
    });
  } catch (err) {
    console.error('❌ Erro ao ler manifest do herói:', err);
    return res.status(500).json({ success: false, message: 'Erro ao ler manifest do herói.' });
  }
};

/**
 * POST /api/battle/manifest/:hero
 */
export const saveHeroManifest = async (req, res) => {
  try {
    const hero = req.params.hero?.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const { manifest } = req.body;

    if (!manifest || typeof manifest !== 'object') {
      return res.status(400).json({ success: false, message: 'Estrutura de manifest inválida.' });
    }

    const charDir = path.join(__dirname, '..', '..', 'public', 'assets', 'characters', hero);
    if (!fs.existsSync(charDir)) {
      return res.status(404).json({ success: false, message: `Pasta do herói '${hero}' não encontrada.` });
    }

    const manifestPath = path.join(charDir, 'manifest.json');
    const backupPath = path.join(charDir, 'manifest.backup.json');

    if (fs.existsSync(manifestPath)) {
      fs.copyFileSync(manifestPath, backupPath);
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    return res.json({
      success: true,
      message: `Manifest de '${hero}' salvo com sucesso! Backup criado em manifest.backup.json.`,
      hero,
    });
  } catch (err) {
    console.error('❌ Erro ao salvar manifest do herói:', err);
    return res.status(500).json({ success: false, message: 'Erro ao salvar manifest.' });
  }
};
