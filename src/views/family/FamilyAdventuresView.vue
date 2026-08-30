<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título dos Contos -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-900/60 pb-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>📜 Contos & Livro-Jogo da Família Lira</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">
            Viva aventuras interativas solo, faça escolhas e role os dados dos seus atributos!
          </p>
        </div>

        <button 
          v-if="currentNode" 
          @click="exitStory" 
          class="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all"
        >
          ➔ Sair da História
        </button>
      </div>

      <!-- ESTADO 1: LISTA DE HISTÓRIAS DISPONÍVEIS -->
      <div v-if="!currentNode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="adv in adventures"
          :key="adv.id"
          class="bg-gradient-to-b from-[#250610] to-[#0a1430] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 flex flex-col justify-between"
        >
          <div class="h-48 relative overflow-hidden">
            <img :src="adv.coverImageUrl" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0a1430] via-transparent to-transparent"></div>
            <div class="absolute top-3 left-3 bg-rose-950/90 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
              Nível {{ adv.recommendedLevel }}+
            </div>
          </div>

          <div class="p-6 pt-0 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-black text-slate-100">{{ adv.title }}</h3>
              <p class="text-xs text-slate-300 mt-2 leading-relaxed">{{ adv.summary }}</p>
            </div>

            <div class="pt-4 border-t border-rose-900/40 flex items-center justify-between">
              <div class="text-xs font-bold text-amber-400">
                ⭐ +{{ adv.rewardXp }} XP • 🪙 +{{ adv.rewardGold }} Ouro
              </div>

              <button
                @click="startAdventure(adv)"
                class="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                📖 Jogar Agora
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ESTADO 2: CENA NARRATIVA INTERATIVA (VISUAL NOVEL) -->
      <div v-else class="bg-gradient-to-b from-[#2a0512] to-[#0a1538] border-2 border-amber-400 rounded-3xl overflow-hidden shadow-2xl space-y-6">
        
        <!-- Cenário e Sprites -->
        <div class="h-64 md:h-80 relative overflow-hidden">
          <img :src="currentNode.bgImageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#2a0512] via-slate-950/50 to-transparent"></div>
          
          <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div class="flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-amber-500/30">
              <img :src="currentNode.speakerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'" class="w-12 h-12 rounded-xl object-cover border border-amber-400" />
              <div>
                <p class="text-xs font-black text-amber-300">{{ currentNode.speakerName || 'Narrador' }}</p>
                <p class="text-[10px] text-blue-200">Aventura da Família</p>
              </div>
            </div>

            <div v-if="currentNode.isEnding" class="bg-emerald-600/90 text-white font-black text-xs px-4 py-2 rounded-xl shadow border border-emerald-400 animate-bounce">
              🎉 Fim da Aventura!
            </div>
          </div>
        </div>

        <!-- Caixa de Diálogo & Narração -->
        <div class="p-6 md:p-8 pt-0 space-y-6">
          <div class="bg-slate-950/90 border border-rose-900/60 p-5 rounded-2xl space-y-2">
            <h4 class="text-base font-black text-amber-300">{{ currentNode.title }}</h4>
            <p class="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              {{ currentNode.narration }}
            </p>
          </div>

          <!-- Resultado de Rolagem de Dados Recente -->
          <div v-if="lastRoll" class="bg-gradient-to-r from-blue-950 to-purple-950 border border-blue-500/50 p-4 rounded-2xl flex items-center justify-between text-xs animate-fade-in">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🎲</span>
              <div>
                <p class="font-black text-sky-300">
                  Rolagem de Dado: D20 ({{ lastRoll.d20 }}) + Bônus ({{ lastRoll.attributeBonus }}) = <strong class="text-amber-300 text-sm">{{ lastRoll.total }}</strong>
                </p>
                <p class="text-[10px] text-slate-300">Dificuldade Alvo: {{ lastRoll.difficulty }}</p>
              </div>
            </div>

            <span :class="['font-black px-3 py-1 rounded-xl text-xs', lastRoll.passed ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white']">
              {{ lastRoll.passed ? '✨ SUCESSO!' : '❌ FALHA' }}
            </span>
          </div>

          <!-- Escolhas Ramificadas -->
          <div v-if="!currentNode.isEnding" class="space-y-3">
            <h5 class="text-xs font-black uppercase tracking-wider text-amber-400">O que você deseja fazer?</h5>
            
            <button
              v-for="choice in currentNode.choices"
              :key="choice.id"
              @click="makeChoice(choice)"
              class="w-full text-left bg-slate-900/90 hover:bg-gradient-to-r hover:from-rose-900/80 hover:to-blue-900/80 border border-slate-800 hover:border-amber-400 p-4 rounded-2xl text-xs font-bold text-slate-100 transition-all flex items-center justify-between group shadow cursor-pointer"
            >
              <div class="flex items-center space-x-3">
                <span class="text-base group-hover:scale-125 transition-transform">➔</span>
                <span>{{ choice.text }}</span>
              </div>

              <span v-if="choice.testAttribute" class="bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[10px] text-amber-400">
                Teste de {{ choice.testAttribute }} (Dif. {{ choice.difficulty }})
              </span>
            </button>
          </div>

          <!-- Final da História & Coleta -->
          <div v-else class="text-center space-y-4 pt-4">
            <div class="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 inline-block text-xs font-bold text-amber-300">
              ⭐ +{{ currentNode.rewardXp }} XP • 🪙 +{{ currentNode.rewardGold }} Ouro Adicionados à sua Ficha!
            </div>
            <div>
              <button
                @click="exitStory"
                class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-8 py-3 rounded-2xl shadow-xl transition-transform active:scale-95 cursor-pointer"
              >
                ✨ Concluir Conto & Voltar
              </button>
            </div>
          </div>

        </div>

      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi } from '../../services/familyApi';

const adventures = ref<any[]>([]);
const currentAdventure = ref<any | null>(null);
const currentNode = ref<any | null>(null);
const lastRoll = ref<any | null>(null);
const hero = ref<any | null>(null);

async function loadData() {
  try {
    const heroRes = await familyApi.getMyCharacters();
    if (heroRes.success && heroRes.characters?.length > 0) {
      const savedId = localStorage.getItem('lira_active_family_char_id');
      hero.value = heroRes.characters.find((c: any) => c.id === savedId) || heroRes.characters[0];
    }

    const advRes = await familyApi.getStoryAdventures();
    if (advRes.success && advRes.adventures) {
      adventures.value = advRes.adventures;
    }
  } catch (err) {
    console.error('Erro ao carregar contos:', err);
  }
}

async function startAdventure(adv: any) {
  currentAdventure.value = adv;
  lastRoll.value = null;
  try {
    const res = await familyApi.getStoryNode(adv.id, adv.initialNodeId);
    if (res.success && res.node) {
      currentNode.value = res.node;
    }
  } catch (err) {
    console.error('Erro ao iniciar conto:', err);
  }
}

async function makeChoice(choice: any) {
  if (!hero.value) return;
  try {
    const res = await familyApi.executeStoryChoice(hero.value.id, choice.id);
    if (res.success) {
      lastRoll.value = res.rollResult;
      currentNode.value = res.targetNode;
    }
  } catch (err) {
    console.error('Erro ao executar escolha:', err);
  }
}

function exitStory() {
  currentNode.value = null;
  currentAdventure.value = null;
  lastRoll.value = null;
}

onMounted(() => {
  loadData();
});
</script>
