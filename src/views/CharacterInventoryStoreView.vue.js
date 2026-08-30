import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { notifySuccess, notifyError } from '../utils/gothicAlerts';
const router = useRouter();
const route = useRoute();
const activeTab = ref('inventario');
const character = ref(null);
const characterId = ref('');
const inventoryItems = ref([]);
const storeCatalog = ref([]);
const loading = ref(true);
const buyingId = ref(null);
const hiringId = ref(null);
const hiredRetainers = ref([]);
// Filtros da Loja
const storeSearch = ref('');
const storeCategory = ref('ALL');
// LACAIOS CONTRATÁVEIS (CANÔNICOS V5)
const hireableRetainers = ref([
    {
        id: 'ret_guard',
        name: 'Guarda-Costas Ex-Militar (Capanga)',
        role: 'Segurança do Refúgio',
        icon: '🛡️',
        cost: 5000,
        bonusLabel: '+2 Dados em Defesa & Proteção',
        description: 'Um veterano treinado que patrulha os arredores do seu refúgio, alertando contra invasores mortais e da Inquisição.'
    },
    {
        id: 'ret_hacker',
        name: 'Operador de Cibersegurança (Hacker)',
        role: 'Especialista em TI',
        icon: '💻',
        cost: 8000,
        bonusLabel: '+2 Dados em Tecnologia & Investigação',
        description: 'Monitora os canais da polícia e apaga registros de câmeras de vigilância para blindar a Máscara do seu vampiro.'
    },
    {
        id: 'ret_medic',
        name: 'Médico Clandestino (Biólogo)',
        role: 'Fornecedor de Sangue',
        icon: '🩸',
        cost: 12000,
        bonusLabel: 'Fornece Bolsas de Sangue O- no Refúgio',
        description: 'Acesso a bancos de sangue de hospitais particulares. Permite estocar bolsas de sangue no refúgio para emergências.'
    },
    {
        id: 'ret_driver',
        name: 'Piloto de Fuga (Motorista Ghoul)',
        role: 'Transporte & Trânsito',
        icon: '🚗',
        cost: 6000,
        bonusLabel: 'Reduz Tempo de Trânsito no Mapa em 50%',
        description: 'Conhece rotas clandestinas e vias expressas de Nocturna, permitindo cruzar distritos rapidamente antes do amanhecer.'
    }
]);
const getNumericPrice = (item) => {
    if (!item.cost)
        return 300;
    const cleanNum = item.cost.replace(/\D/g, '');
    if (cleanNum && parseInt(cleanNum, 10) > 0) {
        return parseInt(cleanNum, 10);
    }
    const dotCount = (item.cost.match(/●/g) || []).length;
    if (dotCount === 1)
        return 500;
    if (dotCount === 2)
        return 1500;
    if (dotCount === 3)
        return 4000;
    if (dotCount === 4)
        return 10000;
    if (dotCount >= 5)
        return 25000;
    return 300;
};
const getItemIcon = (type = '') => {
    if (type === 'ARMA_FOGO')
        return '🔫';
    if (type === 'ARMA_BRANCA')
        return '🗡️';
    if (type === 'ARMADURA')
        return '🛡️';
    if (type === 'EXPLOSIVO')
        return '💣';
    return '📦';
};
const getItemCategoryLabel = (type = '') => {
    if (type === 'ARMA_FOGO')
        return 'Arma de Fogo';
    if (type === 'ARMA_BRANCA')
        return 'Arma Branca';
    if (type === 'ARMADURA')
        return 'Proteção / Armadura';
    if (type === 'EXPLOSIVO')
        return 'Explosivo / Tático';
    return 'Equipamento';
};
const filteredCatalog = computed(() => {
    let list = [...storeCatalog.value];
    if (storeCategory.value !== 'ALL') {
        list = list.filter(item => item.type === storeCategory.value);
    }
    if (storeSearch.value.trim()) {
        const q = storeSearch.value.toLowerCase().trim();
        list = list.filter(item => (item.name && item.name.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q)));
    }
    return list;
});
const fetchCharacterAndInventory = async () => {
    try {
        const id = route.query.id || localStorage.getItem('lira_active_character_id');
        if (!id) {
            router.push('/jogador/vampire');
            return;
        }
        characterId.value = id;
        localStorage.setItem('lira_active_character_id', id);
        const resChar = await api.get(`/api/character-vampires/${id}`);
        character.value = resChar.data;
        inventoryItems.value = resChar.data.CharacterVampireEquipments || [];
        hiredRetainers.value = resChar.data.Haven?.attributes?.retainers || [];
        const resCatalog = await api.get('/api/definition-equipments');
        storeCatalog.value = resCatalog.data || [];
    }
    catch (err) {
        console.error('Erro ao buscar inventario:', err);
    }
    finally {
        loading.value = false;
    }
};
const isRetainerHired = (retainerId) => {
    return hiredRetainers.value.includes(retainerId);
};
const toggleEquip = async (item) => {
    try {
        const res = await api.put(`/api/character-vampires/${characterId.value}/equipments/${item.definitionEquipmentId}/equip`);
        item.equipped = res.data.equipped ? 1 : 0;
        notifySuccess(item.equipped ? 'Item Equipado' : 'Guardado no Refúgio', `"${item.DefinitionEquipment?.name}" está ${item.equipped ? 'pronto para combate na rua' : 'armazenado com segurança no refúgio'}.`);
    }
    catch (err) {
        console.error('Erro ao equipar:', err);
        notifyError('Erro no Arsenal', 'Não foi possível alterar o status do equipamento.');
    }
};
const buyItem = async (equipment) => {
    try {
        buyingId.value = equipment.id;
        const res = await api.post(`/api/character-vampires/${characterId.value}/equipments`, {
            definitionEquipmentId: equipment.id
        });
        // Atualiza saldo de dinheiro em carteira
        if (res.data.newMoney !== undefined) {
            character.value.money = res.data.newMoney;
        }
        // Atualiza o inventário local
        const existing = inventoryItems.value.find(i => i.definitionEquipmentId === equipment.id);
        if (existing) {
            existing.quantity += 1;
        }
        else {
            inventoryItems.value.push({
                characterVampireId: characterId.value,
                definitionEquipmentId: equipment.id,
                quantity: 1,
                equipped: 0,
                DefinitionEquipment: equipment
            });
        }
        notifySuccess('Compra Concluída!', res.data.message || `"${equipment.name}" foi adicionado ao seu arsenal!`);
    }
    catch (err) {
        console.error('Erro ao comprar item:', err);
        notifyError('Falha na Compra', err.response?.data?.error || 'Erro ao processar a compra de equipamento.');
    }
    finally {
        buyingId.value = null;
    }
};
const hireRetainer = async (lacaio) => {
    if ((character.value?.money || 0) < lacaio.cost) {
        notifyError('Saldo Insuficiente', 'Você não possui dinheiro suficiente para contratar este especialista.');
        return;
    }
    try {
        hiringId.value = lacaio.id;
        const res = await api.post(`/api/character-vampires/${characterId.value}/retainers`, {
            retainerId: lacaio.id,
            cost: lacaio.cost
        });
        if (res.data.newMoney !== undefined) {
            character.value.money = res.data.newMoney;
        }
        hiredRetainers.value = res.data.retainers || [];
        notifySuccess('Especialista Contratado!', res.data.message || `"${lacaio.name}" agora presta serviços jurados ao seu refúgio!`);
    }
    catch (err) {
        notifyError('Erro na Contratação', err.response?.data?.error || 'Não foi possível contratar o especialista.');
    }
    finally {
        hiringId.value = null;
    }
};
onMounted(() => {
    fetchCharacterAndInventory();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen demiplane-bg text-parchment font-sans relative overflow-x-hidden selection:bg-blood-red selection:text-white pb-20" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['demiplane-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-[0.03]']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-blend-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "relative z-20 border-b border-vamp-border bg-black/85 backdrop-blur-md sticky top-0 shadow-xl" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/85']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['max-w-[1200px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-14']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.router.push(`/personagem/hub?id=${__VLS_ctx.characterId}`));
            // @ts-ignore
            [router, characterId,];
        } },
    ...{ class: "text-xs text-stone-400 hover:text-gold flex items-center gap-1.5 font-serif uppercase tracking-widest transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
if (__VLS_ctx.character) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-stone-400 font-serif hidden sm:inline" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
    (__VLS_ctx.character.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-lg border border-green-700/50 shadow-inner font-mono text-xs text-green-400 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (Number(__VLS_ctx.character.money || 0).toLocaleString('pt-BR'));
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col items-center justify-center min-h-[70vh] relative z-10 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[70vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-spin w-12 h-12 border-2 border-amber-900 border-t-gold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)]" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(212,175,55,0.3)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-gold font-serif text-xs tracking-widest uppercase animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "relative z-10 max-w-[1200px] mx-auto px-4 py-8 space-y-8" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[1200px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-6 pb-6 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "demiplane-title text-3xl md:text-5xl text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "demiplane-text text-vamp-c2 mt-1.5 text-xs sm:text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    throw 0;
                return (__VLS_ctx.activeTab = 'inventario');
                // @ts-ignore
                [character, character, character, loading, activeTab,];
            } },
        ...{ class: "px-5 py-2.5 rounded-xl text-xs font-serif tracking-wider transition-all duration-300 flex items-center gap-2 shrink-0 border" },
        ...{ class: (__VLS_ctx.activeTab === 'inventario' ? 'bg-blood-red border-blood-red text-white shadow-[0_0_15px_rgba(185,28,28,0.4)]' : 'bg-black/60 border-white/10 text-stone-400 hover:text-white hover:border-white/20') },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] bg-black/50 px-2 py-0.5 rounded-full font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.inventoryItems.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    throw 0;
                return (__VLS_ctx.activeTab = 'loja');
                // @ts-ignore
                [activeTab, activeTab, inventoryItems,];
            } },
        ...{ class: "px-5 py-2.5 rounded-xl text-xs font-serif tracking-wider transition-all duration-300 flex items-center gap-2 shrink-0 border" },
        ...{ class: (__VLS_ctx.activeTab === 'loja' ? 'bg-gold border-gold text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-black/60 border-white/10 text-stone-400 hover:text-white hover:border-white/20') },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] bg-black/50 px-2 py-0.5 rounded-full font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.storeCatalog.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    throw 0;
                return (__VLS_ctx.activeTab = 'lacaios');
                // @ts-ignore
                [activeTab, activeTab, storeCatalog,];
            } },
        ...{ class: "px-5 py-2.5 rounded-xl text-xs font-serif tracking-wider transition-all duration-300 flex items-center gap-2 shrink-0 border" },
        ...{ class: (__VLS_ctx.activeTab === 'lacaios' ? 'bg-cyan-600 border-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/60 border-white/10 text-stone-400 hover:text-white hover:border-white/20') },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] bg-black/50 px-2 py-0.5 rounded-full font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    if (__VLS_ctx.activeTab === 'inventario') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6 animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        if (!__VLS_ctx.inventoryItems.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-black/60 border border-white/10 rounded-2xl p-12 text-center text-stone-400 font-serif space-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-4xl" },
            });
            /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.activeTab === 'inventario'))
                            throw 0;
                        if (!(!__VLS_ctx.inventoryItems.length))
                            throw 0;
                        return (__VLS_ctx.activeTab = 'loja');
                        // @ts-ignore
                        [activeTab, activeTab, activeTab, inventoryItems,];
                    } },
                ...{ class: "px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-widest rounded transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]" },
            });
            /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.3)]']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
            for (const [item] of __VLS_vFor((__VLS_ctx.inventoryItems))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (item.id || item.definitionEquipmentId),
                    ...{ class: "bg-black/70 border rounded-xl p-5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-gold/30 shadow-lg space-y-4" },
                    ...{ class: (item.equipped ? 'border-blood-red/80 bg-blood-red/10 shadow-[0_0_20px_rgba(185,28,28,0.2)]' : 'border-white/10') },
                });
                /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-gold/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-start mb-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gold-dim" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
                (__VLS_ctx.getItemCategoryLabel(item.DefinitionEquipment?.type));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold" },
                    ...{ class: (item.equipped ? 'bg-blood-red/30 border-blood-red text-blood-bright' : 'bg-stone-900 border-stone-700 text-stone-400') },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (item.equipped ? '✔ Equipado em Campo' : '📦 No Refúgio');
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-3 my-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "w-10 h-10 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-xl shadow-inner shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                (__VLS_ctx.getItemIcon(item.DefinitionEquipment?.type));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                    ...{ class: "font-serif text-base text-parchment font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (item.DefinitionEquipment?.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-[10px] font-mono text-stone-400" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                (item.quantity);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-stone-400 italic mb-4 leading-relaxed line-clamp-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['italic']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                (item.DefinitionEquipment?.description);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5 text-stone-300 font-mono" },
                });
                /** @type {__VLS_StyleScopedClasses['grid']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                if (item.DefinitionEquipment?.damage) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-red-400" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                    (item.DefinitionEquipment.damage);
                }
                if (item.DefinitionEquipment?.armorLevel) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-gold" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                    (item.DefinitionEquipment.armorLevel);
                }
                if (item.DefinitionEquipment?.range) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                    (item.DefinitionEquipment.range);
                }
                if (item.DefinitionEquipment?.concealment) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                    (item.DefinitionEquipment.concealment);
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'inventario'))
                                throw 0;
                            if (!!(!__VLS_ctx.inventoryItems.length))
                                throw 0;
                            return (__VLS_ctx.toggleEquip(item));
                            // @ts-ignore
                            [inventoryItems, getItemCategoryLabel, getItemIcon, toggleEquip,];
                        } },
                    ...{ class: "w-full py-2 px-3 text-xs font-serif uppercase tracking-wider rounded border transition-all font-bold" },
                    ...{ class: (item.equipped ? 'bg-white/5 border-white/20 text-stone-300 hover:bg-white/10' : 'bg-blood-red/80 hover:bg-blood-red border-blood-red text-white shadow-[0_0_15px_rgba(185,28,28,0.3)]') },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (item.equipped ? 'Guardar no Refúgio' : '⚔️ Equipar para Combate');
                // @ts-ignore
                [];
            }
        }
    }
    if (__VLS_ctx.activeTab === 'loja') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6 animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-black/50 p-3 rounded-xl border border-white/10" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-stretch']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative flex-1" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            value: (__VLS_ctx.storeSearch),
            type: "text",
            placeholder: "🔍 Buscar armas, blindagens ou equipamentos...",
            ...{ class: "w-full bg-black/80 border border-white/15 focus:border-gold rounded-lg px-3.5 py-2 text-xs text-parchment placeholder-stone-500 font-sans outline-none transition-all pr-8" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-8']} */ ;
        if (__VLS_ctx.storeSearch) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.activeTab === 'loja'))
                            throw 0;
                        if (!(__VLS_ctx.storeSearch))
                            throw 0;
                        return (__VLS_ctx.storeSearch = '');
                        // @ts-ignore
                        [activeTab, storeSearch, storeSearch, storeSearch,];
                    } },
                ...{ class: "absolute right-2.5 top-2 text-stone-400 hover:text-white text-xs font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center gap-1 text-[11px] font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(__VLS_ctx.activeTab === 'loja'))
                        throw 0;
                    return (__VLS_ctx.storeCategory = 'ALL');
                    // @ts-ignore
                    [storeCategory,];
                } },
            ...{ class: "px-3 py-1.5 rounded-lg transition-all" },
            ...{ class: (__VLS_ctx.storeCategory === 'ALL' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-stone-400 border border-white/10 hover:text-white') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(__VLS_ctx.activeTab === 'loja'))
                        throw 0;
                    return (__VLS_ctx.storeCategory = 'ARMA_FOGO');
                    // @ts-ignore
                    [storeCategory, storeCategory,];
                } },
            ...{ class: "px-3 py-1.5 rounded-lg transition-all" },
            ...{ class: (__VLS_ctx.storeCategory === 'ARMA_FOGO' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-stone-400 border border-white/10 hover:text-white') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(__VLS_ctx.activeTab === 'loja'))
                        throw 0;
                    return (__VLS_ctx.storeCategory = 'ARMA_BRANCA');
                    // @ts-ignore
                    [storeCategory, storeCategory,];
                } },
            ...{ class: "px-3 py-1.5 rounded-lg transition-all" },
            ...{ class: (__VLS_ctx.storeCategory === 'ARMA_BRANCA' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-stone-400 border border-white/10 hover:text-white') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(__VLS_ctx.activeTab === 'loja'))
                        throw 0;
                    return (__VLS_ctx.storeCategory = 'ARMADURA');
                    // @ts-ignore
                    [storeCategory, storeCategory,];
                } },
            ...{ class: "px-3 py-1.5 rounded-lg transition-all" },
            ...{ class: (__VLS_ctx.storeCategory === 'ARMADURA' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-stone-400 border border-white/10 hover:text-white') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.filteredCatalog))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (item.id),
                ...{ class: "bg-black/70 border border-white/10 hover:border-gold/50 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 shadow-lg space-y-4 group" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-gold/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-start mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gold-dim" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            (__VLS_ctx.getItemCategoryLabel(item.type));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs font-mono font-bold text-green-400 bg-green-950/40 px-2.5 py-0.5 rounded border border-green-700/40" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-green-700/40']} */ ;
            (__VLS_ctx.getNumericPrice(item).toLocaleString('pt-BR'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3 my-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-12 h-12 rounded-xl bg-black/80 border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:border-gold/60 group-hover:scale-105 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:border-gold/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:scale-105']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            (__VLS_ctx.getItemIcon(item.type));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-base text-parchment font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (item.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] font-mono text-stone-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            (item.clip ? `Carregador: ${item.clip}` : (item.armorPenalty ? `Penalidade: ${item.armorPenalty}` : 'Pronto para uso'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-stone-400 italic mb-4 leading-relaxed line-clamp-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
            (item.description);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5 text-stone-300 font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            if (item.damage) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                    ...{ class: "text-red-400" },
                });
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                (item.damage);
            }
            if (item.armorLevel) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                    ...{ class: "text-gold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                (item.armorLevel);
            }
            if (item.range) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (item.range);
            }
            if (item.concealment) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (item.concealment);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.activeTab === 'loja'))
                            throw 0;
                        return (__VLS_ctx.buyItem(item));
                        // @ts-ignore
                        [getItemCategoryLabel, getItemIcon, storeCategory, filteredCatalog, getNumericPrice, buyItem,];
                    } },
                disabled: (__VLS_ctx.buyingId === item.id || (__VLS_ctx.character?.money || 0) < __VLS_ctx.getNumericPrice(item)),
                ...{ class: "w-full py-2.5 px-3 rounded-lg font-serif text-xs uppercase tracking-wider transition-all duration-300 font-bold flex items-center justify-center gap-2" },
                ...{ class: ((__VLS_ctx.character?.money || 0) >= __VLS_ctx.getNumericPrice(item)
                        ? 'bg-gold/20 hover:bg-gold border border-gold/50 text-gold hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed') },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            if (__VLS_ctx.buyingId === item.id) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "animate-spin" },
                });
                /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            ((__VLS_ctx.character?.money || 0) >= __VLS_ctx.getNumericPrice(item) ? '💵 Comprar Equipamento' : '⛔ Saldo Insuficiente');
            // @ts-ignore
            [character, character, character, getNumericPrice, getNumericPrice, getNumericPrice, buyingId, buyingId,];
        }
        if (!__VLS_ctx.filteredCatalog.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-8 text-center text-xs text-stone-500 font-serif italic border border-white/5 rounded-xl bg-black/20" },
            });
            /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
        }
    }
    if (__VLS_ctx.activeTab === 'lacaios') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6 animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-cyan-500/30 bg-cyan-950/20 p-5 rounded-xl flex items-start gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-cyan-950/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-3xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-sm font-bold text-cyan-300 uppercase tracking-wider" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-300 leading-relaxed font-sans" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        for (const [lacaio] of __VLS_vFor((__VLS_ctx.hireableRetainers))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (lacaio.id),
                ...{ class: "bg-black/70 border border-white/10 hover:border-cyan-500/50 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 shadow-lg space-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-cyan-500/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-start mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-serif uppercase tracking-widest text-cyan-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
            (lacaio.role);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs font-mono font-bold text-green-400 bg-green-950/40 px-2.5 py-0.5 rounded border border-green-700/40" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-green-700/40']} */ ;
            (lacaio.cost.toLocaleString('pt-BR'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3 my-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['my-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-12 h-12 rounded-xl bg-black/80 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            (lacaio.icon);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-base text-parchment font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (lacaio.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] font-mono text-cyan-300" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
            (lacaio.bonusLabel);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-stone-400 leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (lacaio.description);
            if (!__VLS_ctx.isRetainerHired(lacaio.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'lacaios'))
                                throw 0;
                            if (!(!__VLS_ctx.isRetainerHired(lacaio.id)))
                                throw 0;
                            return (__VLS_ctx.hireRetainer(lacaio));
                            // @ts-ignore
                            [activeTab, filteredCatalog, hireableRetainers, isRetainerHired, hireRetainer,];
                        } },
                    disabled: ((__VLS_ctx.character?.money || 0) < lacaio.cost || __VLS_ctx.hiringId === lacaio.id),
                    ...{ class: "w-full py-2.5 px-3 rounded-lg font-serif text-xs uppercase tracking-wider transition-all duration-300 font-bold flex items-center justify-center gap-2" },
                    ...{ class: ((__VLS_ctx.character?.money || 0) >= lacaio.cost
                            ? 'bg-cyan-950 hover:bg-cyan-600 border border-cyan-500/50 text-cyan-300 hover:text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed') },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                if (__VLS_ctx.hiringId === lacaio.id) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "animate-spin" },
                    });
                    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                ((__VLS_ctx.character?.money || 0) >= lacaio.cost ? '🤝 Contratar Especialista' : '⛔ Saldo Insuficiente');
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "w-full py-2.5 px-3 rounded-lg font-serif text-xs uppercase tracking-wider font-bold text-center bg-cyan-950/80 border border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-cyan-950/80']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-cyan-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(6,182,212,0.3)]']} */ ;
            }
            // @ts-ignore
            [character, character, character, hiringId, hiringId,];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
