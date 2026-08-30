<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título da Missão Ativa -->
      <div class="text-center space-y-2 border-b border-rose-900/60 pb-4">
        <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center justify-center space-x-2">
          <span>⏳ Centro de Foco & Expedição Real</span>
        </h1>
        <p class="text-xs md:text-sm text-blue-200">
          Inicie uma sessão de concentração real (estudos, leitura, tarefas) e ganhe recompensas épicas no jogo!
        </p>
      </div>

      <!-- ESTADO 1: NENHUMA MISSÃO ATIVA -> FORMULÁRIO DE INÍCIO -->
      <div v-if="!activeMission" class="bg-gradient-to-b from-[#250610] to-[#091533] border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div class="text-center space-y-1">
          <span class="text-4xl">🧠</span>
          <h2 class="text-xl font-black text-amber-300">Planejar Sessão de Foco</h2>
          <p class="text-xs text-slate-300">Escolha o que você vai fazer na vida real e o tempo de dedicação!</p>
        </div>

        <div class="space-y-4">
          <!-- Nome da Atividade -->
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Qual é a sua missão de foco?</label>
            <input
              v-model="missionForm.title"
              placeholder="Ex: Fazer lição de matemática, Ler 10 páginas, Arrumar os armários..."
              class="w-full bg-slate-950 border border-rose-900/60 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <!-- Categoria -->
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Categoria:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="missionForm.category = 'STUDY'"
                :class="['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', missionForm.category === 'STUDY' ? 'bg-blue-900/60 border-blue-400 text-sky-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']"
              >
                <span class="text-xl">📚</span>
                <span>Estudos & Escola</span>
              </button>

              <button
                type="button"
                @click="missionForm.category = 'CHORE'"
                :class="['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', missionForm.category === 'CHORE' ? 'bg-rose-900/60 border-rose-400 text-rose-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']"
              >
                <span class="text-xl">🧹</span>
                <span>Tarefa de Casa</span>
              </button>

              <button
                type="button"
                @click="missionForm.category = 'READING'"
                :class="['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', missionForm.category === 'READING' ? 'bg-purple-900/60 border-purple-400 text-purple-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']"
              >
                <span class="text-xl">📖</span>
                <span>Leitura</span>
              </button>
            </div>
          </div>

          <!-- Seleção de Tempo -->
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Tempo de Foco (Minutos):</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                type="button"
                v-for="mins in [10, 20, 30, 45]"
                :key="mins"
                @click="missionForm.durationMinutes = mins"
                :class="[
                  'py-3 rounded-xl border text-center transition-all font-black text-xs',
                  missionForm.durationMinutes === mins ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                ]"
              >
                {{ mins }} min
              </button>
            </div>
          </div>

          <!-- Previsão de Recompensas -->
          <div class="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs">
            <span class="text-slate-300 font-medium">Recompensas ao Concluir:</span>
            <div class="flex items-center space-x-3 font-black">
              <span class="text-amber-300">⭐ +{{ missionForm.durationMinutes * 4 }} XP</span>
              <span class="text-yellow-400">🪙 +{{ Math.floor(missionForm.durationMinutes * 1.5) }} Ouro</span>
            </div>
          </div>

          <!-- Botão Iniciar -->
          <button
            @click="startMission"
            class="w-full bg-gradient-to-r from-rose-700 via-purple-700 to-blue-700 hover:from-rose-600 hover:to-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-rose-900/40 transition-transform active:scale-95 cursor-pointer"
          >
            🚀 Iniciar Sessão de Foco Agora!
          </button>
        </div>
      </div>

      <!-- ESTADO 2: MISSÃO EM ANDAMENTO (CRONÔMETRO ATIVO) -->
      <div v-else class="bg-gradient-to-b from-[#2a0512] to-[#0a1538] border-2 border-amber-400 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 text-center relative overflow-hidden">
        
        <div class="space-y-1">
          <div class="inline-block bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black px-4 py-1 rounded-full mb-2 animate-pulse">
            ⚡ Missão de Foco em Andamento
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-slate-100">{{ activeMission.title }}</h2>
          <p class="text-xs text-blue-200">Mantenha o foco e não se distraia! O reino conta com você!</p>
        </div>

        <!-- Cronômetro Circular Visual -->
        <div class="w-56 h-56 mx-auto rounded-full bg-slate-950 border-4 border-amber-400/80 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20 relative">
          <span class="text-4xl md:text-5xl font-black text-amber-300 tracking-wider">
            {{ formatTime(remainingSeconds) }}
          </span>
          <span class="text-[11px] text-sky-400 font-bold uppercase mt-1">Tempo Restante</span>
        </div>

        <!-- Progresso e Etapas -->
        <div class="space-y-3 max-w-md mx-auto">
          <div class="flex justify-between text-xs font-bold text-slate-300">
            <span>Progresso da Sessão</span>
            <span>{{ progressPercentage }}%</span>
          </div>
          <div class="w-full bg-slate-950 h-3 rounded-full border border-blue-900 overflow-hidden">
            <div class="bg-gradient-to-r from-rose-600 via-amber-500 to-blue-500 h-full rounded-full transition-all duration-1000" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            v-if="remainingSeconds <= 0"
            @click="completeMission"
            class="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
          >
            🎉 Concluir & Coletar Recompensas!
          </button>

          <button
            v-else
            @click="completeMission"
            class="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow active:scale-95 cursor-pointer"
          >
            ✅ Finalizar Mais Cedo
          </button>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi } from '../../services/familyApi';

const activeMission = ref<any | null>(null);
const hero = ref<any | null>(null);
const remainingSeconds = ref<number>(0);
let timerInterval: any = null;

const missionForm = ref({
  title: 'Lição de Casa & Estudos',
  category: 'STUDY',
  durationMinutes: 20,
});

const progressPercentage = computed(() => {
  if (!activeMission.value) return 0;
  const totalSecs = activeMission.value.durationMinutes * 60;
  const elapsed = totalSecs - remainingSeconds.value;
  return Math.min(100, Math.max(0, Math.floor((elapsed / totalSecs) * 100)));
});

function formatTime(seconds: number) {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimer() {
  if (!activeMission.value) return;
  const now = new Date().getTime();
  const ends = new Date(activeMission.value.endsAt).getTime();
  const diff = Math.floor((ends - now) / 1000);
  remainingSeconds.value = Math.max(0, diff);
}

async function loadData() {
  try {
    const heroRes = await familyApi.getMyCharacters();
    if (heroRes.success && heroRes.characters?.length > 0) {
      const savedId = localStorage.getItem('lira_active_family_char_id');
      hero.value = heroRes.characters.find((c: any) => c.id === savedId) || heroRes.characters[0];

      if (hero.value) {
        const missionRes = await familyApi.getCurrentActiveMission(hero.value.id);
        if (missionRes.success && missionRes.mission) {
          activeMission.value = missionRes.mission;
          updateTimer();
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar missão ativa:', err);
  }
}

async function startMission() {
  if (!hero.value) {
    alert('Nenhum herói selecionado.');
    return;
  }
  try {
    const res = await familyApi.startActiveMission({
      characterId: hero.value.id,
      title: missionForm.value.title,
      category: missionForm.value.category,
      durationMinutes: missionForm.value.durationMinutes,
    });
    if (res.success && res.mission) {
      activeMission.value = res.mission;
      updateTimer();
    }
  } catch (err) {
    console.error('Erro ao iniciar missão:', err);
  }
}

async function completeMission() {
  if (!activeMission.value) return;
  try {
    const res = await familyApi.completeActiveMission(activeMission.value.id);
    if (res.success) {
      alert(`🎉 ${res.message}`);
      activeMission.value = null;
      await loadData();
    } else {
      alert(res.error || 'Erro ao concluir missão.');
    }
  } catch (err) {
    console.error('Erro ao concluir missão:', err);
  }
}

onMounted(() => {
  loadData();
  timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
