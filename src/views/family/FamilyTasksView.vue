<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-900/60">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>📋 Quadro de Missões Diárias</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">Cumpra suas tarefas no mundo real e ganhe XP e Ouro para o seu herói!</p>
        </div>

        <!-- Personagem Ativo -->
        <div v-if="activeCharacter" class="flex items-center space-x-3 bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-lg">
          <img :src="getDisplayImageUrl(activeCharacter.avatarUrl)" class="w-10 h-10 rounded-xl object-cover border border-amber-400" />
          <div>
            <p class="text-xs font-bold text-slate-200">{{ activeCharacter.name }}</p>
            <p class="text-[11px] text-amber-400 font-semibold">Nv. {{ activeCharacter.level }} • 🪙 {{ activeCharacter.gold }} Ouro</p>
          </div>
        </div>
      </div>

    <!-- Filtros de Categoria -->
    <div class="max-w-5xl mx-auto my-6 flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.key"
        @click="selectedCategory = cat.key"
        :class="[
          'px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all',
          selectedCategory === cat.key ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
        ]"
      >
        <span>{{ cat.icon }}</span>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <!-- Grid de Tarefas -->
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl p-5 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
                {{ task.icon }}
              </div>
              <div>
                <h3 class="text-base font-black text-slate-100">{{ task.title }}</h3>
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {{ getCategoryLabel(task.category) }}
                </span>
              </div>
            </div>

            <!-- Badges de Recompensa -->
            <div class="text-right space-y-1">
              <div class="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black px-2.5 py-1 rounded-lg">
                +{{ task.rewardXp }} XP
              </div>
              <div class="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-black px-2.5 py-1 rounded-lg">
                🪙 +{{ task.rewardGold }} Ouro
              </div>
            </div>
          </div>

          <p class="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
            {{ task.description }}
          </p>
        </div>

        <!-- Ação / Status -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div v-if="isPending(task.id)" class="text-xs font-bold text-amber-400 flex items-center space-x-1.5 animate-pulse">
            <span>⏳</span>
            <span>Aguardando Aprovação dos Pais...</span>
          </div>
          <div v-else-if="isApprovedToday(task.id)" class="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
            <span>✅</span>
            <span>Concluída Hoje! Parabéns!</span>
          </div>
          <button
            v-else
            @click="completeTask(task)"
            class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs md:text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <span>✨</span>
            <span>Finalizei essa Missão!</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import confetti from 'canvas-confetti';

const tasks = ref<any[]>([]);
const recentLogs = ref<any[]>([]);
const activeCharacter = ref<any>(null);
const selectedCategory = ref<string>('ALL');

const categories = [
  { key: 'ALL', label: 'Todas as Missões', icon: '🌟' },
  { key: 'CHORE', label: 'Tarefas da Casa', icon: '🏠' },
  { key: 'STUDY', label: 'Estudos & Leitura', icon: '📚' },
  { key: 'VIRTUE', label: 'Virtudes & Família', icon: '💖' },
  { key: 'HEALTH', label: 'Saúde & Autocuidado', icon: '🏃' },
];

const filteredTasks = computed(() => {
  if (selectedCategory.value === 'ALL') return tasks.value;
  return tasks.value.filter(t => t.category === selectedCategory.value);
});

function getCategoryLabel(cat: string) {
  switch (cat) {
    case 'CHORE': return 'Doméstica';
    case 'STUDY': return 'Estudos';
    case 'VIRTUE': return 'Virtude';
    case 'HEALTH': return 'Saúde';
    default: return 'Geral';
  }
}

function isPending(taskId: string) {
  return recentLogs.value.some(l => l.taskId === taskId && l.status === 'PENDING_APPROVAL');
}

function isApprovedToday(taskId: string) {
  return recentLogs.value.some(l => l.taskId === taskId && l.status === 'APPROVED');
}

async function loadData() {
  try {
    const savedCharId = localStorage.getItem('lira_active_family_char_id');
    const membersRes = await familyApi.getMembers();
    if (membersRes.success && membersRes.members.length > 0) {
      activeCharacter.value = membersRes.members.find((m: any) => m.id === savedCharId) || membersRes.members[0];
    }

    if (activeCharacter.value) {
      const res = await familyApi.getTasks(activeCharacter.value.id);
      if (res.success) {
        tasks.value = res.tasks;
        recentLogs.value = res.recentLogs || [];
      }
    }
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
  }
}

async function completeTask(task: any) {
  if (!activeCharacter.value) return;

  try {
    const res = await familyApi.requestCompleteTask(activeCharacter.value.id, task.id);
    if (res.success) {
      // Efeito de confetes festivos
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#6366f1']
      });

      // Recarrega os logs
      recentLogs.value.push(res.log);
    }
  } catch (error) {
    console.error('Erro ao solicitar conclusão:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>
