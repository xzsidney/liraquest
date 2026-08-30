<template>
  <div class="min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12">
    <FamilyNavbar />

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-900/60">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-amber-300 flex items-center space-x-2">
            <span>🛍️ Loja do Reino & Baú de Recompensas</span>
          </h1>
          <p class="text-xs md:text-sm text-blue-200">Gaste seu ouro conquistado nas tarefas diárias com equipamentos ou vales reais!</p>
        </div>

        <!-- Saldo de Ouro -->
        <div v-if="activeCharacter" class="flex items-center space-x-3 bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-500/40 px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/10">
          <span class="text-2xl">🪙</span>
          <div>
            <p class="text-xs text-slate-300 font-bold">Saldo do Herói:</p>
            <p class="text-lg font-black text-amber-300">{{ activeCharacter.gold }} Ouro</p>
          </div>
        </div>
      </div>

    <!-- Abas: Itens do Jogo vs Recompensas Reais -->
    <div class="max-w-5xl mx-auto my-6 flex gap-3">
      <button
        @click="activeTab = 'REAL_REWARD'"
        :class="[
          'flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all',
          activeTab === 'REAL_REWARD' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xl shadow-yellow-500/20 scale-102' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
        ]"
      >
        <span class="text-xl">🏆</span>
        <span>Baú dos Desejos (Recompensas da Vida Real)</span>
      </button>

      <button
        @click="activeTab = 'GAME'"
        :class="[
          'flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all',
          activeTab === 'GAME' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xl shadow-yellow-500/20 scale-102' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
        ]"
      >
        <span class="text-xl">🗡️</span>
        <span>Mercado do Aventureiro (Equipamentos & Mascotes)</span>
      </button>
    </div>

    <!-- Mensagem de Sucesso / Compra -->
    <div v-if="purchaseMessage" class="max-w-5xl mx-auto my-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl font-bold flex items-center justify-between">
      <span>{{ purchaseMessage }}</span>
      <button @click="purchaseMessage = ''" class="text-emerald-400 font-bold">✕</button>
    </div>

    <!-- Grid de Itens -->
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-yellow-500/40 transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-3xl">
              {{ item.icon }}
            </div>
            <div>
              <h3 class="text-base font-black text-slate-100">{{ item.name }}</h3>
              <span class="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                {{ item.itemType === 'REAL_REWARD' ? 'Vale Real' : 'Item de Jogo' }}
              </span>
            </div>
          </div>

          <p class="text-xs text-slate-400 mb-4 leading-relaxed">
            {{ item.description }}
          </p>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div class="text-sm font-black text-yellow-300 flex items-center space-x-1">
            <span>🪙</span>
            <span>{{ item.costGold }} Ouro</span>
          </div>

          <button
            :disabled="!activeCharacter || activeCharacter.gold < item.costGold"
            @click="buyItem(item)"
            class="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs py-2 px-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
          >
            {{ item.itemType === 'REAL_REWARD' ? 'Resgatar Vale' : 'Comprar' }}
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
import { familyApi } from '../../services/familyApi';
import confetti from 'canvas-confetti';

const items = ref<any[]>([]);
const activeCharacter = ref<any>(null);
const activeTab = ref<'REAL_REWARD' | 'GAME'>('REAL_REWARD');
const purchaseMessage = ref<string>('');

const filteredItems = computed(() => {
  if (activeTab.value === 'REAL_REWARD') {
    return items.value.filter(i => i.itemType === 'REAL_REWARD');
  }
  return items.value.filter(i => i.itemType !== 'REAL_REWARD');
});

async function loadData() {
  try {
    const savedCharId = localStorage.getItem('lira_active_family_char_id');
    const membersRes = await familyApi.getMembers();
    if (membersRes.success && membersRes.members.length > 0) {
      activeCharacter.value = membersRes.members.find((m: any) => m.id === savedCharId) || membersRes.members[0];
    }

    const shopRes = await familyApi.getShopItems();
    if (shopRes.success) {
      items.value = shopRes.items;
    }
  } catch (error) {
    console.error('Erro ao carregar loja:', error);
  }
}

async function buyItem(item: any) {
  if (!activeCharacter.value) return;

  try {
    const res = await familyApi.buyItem(activeCharacter.value.id, item.id);
    if (res.success) {
      activeCharacter.value = res.character;
      purchaseMessage.value = res.message;

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eab308', '#f59e0b', '#10b981']
      });
    } else {
      alert(res.error || 'Erro ao comprar item');
    }
  } catch (error) {
    console.error('Erro ao comprar item:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>
