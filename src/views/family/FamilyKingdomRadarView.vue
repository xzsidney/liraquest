<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título do Radar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-900/60 pb-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>🧭 Radar do Reino Lira</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">Explore os cômodos da casa e os postos avançados da vizinhança!</p>
        </div>

        <!-- Filtros de Região -->
        <div class="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-rose-900/40 text-xs font-bold">
          <button
            @click="filterCategory = 'ALL'"
            :class="['px-3 py-1.5 rounded-xl transition-all', filterCategory === 'ALL' ? 'bg-gradient-to-r from-rose-700 to-blue-700 text-amber-300 shadow' : 'text-slate-400 hover:text-white']"
          >
            Todos
          </button>
          <button
            @click="filterCategory = 'HOUSE'"
            :class="['px-3 py-1.5 rounded-xl transition-all', filterCategory === 'HOUSE' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-400 hover:text-white']"
          >
            🏠 Casa
          </button>
          <button
            @click="filterCategory = 'NEIGHBORHOOD'"
            :class="['px-3 py-1.5 rounded-xl transition-all', filterCategory === 'NEIGHBORHOOD' ? 'bg-blue-900 text-sky-300 shadow' : 'text-slate-400 hover:text-white']"
          >
            🌍 Vizinhança
          </button>
        </div>
      </div>

      <!-- Grid de Locais do Radar -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="loc in filteredLocations"
          :key="loc.id"
          @click="selectLocation(loc)"
          :class="[
            'group bg-gradient-to-b from-[#250610] to-[#0a1430] border-2 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative',
            selectedLoc?.id === loc.id ? 'border-amber-400 ring-2 ring-amber-500/50 shadow-amber-500/20' : 'border-rose-900/50 hover:border-blue-500/60'
          ]"
        >
          <!-- Imagem de Fundo com Overlay -->
          <div class="h-44 relative overflow-hidden">
            <img :src="loc.bgImageUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0a1430] via-slate-950/40 to-transparent"></div>
            
            <div class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center space-x-1.5 shadow">
              <span>{{ loc.icon }}</span>
              <span>{{ loc.category === 'HOUSE' ? 'Dentro de Casa' : 'Vizinhança' }}</span>
            </div>

            <div class="absolute bottom-3 left-3 right-3">
              <h3 class="text-lg font-black text-slate-100 leading-tight drop-shadow-md">{{ loc.name }}</h3>
            </div>
          </div>

          <!-- Conteúdo e Ação -->
          <div class="p-5 space-y-4">
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {{ loc.description }}
            </p>

            <div class="pt-3 border-t border-rose-900/40 flex items-center justify-between text-xs">
              <span class="text-blue-300 font-semibold">📍 Pronto para Missão</span>
              <button 
                @click.stop="goToMissions(loc)"
                class="bg-gradient-to-r from-rose-700 via-purple-700 to-blue-700 hover:from-rose-600 hover:to-blue-600 text-white font-black px-3.5 py-1.5 rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
              >
                Explorar ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dossiê do Local Selecionado (Modal / Card Inferior) -->
      <div v-if="selectedLoc" class="bg-gradient-to-r from-[#2a0612] via-[#120a2b] to-[#081738] border-2 border-amber-400/60 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">{{ selectedLoc.icon }}</span>
            <div>
              <h2 class="text-xl font-black text-amber-300">{{ selectedLoc.name }}</h2>
              <p class="text-xs text-blue-200">Território Ativo da Família Lira</p>
            </div>
          </div>

          <button @click="selectedLoc = null" class="text-slate-400 hover:text-white text-sm">✕ Fechar</button>
        </div>

        <p class="text-xs md:text-sm text-slate-300 leading-relaxed">{{ selectedLoc.description }}</p>

        <div class="flex flex-wrap gap-3 pt-2">
          <router-link
            to="/familia/tarefas"
            class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            📋 Ver Tarefas Deste Local
          </router-link>

          <router-link
            to="/familia/missao-ativa"
            class="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            ⏳ Iniciar Sessão de Foco Aqui
          </router-link>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi } from '../../services/familyApi';

const router = useRouter();
const locations = ref<any[]>([]);
const filterCategory = ref<'ALL' | 'HOUSE' | 'NEIGHBORHOOD'>('ALL');
const selectedLoc = ref<any | null>(null);

const filteredLocations = computed(() => {
  if (filterCategory.value === 'ALL') return locations.value;
  return locations.value.filter(l => l.category === filterCategory.value);
});

function selectLocation(loc: any) {
  selectedLoc.value = loc;
}

function goToMissions(loc: any) {
  selectedLoc.value = loc;
  router.push('/familia/tarefas');
}

async function loadLocations() {
  try {
    const res = await familyApi.getLocations();
    if (res.success && res.locations) {
      locations.value = res.locations;
      if (locations.value.length > 0) {
        selectedLoc.value = locations.value[0];
      }
    }
  } catch (err) {
    console.error('Erro ao carregar locais do radar:', err);
  }
}

onMounted(() => {
  loadLocations();
});
</script>
