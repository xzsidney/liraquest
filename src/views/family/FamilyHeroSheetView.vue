<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título da Ficha -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-900/60 pb-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>🛡️ Ficha do Herói da Família</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">Evolua seus atributos, equipe armas mágicas e desbloqueie talentos!</p>
        </div>

        <div v-if="hero" class="flex items-center space-x-2 bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-400/60 px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/10">
          <span class="text-xs text-slate-300">XP Disponível:</span>
          <span class="text-sm font-black text-amber-300">⭐ {{ hero.currentXp }} XP</span>
          <span class="text-slate-500">•</span>
          <span class="text-sm font-black text-yellow-400">🪙 {{ hero.gold }} Ouro</span>
        </div>
      </div>

      <!-- Seletor se tiver mais de um herói ou aviso de criação -->
      <div v-if="!hero" class="bg-gradient-to-b from-rose-950/80 to-blue-950/80 border-2 border-amber-400/60 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <span class="text-5xl">🛡️</span>
        <h2 class="text-2xl font-black text-amber-300">Nenhum Herói Criado</h2>
        <p class="text-sm text-slate-300 max-w-md mx-auto">Crie seu primeiro personagem no Salão da Família para visualizar sua ficha completa!</p>
        <router-link to="/familia/sala" class="inline-block bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform">
          ➔ Ir para o Salão Criar Herói
        </router-link>
      </div>

      <div v-else class="space-y-6">
        
        <!-- Banner de Enfermaria (se HP <= 0 ou inInfirmaryUntil ativo) -->
        <div v-if="hero.inInfirmaryUntil && isStillInInfirmary" class="bg-gradient-to-r from-rose-950 via-red-950 to-rose-900 border-2 border-rose-500/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div class="flex items-center space-x-4">
            <span class="text-4xl md:text-5xl">🏥</span>
            <div>
              <h3 class="text-lg md:text-xl font-black text-rose-200">Herói Internado na Enfermaria Real!</h3>
              <p class="text-xs text-rose-300">
                Seu herói foi nocauteado em combate e está em repouso absoluto.
              </p>
              <p class="text-sm font-black text-amber-300 mt-1">
                ⏳ Tempo restante de recuperação: <span class="text-lg font-mono underline">{{ formattedInfirmaryTime }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <router-link
              to="/familia/enfermaria"
              class="bg-slate-950 hover:bg-slate-800 border border-amber-400/60 text-amber-300 font-black text-xs md:text-sm px-4 py-3 rounded-2xl shadow transition-all cursor-pointer"
            >
              🏥 Abrir Ala da Enfermaria
            </router-link>

            <button
              v-if="infirmarySecondsLeft <= 0 || hero.isParent"
              @click="recoverFromInfirmary"
              class="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm px-6 py-3 rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              ✨ Reviver (100% HP)
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Coluna 1: Avatar, Status & Equipamentos -->
          <div class="space-y-6">
            
            <!-- Card do Personagem -->
            <div class="bg-gradient-to-b from-[#2a0611] to-[#0a1533] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
              <!-- Avatar com Botão de Troca / Escolha de Lutador -->
              <div class="relative w-32 h-32 mx-auto mb-3 group cursor-pointer" @click="showAvatarModal = true" title="Clique para escolher seu Lutador do MUGEN ou foto personalizada">
                <div class="w-full h-full rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-900 flex items-center justify-center">
                  <img :src="getDisplayImageUrl(hero.avatarUrl)" class="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div class="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-black text-amber-300 transition-opacity">
                  <span class="text-lg">🎮</span>
                  <span>Escolher Lutador</span>
                </div>
                <div v-if="uploadingAvatar" class="absolute inset-0 bg-black/80 rounded-3xl flex items-center justify-center">
                  <div class="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"></div>
                </div>
              </div>

              <!-- Botão Destacado de Escolha de Lutador / Avatar -->
              <button
                @click="showAvatarModal = true"
                class="text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-3 py-1 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer mb-2"
              >
                🎮 Escolher Lutador / Foto
              </button>

              <input type="file" ref="avatarFileInput" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAvatarFileChange" />

              <h2 class="text-2xl font-black text-slate-100">{{ hero.name }}</h2>
              
              <!-- Classe com Botão de Troca -->
              <div class="flex items-center justify-center space-x-2 mt-1">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {{ hero.characterClass }} • {{ hero.title || 'Guardião' }}
                </span>
                <button
                  @click="showClassModal = true"
                  class="text-[10px] font-black bg-rose-950 hover:bg-rose-900 border border-amber-400/60 text-amber-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  title="Trocar de Classe"
                >
                  🔄 Trocar
                </button>
              </div>

              <div class="inline-block bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-black px-3 py-1 rounded-full mt-2">
                Nível {{ hero.level }}
              </div>

              <!-- Barras de Recursos -->
              <div class="space-y-3 mt-6 text-left">
                <!-- HP -->
                <div>
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="text-rose-400">❤️ Vida Máxima (HP)</span>
                    <span class="text-slate-200">{{ hero.hpCurrent }} / {{ hero.hpMax }}</span>
                  </div>
                  <div class="w-full bg-slate-950 h-2.5 rounded-full border border-rose-800/40 overflow-hidden">
                    <div class="bg-gradient-to-r from-rose-600 to-red-400 h-full rounded-full" :style="{ width: `${(hero.hpCurrent / hero.hpMax) * 100}%` }"></div>
                  </div>
                </div>

                <!-- MP -->
                <div>
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="text-sky-400">💧 Mana Astral (MP)</span>
                    <span class="text-slate-200">{{ hero.mpCurrent }} / {{ hero.mpMax }}</span>
                  </div>
                  <div class="w-full bg-slate-950 h-2.5 rounded-full border border-blue-800/40 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full" :style="{ width: `${(hero.mpCurrent / hero.mpMax) * 100}%` }"></div>
                  </div>
                </div>

                <!-- XP para o Próximo Nível -->
                <div>
                  <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="text-amber-400">⭐ Progresso de Nível (XP)</span>
                    <span class="text-slate-200">{{ hero.currentXp }} / {{ hero.nextLevelXp }}</span>
                  </div>
                  <div class="w-full bg-slate-950 h-2.5 rounded-full border border-amber-800/40 overflow-hidden">
                    <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" :style="{ width: `${Math.min(100, (hero.currentXp / hero.nextLevelXp) * 100)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Arsenal Equipado -->
            <div class="bg-gradient-to-b from-[#1f050e] to-[#0c1329] border border-blue-900/60 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-black uppercase tracking-wider text-blue-300 flex items-center space-x-2">
                <span>🗡️ Equipamentos Ativos</span>
              </h3>

              <div class="space-y-2 text-xs">
                <div class="bg-slate-950/80 p-3 rounded-2xl border border-rose-900/40 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xl">⚔️</span>
                    <div>
                      <p class="text-slate-400 text-[10px]">Arma Principal</p>
                      <p class="font-bold text-amber-300">{{ hero.equippedWeapon || 'Espada de Madeira' }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] text-emerald-400 font-bold">+Ataque</span>
                </div>

                <div class="bg-slate-950/80 p-3 rounded-2xl border border-blue-900/40 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xl">🛡️</span>
                    <div>
                      <p class="text-slate-400 text-[10px]">Armadura / Traje</p>
                      <p class="font-bold text-amber-300">{{ hero.equippedArmor || 'Colete de Couro' }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] text-blue-400 font-bold">+Defesa</span>
                </div>

                <div class="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/40 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xl">🐾</span>
                    <div>
                      <p class="text-slate-400 text-[10px]">Mascote Leal</p>
                      <p class="font-bold text-amber-300">{{ hero.equippedPet || 'Nenhum equipado' }}</p>
                    </div>
                  </div>
                  <span v-if="hero.equippedPet" class="text-[10px] text-yellow-400 font-bold">+Sabedoria</span>
                  <router-link v-else to="/familia/loja" class="text-[10px] text-amber-400 hover:underline">Adotar ➔</router-link>
                </div>
              </div>
            </div>

          </div>

          <!-- Coluna 2 & 3: Matriz de Atributos & Árvore de Habilidades VIVA -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Matriz dos 5 Atributos Principais -->
            <div class="bg-gradient-to-b from-[#22050f] via-[#100b24] to-[#071433] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-900/60 pb-3">
                <div>
                  <h3 class="text-lg font-black text-amber-300 flex items-center space-x-2">
                    <span>⚡ Atributos Nucleares do Herói</span>
                  </h3>
                  <p class="text-xs text-blue-200">Gaste 50 XP para aprimorar seus atributos e ficar mais forte nas batalhas e testes!</p>
                </div>
                <span class="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  50 XP por Atributo
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- 1. Força -->
                <div class="bg-slate-950/80 p-4 rounded-2xl border border-rose-900/50 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-2xl">
                      💪
                    </div>
                    <div>
                      <p class="text-sm font-black text-slate-100">Força</p>
                      <p class="text-[11px] text-slate-400">Aumenta dano físico</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-xl font-black text-rose-400">{{ hero.strength }}</span>
                    <button 
                      :disabled="hero.currentXp < 50"
                      @click="upgradeStat('strength')"
                      class="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                      title="Aprimorar +1 Força (Custa 50 XP)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <!-- 2. Vitalidade -->
                <div class="bg-slate-950/80 p-4 rounded-2xl border border-emerald-900/50 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-2xl">
                      🛡️
                    </div>
                    <div>
                      <p class="text-sm font-black text-slate-100">Vitalidade</p>
                      <p class="text-[11px] text-slate-400">+10 HP Máximo</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-xl font-black text-emerald-400">{{ hero.vitality }}</span>
                    <button 
                      :disabled="hero.currentXp < 50"
                      @click="upgradeStat('vitality')"
                      class="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                      title="Aprimorar +1 Vitalidade (Custa 50 XP)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <!-- 3. Sabedoria -->
                <div class="bg-slate-950/80 p-4 rounded-2xl border border-indigo-900/50 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-600/40 flex items-center justify-center text-2xl">
                      📖
                    </div>
                    <div>
                      <p class="text-sm font-black text-slate-100">Sabedoria</p>
                      <p class="text-[11px] text-slate-400">+10 Mana (MP) & Estudo</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-xl font-black text-indigo-300">{{ hero.wisdom }}</span>
                    <button 
                      :disabled="hero.currentXp < 50"
                      @click="upgradeStat('wisdom')"
                      class="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                      title="Aprimorar +1 Sabedoria (Custa 50 XP)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <!-- 4. Agilidade -->
                <div class="bg-slate-950/80 p-4 rounded-2xl border border-sky-900/50 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                    <div>
                      <p class="text-sm font-black text-slate-100">Agilidade</p>
                      <p class="text-[11px] text-slate-400">Iniciativa & Tarefas Rápidas</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-xl font-black text-sky-400">{{ hero.agility }}</span>
                    <button 
                      :disabled="hero.currentXp < 50"
                      @click="upgradeStat('agility')"
                      class="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                      title="Aprimorar +1 Agilidade (Custa 50 XP)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <!-- 5. Laço Familiar -->
                <div class="sm:col-span-2 bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-blue-950/60 p-4 rounded-2xl border-2 border-amber-400/50 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-2xl text-slate-950 shadow">
                      💖
                    </div>
                    <div>
                      <p class="text-sm font-black text-amber-300">Laço Familiar (União do Clã)</p>
                      <p class="text-[11px] text-slate-300">Aumenta bônus de cooperação e cura coletiva com pais e irmãos</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl font-black text-amber-300">{{ hero.heartBond }}</span>
                    <button 
                      :disabled="hero.currentXp < 50"
                      @click="upgradeStat('heartBond')"
                      class="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                      title="Aprimorar +1 Laço Familiar (Custa 50 XP)"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Árvore de Habilidades por Graus (Tier 1 ➔ Tier 2 ➔ Tier 3) -->
            <div class="bg-gradient-to-b from-[#18050c] to-[#071029] border border-blue-900/60 rounded-3xl p-6 shadow-xl space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-900/40 pb-3">
                <div>
                  <h3 class="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                    <span>🌳 Árvore de Habilidades & Builds de {{ hero.characterClass }}</span>
                  </h3>
                  <p class="text-xs text-blue-200">Desbloqueie graus superiores com XP e equipe até 3 habilidades ativas para usar nas batalhas!</p>
                </div>
                <span class="text-xs font-bold text-amber-300 bg-blue-950/80 border border-blue-800 px-3 py-1 rounded-xl">
                  Build: {{ equippedSkillIds.length }}/3 Equipadas
                </span>
              </div>

              <!-- Lista de Habilidades com Graus -->
              <div class="space-y-3">
                <div
                  v-for="skill in skillTree"
                  :key="skill.id"
                  :class="[
                    'p-4 rounded-2xl border transition-all',
                    isSkillEquipped(skill.id) ? 'bg-gradient-to-r from-amber-500/20 via-rose-950/40 to-blue-950/40 border-amber-400 shadow-lg shadow-amber-500/10' :
                    isSkillUnlocked(skill.id) ? 'bg-slate-950/80 border-emerald-500/40' :
                    canBuySkill(skill) ? 'bg-slate-950/80 border-amber-500/40' :
                    'bg-slate-950/40 border-slate-800 opacity-60'
                  ]"
                >
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-start space-x-3.5">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-950 to-blue-950 border border-amber-500/40 flex items-center justify-center text-2xl shadow shrink-0">
                        {{ skill.icon }}
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                          <h4 class="text-sm font-black text-slate-100">{{ skill.name }}</h4>
                          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700/60 text-rose-300">
                            Grau {{ skill.tier === 1 ? 'I (Básico)' : skill.tier === 2 ? 'II (Plus)' : 'III (Mestre)' }}
                          </span>
                          <span v-if="isSkillEquipped(skill.id)" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                            ⚡ Na Build
                          </span>
                        </div>
                        <p class="text-xs text-slate-300 leading-snug">{{ skill.description }}</p>
                        <div class="flex items-center space-x-4 text-[10px] text-blue-300 pt-1">
                          <span>💧 Custo: {{ skill.costMp }} MP</span>
                          <span class="text-amber-400">✨ Poder: {{ skill.power }}</span>
                          <span v-if="skill.requiredSkillId && !isSkillUnlocked(skill.id)" class="text-rose-400 font-bold">
                            🔒 Requer Grau {{ skill.tier - 1 }} anterior
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <!-- Já Desbloqueado: Equipar / Desequipar -->
                      <template v-if="isSkillUnlocked(skill.id)">
                        <button
                          v-if="isSkillEquipped(skill.id)"
                          @click="toggleEquipSkill(skill.id, false)"
                          class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Desequipar
                        </button>
                        <button
                          v-else
                          :disabled="equippedSkillIds.length >= 3"
                          @click="toggleEquipSkill(skill.id, true)"
                          class="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
                        >
                          ⚡ Equipar na Build
                        </button>
                      </template>

                      <!-- Não Desbloqueado: Comprar por XP -->
                      <template v-else>
                        <button
                          v-if="canBuySkill(skill)"
                          :disabled="hero.currentXp < skill.costXp"
                          @click="buySkill(skill)"
                          class="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                          🛒 Desbloquear por {{ skill.costXp }} XP
                        </button>
                        <span v-else class="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900">
                          🔒 Bloqueado
                        </span>
                      </template>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Modal de Troca de Classe -->
      <div v-if="showClassModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-[#22040e] to-[#060e24] border-2 border-amber-400/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-rose-900/60 pb-3">
            <h3 class="text-lg font-black text-amber-300 flex items-center space-x-2">
              <span>🔄 Escolha sua Nova Classe</span>
            </h3>
            <button @click="showClassModal = false" class="text-slate-400 hover:text-white font-black text-sm">✕</button>
          </div>

          <p class="text-xs text-slate-300">
            Você pode alternar de classe livremente! Seus atributos e nível permanecem, e você terá acesso às habilidades da nova classe.
          </p>

          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="cls in availableClasses"
              :key="cls.key"
              @click="changeClass(cls.key)"
              :class="[
                'p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer hover:scale-102',
                hero.characterClass === cls.key ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
              ]"
            >
              <span class="text-2xl">{{ cls.icon }}</span>
              <div>
                <p class="text-xs font-black text-slate-100">{{ cls.name }}</p>
                <p class="text-[10px] text-amber-300">{{ cls.desc }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Escolha de Lutador MUGEN / Avatar -->
      <div v-if="showAvatarModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gradient-to-b from-[#22040e] to-[#060e24] border-2 border-amber-400/80 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-rose-900/60 pb-3">
            <h3 class="text-lg font-black text-amber-300 flex items-center space-x-2">
              <span>🎮 Escolha seu Lutador de Batalha (MUGEN 2D)</span>
            </h3>
            <button @click="showAvatarModal = false" class="text-slate-400 hover:text-white font-black text-sm">✕</button>
          </div>

          <!-- Opções de Sprites MUGEN -->
          <div>
            <p class="text-xs font-bold text-slate-300 mb-3">
              Selecione o lutador com animações originais de fliperama para lutar na Arena:
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <!-- Capitão América -->
              <div
                @click="selectMugenFighter('capamerica')"
                :class="[
                  'p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105',
                  hero?.avatarUrl === 'sprite:capamerica' ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                ]"
              >
                <div class="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <img src="/sprites/capamerica/0-0.png" class="h-full object-contain" style="image-rendering: pixelated;" />
                </div>
                <span class="text-xs font-black text-slate-100">Capitão América</span>
                <span class="text-[9px] text-amber-300 font-bold">MUGEN Arcade</span>
              </div>

              <!-- Homem-Aranha -->
              <div
                @click="selectMugenFighter('spiderman')"
                :class="[
                  'p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105',
                  hero?.avatarUrl === 'sprite:spiderman' ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/20' : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                ]"
              >
                <div class="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <img src="/sprites/spiderman/0-0.png" class="h-full object-contain" style="image-rendering: pixelated;" />
                </div>
                <span class="text-xs font-black text-slate-100">Homem-Aranha</span>
                <span class="text-[9px] text-red-400 font-bold">MUGEN Arcade</span>
              </div>

              <!-- Kenshin Himura -->
              <div
                @click="selectMugenFighter('kenshin')"
                :class="[
                  'p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105',
                  hero?.avatarUrl === 'sprite:kenshin' ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                ]"
              >
                <div class="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <img src="/sprites/kenshin/0-0.png" class="h-full object-contain" style="image-rendering: pixelated;" />
                </div>
                <span class="text-xs font-black text-slate-100">Kenshin Himura</span>
                <span class="text-[9px] text-amber-300 font-bold">MUGEN Arcade</span>
              </div>

              <!-- Colossus -->
              <div
                @click="selectMugenFighter('colossus')"
                :class="[
                  'p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105',
                  hero?.avatarUrl === 'sprite:colossus' ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                ]"
              >
                <div class="w-16 h-16 rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <img src="/sprites/colossus/0-0.png" class="h-full object-contain" style="image-rendering: pixelated;" />
                </div>
                <span class="text-xs font-black text-slate-100">Colossus</span>
                <span class="text-[9px] text-amber-300 font-bold">MUGEN Arcade</span>
              </div>

            </div>
          </div>

          <!-- Opção de Foto Personalizada -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-200">Ou envie uma foto personalizada:</p>
              <p class="text-[10px] text-slate-400">JPG, PNG ou WEBP do seu computador</p>
            </div>
            <button
              @click="triggerAvatarUpload"
              class="bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
            >
              📷 Enviar Foto
            </button>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';

const hero = ref<any | null>(null);
const avatarFileInput = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref<boolean>(false);
const showClassModal = ref<boolean>(false);
const showAvatarModal = ref<boolean>(false);

const skillTree = ref<any[]>([]);
const unlockedSkillIds = ref<string[]>([]);
const equippedSkillIds = ref<string[]>([]);

const infirmarySecondsLeft = ref<number>(0);
let timerInterval: any = null;

const availableClasses = [
  { key: 'GUERREIRO', name: 'Guerreiro', icon: '⚔️', desc: 'Dano Físico Brutal' },
  { key: 'MAGO', name: 'Mago', icon: '🔥', desc: 'Magia Elemental' },
  { key: 'PALADINO', name: 'Paladino', icon: '🛡️', desc: 'Escudos Sagrados' },
  { key: 'CURANDEIRA', name: 'Curandeira', icon: '✨', desc: 'Cura da Família' },
  { key: 'ARQUEIRO', name: 'Arqueiro', icon: '🏹', desc: 'Tiros à Distância' },
  { key: 'LADINO', name: 'Ladino', icon: '🗡️', desc: 'Críticos Furtivos' },
];

const isStillInInfirmary = computed(() => {
  if (!hero.value || !hero.value.inInfirmaryUntil) return false;
  return new Date(hero.value.inInfirmaryUntil).getTime() > Date.now() || hero.value.hpCurrent <= 0;
});

const formattedInfirmaryTime = computed(() => {
  if (infirmarySecondsLeft.value <= 0) return '00:00 (Pronto para Alta!)';
  const m = Math.floor(infirmarySecondsLeft.value / 60);
  const s = infirmarySecondsLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

function updateInfirmaryCountdown() {
  if (hero.value && hero.value.inInfirmaryUntil) {
    const diff = Math.floor((new Date(hero.value.inInfirmaryUntil).getTime() - Date.now()) / 1000);
    infirmarySecondsLeft.value = Math.max(0, diff);
  } else {
    infirmarySecondsLeft.value = 0;
  }
}

function isSkillUnlocked(skillId: string) {
  return unlockedSkillIds.value.includes(skillId);
}

function isSkillEquipped(skillId: string) {
  return equippedSkillIds.value.includes(skillId);
}

function canBuySkill(skill: any) {
  if (isSkillUnlocked(skill.id)) return false;
  if (!skill.requiredSkillId) return true; // Tier 1 sem pré-requisito
  return isSkillUnlocked(skill.requiredSkillId); // Tier 2/3 exige que o anterior esteja desbloqueado
}

async function loadHeroAndSkills() {
  try {
    const res = await familyApi.getMyCharacters();
    if (res.success && res.characters?.length > 0) {
      const savedId = localStorage.getItem('lira_active_family_char_id');
      hero.value = res.characters.find((c: any) => c.id === savedId) || res.characters[0];

      if (hero.value) {
        updateInfirmaryCountdown();
        const treeRes = await familyApi.getSkillTree(hero.value.id);
        if (treeRes.success) {
          skillTree.value = treeRes.skills;
          unlockedSkillIds.value = treeRes.unlockedSkillIds;
          equippedSkillIds.value = treeRes.equippedSkillIds;
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar herói e árvore de habilidades:', err);
  }
}

async function buySkill(skill: any) {
  if (!hero.value) return;
  try {
    const res = await familyApi.buySkill(hero.value.id, skill.id);
    if (res.success) {
      alert(`🎉 ${res.message}`);
      await loadHeroAndSkills();
    } else {
      alert(res.error || 'Erro ao desbloquear habilidade.');
    }
  } catch (err) {
    console.error('Erro ao comprar habilidade:', err);
  }
}

async function toggleEquipSkill(skillId: string, equip: boolean) {
  if (!hero.value) return;
  try {
    const res = await familyApi.equipSkill(hero.value.id, skillId, equip);
    if (res.success) {
      await loadHeroAndSkills();
    } else {
      alert(res.error || 'Erro ao equipar habilidade.');
    }
  } catch (err) {
    console.error('Erro ao equipar habilidade:', err);
  }
}

async function changeClass(newClass: string) {
  if (!hero.value) return;
  try {
    const res = await familyApi.changeClass(hero.value.id, newClass);
    if (res.success) {
      showClassModal.value = false;
      alert(`✨ ${res.message}`);
      await loadHeroAndSkills();
    } else {
      alert(res.error || 'Erro ao trocar de classe.');
    }
  } catch (err) {
    console.error('Erro ao trocar de classe:', err);
  }
}

async function recoverFromInfirmary() {
  if (!hero.value) return;
  try {
    const res = await familyApi.recoverFromInfirmary(hero.value.id, true);
    if (res.success) {
      alert(`🎉 ${res.message}`);
      hero.value = res.character;
      infirmarySecondsLeft.value = 0;
    } else {
      alert(res.error || 'Erro ao receber alta.');
    }
  } catch (err) {
    console.error('Erro ao receber alta:', err);
  }
}

function triggerAvatarUpload() {
  if (avatarFileInput.value) avatarFileInput.value.click();
}

async function handleAvatarFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0 && hero.value) {
    const file = target.files[0];
    uploadingAvatar.value = true;
    try {
      const uploadRes = await familyApi.uploadAvatar(file);
      if (uploadRes.url) {
        const updateRes = await familyApi.updateCharacterAvatar(hero.value.id, uploadRes.url);
        if (updateRes.success) {
          hero.value.avatarUrl = uploadRes.url;
          alert('🎉 Foto do herói atualizada com sucesso!');
        }
      } else {
        alert(uploadRes.error || 'Erro ao enviar foto.');
      }
    } catch (err) {
      console.error('Erro no upload de foto:', err);
      alert('Erro ao enviar foto. Verifique o formato ou tamanho do arquivo.');
    } finally {
      uploadingAvatar.value = false;
    }
  }
}

async function selectMugenFighter(spriteKey: string) {
  if (!hero.value) return;
  try {
    const avatarValue = `sprite:${spriteKey}`;
    const res = await familyApi.updateCharacterAvatar(hero.value.id, avatarValue);
    if (res.success) {
      hero.value.avatarUrl = avatarValue;
      showAvatarModal.value = false;
      alert(`🎉 Lutador ${spriteKey.toUpperCase()} selecionado com sucesso para a Arena de Batalha!`);
    } else {
      alert(res.error || 'Erro ao selecionar lutador.');
    }
  } catch (err) {
    console.error('Erro ao selecionar lutador MUGEN:', err);
  }
}

async function upgradeStat(attribute: string) {
  if (!hero.value) return;
  try {
    const res = await familyApi.updateCharacterStats(hero.value.id, attribute);
    if (res.success) {
      alert(`✨ ${res.message}`);
      hero.value = res.character;
    } else {
      alert(res.error || 'Erro ao aprimorar atributo.');
    }
  } catch (err) {
    console.error('Erro ao aprimorar atributo:', err);
  }
}

onMounted(() => {
  loadHeroAndSkills();
  timerInterval = setInterval(updateInfirmaryCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
