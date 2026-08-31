import sequelize from '../server/config/database';
import { 
  FamilyCharacter, 
  FamilyTask, 
  FamilyShopItem, 
  FamilyLocation, 
  FamilyClassSkill,
  FamilyStoryAdventure,
  FamilyStoryNode,
  FamilyStoryChoice
} from '../server/models';

async function seed() {
  try {
    console.log('🔄 Conectando para popular dados base na Hostinger...');
    await sequelize.authenticate();

    // 1. Heróis Iniciais da Família (se não existirem)
    const charCount = await FamilyCharacter.count();
    if (charCount === 0) {
      console.log('🌱 Criando heróis iniciais da família...');
      await FamilyCharacter.bulkCreate([
        {
          name: 'Sidney Lira',
          characterClass: 'GUERREIRO',
          title: 'O Patriarca Guardião',
          avatarUrl: 'sprite:capamerica',
          level: 5,
          currentXp: 120,
          nextLevelXp: 500,
          gold: 250,
          hpCurrent: 180,
          hpMax: 180,
          mpCurrent: 60,
          mpMax: 60,
          strength: 18,
          vitality: 16,
          agility: 12,
          wisdom: 10,
          heartBond: 15,
          isParent: true,
          orderIndex: 0,
        },
        {
          name: 'Arthur Lira',
          characterClass: 'MAGO',
          title: 'O Aprendiz Arcano',
          avatarUrl: 'sprite:spiderman',
          level: 3,
          currentXp: 80,
          nextLevelXp: 300,
          gold: 150,
          hpCurrent: 110,
          hpMax: 110,
          mpCurrent: 120,
          mpMax: 120,
          strength: 8,
          vitality: 10,
          agility: 14,
          wisdom: 18,
          heartBond: 14,
          isParent: false,
          orderIndex: 1,
        },
        {
          name: 'Herói Mirim',
          characterClass: 'ARQUEIRO',
          title: 'O Caçador Veloz',
          avatarUrl: 'sprite:kenshin',
          level: 2,
          currentXp: 40,
          nextLevelXp: 200,
          gold: 80,
          hpCurrent: 100,
          hpMax: 100,
          mpCurrent: 70,
          mpMax: 70,
          strength: 10,
          vitality: 10,
          agility: 16,
          wisdom: 12,
          heartBond: 12,
          isParent: false,
          orderIndex: 2,
        },
      ]);
      console.log('✅ Heróis criados com sucesso!');
    }

    // 2. Habilidades das Classes (Árvore de Talentos)
    const skillCount = await FamilyClassSkill.count();
    if (skillCount === 0) {
      console.log('🌱 Criando Árvore de Talentos...');
      await FamilyClassSkill.bulkCreate([
        // Guerreiro
        {
          characterClass: 'GUERREIRO',
          tier: 1,
          name: 'Golpe Demolidor',
          description: 'Desfere um golpe pesado causando grande dano físico.',
          icon: '⚔️',
          costXp: 50,
          effectType: 'DAMAGE',
          power: 35,
          costMp: 15,
          orderIndex: 1,
        },
        {
          characterClass: 'GUERREIRO',
          tier: 2,
          name: 'Grito de Guerra',
          description: 'Aumenta o espírito de combate e concede escudo ao grupo.',
          icon: '🛡️',
          costXp: 120,
          effectType: 'SHIELD',
          power: 30,
          costMp: 20,
          orderIndex: 2,
        },
        {
          characterClass: 'GUERREIRO',
          tier: 3,
          name: 'Fúria dos Titãs',
          description: 'Golpe supremo que causa dano colossal e atordoa o inimigo.',
          icon: '💥',
          costXp: 250,
          effectType: 'DAMAGE',
          power: 80,
          costMp: 40,
          orderIndex: 3,
        },
        // Mago
        {
          characterClass: 'MAGO',
          tier: 1,
          name: 'Bola de Fogo',
          description: 'Lança uma esfera flamejante de longo alcance.',
          icon: '🔥',
          costXp: 50,
          effectType: 'DAMAGE',
          power: 40,
          costMp: 20,
          orderIndex: 1,
        },
        {
          characterClass: 'MAGO',
          tier: 2,
          name: 'Tempestade de Gelo',
          description: 'Congela a área e reduz a velocidade do chefe.',
          icon: '❄️',
          costXp: 120,
          effectType: 'DAMAGE',
          power: 55,
          costMp: 30,
          orderIndex: 2,
        },
        {
          characterClass: 'MAGO',
          tier: 3,
          name: 'Meteoro Arcano',
          description: 'Invoca uma chuva de meteoros devastadora.',
          icon: '☄️',
          costXp: 250,
          effectType: 'DAMAGE',
          power: 95,
          costMp: 50,
          orderIndex: 3,
        },
        // Curandeira
        {
          characterClass: 'CURANDEIRA',
          tier: 1,
          name: 'Toque Restaurador',
          description: 'Cura ferimentos de um aliado.',
          icon: '✨',
          costXp: 50,
          effectType: 'HEAL',
          power: 45,
          costMp: 15,
          orderIndex: 1,
        },
        {
          characterClass: 'CURANDEIRA',
          tier: 2,
          name: 'Aura da Família',
          description: 'Restaura a vida de todos os membros do grupo na Raid.',
          icon: '💖',
          costXp: 130,
          effectType: 'HEAL',
          power: 35,
          costMp: 35,
          orderIndex: 2,
        },
        {
          characterClass: 'CURANDEIRA',
          tier: 3,
          name: 'Milagre Divino',
          description: 'Cura total e escudo protetor sagrado.',
          icon: '🌟',
          costXp: 250,
          effectType: 'HEAL',
          power: 90,
          costMp: 55,
          orderIndex: 3,
        },
      ]);
      console.log('✅ Árvore de Habilidades criada!');
    }

    // 3. Mural de Tarefas Iniciais
    const taskCount = await FamilyTask.count();
    if (taskCount === 0) {
      console.log('🌱 Criando mural inicial de tarefas...');
      await FamilyTask.bulkCreate([
        {
          title: 'Arrumar o Quarto e a Cama',
          description: 'Deixar os brinquedos organizados e a cama bem arrumada.',
          category: 'CHORE',
          rewardXp: 50,
          rewardGold: 15,
          icon: '🛏️',
          cooldownHours: 24,
          isActive: true,
        },
        {
          title: 'Fazer Lição de Casa / Estudo de 30 min',
          description: 'Concluir as tarefas escolares com foco total.',
          category: 'STUDY',
          rewardXp: 80,
          rewardGold: 25,
          icon: '📚',
          cooldownHours: 24,
          isActive: true,
        },
        {
          title: 'Escovar os Dentes Após as Refeições',
          description: 'Manter a higiene e a saúde bucal impecáveis.',
          category: 'HEALTH',
          rewardXp: 30,
          rewardGold: 10,
          icon: '🪥',
          cooldownHours: 12,
          isActive: true,
        },
        {
          title: 'Ajudar a Colocar ou Tirar a Mesa',
          description: 'Colaborar nas refeições da família com carinho e união.',
          category: 'VIRTUE',
          rewardXp: 40,
          rewardGold: 15,
          icon: '🍽️',
          cooldownHours: 12,
          isActive: true,
        },
      ]);
      console.log('✅ Tarefas iniciais criadas!');
    }

    // 4. Loja do Reino
    const shopCount = await FamilyShopItem.count();
    if (shopCount === 0) {
      console.log('🌱 Criando itens na Loja do Reino...');
      await FamilyShopItem.bulkCreate([
        {
          name: '1 Hora de Videogame Livre',
          description: 'Tempo extra de diversão no console ou computador.',
          itemType: 'REAL_REWARD',
          costGold: 60,
          icon: '🎮',
          stock: -1,
          isAvailable: true,
        },
        {
          name: 'Passeio Especial com Sorvete',
          description: 'Um passeio divertido com direito a sorvete.',
          itemType: 'REAL_REWARD',
          costGold: 150,
          icon: '🍦',
          stock: -1,
          isAvailable: true,
        },
        {
          name: 'Espada de Ferro Valiriana',
          description: 'Aumenta a Força em +5 pontos nos combates da Arena e Raids.',
          itemType: 'GAME_EQUIPMENT',
          costGold: 80,
          statsJson: { strength: 5 },
          icon: '⚔️',
          stock: -1,
          isAvailable: true,
        },
        {
          name: 'Poção Maior de Vida',
          description: 'Restaura 80 pontos de HP instantaneamente.',
          itemType: 'GAME_POTION',
          costGold: 30,
          icon: '🧪',
          stock: -1,
          isAvailable: true,
        },
      ]);
      console.log('✅ Itens da Loja criados!');
    }

    // 5. Radar de Localidades
    const locCount = await FamilyLocation.count();
    if (locCount === 0) {
      console.log('🌱 Criando localidades do Radar do Reino...');
      await FamilyLocation.bulkCreate([
        {
          name: 'O Quarto Real',
          category: 'HOUSE',
          description: 'Local de repouso, organização e concentração dos heróis.',
          icon: '🛏️',
          bgImageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
          orderIndex: 1,
          isUnlocked: true,
        },
        {
          name: 'A Sala de Estudos & Biblioteca',
          category: 'HOUSE',
          description: 'Templo do conhecimento onde o foco AFK concede bônus de XP.',
          icon: '📚',
          bgImageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
          orderIndex: 2,
          isUnlocked: true,
        },
        {
          name: 'O Salão de Banquetes (Cozinha)',
          category: 'HOUSE',
          description: 'Onde a energia é restaurada e a família se reúne.',
          icon: '🍽️',
          bgImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
          orderIndex: 3,
          isUnlocked: true,
        },
        {
          name: 'A Arena da Masmorra Real',
          category: 'SPECIAL',
          description: 'Onde os Chefes Colossais são enfrentados em Raids cooperativas.',
          icon: '🏰',
          bgImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
          orderIndex: 4,
          isUnlocked: true,
        },
      ]);
      console.log('✅ Localidades do Radar criadas!');
    }

    console.log('\n🎉 CARGA INICIAL COMPLETA! O banco de dados da Hostinger está pronto!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
