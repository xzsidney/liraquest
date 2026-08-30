<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden pb-12">
    <FamilyNavbar />
    
    <div class="p-4 md:p-8">
      <!-- Modal de Convite de Batalha Recebido em Tempo Real -->
      <transition name="slide-down">
        <div 
          v-if="incomingBattleInvite && incomingBattleInvite.leaderId !== activeCharacter?.id"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4"
        >
        <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border-2 border-purple-400 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">⚔️</span>
            <div>
              <p class="text-xs font-extrabold uppercase tracking-wider text-purple-300">Convite de Batalha!</p>
              <p class="text-sm font-bold text-slate-100">
                <strong>{{ incomingBattleInvite.leaderName }}</strong> te chamou para enfrentar <em>{{ incomingBattleInvite.monsterName }}</em>!
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="acceptInviteAndGo"
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow transition-all active:scale-95"
            >
              Aceitar!
            </button>
            <button
              @click="incomingBattleInvite = null"
              class="text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Emojis Flutuantes em Tempo Real -->
    <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <transition-group name="float-up">
        <div
          v-for="reaction in floatingReactions"
          :key="reaction.id"
          class="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500/50 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce text-lg"
        >
          <span class="text-2xl">{{ reaction.emoji }}</span>
          <span class="font-bold text-amber-300">{{ reaction.characterName }}:</span>
          <span class="text-slate-200 text-sm">{{ reaction.text || 'mandou uma reação!' }}</span>
        </div>
      </transition-group>
    </div>

    <!-- Banner de Alerta em Tempo Real (Conquistas/Tarefas) -->
    <transition name="slide-down">
      <div 
        v-if="familyAlerts.length > 0"
        class="mb-6 max-w-4xl mx-auto bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 px-6 py-3 rounded-2xl shadow-xl shadow-amber-500/20 font-bold flex items-center justify-between border-2 border-yellow-200"
      >
        <div class="flex items-center space-x-3">
          <span class="text-3xl animate-spin">⭐</span>
          <div>
            <p class="text-sm uppercase tracking-wider font-extrabold text-amber-950">Conquista em Família!</p>
            <p class="text-base">
              🎉 <strong>{{ familyAlerts[0].characterName }}</strong> concluiu <em>"{{ familyAlerts[0].taskTitle }}"</em> (+{{ familyAlerts[0].rewardXp }} XP • +{{ familyAlerts[0].rewardGold }} Ouro)!
            </p>
          </div>
        </div>
        <button @click="familyAlerts.shift()" class="text-amber-950 font-black text-xl hover:scale-110 transition-transform">✕</button>
      </div>
    </transition>

    <!-- Topo / Header da Família Lira -->
    <header class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div class="flex items-center space-x-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <span class="text-3xl">🏰</span>
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
            Crônicas da Família Lira
          </h1>
          <p class="text-xs md:text-sm text-slate-400 flex items-center space-x-2">
            <span>🔥 Salão do Clã em Tempo Real</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-emerald-400 font-semibold">Multijogador Conectado</span>
          </p>
        </div>
      </div>

      <!-- Seletor de Perfil Ativo (Filtrado estritamente para o Usuário Logado) -->
      <div class="flex items-center space-x-2">
        <div v-if="myCharacters.length > 1" class="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center space-x-3">
          <label class="text-xs text-slate-400 font-medium pl-1">Seu Herói:</label>
          <select 
            v-model="selectedCharacterId" 
            @change="changeActiveCharacter"
            class="bg-slate-800 text-amber-300 font-bold text-sm px-3 py-1.5 rounded-lg border border-amber-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option v-for="m in myCharacters" :key="m.id" :value="m.id">
              {{ m.name }} ({{ m.characterClass }}) - Nv. {{ m.level }}
            </option>
          </select>
        </div>

        <div v-else-if="myCharacters.length === 1 && activeCharacter" class="bg-slate-900 border border-amber-500/40 px-3 py-2 rounded-xl flex items-center space-x-2">
          <span class="text-xs text-slate-400">Jogando como:</span>
          <span class="text-xs font-black text-amber-300">{{ activeCharacter.name }} ({{ activeCharacter.characterClass }})</span>
        </div>

        <button
          @click="showClaimModal = true"
          class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl font-bold transition-all"
        >
          ⚙️ Heróis
        </button>

        <button
          @click="logout"
          class="bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-rose-100 text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer"
          title="Sair da Conta"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </header>

    <!-- Barra de Reações Rápidas -->
    <div class="max-w-6xl mx-auto my-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 backdrop-blur-sm">
      <div class="flex items-center space-x-2 text-xs font-semibold text-slate-400 pl-2">
        <span>Interagir com a família:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="btn in reactionButtons" 
          :key="btn.emoji"
          @click="sendReaction(btn.emoji, btn.text)"
          class="bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <span class="text-base">{{ btn.emoji }}</span>
          <span>{{ btn.label }}</span>
        </button>
      </div>
    </div>

    <!-- Banner de Emergência: Herói na Enfermaria (0 HP) -->
    <section v-if="activeCharacter && (activeCharacter.hpCurrent <= 0 || (activeCharacter.inInfirmaryUntil && new Date(activeCharacter.inInfirmaryUntil).getTime() > Date.now()))" class="max-w-6xl mx-auto my-4 bg-gradient-to-r from-rose-950 via-red-950 to-rose-900 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
      <div class="flex items-center space-x-3 text-left">
        <span class="text-4xl">🚑</span>
        <div>
          <h3 class="text-base md:text-lg font-black text-rose-200">Herói Nocauteado (0 HP)!</h3>
          <p class="text-xs text-rose-300">
            Seu herói foi internado na Enfermaria Real e está em recuperação.
          </p>
        </div>
      </div>
      <router-link
        to="/familia/enfermaria"
        class="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs md:text-sm px-6 py-2.5 rounded-2xl shadow-xl transition-all shrink-0 cursor-pointer"
      >
        🏥 Ir para a Enfermaria (Aguardar / Reviver 100% HP) ➔
      </router-link>
    </section>

    <!-- Herói Selecionado / Card de Destaque -->
    <section v-if="activeCharacter" class="max-w-6xl mx-auto my-6">
      <div class="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl pointer-events-none">🛡️</div>
        
        <div class="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-amber-400/80 shadow-xl shadow-amber-500/20 bg-slate-800">
              <img :src="getDisplayImageUrl(activeCharacter.avatarUrl)" :alt="activeCharacter.name" class="w-full h-full object-cover" />
            </div>
            <span class="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
              Nv. {{ activeCharacter.level }}
            </span>
          </div>

          <!-- Info & Barras -->
          <div class="flex-1 text-center md:text-left space-y-2">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 class="text-2xl font-black text-slate-100">{{ activeCharacter.name }}</h2>
              <span class="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {{ activeCharacter.characterClass }} • {{ activeCharacter.title || 'Guardião' }}
              </span>
              <span v-if="activeCharacter.isParent" class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                👑 Mestre Parental
              </span>
            </div>

            <!-- Barras de Recursos -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <!-- HP -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-rose-400 flex items-center space-x-1"><span>❤️</span><span>Vida (HP)</span></span>
                  <span>{{ activeCharacter.hpCurrent }} / {{ activeCharacter.hpMax }}</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-rose-500 h-full rounded-full transition-all duration-300" :style="{ width: `${(activeCharacter.hpCurrent / activeCharacter.hpMax) * 100}%` }"></div>
                </div>
              </div>

              <!-- MP -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-sky-400 flex items-center space-x-1"><span>💧</span><span>Mana (MP)</span></span>
                  <span>{{ activeCharacter.mpCurrent }} / {{ activeCharacter.mpMax }}</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-sky-500 h-full rounded-full transition-all duration-300" :style="{ width: `${(activeCharacter.mpCurrent / activeCharacter.mpMax) * 100}%` }"></div>
                </div>
              </div>

              <!-- XP -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-amber-400 flex items-center space-x-1"><span>⭐</span><span>Experiência (XP)</span></span>
                  <span class="text-amber-300">🪙 {{ activeCharacter.gold }} Ouro</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300" :style="{ width: `${Math.min(100, (activeCharacter.currentXp / activeCharacter.nextLevelXp) * 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Equipamentos Mini -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px] text-slate-300">
              <span class="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1">
                <span>🗡️ Arma:</span>
                <strong class="text-amber-300">{{ activeCharacter.equippedWeapon || 'Espada de Treino' }}</strong>
              </span>
              <span class="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1">
                <span>🛡️ Armadura:</span>
                <strong class="text-amber-300">{{ activeCharacter.equippedArmor || 'Colete de Couro' }}</strong>
              </span>
              <span v-if="activeCharacter.equippedPet" class="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1">
                <span>🐾 Mascote:</span>
                <strong class="text-amber-300">{{ activeCharacter.equippedPet }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Card de Ação Rápida para Quem Não Tem Personagem Vinculado -->
    <section v-else class="max-w-6xl mx-auto my-6 bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
      <span class="text-5xl">🏰</span>
      <h2 class="text-2xl font-black text-amber-300">Bem-vindo ao Salão da Família Lira!</h2>
      <p class="text-sm text-slate-300 max-w-md mx-auto">
        Você ainda não vinculou seu herói a esta conta. Escolha um dos personagens da família ou crie o seu agora mesmo para começar!
      </p>
      <button
        @click="showClaimModal = true"
        class="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
      >
        ✨ Vincular ou Criar Meu Herói
      </button>
    </section>

    <!-- Módulos / Hub de Navegação Expandido -->
    <section class="max-w-6xl mx-auto my-8">
      <h3 class="text-sm font-extrabold uppercase tracking-wider text-amber-300 mb-4 flex items-center space-x-2">
        <span>🧭 Caminhos do Reino Lira:</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- 1. Ficha do Herói -->
        <router-link to="/familia/ficha" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-rose-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-amber-300 transition-colors">Ficha do Herói</h4>
            <p class="text-xs text-slate-400 mt-1">Evolua Força, Sabedoria e Laço Familiar com seu XP acumulado!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Acessar Ficha</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 2. Radar do Reino -->
        <router-link to="/familia/radar" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-blue-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🧭
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-sky-300 transition-colors">Radar do Reino</h4>
            <p class="text-xs text-slate-400 mt-1">Explore os cômodos da casa e os postos avançados da vizinhança!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Abrir Mapa</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 3. Centro de Foco AFK -->
        <router-link to="/familia/missao-ativa" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-purple-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⏳
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-purple-300 transition-colors">Centro de Foco</h4>
            <p class="text-xs text-slate-400 mt-1">Cronômetro de concentração para estudos e tarefas da vida real!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Iniciar Sessão</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 4. Arena de Batalha -->
        <router-link to="/familia/batalha" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-rose-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚔️
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-rose-300 transition-colors">Arena de Batalha</h4>
            <p class="text-xs text-slate-400 mt-1">Enfrente monstros em turnos ao vivo solo ou em grupo com a família!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Entrar na Arena</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 5. Tarefas da Casa -->
        <router-link to="/familia/tarefas" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-amber-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-amber-300 transition-colors">Missões Diárias</h4>
            <p class="text-xs text-slate-400 mt-1">Lave a louça, arrume o quarto e estude para ganhar XP e Ouro real!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Ver Missões</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 6. Loja e Vales Reais -->
        <router-link to="/familia/loja" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-blue-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🛍️
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-sky-300 transition-colors">Loja & Recompensas</h4>
            <p class="text-xs text-slate-400 mt-1">Compre armas, mascotes e troque seu ouro por 1h de videogame ou pizza!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Abrir Mercado</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 7. Contos e Livro-Jogo -->
        <router-link to="/familia/aventuras" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-emerald-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📜
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-emerald-300 transition-colors">Contos Interativos</h4>
            <p class="text-xs text-slate-400 mt-1">Histórias solo com escolhas e rolagens de dados de atributos!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Ler Contos</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 8. Mural do Clã & Placar -->
        <router-link to="/familia/mural" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-yellow-900/60 hover:border-amber-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-yellow-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-yellow-950 border border-yellow-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-amber-300 transition-colors">Mural de Honra</h4>
            <p class="text-xs text-slate-400 mt-1">Ranking semanal da família, medalhas e feed de boas ações!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-yellow-400 group-hover:translate-x-1 transition-transform">
            <span>Ver Placar</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

        <!-- 9. Enfermaria Real -->
        <router-link to="/familia/enfermaria" class="group bg-gradient-to-b from-[#20050d] to-[#0a122e] border border-rose-900/60 hover:border-rose-400 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-600/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏥
            </div>
            <h4 class="text-base font-black text-slate-100 group-hover:text-rose-300 transition-colors">Enfermaria Real</h4>
            <p class="text-xs text-slate-400 mt-1">Repouse ferimentos de combate e reviva seu herói com 100% de Vida!</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Acessar Ala Médica</span>
            <span class="ml-1">➔</span>
          </div>
        </router-link>

      </div>
    </section>

    <!-- Modal de Criar Herói da Família -->
    <div v-if="showClaimModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border-2 border-amber-500/40 p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button v-if="myCharacters.length > 0" @click="showClaimModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

        <div class="text-center">
          <span class="text-4xl">⚔️</span>
          <h3 class="text-xl font-black text-amber-300 mt-2">Crie seu Herói da Família</h3>
          <p class="text-xs text-slate-400">Personalize seu personagem para entrar nas missões e batalhas!</p>
        </div>

        <!-- Escolha do Avatar & Upload de Foto -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-300">Escolha a Foto ou Envie do Aparelho:</label>
            <button
              type="button"
              @click="triggerAvatarUpload"
              class="text-[11px] font-black text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer"
            >
              <span>📷</span>
              <span>{{ uploadingAvatar ? 'Enviando...' : 'Enviar Foto Real' }}</span>
            </button>
            <input type="file" ref="avatarFileInput" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAvatarFileChange" />
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="ava in avatarOptions"
              :key="ava"
              @click="newHeroForm.avatarUrl = ava"
              :class="[
                'w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 relative',
                newHeroForm.avatarUrl === ava ? 'border-amber-400 ring-2 ring-amber-500/50 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
              ]"
            >
              <img :src="getDisplayImageUrl(ava)" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Formulário de Criação -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Nome do seu Herói:</label>
            <input
              v-model="newHeroForm.name"
              placeholder="Ex: Paulo Lira, Lucas, Sofia..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-bold text-slate-300 block mb-1">Classe:</label>
              <select
                v-model="newHeroForm.characterClass"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="GUERREIRO">⚔️ Guerreiro (Dano)</option>
                <option value="MAGO">🔥 Mago (Magia)</option>
                <option value="PALADINO">🛡️ Paladino (Defesa)</option>
                <option value="CURANDEIRA">✨ Curandeira (Cura)</option>
                <option value="ARQUEIRO">🏹 Arqueiro (Velocidade)</option>
                <option value="LADINO">🗡️ Ladino (Furtividade)</option>
                <option value="INVOCADORA">🐾 Invocadora (Mascotes)</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-300 block mb-1">Título de Honra:</label>
              <input
                v-model="newHeroForm.title"
                placeholder="Ex: O Guardião da Casa"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            @click="createNewHero"
            class="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-3 cursor-pointer"
          >
            ✨ Criar Meu Herói e Entrar no Salão
          </button>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi } from '../../services/familyApi';
import { 
  joinFamilyRoom, 
  sendFamilyReaction, 
  floatingReactions, 
  familyAlerts, 
  incomingBattleInvite,
  acceptPartyInvite
} from '../../services/familySocket';

const router = useRouter();
const members = ref<any[]>([]);
const myCharacters = ref<any[]>([]);
const selectedCharacterId = ref<string>('');
const showClaimModal = ref<boolean>(false);

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);
const avatarFileInput = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref<boolean>(false);

const avatarOptions = ref<string[]>([
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
]);

const newHeroForm = ref({
  name: '',
  characterClass: 'GUERREIRO',
  title: 'Guardião da Casa',
  avatarUrl: avatarOptions.value[0],
});

function getDisplayImageUrl(url: string) {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${API_BASE_URL}${url}`;
}

function triggerAvatarUpload() {
  if (avatarFileInput.value) avatarFileInput.value.click();
}

async function handleAvatarFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    uploadingAvatar.value = true;
    try {
      const res = await familyApi.uploadAvatar(file);
      if (res.url) {
        const fullUrl = res.url;
        avatarOptions.value.unshift(fullUrl);
        newHeroForm.value.avatarUrl = fullUrl;
      } else {
        alert(res.error || 'Erro ao enviar foto.');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Erro ao enviar foto. Verifique o formato ou tamanho do arquivo.');
    } finally {
      uploadingAvatar.value = false;
    }
  }
}

function acceptInviteAndGo() {
  if (activeCharacter.value) {
    acceptPartyInvite(activeCharacter.value);
    router.push('/familia/batalha');
  }
}

const activeCharacter = computed(() => {
  if (myCharacters.value.length > 0) {
    return myCharacters.value.find(m => m.id === selectedCharacterId.value) || myCharacters.value[0];
  }
  return members.value.find(m => m.id === selectedCharacterId.value) || null;
});

const reactionButtons = [
  { emoji: '👏', label: 'Parabéns!', text: 'Mandou bem na missão!' },
  { emoji: '🔥', label: 'Bora time!', text: 'Vamos vencer o monstro!' },
  { emoji: '💖', label: 'Amo vocês!', text: 'Família unida!' },
  { emoji: '🛡️', label: 'Defesa!', text: 'Cuidado com o chefe!' },
  { emoji: '😂', label: 'Hahaha!', text: 'Muito divertido!' },
  { emoji: '⭐', label: 'Super Estrela!', text: 'Arrasou!' },
];

function sendReaction(emoji: string, text: string) {
  if (activeCharacter.value) {
    sendFamilyReaction(activeCharacter.value.id, activeCharacter.value.name, emoji, text);
  }
}

function logout() {
  sessionStorage.removeItem('lira_token');
  sessionStorage.removeItem('lira_user');
  localStorage.removeItem('lira_token');
  localStorage.removeItem('lira_user');
  localStorage.removeItem('token');
  router.push('/login');
}

function selectCharacter(id: string) {
  selectedCharacterId.value = id;
  localStorage.setItem('lira_active_family_char_id', id);
  if (activeCharacter.value) {
    joinFamilyRoom(activeCharacter.value.id, activeCharacter.value.name);
  }
}

function changeActiveCharacter() {
  selectCharacter(selectedCharacterId.value);
}

async function createNewHero() {
  if (!newHeroForm.value.name) {
    alert('Por favor, informe o nome do seu herói.');
    return;
  }
  try {
    const res = await familyApi.createCharacter(newHeroForm.value);
    if (res.success) {
      alert(`🎉 Herói ${res.character.name} criado com sucesso!`);
      showClaimModal.value = false;
      await loadData();
      if (res.character?.id) {
        selectCharacter(res.character.id);
      }
    } else {
      alert(res.error || 'Erro ao criar herói.');
    }
  } catch (err) {
    console.error('Erro ao criar herói:', err);
  }
}

async function loadData() {
  try {
    // 1. Carrega todos os membros para visualização do clã
    const membersRes = await familyApi.getMembers();
    if (membersRes.success && membersRes.members) {
      members.value = membersRes.members;
    }

    // 2. Carrega apenas os personagens pertencentes ao usuário logado
    const myRes = await familyApi.getMyCharacters();
    if (myRes.success && myRes.characters) {
      myCharacters.value = myRes.characters;
      
      if (myCharacters.value.length > 0) {
        selectedCharacterId.value = myCharacters.value[0].id;
        localStorage.setItem('lira_active_family_char_id', selectedCharacterId.value);
      }
    }

    if (activeCharacter.value) {
      joinFamilyRoom(activeCharacter.value.id, activeCharacter.value.name);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do Salão da Família:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.float-up-enter-active, .float-up-leave-active {
  transition: all 0.6s ease;
}
.float-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.8);
}
.float-up-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(1.1);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
