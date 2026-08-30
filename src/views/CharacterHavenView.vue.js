import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { notifySuccess, notifyError } from '../utils/gothicAlerts';
const router = useRouter();
const route = useRoute();
const character = ref(null);
const haven = ref(null);
const characterId = ref('');
const inventoryItems = ref([]);
const loading = ref(true);
const upgrading = ref(false);
const consumingBlood = ref(false);
const allRetainers = [
    {
        id: 'ret_guard',
        name: 'Guarda-Costas Ex-Militar (Capanga)',
        role: 'Segurança do Refúgio',
        icon: '🛡️',
        cost: 5000,
        bonusLabel: '+2 Dados em Defesa & Proteção',
        description: 'Um veterano treinado que patrulha os arredores do seu refúgio.'
    },
    {
        id: 'ret_hacker',
        name: 'Operador de Cibersegurança (Hacker)',
        role: 'Especialista em TI',
        icon: '💻',
        cost: 8000,
        bonusLabel: '+2 Dados em Tecnologia & Investigação',
        description: 'Monitora os canais da polícia e blindagem da Máscara.'
    },
    {
        id: 'ret_medic',
        name: 'Médico Clandestino (Biólogo)',
        role: 'Fornecedor de Sangue',
        icon: '🩸',
        cost: 12000,
        bonusLabel: 'Fornece Bolsas de Sangue O- no Refúgio',
        description: 'Permite estocar bolsas de sangue no refúgio para emergências.'
    },
    {
        id: 'ret_driver',
        name: 'Piloto de Fuga (Motorista Ghoul)',
        role: 'Transporte & Trânsito',
        icon: '🚗',
        cost: 6000,
        bonusLabel: 'Reduz Tempo de Trânsito no Mapa em 50%',
        description: 'Conhece rotas clandestinas e vias expressas de Nocturna.'
    }
];
const havenLocationName = computed(() => {
    return haven.value?.DefinitionLocation?.name || character.value?.Haven?.DefinitionLocation?.name || 'Belenzinho';
});
const activeRetainersList = computed(() => {
    const retainersKeys = haven.value?.attributes?.retainers || [];
    return allRetainers.filter(r => retainersKeys.includes(r.id));
});
const hasRetainer = (retainerId) => {
    const retainersKeys = haven.value?.attributes?.retainers || [];
    return retainersKeys.includes(retainerId);
};
const unequippedItems = computed(() => {
    return inventoryItems.value.filter(i => !i.equipped);
});
const fetchHavenData = async () => {
    try {
        const id = route.query.id || localStorage.getItem('lira_active_character_id');
        if (!id) {
            router.push('/jogador/vampire');
            return;
        }
        characterId.value = id;
        const res = await api.get(`/api/character-vampires/${id}`);
        character.value = res.data;
        haven.value = res.data.Haven || {
            securityLevel: 1,
            luxuryLevel: 1,
            attributes: { retainers: [] }
        };
        inventoryItems.value = res.data.CharacterVampireEquipments || [];
    }
    catch (err) {
        console.error('Erro ao buscar dados do refúgio:', err);
    }
    finally {
        loading.value = false;
    }
};
const upgradeHaven = async (type) => {
    try {
        upgrading.value = true;
        const res = await api.post(`/api/character-vampires/${characterId.value}/haven/upgrade`, { type });
        haven.value = res.data.haven;
        if (res.data.newMoney !== undefined) {
            character.value.money = res.data.newMoney;
        }
        notifySuccess('Refúgio Aprimorado!', res.data.message);
    }
    catch (err) {
        notifyError('Falha no Upgrade', err.response?.data?.error || 'Erro ao aprimorar refúgio.');
    }
    finally {
        upgrading.value = false;
    }
};
const consumeBloodBag = async () => {
    try {
        consumingBlood.value = true;
        const res = await api.post(`/api/character-vampires/${characterId.value}/haven/consume-blood`);
        if (res.data.hunger !== undefined) {
            character.value.hunger = res.data.hunger;
        }
        notifySuccess('Sangue Consumido', res.data.message);
    }
    catch (err) {
        notifyError('Erro ao Consumir', err.response?.data?.error || 'Não foi possível consumir a bolsa de sangue.');
    }
    finally {
        consumingBlood.value = false;
    }
};
const toggleEquip = async (item) => {
    try {
        const res = await api.put(`/api/character-vampires/${characterId.value}/equipments/${item.definitionEquipmentId}/equip`);
        item.equipped = res.data.equipped ? 1 : 0;
        notifySuccess('Item Equipado', `"${item.DefinitionEquipment?.name}" está pronto para combate.`);
    }
    catch (err) {
        notifyError('Erro no Arsenal', 'Não foi possível alterar o status do equipamento.');
    }
};
onMounted(() => {
    fetchHavenData();
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
    ...{ class: "max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
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
        ...{ class: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-gold mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "demiplane-title text-3xl md:text-5xl text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-title']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (__VLS_ctx.havenLocationName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "demiplane-text text-vamp-c2 mt-1.5 text-xs sm:text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    throw 0;
                return (__VLS_ctx.router.push('/personagem/inventario?id=' + __VLS_ctx.characterId));
                // @ts-ignore
                [router, characterId, character, character, character, loading, havenLocationName,];
            } },
        ...{ class: "px-4 py-2.5 bg-gold/15 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-serif uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.15)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 lg:grid-cols-12 gap-8" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "lg:col-span-7 space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['lg:col-span-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "demiplane-box p-6 rounded-2xl space-y-6 bg-black/70 border border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-sm font-bold text-parchment uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-black/50 border border-white/10 rounded-xl p-5 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs font-serif font-bold text-parchment flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-400 mt-1 leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950/60 border border-amber-700/50 text-gold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    (__VLS_ctx.haven?.securityLevel || 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    for (const [i] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "h-2 flex-1 rounded-sm border transition-all" },
            ...{ class: (i <= (__VLS_ctx.haven?.securityLevel || 1) ? 'bg-gold border-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'bg-black/60 border-white/10') },
        });
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        // @ts-ignore
        [haven, haven,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[11px] text-stone-400 font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    ((__VLS_ctx.haven?.securityLevel || 1) < 5 ? `Custo próximo nível: R$ ${((__VLS_ctx.haven?.securityLevel || 1) + 1) * 3500}` : 'Defesa Máxima Atingida');
    if ((__VLS_ctx.haven?.securityLevel || 1) < 5) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!((__VLS_ctx.haven?.securityLevel || 1) < 5))
                        throw 0;
                    return (__VLS_ctx.upgradeHaven('security'));
                    // @ts-ignore
                    [haven, haven, haven, upgradeHaven,];
                } },
            disabled: (__VLS_ctx.upgrading || (__VLS_ctx.character?.money || 0) < ((__VLS_ctx.haven?.securityLevel || 1) + 1) * 3500),
            ...{ class: "px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all font-bold" },
            ...{ class: ((__VLS_ctx.character?.money || 0) >= ((__VLS_ctx.haven?.securityLevel || 1) + 1) * 3500
                    ? 'bg-gold hover:bg-gold-light text-black shadow-md'
                    : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-black/50 border border-white/10 rounded-xl p-5 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs font-serif font-bold text-parchment flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-400 mt-1 leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-950/60 border border-blue-700/50 text-cyan-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blue-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
    (__VLS_ctx.haven?.luxuryLevel || 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-1.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    for (const [i] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "h-2 flex-1 rounded-sm border transition-all" },
            ...{ class: (i <= (__VLS_ctx.haven?.luxuryLevel || 1) ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-black/60 border-white/10') },
        });
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        // @ts-ignore
        [character, character, haven, haven, haven, haven, upgrading,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[11px] text-stone-400 font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    ((__VLS_ctx.haven?.luxuryLevel || 1) < 5 ? `Custo próximo nível: R$ ${((__VLS_ctx.haven?.luxuryLevel || 1) + 1) * 3500}` : 'Luxo Máximo Atingido');
    if ((__VLS_ctx.haven?.luxuryLevel || 1) < 5) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!((__VLS_ctx.haven?.luxuryLevel || 1) < 5))
                        throw 0;
                    return (__VLS_ctx.upgradeHaven('luxury'));
                    // @ts-ignore
                    [haven, haven, haven, upgradeHaven,];
                } },
            disabled: (__VLS_ctx.upgrading || (__VLS_ctx.character?.money || 0) < ((__VLS_ctx.haven?.luxuryLevel || 1) + 1) * 3500),
            ...{ class: "px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all font-bold" },
            ...{ class: ((__VLS_ctx.character?.money || 0) >= ((__VLS_ctx.haven?.luxuryLevel || 1) + 1) * 3500
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
                    : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed') },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "demiplane-box p-6 rounded-2xl space-y-4 bg-black/70 border border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-sm font-bold text-parchment uppercase tracking-widest flex items-center justify-between pb-3 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono font-normal text-stone-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-red-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    (__VLS_ctx.character?.hunger || 0);
    if (__VLS_ctx.hasRetainer('ret_medic')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-red-950/20 border border-red-900/50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-red-950/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-900/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-12 h-12 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center justify-center text-2xl shrink-0 shadow-inner" },
        });
        /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-900/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-700/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "font-serif text-sm font-bold text-red-200" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-200']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-300 mt-0.5 leading-relaxed" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.consumeBloodBag) },
            disabled: (__VLS_ctx.consumingBlood || (__VLS_ctx.character?.hunger || 0) <= 0),
            ...{ class: "px-5 py-2.5 rounded-xl font-serif text-xs uppercase tracking-wider transition-all font-bold shrink-0 flex items-center gap-2" },
            ...{ class: ((__VLS_ctx.character?.hunger || 0) > 0
                    ? 'bg-blood-red hover:bg-red-700 text-white shadow-[0_0_15px_rgba(185,28,28,0.4)]'
                    : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed') },
        });
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (__VLS_ctx.consumingBlood) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "animate-spin" },
            });
            /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        ((__VLS_ctx.character?.hunger || 0) > 0 ? '🩸 Alimentar-se (-1 Fome)' : '✔ Fome Saciada (0)');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-6 text-center text-xs text-stone-400 font-serif italic border border-white/5 rounded-xl bg-black/40 space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[11px] text-stone-500 font-sans" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "lg:col-span-5 space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['lg:col-span-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "demiplane-box p-6 rounded-2xl space-y-4 bg-black/70 border border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center pb-3 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-sm font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cyan-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-800/40']} */ ;
    (__VLS_ctx.activeRetainersList.length);
    if (__VLS_ctx.activeRetainersList.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        for (const [ret] of __VLS_vFor((__VLS_ctx.activeRetainersList))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (ret.id),
                ...{ class: "bg-black/60 border border-cyan-500/30 rounded-xl p-4 flex items-center gap-3.5 shadow-md" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-10 h-10 rounded-lg bg-black/80 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-cyan-500/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            (ret.icon);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-serif text-xs font-bold text-parchment truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (ret.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] font-mono text-cyan-400 uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-[10px] text-cyan-300 font-mono mt-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
            (ret.bonusLabel);
            // @ts-ignore
            [character, character, character, character, character, character, haven, haven, upgrading, hasRetainer, consumeBloodBag, consumingBlood, consumingBlood, activeRetainersList, activeRetainersList, activeRetainersList,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-6 text-center text-xs text-stone-500 font-serif italic border border-white/5 rounded-xl bg-black/40 space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!!(__VLS_ctx.activeRetainersList.length))
                        throw 0;
                    return (__VLS_ctx.router.push('/personagem/inventario?id=' + __VLS_ctx.characterId));
                    // @ts-ignore
                    [router, characterId,];
                } },
            ...{ class: "px-4 py-2 bg-cyan-950 hover:bg-cyan-600 border border-cyan-500/40 text-cyan-300 hover:text-black font-serif text-[11px] uppercase tracking-wider rounded-lg transition-all font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-cyan-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-cyan-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-500/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "demiplane-box p-6 rounded-2xl space-y-4 bg-black/70 border border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['demiplane-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center pb-3 border-b border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-sm font-bold text-parchment uppercase tracking-widest flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono text-stone-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    (__VLS_ctx.unequippedItems.length);
    if (__VLS_ctx.unequippedItems.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3 max-h-[300px] overflow-y-auto pr-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[300px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.unequippedItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (item.id),
                ...{ class: "bg-black/60 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-white/20 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-white/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-serif text-xs font-bold text-stone-200" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-200']} */ ;
            (item.DefinitionEquipment?.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] font-mono text-stone-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            if (item.DefinitionEquipment?.damage) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-red-400 mr-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                (item.DefinitionEquipment.damage);
            }
            if (item.DefinitionEquipment?.armorLevel) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-gold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                (item.DefinitionEquipment.armorLevel);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.unequippedItems.length))
                            throw 0;
                        return (__VLS_ctx.toggleEquip(item));
                        // @ts-ignore
                        [unequippedItems, unequippedItems, unequippedItems, toggleEquip,];
                    } },
                ...{ class: "px-3 py-1 bg-blood-red/80 hover:bg-blood-red text-white text-[10px] font-serif uppercase tracking-wider rounded font-bold transition-all shrink-0 shadow" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blood-red/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-6 text-center text-xs text-stone-500 font-serif italic border border-white/5 rounded-xl bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
