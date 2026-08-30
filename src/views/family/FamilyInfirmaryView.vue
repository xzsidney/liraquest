<template>
  <div class="min-h-screen bg-gradient-to-b from-[#1c040b] via-[#0d091a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título da Enfermaria -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-900/60 pb-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-rose-300 flex items-center space-x-2">
            <span>🏥 Enfermaria Real da Família Lira</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">
            Ala médica e repouso sagrado para curar os ferimentos de combate e restaurar as forças do Clã.
          </p>
        </div>

        <div v-if="hero" class="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs">
          <img :src="getDisplayImageUrl(hero.avatarUrl)" class="w-6 h-6 rounded-lg object-cover" />
          <span class="font-bold text-amber-300">{{ hero.name }}</span>
          <span class="text-rose-400 font-bold">({{ hero.hpCurrent }}/{{ hero.hpMax }} HP)</span>
        </div>
      </div>

      <!-- Seletor se não houver herói -->
      <div v-if="!hero" class="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <span class="text-5xl">🛡️</span>
        <h2 class="text-2xl font-black text-amber-300">Nenhum Herói Selecionado</h2>
        <p class="text-sm text-slate-300 max-w-md mx-auto">Vincule ou crie seu personagem no Salão da Família para acessar a enfermaria!</p>
        <router-link to="/familia/sala" class="inline-block bg-gradient-to-r from-rose-600 to-blue-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg">
          ➔ Ir para o Salão
        </router-link>
      </div>

      <!-- ESTADO 1: HERÓI INTERNADO (0 HP OU EM RECUPERAÇÃO) -->
      <div v-else-if="isHeroInInfirmary" class="space-y-6">
        
        <!-- Cartão da Cama Hospitalar Mágica -->
        <div class="bg-gradient-to-b from-[#2a0611] via-[#160b24] to-[#0a122e] border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
          
          <!-- Efeito de Pulso de Emergência -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

          <!-- Avatar e Status de Nocaute -->
          <div class="relative w-32 h-32 md:w-36 md:h-36 mx-auto">
            <div class="w-full h-full rounded-3xl overflow-hidden border-4 border-rose-500 shadow-2xl shadow-rose-600/40 bg-slate-950 relative">
              <img :src="getDisplayImageUrl(hero.avatarUrl)" class="w-full h-full object-cover grayscale opacity-75" />
              <div class="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
                <span class="text-4xl animate-bounce">🛌</span>
              </div>
            </div>
            <span class="absolute -bottom-2 -right-2 bg-rose-600 border-2 border-white text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              0 HP
            </span>
          </div>

          <div>
            <span class="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-4 py-1 rounded-full border border-rose-700/60 inline-block">
              🚨 Em Tratamento Intensivo
            </span>
            <h2 class="text-2xl md:text-3xl font-black text-slate-100 mt-2">{{ hero.name }}</h2>
            <p class="text-xs text-amber-300 font-bold uppercase tracking-wider mt-0.5">
              {{ hero.characterClass }} • Nível {{ hero.level }}
            </p>
            <p class="text-xs md:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
              O herói foi nocauteado em combate contra o chefe da masmorra. As poções e encantos do Reino estão restaurando sua vitalidade.
            </p>
          </div>

          <!-- Painel do Cronômetro de 1 Hora Regressivo -->
          <div class="bg-slate-950/90 border-2 border-amber-400/40 rounded-3xl p-6 max-w-md mx-auto space-y-3 shadow-inner">
            <div class="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>TEMPO RESTANTE DE REPOUSO</span>
              <span class="text-amber-400">{{ Math.round(recoveryPercentage) }}% Recuperado</span>
            </div>

            <!-- Display Digital Gigante -->
            <div class="text-4xl md:text-5xl font-mono font-black text-amber-300 tracking-widest py-2 bg-slate-900/80 rounded-2xl border border-rose-900/40 shadow-inner">
              ⏳ {{ formattedInfirmaryTime }}
            </div>

            <!-- Barra de Progresso do Tempo -->
            <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                class="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
                :style="{ width: `${recoveryPercentage}%` }"
              ></div>
            </div>

            <p class="text-[11px] text-slate-400">
              Ao atingir <strong>00:00</strong>, o botão para reviver o herói com <strong>100% de Vida Full</strong> será liberado!
            </p>
          </div>

          <!-- Botão Reviver / Receber Alta -->
          <div class="pt-2">
            <button
              v-if="infirmarySecondsLeft <= 0 || hero.isParent"
              @click="reviveHero"
              class="w-full max-w-md mx-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-base md:text-lg py-4 px-8 rounded-2xl shadow-2xl shadow-amber-400/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-3"
            >
              <span class="text-2xl">✨</span>
              <span>Reviver Herói (100% Vida Full)</span>
            </button>

            <div v-else class="text-xs text-slate-400 font-bold bg-slate-950/60 max-w-md mx-auto p-3 rounded-xl border border-slate-800">
              🔒 O paciente está em repouso. Aguarde a contagem zerar para reviver!
            </div>
          </div>

        </div>

      </div>

      <!-- ESTADO 2: HERÓI 100% SAUDÁVEL -->
      <div v-else class="bg-gradient-to-b from-[#102419] to-[#09152b] border-2 border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div class="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-4 border-emerald-400 shadow-xl bg-slate-950">
          <img :src="getDisplayImageUrl(hero.avatarUrl)" class="w-full h-full object-cover" />
        </div>

        <div>
          <span class="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600/60 inline-block">
            ✅ Saúde Impecável
          </span>
          <h2 class="text-2xl md:text-3xl font-black text-slate-100 mt-2">{{ hero.name }} está 100% Forte!</h2>
          <p class="text-xs md:text-sm text-emerald-200 max-w-md mx-auto mt-1">
            Seu herói está com o HP máximo e pronto para enfrentar monstros, cumprir missões e explorar o reino!
          </p>
        </div>

        <!-- Indicador de Vida e Mana -->
        <div class="max-w-md mx-auto bg-slate-950/80 p-4 rounded-2xl border border-emerald-900/50 space-y-3 text-left">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-rose-400">❤️ Vida (HP):</span>
              <span class="text-slate-100">{{ hero.hpCurrent }} / {{ hero.hpMax }} (100%)</span>
            </div>
            <div class="w-full bg-slate-900 h-2.5 rounded-full border border-rose-800/40 overflow-hidden">
              <div class="bg-gradient-to-r from-rose-500 to-emerald-400 h-full rounded-full" style="width: 100%;"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-sky-400">💧 Mana (MP):</span>
              <span class="text-slate-100">{{ hero.mpCurrent }} / {{ hero.mpMax }} (100%)</span>
            </div>
            <div class="w-full bg-slate-900 h-2.5 rounded-full border border-blue-800/40 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full" style="width: 100%;"></div>
            </div>
          </div>
        </div>

        <!-- Atalhos de Ação -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <router-link
            to="/familia/batalha"
            class="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 text-center"
          >
            ⚔️ Ir para a Arena de Batalha
          </router-link>

          <router-link
            to="/familia/ficha"
            class="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 text-center"
          >
            🛡️ Acessar Ficha & Habilidades
          </router-link>

          <router-link
            to="/familia/sala"
            class="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl transition-transform active:scale-95 text-center"
          >
            🏰 Voltar ao Salão
          </router-link>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import confetti from 'canvas-confetti';

const hero = ref<any | null>(null);
const infirmarySecondsLeft = ref<number>(0);
let timerInterval: any = null;

const isHeroInInfirmary = computed(() => {
  if (!hero.value) return false;
  if (hero.value.hpCurrent <= 0) return true;
  if (hero.value.inInfirmaryUntil && new Date(hero.value.inInfirmaryUntil).getTime() > Date.now()) {
    return true;
  }
  return false;
});

const formattedInfirmaryTime = computed(() => {
  if (infirmarySecondsLeft.value <= 0) return '00:00';
  const m = Math.floor(infirmarySecondsLeft.value / 60);
  const s = infirmarySecondsLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const recoveryPercentage = computed(() => {
  // 1 hora total = 3600 segundos
  const totalSeconds = 3600;
  const elapsed = Math.max(0, totalSeconds - infirmarySecondsLeft.value);
  return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
});

function updateInfirmaryCountdown() {
  if (hero.value && hero.value.inInfirmaryUntil) {
    const diff = Math.floor((new Date(hero.value.inInfirmaryUntil).getTime() - Date.now()) / 1000);
    infirmarySecondsLeft.value = Math.max(0, diff);
  } else {
    infirmarySecondsLeft.value = 0;
  }
}

async function loadHero() {
  try {
    const res = await familyApi.getMyCharacters();
    if (res.success && res.characters?.length > 0) {
      const savedId = localStorage.getItem('lira_active_family_char_id');
      hero.value = res.characters.find((c: any) => c.id === savedId) || res.characters[0];
      updateInfirmaryCountdown();
    }
  } catch (err) {
    console.error('Erro ao carregar herói na enfermaria:', err);
  }
}

async function reviveHero() {
  if (!hero.value) return;
  try {
    const res = await familyApi.recoverFromInfirmary(hero.value.id, true);
    if (res.success) {
      hero.value = res.character;
      infirmarySecondsLeft.value = 0;

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#f59e0b', '#38bdf8']
      });

      alert('🎉 HERÓI RENASCIDO! O herói foi curado com 100% de HP e Mana Full!');
    } else {
      alert(res.error || 'Erro ao reviver herói.');
    }
  } catch (err) {
    console.error('Erro ao reviver herói:', err);
  }
}

onMounted(() => {
  loadHero();
  timerInterval = setInterval(updateInfirmaryCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
