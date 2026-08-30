<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
    <FamilyNavbar />

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
      
      <!-- Cabeçalho da Raid -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#2a0410] via-[#16062b] to-[#041029] p-6 rounded-3xl border-2 border-rose-500/50 shadow-2xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">👥</span>
            <span class="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-700/60">
              Modo Cooperativo Multiplayer (2 a 4 Jogadores)
            </span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-300 via-rose-300 to-amber-400 bg-clip-text text-transparent">
            Raid Épica da Família Lira
          </h1>
          <p class="text-xs md:text-sm text-slate-300">
            Junte os heróis da família em tempo real para derrotar os chefes mais poderosos do reino!
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <router-link
            to="/familia/batalha"
            class="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-slate-700 transition-all flex items-center space-x-2"
          >
            <span>⚔️ Ir para Arena 1v1</span>
          </router-link>
        </div>
      </div>

      <!-- TELA 1: LOBBY DE CONVOCAÇÃO DA RAID -->
      <div v-if="battleState === 'LOBBY'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Coluna 1 e 2: Salão da Party & Heróis Convocados -->
        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-gradient-to-b from-[#1b030b] to-[#080d22] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
            <div class="flex items-center justify-between border-b border-rose-900/40 pb-4">
              <div>
                <h3 class="text-lg font-black text-amber-300 flex items-center space-x-2">
                  <span>🛡️ Grupo de Batalha (Party da Raid)</span>
                </h3>
                <p class="text-xs text-slate-400">Até 4 heróis da família podem lutar juntos simultaneamente</p>
              </div>
              <span class="text-xs font-black text-rose-400 bg-rose-950 px-3 py-1 rounded-xl border border-rose-700/50">
                {{ activePartyLobby.length }}/4 Heróis Prontos
              </span>
            </div>

            <!-- Lista de Membros no Grupo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="member in activePartyLobby"
                :key="member.characterId"
                class="bg-slate-950/80 border-2 border-amber-400/60 p-4 rounded-2xl flex items-center space-x-4 shadow-lg relative overflow-hidden"
              >
                <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-amber-400 shrink-0 flex items-center justify-center">
                  <img :src="getDisplayImageUrl(member.avatarUrl)" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-black text-slate-100 truncate">{{ member.name }}</span>
                    <span v-if="member.isLeader" class="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">LÍDER</span>
                  </div>
                  <p class="text-xs text-amber-300 font-semibold">{{ member.characterClass || 'Guerreiro' }}</p>
                  <p class="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Pronto para o Combate</span>
                  </p>
                </div>
              </div>

              <!-- Slots Vazios de Convocação -->
              <div
                v-for="slot in Math.max(0, 4 - activePartyLobby.length)"
                :key="`slot-${slot}`"
                class="border-2 border-dashed border-slate-800 bg-slate-950/40 p-4 rounded-2xl flex items-center justify-center text-center text-slate-500 text-xs font-bold space-x-2"
              >
                <span>➕</span>
                <span>Aguardando Convocação de Irmão / Parente</span>
              </div>
            </div>

            <!-- Botão Iniciar Raid (Disponível para todos ou Líder) -->
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
              <p class="text-xs text-slate-400">
                O combate é sincronizado em tempo real por WebSockets.
              </p>
              <button
                @click="startRaidBattle"
                class="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 font-black text-sm py-3.5 px-8 rounded-2xl shadow-xl shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center space-x-2"
              >
                <span>🔥 Iniciar Raid Cooperativa!</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Coluna 3: Convocação de Membros da Família Online -->
        <div class="space-y-6">
          <div class="bg-gradient-to-b from-[#1b030b] to-[#080d22] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 class="text-sm font-black text-amber-300 flex items-center space-x-2">
              <span>📱 Heróis da Família Conectados</span>
            </h3>
            <p class="text-xs text-slate-400">Clique para convidar e adicionar à sala de combate:</p>

            <div class="space-y-3">
              <div
                v-for="hero in members"
                :key="hero.id"
                class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <img :src="getDisplayImageUrl(hero.avatarUrl)" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p class="text-xs font-black text-slate-100">{{ hero.name }}</p>
                    <p class="text-[10px] text-amber-300 font-semibold">{{ hero.characterClass }} • Nv. {{ hero.level }}</p>
                  </div>
                </div>

                <div>
                  <button
                    v-if="!isInParty(hero.id)"
                    @click="inviteHeroToParty(hero)"
                    class="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow transition-all cursor-pointer"
                  >
                    + Convidar
                  </button>
                  <span v-else class="text-[10px] font-black text-amber-400 bg-amber-950 px-2 py-1 rounded-lg border border-amber-600/40">
                    No Grupo ✓
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- TELA 2: ARENA DE BATALHA MULTIPLAYER CO-OP -->
      <div v-else-if="battleState === 'BATTLE' && battle" class="space-y-6">
        
        <!-- Placar e Vidas da Raid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Time dos Heróis -->
          <div class="bg-gradient-to-r from-[#1c040d] to-[#0a122e] border-2 border-amber-400/60 p-4 rounded-3xl shadow-xl flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🛡️</span>
              <div>
                <h3 class="text-sm font-black text-amber-300">Esquadrão da Família Lira</h3>
                <p class="text-[10px] text-slate-400">{{ activePartyLobby.length }} Heróis em Campo</p>
              </div>
            </div>
            <div class="text-right">
              <span v-if="isMyTurn" class="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full animate-pulse">
                ⚡ SEU TURNO!
              </span>
              <span v-else class="text-xs font-bold text-slate-400">
                Vez de: {{ currentTurnHeroName }}
              </span>
            </div>
          </div>

          <!-- Barra do Chefe -->
          <div class="bg-gradient-to-r from-[#2a0410] to-[#12051f] border-2 border-rose-500/80 p-4 rounded-3xl shadow-xl flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">👹</span>
              <div>
                <h3 class="text-sm font-black text-rose-300">{{ battle.monsterName }}</h3>
                <p class="text-[10px] text-rose-400 font-bold">{{ battle.monsterHpCurrent }}/{{ battle.monsterHpMax }} HP</p>
              </div>
            </div>
            <div class="w-1/2 bg-slate-950 rounded-full h-3.5 overflow-hidden border border-rose-600/60">
              <div
                class="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300"
                :style="{ width: `${Math.max(0, Math.min(100, (battle.monsterHpCurrent / battle.monsterHpMax) * 100))}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Palco do Grid e Sprites da Raid -->
        <div class="bg-gradient-to-b from-[#14020a] via-[#090b1e] to-[#040817] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
          
          <!-- Sprites no Palco -->
          <div class="w-full flex items-end justify-between px-6 md:px-16 mb-8 relative">
            
            <!-- Heróis do Grupo Lado a Lado -->
            <div class="flex items-end space-x-2 md:space-x-4">
              <div
                v-for="member in activePartyLobby"
                :key="member.characterId"
                class="flex flex-col items-center"
              >
                <div class="text-[10px] font-black text-amber-300 bg-black/60 px-2 py-0.5 rounded-md mb-1 border border-amber-500/30">
                  {{ member.name }}
                </div>
                <SpriteFighter
                  :character="getSpriteKey(member.avatarUrl)"
                  :state="member.characterId === activeCharacter?.id ? heroSpriteState : 'idle'"
                  :scale="1.25"
                />
              </div>
            </div>

            <!-- Chefe / Boss (Colossus) -->
            <div class="flex flex-col items-center">
              <div class="text-[10px] font-black text-rose-300 bg-black/60 px-2 py-0.5 rounded-md mb-1 border border-rose-500/30">
                {{ battle.monsterName }}
              </div>
              <SpriteFighter
                character="colossus"
                :state="monsterSpriteState"
                :flip="true"
                :scale="1.45"
              />
            </div>

          </div>

          <!-- Grid Tático -->
          <div class="w-full max-w-2xl bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-1">
            <div
              v-for="cell in 10"
              :key="cell - 1"
              :class="[
                'flex-1 h-9 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all',
                heroGridPos === (cell - 1) ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg' :
                monsterGridPos === (cell - 1) ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg' :
                'bg-slate-900/60 border-slate-800 text-slate-500'
              ]"
            >
              {{ heroGridPos === (cell - 1) ? 'HERÓIS' : monsterGridPos === (cell - 1) ? 'BOSS' : (cell - 1) }}
            </div>
          </div>

        </div>

        <!-- Painel de Ações de Combate da Raid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-gradient-to-b from-[#1b030b] to-[#080d22] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 class="text-xs font-black uppercase tracking-wider text-amber-300">
              🎮 Comandos do seu Herói no Turno:
            </h4>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                :disabled="!isMyTurn"
                @click="executeRaidAttack('LIGHT')"
                class="bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-600 text-white font-black text-xs py-3 px-2 rounded-2xl shadow border border-orange-400 flex flex-col items-center justify-center space-y-1 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="text-xl">👊</span>
                <span>Golpe Rápido</span>
              </button>

              <button
                :disabled="!isMyTurn"
                @click="executeRaidAttack('HEAVY')"
                class="bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 text-white font-black text-xs py-3 px-2 rounded-2xl shadow border border-rose-400 flex flex-col items-center justify-center space-y-1 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="text-xl">💥</span>
                <span>Golpe Forte</span>
              </button>

              <button
                :disabled="!isMyTurn"
                @click="executeRaidAttack('RANGED')"
                class="bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 text-white font-black text-xs py-3 px-2 rounded-2xl shadow border border-teal-400 flex flex-col items-center justify-center space-y-1 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="text-xl">🕸️</span>
                <span>Ataque à Distância</span>
              </button>

              <button
                :disabled="!isMyTurn"
                @click="executeRaidDefend"
                class="bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 text-white font-black text-xs py-3 px-2 rounded-2xl shadow border border-blue-400 flex flex-col items-center justify-center space-y-1 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="text-xl">🛡️</span>
                <span>Defender</span>
              </button>
            </div>
          </div>

          <!-- Logs da Raid em Tempo Real -->
          <div class="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 flex flex-col h-[260px]">
            <h4 class="text-xs font-black uppercase text-amber-300 mb-2">📜 Diário da Raid Co-op</h4>
            <div class="flex-1 overflow-y-auto space-y-2 text-xs text-slate-300">
              <div v-for="(log, idx) in formattedBattleLogs" :key="idx" class="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                {{ log }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal de Vitória da Raid -->
      <div v-if="battle?.status === 'VICTORY'" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-slate-900 to-amber-950 border-2 border-amber-400 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-5 animate-bounce">
          <div class="text-6xl">🏆</div>
          <h2 class="text-3xl font-black text-amber-300">VITÓRIA DA FAMÍLIA!</h2>
          <p class="text-sm text-slate-300">
            A Raid foi um sucesso e o chefe foi derrotado em equipe!
          </p>
          <div class="space-y-2">
            <button
              @click="resetRaidLobby"
              class="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-3 px-6 rounded-2xl shadow cursor-pointer active:scale-95"
            >
              👥 Jogar Outra Raid
            </button>
            <router-link
              to="/familia/sala"
              class="block w-full bg-slate-900 text-slate-300 font-bold py-2.5 rounded-2xl text-xs"
            >
              🏠 Voltar ao Salão
            </router-link>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import confetti from 'canvas-confetti';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import SpriteFighter from '../../components/family/SpriteFighter.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import {
  getFamilySocket,
  joinFamilyRoom,
  createPartyLobby,
  sendPartyInvite,
  startPartyBattle,
  sendFamilyBattleAction,
  activePartyLobby,
} from '../../services/familySocket';

const battleState = ref<'LOBBY' | 'BATTLE'>('LOBBY');
const battle = ref<any | null>(null);
const members = ref<any[]>([]);
const activeCharacter = ref<any>(null);

const heroSpriteState = ref<'idle' | 'walk' | 'walkBack' | 'attack' | 'attackLight' | 'attackHeavy' | 'special' | 'hit' | 'win'>('idle');
const monsterSpriteState = ref<'idle' | 'walk' | 'walkBack' | 'attack' | 'attackLight' | 'attackHeavy' | 'special' | 'hit' | 'win'>('idle');

const heroGridPos = computed(() => {
  if (!battle.value || !activeCharacter.value) return 3;
  return battle.value.gridPositions?.[activeCharacter.value.id] ?? 3;
});

const monsterGridPos = computed(() => {
  if (!battle.value) return 6;
  return battle.value.gridPositions?.monster ?? 6;
});

const isMyTurn = computed(() => {
  if (!battle.value || !activeCharacter.value) return false;
  return battle.value.currentTurnCharacterId === activeCharacter.value.id;
});

const currentTurnHeroName = computed(() => {
  if (!battle.value) return '';
  const heroId = battle.value.currentTurnCharacterId;
  const found = activePartyLobby.value.find((p: any) => p.characterId === heroId);
  return found ? found.name : 'Outro Membro';
});

const formattedBattleLogs = computed(() => {
  if (!battle.value || !battle.value.logs) return [];
  if (Array.isArray(battle.value.logs)) return battle.value.logs;
  try {
    return JSON.parse(battle.value.logs);
  } catch {
    return [battle.value.logs];
  }
});

function getSpriteKey(avatarUrl?: string) {
  if (!avatarUrl) return 'capamerica';
  if (avatarUrl.startsWith('sprite:')) {
    return avatarUrl.replace('sprite:', '');
  }
  return 'capamerica';
}

function isInParty(characterId: string) {
  return activePartyLobby.value.some((p: any) => p.characterId === characterId);
}

function inviteHeroToParty(hero: any) {
  if (!activeCharacter.value) return;
  sendPartyInvite(activeCharacter.value.name, activeCharacter.value.id, 'O Golem da Bagunça');
  alert(`📨 Convite de Raid enviado para ${hero.name}! Um alerta foi exibido na tela dele para aceitar.`);
}

function startRaidBattle() {
  if (activePartyLobby.value.length === 0 && activeCharacter.value) {
    createPartyLobby(activeCharacter.value);
  }
  startPartyBattle(activePartyLobby.value, false);
}

function executeRaidAttack(type: 'LIGHT' | 'HEAVY' | 'RANGED') {
  if (!battle.value || !activeCharacter.value) return;

  if (type === 'LIGHT') {
    heroSpriteState.value = 'attackLight';
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'ATTACK', 'Golpe Rápido', undefined, 'STAY');
  } else if (type === 'HEAVY') {
    heroSpriteState.value = 'attackHeavy';
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'ATTACK', 'Golpe Forte', undefined, 'STAY');
  } else {
    heroSpriteState.value = 'special';
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'SKILL', 'Disparo à Distância', 'ranged_move', 'STAY');
  }

  setTimeout(() => { heroSpriteState.value = 'idle'; }, 500);
}

function executeRaidDefend() {
  if (!battle.value || !activeCharacter.value) return;
  sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'DEFEND', undefined, undefined, 'STAY');
}

function resetRaidLobby() {
  battleState.value = 'LOBBY';
  battle.value = null;
  heroSpriteState.value = 'idle';
  monsterSpriteState.value = 'idle';
}

onMounted(async () => {
  try {
    const savedCharId = localStorage.getItem('lira_active_family_char_id');
    const membersRes = await familyApi.getMembers();
    if (membersRes.success && membersRes.members.length > 0) {
      members.value = membersRes.members;
      activeCharacter.value = members.value.find((m: any) => m.id === savedCharId) || members.value[0];
    }

    if (activeCharacter.value) {
      joinFamilyRoom(activeCharacter.value.id, activeCharacter.value.name);
      createPartyLobby(activeCharacter.value);
    }

    const socket = getFamilySocket();

    socket.on('family:battle_party_started', (data: any) => {
      battle.value = data.battle;
      battleState.value = 'BATTLE';
    });

    socket.on('family:battle_updated', (data: any) => {
      battle.value = data.battle;
      battleState.value = 'BATTLE';
    });

    socket.on('family:battle_victory', (data: any) => {
      battle.value = data.battle;
      heroSpriteState.value = 'win';
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    });
  } catch (err) {
    console.error('Erro ao inicializar tela de Raid:', err);
  }
});
</script>
