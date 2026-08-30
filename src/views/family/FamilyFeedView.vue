<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Topo: Título do Mural -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-900/60 pb-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>🏆 Mural do Clã & Galeria de Honra</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">
            Acompanhe o ranking da família, as conquistas desbloqueadas e o feed de boas ações!
          </p>
        </div>

        <div class="bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-500/40 px-4 py-2 rounded-2xl text-xs font-black text-amber-300 shadow">
          👑 União e Honra da Família Lira
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Coluna 1: Placar de Heróis (Leaderboard) -->
        <div class="space-y-6">
          <div class="bg-gradient-to-b from-[#250610] to-[#0a1430] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 class="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2 border-b border-rose-900/40 pb-3">
              <span>👑 Placar dos Heróis da Família</span>
            </h3>

            <div class="space-y-3">
              <div
                v-for="(member, idx) in leaderboard"
                :key="member.id"
                :class="[
                  'p-3.5 rounded-2xl border flex items-center justify-between transition-transform hover:scale-102',
                  idx === 0 ? 'bg-gradient-to-r from-amber-500/20 via-rose-900/40 to-blue-900/40 border-amber-400 shadow-lg shadow-amber-500/10' : 'bg-slate-950/80 border-slate-800'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-base font-black w-5 text-center" :class="idx === 0 ? 'text-amber-300 text-lg' : 'text-slate-400'">
                    {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
                  </span>
                  
                  <img :src="getDisplayImageUrl(member.avatarUrl)" class="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                  
                  <div>
                    <h5 class="text-xs font-bold text-slate-100">{{ member.name }}</h5>
                    <p class="text-[10px] text-amber-400 font-semibold">{{ member.characterClass }} • Nv. {{ member.level }}</p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-xs font-black text-amber-300">⭐ {{ member.currentXp }} XP</p>
                  <p class="text-[10px] text-yellow-400 font-bold">🪙 {{ member.gold }} Ouro</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna 2 & 3: Feed de Atividades & Medalhas de Honra -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Galeria de Medalhas & Conquistas -->
          <div class="bg-gradient-to-b from-[#22050f] via-[#100b24] to-[#071433] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 class="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2 border-b border-rose-900/40 pb-3">
              <span>🏅 Medalhas & Conquistas da Casa</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="ach in achievements"
                :key="ach.id"
                class="bg-slate-950/80 p-4 rounded-2xl border border-rose-900/50 flex items-start space-x-3.5 hover:border-amber-400/60 transition-colors"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-950 to-blue-950 border border-amber-500/40 flex items-center justify-center text-2xl shadow shrink-0">
                  {{ ach.icon }}
                </div>
                <div class="space-y-1">
                  <h5 class="text-xs font-black text-slate-100">{{ ach.title }}</h5>
                  <p class="text-[11px] text-slate-400 leading-snug">{{ ach.description }}</p>
                  <div class="text-[10px] font-bold text-amber-400 pt-1">
                    Recompensa: +{{ ach.rewardXp }} XP • +{{ ach.rewardGold }} Ouro
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feed de Boas Ações Aprovadas -->
          <div class="bg-gradient-to-b from-[#1c040c] to-[#061028] border border-blue-900/60 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 class="text-sm font-black uppercase tracking-wider text-blue-300 flex items-center space-x-2 border-b border-blue-900/40 pb-3">
              <span>📜 Diário de Boas Ações Aprovadas</span>
            </h3>

            <div v-if="feed.length === 0" class="text-center py-6 text-slate-400 text-xs">
              Nenhuma tarefa recente ainda. Cumpra missões para aparecer no mural!
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="log in feed"
                :key="log.id"
                class="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-900/40 flex items-center justify-between text-xs"
              >
                <div class="flex items-center space-x-3">
                  <img :src="getDisplayImageUrl(log.character?.avatarUrl)" class="w-9 h-9 rounded-xl object-cover border border-amber-500/30" />
                  <div>
                    <p class="text-slate-100 font-bold">
                      <strong class="text-amber-300">{{ log.character?.name }}</strong> completou a missão 
                      <span class="text-sky-300">"{{ log.task?.title || 'Missão Especial' }}"</span>
                    </p>
                    <p class="text-[10px] text-emerald-400 font-semibold">✨ Aprovado pelos Pais!</p>
                  </div>
                </div>

                <div class="text-right font-black">
                  <span class="text-amber-300 text-xs">+{{ log.task?.rewardXp || 50 }} XP</span>
                  <span class="text-yellow-400 text-[10px] block">+{{ log.task?.rewardGold || 15 }} 🪙</span>
                </div>
              </div>
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
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';

const leaderboard = ref<any[]>([]);
const achievements = ref<any[]>([]);
const feed = ref<any[]>([]);

async function loadFeed() {
  try {
    const res = await familyApi.getFamilyFeed();
    if (res.success) {
      leaderboard.value = res.leaderboard || [];
      achievements.value = res.achievements || [];
      feed.value = res.feed || [];
    }
  } catch (err) {
    console.error('Erro ao carregar mural da família:', err);
  }
}

onMounted(() => {
  loadFeed();
});
</script>
