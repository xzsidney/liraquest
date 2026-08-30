<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-900/60">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>👑 Painel dos Pais (Mestre da Família)</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">Gerencie a evolução dos heróis, aprove tarefas com 1 clique e crie novas missões.</p>
        </div>
      </div>

    <!-- Seção 1: Tarefas Pendentes de Aprovação -->
    <section class="max-w-5xl mx-auto my-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-black text-slate-200 flex items-center space-x-2">
          <span>⏳ Tarefas Aguardando Aprovação</span>
          <span v-if="pendingLogs.length > 0" class="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
            {{ pendingLogs.length }}
          </span>
        </h2>
      </div>

      <div v-if="pendingLogs.length === 0" class="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <span class="text-4xl block mb-2">🎉</span>
        <p class="text-sm font-bold">Nenhuma tarefa pendente no momento!</p>
        <p class="text-xs text-slate-500 mt-1">Quando seus filhos concluírem uma missão diária, ela aparecerá aqui para você aprovar.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="log in pendingLogs"
          :key="log.id"
          class="bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center space-x-3 mb-3">
              <img :src="log.character?.avatarUrl" class="w-12 h-12 rounded-xl object-cover border border-amber-400" />
              <div>
                <h4 class="text-base font-black text-slate-100">{{ log.character?.name }}</h4>
                <p class="text-xs text-amber-300 font-bold">{{ log.character?.characterClass }} • Nv. {{ log.character?.level }}</p>
              </div>
            </div>

            <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-3">
              <div class="flex items-center space-x-2 text-sm font-bold text-slate-200">
                <span>{{ log.task?.icon }}</span>
                <span>{{ log.task?.title }}</span>
              </div>
              <p class="text-xs text-slate-400 mt-1">{{ log.task?.description }}</p>
              <div class="flex gap-2 mt-2 text-xs font-black">
                <span class="text-amber-400">+{{ log.task?.rewardXp }} XP</span>
                <span class="text-yellow-400">🪙 +{{ log.task?.rewardGold }} Ouro</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              @click="approveTask(log.id)"
              class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <span>✅</span>
              <span>Aprovar (+XP e Ouro)</span>
            </button>

            <button
              @click="rejectTask(log.id)"
              class="bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500 border border-slate-700 text-slate-300 hover:text-rose-400 font-bold text-xs py-2.5 px-3 rounded-xl transition-all"
            >
              <span>❌ Ajustar</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção 2: Cadastrar Nova Tarefa da Casa -->
    <section class="max-w-5xl mx-auto my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <h3 class="text-lg font-black text-slate-200 mb-4 flex items-center space-x-2">
        <span>➕ Criar Nova Tarefa para a Casa</span>
      </h3>

      <form @submit.prevent="createTask" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2 space-y-1">
          <label class="text-xs text-slate-400 font-bold">Título da Tarefa:</label>
          <input
            v-model="newTask.title"
            required
            placeholder="Ex: Regar as plantas do jardim"
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-400 font-bold">Ícone / Emoji:</label>
          <input
            v-model="newTask.icon"
            required
            placeholder="Ex: 🪴"
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div class="md:col-span-3 space-y-1">
          <label class="text-xs text-slate-400 font-bold">Descrição da Tarefa:</label>
          <textarea
            v-model="newTask.description"
            rows="2"
            placeholder="Descreva o que a criança precisa fazer..."
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          ></textarea>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-400 font-bold">Categoria:</label>
          <select
            v-model="newTask.category"
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          >
            <option value="CHORE">🏠 Doméstica (Casa)</option>
            <option value="STUDY">📚 Estudos & Lição</option>
            <option value="VIRTUE">💖 Virtude & Família</option>
            <option value="HEALTH">🏃 Saúde & Autocuidado</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-400 font-bold">Recompensa em XP:</label>
          <input
            type="number"
            v-model.number="newTask.rewardXp"
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-400 font-bold">Recompensa em Ouro:</label>
          <input
            type="number"
            v-model.number="newTask.rewardGold"
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div class="md:col-span-3 pt-2">
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:from-purple-400 hover:to-indigo-400 transition-all active:scale-95"
          >
            ➕ Publicar Nova Tarefa para a Família
          </button>
        </div>
      </form>
    </section>

    <!-- Seção 3: Resumo dos 7 Heróis -->
    <section class="max-w-5xl mx-auto my-8">
      <h3 class="text-lg font-black text-slate-200 mb-4 flex items-center space-x-2">
        <span>📊 Status dos Heróis da Família</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="m in members"
          :key="m.id"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3"
        >
          <img :src="getDisplayImageUrl(m.avatarUrl)" class="w-12 h-12 rounded-xl object-cover border border-slate-700" />
          <div class="flex-1">
            <h5 class="text-xs font-bold text-slate-200">{{ m.name }}</h5>
            <p class="text-[11px] text-amber-400 font-semibold">{{ m.characterClass }} • Nv. {{ m.level }}</p>
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>⭐ {{ m.currentXp }}/{{ m.nextLevelXp }} XP</span>
              <span class="text-yellow-400">🪙 {{ m.gold }} Ouro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import confetti from 'canvas-confetti';

const pendingLogs = ref<any[]>([]);
const members = ref<any[]>([]);

const newTask = ref({
  title: '',
  description: '',
  icon: '⭐',
  category: 'CHORE',
  rewardXp: 50,
  rewardGold: 10,
});

async function loadData() {
  try {
    const pendingRes = await familyApi.getPendingTasks();
    if (pendingRes.success) {
      pendingLogs.value = pendingRes.pendingLogs;
    }

    const membersRes = await familyApi.getMembers();
    if (membersRes.success) {
      members.value = membersRes.members;
    }
  } catch (error) {
    console.error('Erro ao carregar dados do painel mestre:', error);
  }
}

async function approveTask(logId: string) {
  try {
    const res = await familyApi.approveTask(logId);
    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#fbbf24']
      });
      pendingLogs.value = pendingLogs.value.filter(l => l.id !== logId);
      loadData();
    }
  } catch (error) {
    console.error('Erro ao aprovar tarefa:', error);
  }
}

async function rejectTask(logId: string) {
  try {
    const res = await familyApi.rejectTask(logId);
    if (res.success) {
      pendingLogs.value = pendingLogs.value.filter(l => l.id !== logId);
    }
  } catch (error) {
    console.error('Erro ao rejeitar tarefa:', error);
  }
}

async function createTask() {
  try {
    const res = await familyApi.createTask(newTask.value);
    if (res.success) {
      alert('Tarefa criada com sucesso para toda a família!');
      newTask.value = {
        title: '',
        description: '',
        icon: '⭐',
        category: 'CHORE',
        rewardXp: 50,
        rewardGold: 10,
      };
    }
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>
