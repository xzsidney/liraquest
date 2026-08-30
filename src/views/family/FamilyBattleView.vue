<template>
  <div class="min-h-screen bg-gradient-to-b from-[#140207] via-[#090614] to-[#020817] text-slate-100 font-sans relative overflow-hidden pb-12">
    <FamilyNavbar />

    <div class="p-3 md:p-6 max-w-6xl mx-auto space-y-6">
      
      <!-- Modal / Toast de Convite de Batalha Recebido -->
      <transition name="slide-down">
        <div 
          v-if="incomingBattleInvite && incomingBattleInvite.leaderId !== activeCharacter?.id"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4"
        >
          <div class="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">⚔️</span>
              <div>
                <p class="text-xs font-extrabold uppercase tracking-wider text-amber-300">Convite de Batalha!</p>
                <p class="text-sm font-bold text-slate-100">
                  <strong>{{ incomingBattleInvite.leaderName }}</strong> te chamou para enfrentar <em>{{ incomingBattleInvite.monsterName }}</em>!
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="acceptInvite"
                class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow transition-all active:scale-95 cursor-pointer"
              >
                Aceitar!
              </button>
              <button
                @click="incomingBattleInvite = null"
                class="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 cursor-pointer"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ========================================================================= -->
      <!-- ESTADO 1: LOBBY DE FORMAÇÃO DO GRUPO (ANTES DE INICIAR A LUTA) -->
      <!-- ========================================================================= -->
      <div v-if="battleState === 'LOBBY'" class="space-y-6">
        
        <div class="flex items-center justify-between pb-4 border-b border-rose-900/60">
          <div>
            <h1 class="text-2xl md:text-3xl font-black text-rose-400 flex items-center space-x-2">
              <span>⚔️ Arena Arcade da Família Lira</span>
            </h1>
            <p class="text-xs md:text-sm text-slate-400">Jogue Solo ou convide os membros online para lutar em grupo no Grid Tático!</p>
          </div>
          <div class="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Lobby Aberto</span>
          </div>
        </div>

        <!-- Card de Apresentação do Chefe -->
        <div class="bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 border-2 border-rose-500/40 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl">
          <div class="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-3xl overflow-hidden border-4 border-rose-500 shadow-2xl shadow-rose-500/30 mb-4 bg-slate-800">
            <img :src="monsterInfo.avatar" :alt="monsterInfo.name" class="w-full h-full object-cover" />
          </div>
          <span class="text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-2 inline-block">
            Chefe da Masmorra
          </span>
          <h2 class="text-2xl md:text-3xl font-black text-slate-100">{{ monsterInfo.name }}</h2>
          <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">{{ monsterInfo.description }}</p>
        </div>

        <!-- Área de Formação de Grupo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Heróis no Lobby -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-black text-slate-200">🛡️ Heróis no Grupo:</h3>
                <span class="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {{ activePartyLobby.length }} no Grupo
                </span>
              </div>

              <div class="space-y-2 mb-4">
                <div
                  v-for="p in activePartyLobby"
                  :key="p.characterId"
                  class="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800"
                >
                  <div class="flex items-center space-x-3">
                    <img :src="getDisplayImageUrl(p.avatarUrl)" class="w-10 h-10 rounded-xl object-cover border border-amber-400/60" />
                    <div>
                      <p class="text-xs font-bold text-slate-100">{{ p.name }}</p>
                      <p class="text-[10px] text-amber-400 font-semibold">{{ p.characterClass }}</p>
                    </div>
                  </div>
                  <span v-if="p.isLeader" class="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                    👑 Líder
                  </span>
                </div>
              </div>
            </div>

            <!-- Botões de Início -->
            <div class="space-y-3 pt-4 border-t border-slate-800">
              <button
                @click="startSoloBattle"
                class="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-rose-600/30 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span class="text-xl">⚔️</span>
                <span>Iniciar Batalha 2D Solo (Posição 3 vs 6)</span>
              </button>

              <button
                v-if="activePartyLobby.length > 1"
                @click="startPartyBattleGroup"
                class="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-3 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span class="text-lg">🛡️</span>
                <span>Iniciar com Todos do Grupo ({{ activePartyLobby.length }} Heróis)</span>
              </button>
            </div>
          </div>

          <!-- Membros da Casa Conectados -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-black text-slate-200">👨‍👩‍👧‍👦 Membros Online na Casa:</h3>
                <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {{ onlineFamilyMembers.length }} Online
                </span>
              </div>

              <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                <div
                  v-for="m in members"
                  :key="m.id"
                  class="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80"
                >
                  <div class="flex items-center space-x-3">
                    <div class="relative">
                      <img :src="getDisplayImageUrl(m.avatarUrl)" class="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                      <span
                        v-if="isMemberOnline(m.id)"
                        class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"
                      ></span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-200">{{ m.name }}</p>
                      <p class="text-[10px] text-slate-400">{{ m.characterClass }} • Nv. {{ m.level }}</p>
                    </div>
                  </div>

                  <div>
                    <span v-if="isInParty(m.id)" class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      No Grupo
                    </span>
                    <span v-else-if="isMemberOnline(m.id)" class="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                    <span v-else class="text-[10px] text-slate-500">
                      Offline
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="inviteOnlineMembers"
              class="w-full mt-4 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              📢 Enviar Convite para Todos os Online
            </button>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- ESTADO 2: ARENA DE LUTA 2D ESTILO MUGEN (COM GRID DE 10 POSIÇÕES) -->
      <!-- ========================================================================= -->
      <div v-else-if="battleState === 'BATTLE' && battle" class="space-y-6">

        <!-- 1. HUD SUPERIOR ESTILO MUGEN / JOGO DE LUTA ARCADE -->
        <div class="bg-slate-950/95 border-2 border-amber-500/60 rounded-3xl p-3 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          <div class="grid grid-cols-12 gap-2 md:gap-4 items-center">
            
            <!-- PLAYER 1: HERÓI (LADO ESQUERDO) -->
            <div class="col-span-5 flex items-center space-x-2 md:space-x-4">
              <!-- Avatar Chanfrado Arcade -->
              <div class="relative shrink-0">
                <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 md:border-4 border-amber-400 shadow-xl bg-slate-900 transform -skew-x-6">
                  <img :src="getDisplayImageUrl(activeCharacter?.avatarUrl)" class="w-full h-full object-cover transform skew-x-6 scale-110" />
                </div>
                <span class="absolute -bottom-1.5 -left-1 bg-amber-400 text-slate-950 text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                  P1
                </span>
              </div>

              <!-- Barras de HP e MP Player 1 -->
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between text-xs font-black">
                  <span class="text-amber-300 truncate max-w-[120px] md:max-w-none">{{ activeCharacter?.name }}</span>
                  <span class="text-rose-400 font-mono text-[10px] md:text-xs">{{ activeCharacter?.hpCurrent }}/{{ activeCharacter?.hpMax }} HP</span>
                </div>

                <!-- Barra de Vida HP Chanfrada Estilo MUGEN -->
                <div class="w-full bg-slate-900 h-4 md:h-6 rounded-lg border-2 border-amber-400/80 p-0.5 overflow-hidden transform -skew-x-12 shadow-inner">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-400 rounded-sm transition-all duration-500 shadow-md shadow-emerald-500/50"
                    :style="{ width: `${Math.min(100, Math.max(0, ((activeCharacter?.hpCurrent || 0) / (activeCharacter?.hpMax || 1)) * 100))}%` }"
                  ></div>
                </div>

                <!-- Barra de Mana / Especial -->
                <div class="w-full bg-slate-900 h-2 md:h-2.5 rounded-md border border-sky-400/60 p-0.5 overflow-hidden transform -skew-x-12">
                  <div
                    class="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-sm transition-all duration-300"
                    :style="{ width: `${Math.min(100, Math.max(0, ((activeCharacter?.mpCurrent || 0) / (activeCharacter?.mpMax || 1)) * 100))}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- CENTRO: EMBLEMA VS / ROUND ARCADE -->
            <div class="col-span-2 text-center flex flex-col items-center justify-center">
              <div class="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-red-600 to-yellow-400 p-0.5 border-2 border-yellow-200 shadow-xl shadow-red-600/40 flex items-center justify-center animate-pulse">
                <span class="text-sm md:text-xl font-black italic tracking-tighter text-slate-950">VS</span>
              </div>
              <span class="text-[9px] md:text-[10px] font-black uppercase text-amber-300 mt-1 tracking-wider">
                {{ isMyTurn ? 'SUA VEZ!' : 'VEZ DO CHEFE' }}
              </span>
            </div>

            <!-- PLAYER 2: MONSTRO / BOSS (LADO DIREITO ESPELHADO) -->
            <div class="col-span-5 flex items-center justify-end space-x-2 md:space-x-4 flex-row-reverse">
              <!-- Avatar Chanfrado Arcade do Boss -->
              <div class="relative shrink-0">
                <div class="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 md:border-4 border-rose-500 shadow-xl bg-slate-900 transform skew-x-6">
                  <img :src="battle.monsterAvatar || monsterInfo.avatar" class="w-full h-full object-cover transform -skew-x-6 scale-110" />
                </div>
                <span class="absolute -bottom-1.5 -right-1 bg-rose-600 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                  BOSS
                </span>
              </div>

              <!-- Barras de HP Boss -->
              <div class="flex-1 space-y-1 text-right">
                <div class="flex items-center justify-between text-xs font-black flex-row-reverse">
                  <span class="text-rose-400 truncate max-w-[120px] md:max-w-none">{{ battle.monsterName }}</span>
                  <span class="text-rose-400 font-mono text-[10px] md:text-xs">{{ battle.monsterHpCurrent }}/{{ battle.monsterHpMax }} HP</span>
                </div>

                <!-- Barra de Vida HP Chanfrada Invertida -->
                <div class="w-full bg-slate-900 h-4 md:h-6 rounded-lg border-2 border-rose-500/80 p-0.5 overflow-hidden transform skew-x-12 shadow-inner">
                  <div
                    class="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 rounded-sm transition-all duration-500 ml-auto shadow-md shadow-rose-500/50"
                    :style="{ width: `${Math.min(100, Math.max(0, (battle.monsterHpCurrent / battle.monsterHpMax) * 100))}%` }"
                  ></div>
                </div>

                <p class="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">Ataque: {{ battle.monsterAttack }} • Defesa: {{ battle.monsterDefense }}</p>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. CENÁRIO DE LUTA 2D COM O GRID DE 10 POSIÇÕES NO SOLO -->
        <div class="bg-gradient-to-b from-[#1b0816] via-[#100c24] to-[#0a1226] border-2 border-amber-500/40 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden min-h-[320px] md:min-h-[380px] flex flex-col justify-between">
          
          <!-- Elementos de Fundo da Masmorra -->
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <!-- Indicador Central de Distância -->
          <div class="text-center relative z-10 pt-2">
            <span class="bg-slate-950/80 border border-amber-400/50 px-4 py-1 rounded-full text-xs font-black text-amber-300 shadow-md">
              📏 Distância Tática: <strong class="text-white font-mono text-sm">{{ currentDistance }} Casas</strong> 
              <span v-if="currentDistance === 1" class="text-rose-400 ml-1.5 font-bold">(⚔️ No Alcance Corpo a Corpo!)</span>
              <span v-else class="text-sky-300 ml-1.5 font-bold">(🏹 No Alcance de Longa Distância)</span>
            </span>
          </div>

          <!-- PALCO 2D COM OS SPRITES / AVATARES DOS LUTADORES -->
          <div class="relative w-full h-44 md:h-52 my-auto flex items-end">
            
            <!-- Herói Animado com Sprites MUGEN (Kenshin / Classe) -->
            <div
              class="absolute bottom-1 transition-all duration-500 ease-out flex flex-col items-center z-20"
              :style="{ left: `${(heroGridPos / 9) * 82 + 3}%` }"
            >
              <!-- Balão de Dano Flutuante -->
              <span v-if="heroTookHit" class="text-xl md:text-2xl font-black text-rose-500 animate-bounce mb-1 drop-shadow-lg">
                -{{ lastDamageTaken }} HP!
              </span>

              <SpriteFighter
                :character="heroFighterSprite"
                :state="heroSpriteState"
                :flip="false"
                :scale="1.35"
              />

              <span class="bg-amber-500 text-slate-950 font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mt-1 shadow">
                {{ activeCharacter?.name }} [{{ heroGridPos }}]
              </span>
            </div>

            <!-- Monstro Animado com Sprites MUGEN (Colossus) -->
            <div
              class="absolute bottom-1 transition-all duration-500 ease-out flex flex-col items-center z-20"
              :style="{ left: `${(monsterGridPos / 9) * 82 + 3}%` }"
            >
              <!-- Balão de Dano Flutuante -->
              <span v-if="monsterHit" class="text-xl md:text-2xl font-black text-yellow-300 animate-bounce mb-1 drop-shadow-lg">
                HIT!
              </span>

              <SpriteFighter
                character="colossus"
                :state="monsterSpriteState"
                :flip="true"
                :scale="1.45"
              />

              <span class="bg-rose-600 text-white font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mt-1 shadow">
                Colossus [{{ monsterGridPos }}]
              </span>
            </div>

          </div>

          <!-- O GRID TÁTICO DE 10 POSIÇÕES NO SOLO (0 A 9) -->
          <div class="relative z-10 pt-4 border-t-2 border-amber-500/40">
            <p class="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest text-center mb-2">
              GRID TÁTICO DE SOLO (10 CASAS)
            </p>
            <div class="grid grid-cols-10 gap-1 md:gap-2">
              <div
                v-for="idx in 10"
                :key="idx - 1"
                :class="[
                  'h-10 md:h-12 rounded-xl border flex flex-col items-center justify-center transition-all font-mono font-bold text-xs',
                  heroGridPos === (idx - 1)
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                    : monsterGridPos === (idx - 1)
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/30 scale-105'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                ]"
              >
                <span class="text-xs md:text-sm font-black">{{ idx - 1 }}</span>
                <span v-if="heroGridPos === (idx - 1)" class="text-[8px] text-amber-300 font-sans font-black leading-none">HERÓI</span>
                <span v-else-if="monsterGridPos === (idx - 1)" class="text-[8px] text-rose-400 font-sans font-black leading-none">CHEFE</span>
                <span v-else-if="idx - 1 === 3" class="text-[7px] text-slate-500 leading-none">Início A</span>
                <span v-else-if="idx - 1 === 6" class="text-[7px] text-slate-500 leading-none">Início B</span>
              </div>
            </div>
          </div>

        </div>

        <!-- 3. PAINEL DE CONTROLE TÁTICO (FASE 1: MOVIMENTO + FASE 2: ATAQUE) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Estação de Comandos do Herói (Colunas 1 e 2) -->
          <div class="lg:col-span-2 bg-slate-950/90 border-2 border-amber-500/50 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-base font-black text-amber-300 flex items-center space-x-2">
                <span>🎮 Painel de Ações do Turno</span>
              </h3>
              <span :class="['text-xs font-black px-3 py-1 rounded-full border', isMyTurn ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700']">
                {{ isMyTurn ? '⚡ SEU TURNO DE ATUAR' : '⏳ AGUARDANDO TURNO DO CHEFE' }}
              </span>
            </div>

            <!-- FASE 1: AÇÃO DE MOVIMENTAÇÃO NO GRID (IMEDIATA) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1">
                  <span>1. Mova seu Herói no Grid:</span>
                </span>
                <span class="text-xs font-mono font-bold text-amber-400">Posição Atual: [{{ heroGridPos }}]</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Recuar 1 Casa -->
                <button
                  :disabled="!isMyTurn || heroGridPos <= 0"
                  @click="moveHero('LEFT')"
                  class="py-3 px-4 rounded-2xl border border-sky-400 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs md:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span class="text-xl">◀</span>
                  <div class="text-left">
                    <p class="leading-tight">Recuar 1 Casa</p>
                    <p class="text-[10px] text-sky-200 font-normal">Para casa [{{ Math.max(0, heroGridPos - 1) }}]</p>
                  </div>
                </button>

                <!-- Avançar 1 Casa -->
                <button
                  :disabled="!isMyTurn || heroGridPos + 1 >= monsterGridPos"
                  @click="moveHero('RIGHT')"
                  class="py-3 px-4 rounded-2xl border border-rose-400 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs md:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 cursor-pointer"
                >
                  <div class="text-right">
                    <p class="leading-tight">Avançar 1 Casa</p>
                    <p class="text-[10px] text-rose-200 font-normal">Para casa [{{ Math.min(monsterGridPos - 1, heroGridPos + 1) }}]</p>
                  </div>
                  <span class="text-xl">▶</span>
                </button>
              </div>
            </div>

            <!-- FASE 2: AÇÕES DE COMBATE / GOLPES MUGEN & HABILIDADES -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                  2. Escolha o Golpe ou Habilidade:
                </span>
                <span class="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  Distância: {{ currentDistance }} {{ currentDistance === 1 ? 'Casa (Lado a Lado)' : 'Casas' }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                
                <!-- 1. Soco / Golpe Rápido -->
                <button
                  :disabled="!isMyTurn || currentDistance > 1"
                  @click="executeMugenAttack('LIGHT')"
                  class="bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-600 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-orange-500/40"
                >
                  <span class="text-xl">👊</span>
                  <span>Golpe Rápido</span>
                  <span v-if="currentDistance > 1" class="text-[9px] text-amber-200">Requer Lado a Lado</span>
                  <span v-else class="text-[9px] text-orange-200 font-bold">1x Dano Físico</span>
                </button>

                <!-- 2. Golpe Forte / Escudo Pesado -->
                <button
                  :disabled="!isMyTurn || currentDistance > 1"
                  @click="executeMugenAttack('HEAVY')"
                  class="bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-rose-500/40"
                >
                  <span class="text-xl">💥</span>
                  <span>Golpe Forte</span>
                  <span v-if="currentDistance > 1" class="text-[9px] text-amber-200">Requer Lado a Lado</span>
                  <span v-else class="text-[9px] text-rose-200 font-bold">1.5x Dano Crítico</span>
                </button>

                <!-- 3. Disparo / Teia / Ataque à Distância -->
                <button
                  :disabled="!isMyTurn || currentDistance < 2"
                  @click="executeMugenAttack('RANGED')"
                  class="bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-teal-400/40"
                >
                  <span class="text-xl">🕸️</span>
                  <span>Ataque à Distância</span>
                  <span v-if="currentDistance < 2" class="text-[9px] text-teal-200">Requer Distância (2+)</span>
                  <span v-else class="text-[9px] text-emerald-200 font-bold">Projétil / Teia / Tiro</span>
                </button>

                <!-- 4. Postura Defensiva -->
                <button
                  :disabled="!isMyTurn"
                  @click="executeTurnAction('DEFEND')"
                  class="bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-blue-400/40"
                >
                  <span class="text-xl">🛡️</span>
                  <span>Defender</span>
                  <span class="text-[9px] text-blue-200 font-bold">-50% Dano +5 MP</span>
                </button>

                <!-- 5. Habilidades Equipadas da Build da Classe -->
                <button
                  v-for="skill in equippedSkills"
                  :key="skill.id"
                  :disabled="!isMyTurn || isSkillOutOfRange(skill)"
                  @click="executeTurnSkill(skill)"
                  class="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-amber-300 col-span-2 md:col-span-2"
                >
                  <span class="text-xl">{{ skill.icon || '🔥' }}</span>
                  <span class="truncate max-w-[180px]">{{ skill.name }}</span>
                  <span v-if="isSkillOutOfRange(skill)" class="text-[9px] text-red-950 font-bold">Muito Longe (Lado a Lado)</span>
                  <span v-else class="text-[9px] text-slate-900 font-bold">Magia Especial • {{ skill.costMp }} MP</span>
                </button>

              </div>
            </div>

          </div>

          <!-- Diário de Combate em Tempo Real (Coluna 3) -->
          <div class="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 flex flex-col h-[380px]">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2 flex items-center space-x-2">
              <span>📜 Diário de Combate Arcade</span>
            </h4>

            <div class="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              <div
                v-for="(log, idx) in formattedBattleLogs"
                :key="idx"
                class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed text-slate-300"
                v-html="formatLog(log)"
              ></div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- Modal de Vitória Arcade -->
    <div v-if="battleState === 'BATTLE' && battle?.status === 'VICTORY'" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-gradient-to-b from-slate-900 via-[#1c1206] to-amber-950 border-2 border-amber-400 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-5 animate-bounce">
        <div class="text-6xl">🏆</div>
        <h2 class="text-3xl font-black text-amber-300">K.O. - VITÓRIA ÉPICA!</h2>
        <p class="text-sm text-slate-300">
          O temível <strong>{{ battle.monsterName }}</strong> foi derrotado no Grid Arcade!
        </p>

        <div class="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex justify-around">
          <div>
            <p class="text-xs text-slate-400">Recompensa</p>
            <p class="text-lg font-black text-amber-400">+{{ battle.rewardXp }} XP</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">Recompensa</p>
            <p class="text-lg font-black text-yellow-400">🪙 +{{ battle.rewardGold }} Ouro</p>
          </div>
        </div>

        <div class="space-y-2">
          <button
            @click="resetToLobby"
            class="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            ⚔️ Jogar Novamente / Voltar ao Lobby
          </button>

          <router-link
            to="/familia/sala"
            class="block w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl text-center text-xs transition-all active:scale-95"
          >
            🏠 Voltar ao Salão da Família
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal da Enfermaria do Reino (Aparece se o herói for nocauteado ou estiver com 0 HP) -->
    <div v-if="showInfirmaryModal || (isHeroInInfirmary && battleState === 'BATTLE')" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-gradient-to-b from-[#25040e] via-[#15071e] to-[#080d24] border-2 border-rose-500 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl space-y-5">
        <div class="text-6xl animate-bounce">🚑</div>
        <div>
          <span class="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-700/60">
            Nocaute em Combate (0 HP)
          </span>
          <h2 class="text-2xl md:text-3xl font-black text-rose-200 mt-2">Internado na Enfermaria Real!</h2>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            Seu herói <strong>{{ activeCharacter?.name }}</strong> foi nocauteado pelo monstro e foi levado para a <strong>Enfermaria do Reino</strong> para repousar por <strong>1 hora</strong> do tempo real!
          </p>
        </div>

        <!-- Cronômetro da Enfermaria -->
        <div class="bg-slate-950/90 p-4 rounded-2xl border border-rose-800/60 text-center space-y-1">
          <p class="text-[11px] font-bold text-slate-400 uppercase">Tempo Restante de Repouso:</p>
          <p class="text-2xl md:text-3xl font-mono font-black text-amber-300 tracking-widest">
            ⏳ {{ formattedInfirmaryTime }}
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <!-- Botão de Alta Médica -->
          <button
            v-if="infirmarySecondsLeft <= 0 || activeCharacter?.isParent"
            @click="recoverFromInfirmary"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            ✨ Receber Alta da Enfermaria (Restaurar 100% HP)
          </button>

          <div class="flex items-center space-x-3">
            <router-link
              to="/familia/enfermaria"
              class="flex-1 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs py-3 px-4 rounded-xl text-center shadow transition-all active:scale-95"
            >
              🏥 Abrir Ala da Enfermaria
            </router-link>

            <router-link
              to="/familia/sala"
              class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs py-3 px-4 rounded-xl text-center transition-all active:scale-95"
            >
              🏰 Ir para o Salão
            </router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import {
  getFamilySocket,
  onlineFamilyMembers,
  activePartyLobby,
  incomingBattleInvite,
  joinFamilyRoom,
  createPartyLobby,
  sendPartyInvite,
  acceptPartyInvite,
  startPartyBattle,
  sendFamilyBattleAction,
} from '../../services/familySocket';
import confetti from 'canvas-confetti';
import SpriteFighter from '../../components/family/SpriteFighter.vue';

const battle = ref<any>(null);
const members = ref<any[]>([]);
const activeCharacter = ref<any>(null);
const equippedSkills = ref<any[]>([]);
const monsterHit = ref<boolean>(false);
const heroTookHit = ref<boolean>(false);
const lastDamageTaken = ref<number>(15);
const battleState = ref<'LOBBY' | 'BATTLE'>('LOBBY');
const showInfirmaryModal = ref<boolean>(false);

const heroSpriteState = ref<'idle' | 'walk' | 'walkBack' | 'attack' | 'attackLight' | 'attackHeavy' | 'special' | 'hit' | 'win'>('idle');
const monsterSpriteState = ref<'idle' | 'walk' | 'walkBack' | 'attack' | 'attackLight' | 'attackHeavy' | 'special' | 'hit' | 'win'>('idle');

const heroFighterSprite = computed<string>(() => {
  if (activeCharacter.value?.avatarUrl?.startsWith('sprite:')) {
    return activeCharacter.value.avatarUrl.replace('sprite:', '');
  }
  return 'capamerica';
});

const infirmarySecondsLeft = ref<number>(0);
let timerInterval: any = null;

const monsterInfo = {
  name: 'O Golem da Bagunça',
  avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60',
  description: 'Criatura colossal feita de brinquedos fora do lugar e roupas espalhadas pelo quarto. Reúna seus irmãos ou lute sozinho para vencê-lo!',
};

const isHeroInInfirmary = computed(() => {
  if (!activeCharacter.value) return false;
  if (activeCharacter.value.hpCurrent <= 0) return true;
  if (activeCharacter.value.inInfirmaryUntil && new Date(activeCharacter.value.inInfirmaryUntil).getTime() > Date.now()) {
    return true;
  }
  return false;
});

const formattedInfirmaryTime = computed(() => {
  if (infirmarySecondsLeft.value <= 0) return '00:00 (Pronto para Alta!)';
  const m = Math.floor(infirmarySecondsLeft.value / 60);
  const s = infirmarySecondsLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

function updateInfirmaryCountdown() {
  if (activeCharacter.value && activeCharacter.value.inInfirmaryUntil) {
    const diff = Math.floor((new Date(activeCharacter.value.inInfirmaryUntil).getTime() - Date.now()) / 1000);
    infirmarySecondsLeft.value = Math.max(0, diff);
  } else {
    infirmarySecondsLeft.value = 0;
  }
}

async function recoverFromInfirmary() {
  if (!activeCharacter.value) return;
  try {
    const res = await familyApi.recoverFromInfirmary(activeCharacter.value.id, true);
    if (res.success) {
      alert(`🎉 ${res.message}`);
      activeCharacter.value = res.character;
      showInfirmaryModal.value = false;
      infirmarySecondsLeft.value = 0;
      await loadData();
    } else {
      alert(res.error || 'Erro ao receber alta.');
    }
  } catch (err) {
    console.error('Erro ao receber alta da enfermaria:', err);
  }
}

// Posições no Grid de 10 Casas (0 a 9)
const heroGridPos = computed<number>(() => {
  if (!battle.value?.gridPositions || !activeCharacter.value) return 3;
  const p = battle.value.gridPositions;
  return p[activeCharacter.value.id] !== undefined ? Number(p[activeCharacter.value.id]) : 3;
});

const monsterGridPos = computed<number>(() => {
  if (!battle.value?.gridPositions) return 6;
  const p = battle.value.gridPositions;
  return p.monster !== undefined ? Number(p.monster) : 6;
});

const currentDistance = computed<number>(() => {
  return Math.abs(monsterGridPos.value - heroGridPos.value);
});

function isSkillOutOfRange(skill: any) {
  if (!skill) return false;
  const isRanged = skill.effectType?.includes('RANGED') || activeCharacter.value?.characterClass === 'ARQUEIRO';
  const isHeal = skill.effectType?.includes('HEAL') || activeCharacter.value?.characterClass === 'CURANDEIRA';
  const isMagic = skill.effectType?.includes('MAGIC') || activeCharacter.value?.characterClass === 'MAGO';

  if (isRanged || isHeal || isMagic || skill.effectType === 'SHIELD') {
    return false;
  }
  return currentDistance.value > 1;
}

function moveHero(direction: 'LEFT' | 'RIGHT') {
  if (!isMyTurn.value || !battle.value || !activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }

  heroSpriteState.value = direction === 'LEFT' ? 'walkBack' : 'walk';
  setTimeout(() => { heroSpriteState.value = 'idle'; }, 600);

  // 1. Atualiza otimisticamente a posição local imediatamente
  if (direction === 'LEFT' && heroGridPos.value > 0) {
    if (!battle.value.gridPositions) battle.value.gridPositions = {};
    battle.value.gridPositions[activeCharacter.value.id] = heroGridPos.value - 1;
  } else if (direction === 'RIGHT' && heroGridPos.value + 1 < monsterGridPos.value) {
    if (!battle.value.gridPositions) battle.value.gridPositions = {};
    battle.value.gridPositions[activeCharacter.value.id] = heroGridPos.value + 1;
  }

  // 2. Envia imediatamente para o backend persistir e sincronizar no socket
  sendFamilyBattleAction(
    battle.value.id,
    activeCharacter.value.id,
    'MOVE',
    undefined,
    undefined,
    direction
  );
}

function isMemberOnline(characterId: string) {
  return onlineFamilyMembers.value.some(m => m.characterId === characterId);
}

function isInParty(characterId: string) {
  return activePartyLobby.value.some(p => p.characterId === characterId);
}

const normalizedTurnOrder = computed<string[]>(() => {
  if (!battle.value || !battle.value.currentTurnOrder) return [];
  if (Array.isArray(battle.value.currentTurnOrder)) return battle.value.currentTurnOrder;
  if (typeof battle.value.currentTurnOrder === 'string') {
    try {
      const parsed = JSON.parse(battle.value.currentTurnOrder);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
});

const formattedBattleLogs = computed<string[]>(() => {
  if (!battle.value || !battle.value.battleLogs) return [];
  if (Array.isArray(battle.value.battleLogs)) return battle.value.battleLogs;
  if (typeof battle.value.battleLogs === 'string') {
    try {
      const parsed = JSON.parse(battle.value.battleLogs);
      return Array.isArray(parsed) ? parsed : [battle.value.battleLogs];
    } catch (e) {
      return [battle.value.battleLogs];
    }
  }
  return [];
});

const currentTurnHeroId = computed(() => {
  const turns = normalizedTurnOrder.value;
  if (turns.length === 0) return activeCharacter.value?.id || null;
  const idx = (battle.value?.activeTurnIndex ?? 0) % turns.length;
  return turns[idx];
});

const isMyTurn = computed(() => {
  if (!activeCharacter.value || isHeroInInfirmary.value) return false;
  const turns = normalizedTurnOrder.value;
  if (turns.length === 0) return true;
  const heroId = currentTurnHeroId.value;
  if (heroId === 'MONSTER') return false;
  
  const activeHeroes = turns.filter(id => id !== 'MONSTER');
  if (activeHeroes.length === 1 && activeHeroes[0] === activeCharacter.value.id) {
    return true;
  }
  return heroId === activeCharacter.value.id;
});

function formatLog(log: string) {
  if (typeof log !== 'string') return '';
  return log.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>');
}

function inviteOnlineMembers() {
  if (!activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }
  sendPartyInvite(activeCharacter.value.name, activeCharacter.value.id, monsterInfo.name);
  alert('📢 Convite de batalha enviado para todos os membros online na casa!');
}

function acceptInvite() {
  if (!activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }
  acceptPartyInvite(activeCharacter.value);
}

function startSoloBattle() {
  if (!activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }
  const soloParty = [{
    characterId: activeCharacter.value.id,
    name: activeCharacter.value.name,
    characterClass: activeCharacter.value.characterClass,
    avatarUrl: activeCharacter.value.avatarUrl,
    isLeader: true,
  }];
  startPartyBattle(soloParty, true);
}

function startPartyBattleGroup() {
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }
  startPartyBattle(activePartyLobby.value, false);
}

function resetToLobby() {
  battleState.value = 'LOBBY';
  battle.value = null;
  heroTookHit.value = false;
  monsterHit.value = false;
  heroSpriteState.value = 'idle';
  monsterSpriteState.value = 'idle';
  if (activeCharacter.value) {
    createPartyLobby(activeCharacter.value);
  }
  loadData();
}

async function loadData() {
  try {
    const savedCharId = localStorage.getItem('lira_active_family_char_id');
    const membersRes = await familyApi.getMembers();
    if (membersRes.success && membersRes.members.length > 0) {
      members.value = membersRes.members;
      activeCharacter.value = members.value.find((m: any) => m.id === savedCharId) || members.value[0];
    }

    if (activeCharacter.value) {
      updateInfirmaryCountdown();
      joinFamilyRoom(activeCharacter.value.id, activeCharacter.value.name);
      createPartyLobby(activeCharacter.value);

      const treeRes = await familyApi.getSkillTree(activeCharacter.value.id);
      if (treeRes.success) {
        equippedSkills.value = treeRes.skills.filter((s: any) => treeRes.equippedSkillIds.includes(s.id));
      }
    }
  } catch (error) {
    console.error('Erro ao carregar batalha:', error);
  }
}

function executeMugenAttack(type: 'LIGHT' | 'HEAVY' | 'RANGED') {
  if (!battle.value || !activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }

  if (type === 'LIGHT') {
    heroSpriteState.value = 'attackLight';
    setTimeout(() => {
      heroSpriteState.value = 'idle';
      monsterHit.value = true;
      monsterSpriteState.value = 'hit';
      setTimeout(() => {
        monsterHit.value = false;
        monsterSpriteState.value = 'idle';
      }, 500);
    }, 350);

    sendFamilyBattleAction(
      battle.value.id,
      activeCharacter.value.id,
      'ATTACK',
      'Golpe Rápido',
      undefined,
      'STAY'
    );
  } else if (type === 'HEAVY') {
    heroSpriteState.value = 'attackHeavy';
    setTimeout(() => {
      heroSpriteState.value = 'idle';
      monsterHit.value = true;
      monsterSpriteState.value = 'hit';
      setTimeout(() => {
        monsterHit.value = false;
        monsterSpriteState.value = 'idle';
      }, 600);
    }, 450);

    sendFamilyBattleAction(
      battle.value.id,
      activeCharacter.value.id,
      'ATTACK',
      'Golpe Forte',
      undefined,
      'STAY'
    );
  } else if (type === 'RANGED') {
    heroSpriteState.value = 'special';
    setTimeout(() => {
      heroSpriteState.value = 'idle';
      monsterHit.value = true;
      monsterSpriteState.value = 'hit';
      setTimeout(() => {
        monsterHit.value = false;
        monsterSpriteState.value = 'idle';
      }, 600);
    }, 550);

    sendFamilyBattleAction(
      battle.value.id,
      activeCharacter.value.id,
      'SKILL',
      'Disparo à Distância',
      'ranged_move',
      'STAY'
    );
  }
}

function executeTurnAction(actionType: 'ATTACK' | 'DEFEND') {
  if (!battle.value || !activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }

  if (actionType === 'ATTACK') {
    heroSpriteState.value = 'attackHeavy';
    setTimeout(() => {
      heroSpriteState.value = 'idle';
      monsterHit.value = true;
      monsterSpriteState.value = 'hit';
      setTimeout(() => {
        monsterHit.value = false;
        monsterSpriteState.value = 'idle';
      }, 600);
    }, 450);
  }

  sendFamilyBattleAction(
    battle.value.id,
    activeCharacter.value.id,
    actionType,
    undefined,
    undefined,
    'STAY'
  );
}

function executeTurnSkill(skill: any) {
  if (!battle.value || !activeCharacter.value) return;
  if (isHeroInInfirmary.value) {
    showInfirmaryModal.value = true;
    return;
  }

  heroSpriteState.value = 'special';
  setTimeout(() => {
    heroSpriteState.value = 'idle';
    monsterHit.value = true;
    monsterSpriteState.value = 'hit';
    setTimeout(() => {
      monsterHit.value = false;
      monsterSpriteState.value = 'idle';
    }, 600);
  }, 550);

  sendFamilyBattleAction(
    battle.value.id,
    activeCharacter.value.id,
    'SKILL',
    skill.name,
    skill.id,
    'STAY'
  );
}

onMounted(() => {
  loadData();
  timerInterval = setInterval(updateInfirmaryCountdown, 1000);

  const socket = getFamilySocket();

  socket.on('family:action_error', (data: any) => {
    alert(data.message || 'Ação inválida!');
  });

  socket.on('family:hero_knocked_out', (data: any) => {
    if (activeCharacter.value && data.characterId === activeCharacter.value.id) {
      activeCharacter.value.hpCurrent = 0;
      activeCharacter.value.inInfirmaryUntil = data.inInfirmaryUntil;
      heroTookHit.value = true;
      heroSpriteState.value = 'hit';
      showInfirmaryModal.value = true;
      updateInfirmaryCountdown();
    }
  });

  socket.on('family:battle_party_started', (data: any) => {
    battle.value = data.battle;
    battleState.value = 'BATTLE';
    if (data.characters) {
      members.value = data.characters;
      if (activeCharacter.value) {
        activeCharacter.value = members.value.find((m: any) => m.id === activeCharacter.value.id) || activeCharacter.value;
      }
    }
  });

  socket.on('family:battle_updated', (data: any) => {
    battle.value = data.battle;
    battleState.value = 'BATTLE';

    if (data.lastAction) {
      const act = data.lastAction;
      if (act.includes('contra-atacou') || act.includes('golpeou') || act.includes('foi atingido')) {
        monsterSpriteState.value = 'attackHeavy';
        setTimeout(() => {
          monsterSpriteState.value = 'idle';
          heroTookHit.value = true;
          heroSpriteState.value = 'hit';
          setTimeout(() => {
            heroTookHit.value = false;
            heroSpriteState.value = 'idle';
          }, 600);
        }, 350);
      } else if (act.includes('avançou')) {
        monsterSpriteState.value = 'walk';
        setTimeout(() => { monsterSpriteState.value = 'idle'; }, 600);
      }
    }

    if (data.characters) {
      members.value = data.characters;
      if (activeCharacter.value) {
        activeCharacter.value = members.value.find((m: any) => m.id === activeCharacter.value.id) || activeCharacter.value;
        if (activeCharacter.value.hpCurrent <= 0) {
          showInfirmaryModal.value = true;
        }
      }
    }
  });

  socket.on('family:battle_victory', (data: any) => {
    battle.value = data.battle;
    heroSpriteState.value = 'win';
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#e11d48', '#10b981', '#6366f1']
    });
  });
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  const socket = getFamilySocket();
  socket.off('family:action_error');
  socket.off('family:hero_knocked_out');
  socket.off('family:battle_party_started');
  socket.off('family:battle_updated');
  socket.off('family:battle_victory');
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
