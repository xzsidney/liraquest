import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api, { API_BASE_URL } from '../services/api';
const router = useRouter();
const route = useRoute();
const characterId = ref('');
const character = ref(null);
const loading = ref(true);
const adventures = ref([]);
const activeAdventure = ref(null);
const currentNode = ref(null);
const progressData = ref(null);
const processingChoice = ref(false);
const showResultModal = ref(false);
const lastRollDetails = ref(null);
const pendingNode = ref(null);
const lastRewards = ref(null);
// Efeitos de Transição
const transitionOpacity = ref(1);
const animateText = ref(true);
const resolveImageUrl = (url) => {
    if (!url)
        return '';
    if (url.startsWith('http') || url.startsWith('data:'))
        return url;
    if (url.startsWith('/uploads/'))
        return API_BASE_URL + url;
    return url;
};
const fetchCharacter = async () => {
    try {
        const res = await api.get(`/api/character-vampires/${characterId.value}`);
        character.value = res.data;
    }
    catch (e) {
        console.error('Erro ao buscar personagem:', e);
    }
};
const fetchAdventures = async () => {
    try {
        const res = await api.get(`/api/story/adventures?characterId=${characterId.value}`);
        adventures.value = res.data;
    }
    catch (e) {
        console.error(e);
    }
};
const handleBack = () => {
    if (activeAdventure.value) {
        activeAdventure.value = null;
        currentNode.value = null;
        fetchAdventures();
    }
    else {
        router.push(`/personagem/hub?id=${characterId.value}`);
    }
};
const startAdventure = async (advId) => {
    try {
        loading.value = true;
        const res = await api.get(`/api/story/adventures/${advId}/progress/${characterId.value}`);
        if (!res.data.currentNode) {
            alert('Esta crônica ainda não possui cenas configuradas pelo Mestre.');
            return;
        }
        triggerSceneTransition();
        activeAdventure.value = advId;
        progressData.value = res.data.progress;
        currentNode.value = res.data.currentNode;
    }
    catch (e) {
        console.error(e);
        alert(e.response?.data?.error || 'Erro ao carregar crônica.');
    }
    finally {
        loading.value = false;
    }
};
const resetAdventure = async (advId) => {
    if (!confirm('Deseja reiniciar esta crônica do primeiro capítulo? Todo o progresso anterior será resetado.'))
        return;
    try {
        loading.value = true;
        await api.post('/api/story/adventures/reset', {
            characterId: characterId.value,
            adventureId: advId
        });
        await startAdventure(advId);
    }
    catch (e) {
        console.error(e);
        alert(e.response?.data?.error || 'Erro ao reiniciar crônica');
    }
    finally {
        loading.value = false;
    }
};
const confirmResetCurrentAdventure = () => {
    if (activeAdventure.value) {
        resetAdventure(activeAdventure.value);
    }
};
const makeChoice = async (choice) => {
    try {
        processingChoice.value = true;
        const res = await api.post('/api/story/adventures/choice', {
            characterId: characterId.value,
            adventureId: activeAdventure.value,
            choiceId: choice.id
        });
        if (res.data.character) {
            character.value = res.data.character;
        }
        if (res.data.rewards) {
            lastRewards.value = res.data.rewards;
        }
        // Se houve teste de dados V5 com rollDetails
        if (res.data.rollDetails) {
            lastRollDetails.value = res.data.rollDetails;
            pendingNode.value = res.data.newNode;
            showResultModal.value = true;
        }
        else {
            applyNewNode(res.data.newNode);
        }
    }
    catch (e) {
        console.error(e);
        alert(e.response?.data?.error || 'Erro ao processar escolha');
    }
    finally {
        processingChoice.value = false;
    }
};
const closeResultModal = () => {
    showResultModal.value = false;
    if (pendingNode.value) {
        applyNewNode(pendingNode.value);
        pendingNode.value = null;
    }
    lastRollDetails.value = null;
};
const applyNewNode = (node) => {
    triggerSceneTransition();
    setTimeout(() => {
        currentNode.value = node;
    }, 300);
};
const finishAdventure = () => {
    activeAdventure.value = null;
    currentNode.value = null;
    lastRewards.value = null;
    router.push(`/personagem/hub?id=${characterId.value}`);
};
const triggerSceneTransition = () => {
    transitionOpacity.value = 0;
    animateText.value = false;
    setTimeout(() => {
        transitionOpacity.value = 1;
        animateText.value = true;
    }, 400);
};
// Computados para o modal de dados
const verdictIcon = computed(() => {
    if (!lastRollDetails.value)
        return '🎲';
    switch (lastRollDetails.value.verdictType) {
        case 'MESSY_CRITICAL': return '🩸⚡';
        case 'CRITICAL': return '☥✨';
        case 'SUCCESS': return '✔';
        case 'BESTIAL_FAILURE': return '☠️';
        default: return '✖';
    }
});
const verdictTextClass = computed(() => {
    if (!lastRollDetails.value)
        return 'text-white';
    switch (lastRollDetails.value.verdictType) {
        case 'MESSY_CRITICAL': return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';
        case 'CRITICAL': return 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]';
        case 'SUCCESS': return 'text-emerald-400';
        case 'BESTIAL_FAILURE': return 'text-red-400';
        default: return 'text-stone-400';
    }
});
const verdictBorderClass = computed(() => {
    if (!lastRollDetails.value)
        return 'border-white/10';
    switch (lastRollDetails.value.verdictType) {
        case 'MESSY_CRITICAL': return 'border-red-600 shadow-[0_0_40px_rgba(239,68,68,0.4)]';
        case 'CRITICAL': return 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)]';
        case 'SUCCESS': return 'border-emerald-600';
        case 'BESTIAL_FAILURE': return 'border-red-900';
        default: return 'border-white/10';
    }
});
onMounted(() => {
    characterId.value = route.query.id || localStorage.getItem('lira_active_character_id') || '';
    if (!characterId.value) {
        router.push('/jogador/vampire');
        return;
    }
    Promise.all([fetchCharacter(), fetchAdventures()]).finally(() => {
        loading.value = false;
    });
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-screen w-full bg-[#050505] text-parchment font-sans relative overflow-hidden flex flex-col select-none" },
});
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#050505]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
if (!__VLS_ctx.activeAdventure) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "absolute top-0 w-full z-40 bg-gradient-to-b from-black via-black/80 to-transparent p-4 flex justify-between items-center border-b border-white/5 backdrop-blur-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleBack) },
        ...{ class: "text-xs text-gray-400 hover:text-white flex items-center gap-2 font-serif uppercase tracking-widest transition-colors cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-4 text-xs font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    if (__VLS_ctx.character) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-1.5 text-stone-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-vamp-c2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-vamp-c2 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.character.hunger);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-px h-3 bg-white/10" },
        });
        /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-1.5 text-stone-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-amber-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-amber-300 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.character.experienceTotal || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-px h-3 bg-white/10" },
        });
        /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-1.5 text-stone-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-emerald-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-emerald-300 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-emerald-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        ((__VLS_ctx.character.money || 0).toLocaleString('pt-BR'));
    }
}
if (__VLS_ctx.character && __VLS_ctx.activeAdventure && __VLS_ctx.currentNode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "absolute top-0 left-0 w-full z-40 p-4 pointer-events-none bg-gradient-to-b from-black/95 via-black/60 to-transparent" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-black/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-5xl mx-auto flex justify-between items-center w-full" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-10 h-10 rounded-full border-2 border-vamp-c2 bg-zinc-900 overflow-hidden relative shadow-[0_0_12px_rgba(192,57,43,0.5)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_12px_rgba(192,57,43,0.5)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.character.avatarUrl ? (__VLS_ctx.character.avatarUrl.startsWith('http') ? __VLS_ctx.character.avatarUrl : __VLS_ctx.API_BASE_URL + __VLS_ctx.character.avatarUrl) : ''),
        ...{ class: "w-full h-full object-cover" },
        alt: "Avatar",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col gap-0.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif font-bold text-xs text-parchment uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.character.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] px-1.5 py-0.2 bg-red-950/80 text-red-300 border border-red-800/40 rounded font-mono uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    (__VLS_ctx.character.Clan?.name || 'Caitiff');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] font-mono text-stone-400 uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    for (const [i] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: ('hunger-' + i),
            ...{ class: "w-3 h-3 rounded-full border transition-all duration-300 flex items-center justify-center text-[7px]" },
            ...{ class: (i <= (__VLS_ctx.character.hunger || 1)
                    ? 'bg-gradient-to-br from-red-600 to-red-950 border-red-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'bg-black/60 border-red-950 text-transparent') },
        });
        /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[7px]']} */ ;
        // @ts-ignore
        [activeAdventure, activeAdventure, handleBack, character, character, character, character, character, character, character, character, character, character, character, character, currentNode, API_BASE_URL,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 pointer-events-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.confirmResetCurrentAdventure) },
        title: "Reiniciar esta Crônica",
        ...{ class: "px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 hover:border-amber-500/50 text-stone-400 hover:text-amber-300 text-[10px] font-serif uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-amber-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleBack) },
        title: "Voltar à Seleção de Crônicas",
        ...{ class: "w-9 h-9 rounded-full bg-black/80 border border-white/10 hover:border-vamp-c2 text-stone-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md shadow-lg cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 flex flex-col items-center justify-center bg-[#050505] z-30 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#050505]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-spin w-14 h-14 border-2 border-white/10 border-t-vamp-c2 rounded-full shadow-[0_0_20px_rgba(192,57,43,0.6)]" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(192,57,43,0.6)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-serif uppercase tracking-[3px] text-vamp-c2 animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else if (!__VLS_ctx.activeAdventure) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 flex flex-col items-center justify-start bg-gradient-to-b from-[#0a0a0c] via-[#050505] to-black p-4 pt-24 overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#0a0a0c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-[#050505]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-24']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-4xl w-full space-y-8 pb-20" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "text-center space-y-2 border-b border-white/10 pb-6" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-[10px] font-mono uppercase tracking-widest text-red-300" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-red-500 animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-3xl md:text-5xl text-parchment uppercase tracking-[0.2em] font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.2em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-400 uppercase tracking-widest font-serif max-w-xl mx-auto leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    for (const [adv] of __VLS_vFor((__VLS_ctx.adventures))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (adv.id),
            ...{ class: "relative overflow-hidden border border-white/10 hover:border-vamp-c2/80 bg-zinc-950/80 transition-all duration-300 rounded-xl shadow-2xl group flex flex-col md:flex-row" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-vamp-c2/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-950/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full md:w-2 bg-gradient-to-b from-vamp-c2 via-red-900 to-black shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['via-red-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center justify-between gap-2 mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-xl md:text-2xl text-parchment font-bold uppercase tracking-wider group-hover:text-gold transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (adv.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (adv.isCompleted) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono uppercase font-bold flex items-center gap-1" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-emerald-950/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-emerald-700/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (adv.completionCount);
        }
        else if (adv.hasActiveProgress) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px] font-mono uppercase font-bold flex items-center gap-1 animate-pulse" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-amber-950/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-amber-700/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-stone-400 text-[10px] font-mono uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "px-2.5 py-0.5 rounded-full bg-black/60 border border-white/5 text-stone-400 text-[10px] font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (adv.totalNodes || 1);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-stone-300 leading-relaxed font-light italic" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        (adv.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[11px] font-mono text-stone-500 flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-amber-400 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-emerald-400 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-red-400 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (adv.hasActiveProgress) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(!__VLS_ctx.activeAdventure))
                            throw 0;
                        if (!(adv.hasActiveProgress))
                            throw 0;
                        return (__VLS_ctx.resetAdventure(adv.id));
                        // @ts-ignore
                        [activeAdventure, handleBack, confirmResetCurrentAdventure, loading, adventures, resetAdventure,];
                    } },
                ...{ class: "px-4 py-2.5 rounded-lg border border-white/10 hover:border-amber-500/50 text-stone-400 hover:text-amber-300 text-xs font-serif uppercase tracking-wider transition-all cursor-pointer" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-amber-500/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-amber-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(!__VLS_ctx.activeAdventure))
                        throw 0;
                    return (__VLS_ctx.startAdventure(adv.id));
                    // @ts-ignore
                    [startAdventure,];
                } },
            ...{ class: "px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-800 to-vamp-c2 hover:from-red-700 hover:to-red-600 text-white font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-[0_0_15px_rgba(192,57,43,0.4)] flex items-center gap-2 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-red-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:from-red-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:to-red-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-[0.15em]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(192,57,43,0.4)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (adv.hasActiveProgress ? 'Continuar Crônica' : 'Iniciar Crônica');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.adventures.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-16 bg-zinc-950/40 border border-white/5 rounded-xl space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-950/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-4xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-lg text-stone-300 uppercase tracking-widest" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-500 font-mono max-w-md mx-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    }
}
else if (__VLS_ctx.currentNode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 flex flex-col justify-end bg-black" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105" },
        ...{ style: ({
                backgroundImage: __VLS_ctx.currentNode.backgroundImageUrl ? `url('${__VLS_ctx.resolveImageUrl(__VLS_ctx.currentNode.backgroundImageUrl)}')` : 'none',
                opacity: __VLS_ctx.transitionOpacity
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-in-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['scale-105']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 z-0 bg-gradient-to-t from-black via-black/60 to-black/80 pointer-events-none mix-blend-multiply" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['mix-blend-multiply']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 z-0 bg-black/40 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-20 w-full min-h-[50vh] max-h-screen overflow-y-auto custom-vamp-scrollbar flex flex-col justify-end pt-20 pb-8 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[50vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-screen']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full max-w-5xl mx-auto flex flex-col justify-end items-center px-4 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full flex justify-between items-end px-2 sm:px-6 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "transition-all duration-700 transform flex flex-col items-center" },
        ...{ class: ({ 'opacity-100 translate-y-0': __VLS_ctx.currentNode.leftCharacterImageUrl, 'opacity-0 translate-y-8 pointer-events-none': !__VLS_ctx.currentNode.leftCharacterImageUrl }) },
    });
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    if (__VLS_ctx.currentNode.leftCharacterImageUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative group" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-red-950/80 bg-zinc-950/90 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md relative flex items-center justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-44']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-40']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:h-56']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-950/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-950/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_10px_30px_rgba(0,0,0,0.9)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.resolveImageUrl(__VLS_ctx.currentNode.leftCharacterImageUrl)),
            ...{ class: "w-full h-full object-cover object-top filter brightness-90 contrast-105" },
            alt: "Interlocutor",
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-top']} */ ;
        /** @type {__VLS_StyleScopedClasses['filter']} */ ;
        /** @type {__VLS_StyleScopedClasses['brightness-90']} */ ;
        /** @type {__VLS_StyleScopedClasses['contrast-105']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['via-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-black/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2 px-3 py-0.5 rounded-full bg-black/80 border border-white/10 text-[10px] font-serif text-parchment-dim uppercase tracking-wider text-center shadow-md" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
        (__VLS_ctx.currentNode.speakerName || 'Interlocutor');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "transition-all duration-700 transform flex flex-col items-center" },
        ...{ class: ({ 'opacity-100 translate-y-0': __VLS_ctx.currentNode.rightCharacterImageUrl, 'opacity-0 translate-y-8 pointer-events-none': !__VLS_ctx.currentNode.rightCharacterImageUrl }) },
    });
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['translate-y-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    if (__VLS_ctx.currentNode.rightCharacterImageUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative group" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-950/80 bg-zinc-950/90 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md relative flex items-center justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-44']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-40']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:h-56']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-amber-950/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-950/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_10px_30px_rgba(0,0,0,0.9)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.resolveImageUrl(__VLS_ctx.currentNode.rightCharacterImageUrl)),
            ...{ class: "w-full h-full object-cover object-top filter brightness-90 contrast-105" },
            alt: "Protagonista",
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-top']} */ ;
        /** @type {__VLS_StyleScopedClasses['filter']} */ ;
        /** @type {__VLS_StyleScopedClasses['brightness-90']} */ ;
        /** @type {__VLS_StyleScopedClasses['contrast-105']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['via-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-black/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-2 px-3 py-0.5 rounded-full bg-black/80 border border-gold/30 text-[10px] font-serif text-gold uppercase tracking-wider text-center shadow-md" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
        (__VLS_ctx.character.name);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full pointer-events-auto max-h-[75vh] flex flex-col space-y-4 pt-5 pb-6 px-6 md:px-10 bg-black/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)] transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[75vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:px-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/85']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_50px_rgba(0,0,0,0.95)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between border-b border-white/10 pb-2.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-vamp-c2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-base md:text-lg uppercase tracking-[0.2em] text-gold font-bold drop-shadow-md" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.2em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-md']} */ ;
    (__VLS_ctx.currentNode.speakerName || 'O Narrador');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase tracking-widest text-stone-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-h-[180px] sm:max-h-[240px] overflow-y-auto custom-vamp-scrollbar pr-3 text-base md:text-lg font-serif leading-relaxed text-parchment whitespace-pre-line drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-light" },
        ...{ class: ({ 'animate-fade-in': __VLS_ctx.animateText }) },
    });
    /** @type {__VLS_StyleScopedClasses['max-h-[180px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:max-h-[240px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    (__VLS_ctx.currentNode.narrativeText);
    if (__VLS_ctx.currentNode.isEnding) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pt-3 border-t border-white/10 text-center space-y-4 animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-red-950/40 border border-red-800/40 p-4 rounded-xl max-w-md mx-auto space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-red-950/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs font-serif uppercase tracking-widest text-gold font-bold flex items-center justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-300 font-light leading-relaxed" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        if (__VLS_ctx.lastRewards) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-center items-center gap-4 text-xs font-mono pt-2 text-stone-300" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-amber-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.lastRewards.exp);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-emerald-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.lastRewards.money?.toLocaleString('pt-BR'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-red-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.finishAdventure) },
            ...{ class: "px-10 py-3.5 rounded-lg bg-gradient-to-r from-amber-600 via-gold to-amber-700 text-black font-serif uppercase tracking-[0.2em] text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['px-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-amber-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['via-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-amber-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-[0.2em]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:brightness-110']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_25px_rgba(212,175,55,0.4)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col gap-2.5 w-full pt-1 animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] font-mono uppercase tracking-widest text-stone-400 pb-0.5 flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-h-[220px] sm:max-h-[260px] overflow-y-auto custom-vamp-scrollbar pr-1.5 flex flex-col gap-2.5" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-[220px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:max-h-[260px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['custom-vamp-scrollbar']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
        for (const [choice] of __VLS_vFor((__VLS_ctx.currentNode.choices))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(!__VLS_ctx.activeAdventure))
                            throw 0;
                        if (!(__VLS_ctx.currentNode))
                            throw 0;
                        if (!!(__VLS_ctx.currentNode.isEnding))
                            throw 0;
                        return (__VLS_ctx.makeChoice(choice));
                        // @ts-ignore
                        [character, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, currentNode, adventures, resolveImageUrl, resolveImageUrl, resolveImageUrl, transitionOpacity, animateText, lastRewards, lastRewards, lastRewards, finishAdventure, makeChoice,];
                    } },
                key: (choice.id),
                disabled: (__VLS_ctx.processingChoice),
                ...{ class: "w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-300 relative group overflow-hidden cursor-pointer" },
                ...{ class: ([
                        choice.customStyle === 'DISCIPLINE' || choice.customStyle === 'RED'
                            ? 'bg-red-950/30 border-red-800/60 hover:bg-red-900/40 hover:border-red-500 shadow-[0_0_15px_rgba(192,57,43,0.15)]'
                            : 'bg-zinc-950/60 border-white/10 hover:bg-white/5 hover:border-gold/60 shadow-md'
                    ]) },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs group-hover:scale-125 transition-transform" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:scale-125']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            (choice.customStyle === 'DISCIPLINE' ? '🩸' : (choice.attributeReq ? '🎲' : '💬'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-serif text-sm md:text-base text-parchment group-hover:text-white font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (choice.choiceText);
            if (choice.attributeReq || choice.skillReq) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "shrink-0 flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-black/60 border border-white/10 group-hover:border-gold/40 text-stone-300" },
                });
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:border-gold/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-amber-400 font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (choice.attributeReq);
                if (choice.skillReq) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    (choice.skillReq);
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-red-400 font-bold ml-1" },
                });
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
                (choice.difficulty || 1);
            }
            // @ts-ignore
            [processingChoice,];
        }
    }
}
if (__VLS_ctx.showResultModal && __VLS_ctx.lastRollDetails) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 max-w-xl w-full text-center space-y-6 animate-fade-in p-6 bg-zinc-950 border rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)]" },
        ...{ class: (__VLS_ctx.verdictBorderClass) },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_50px_rgba(0,0,0,0.95)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    (__VLS_ctx.verdictIcon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-2xl md:text-4xl uppercase tracking-[0.15em] font-bold drop-shadow-md" },
        ...{ class: (__VLS_ctx.verdictTextClass) },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.15em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-md']} */ ;
    (__VLS_ctx.lastRollDetails.verdictTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-300 font-serif max-w-md mx-auto leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    (__VLS_ctx.lastRollDetails.verdictSubtitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-black/60 border border-white/10 p-3 rounded-xl flex items-center justify-around text-xs font-mono uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-stone-400 block text-[9px]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-parchment text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.lastRollDetails.totalDicePool);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-px h-6 bg-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-stone-400 block text-[9px]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-amber-400 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.lastRollDetails.difficulty);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-px h-6 bg-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-stone-400 block text-[9px]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-sm font-bold" },
        ...{ class: (__VLS_ctx.lastRollDetails.isVictory ? 'text-emerald-400' : 'text-red-400') },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.lastRollDetails.totalSuccesses);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 py-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    if (__VLS_ctx.lastRollDetails.regularDice && __VLS_ctx.lastRollDetails.regularDice.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] font-mono uppercase tracking-widest text-stone-400 block" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        for (const [val, idx] of __VLS_vFor((__VLS_ctx.lastRollDetails.regularDice))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: ('reg-' + idx),
                ...{ class: "w-11 h-11 rounded-lg flex items-center justify-center font-serif font-bold text-base border shadow-lg transition-transform transform hover:scale-110" },
                ...{ class: (val === 10
                        ? 'bg-amber-600 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                        : (val >= 6 ? 'bg-zinc-800 text-amber-300 border-amber-600/50' : 'bg-black text-stone-600 border-zinc-800')) },
            });
            /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:scale-110']} */ ;
            (val);
            if (val === 10) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] ml-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
            }
            // @ts-ignore
            [showResultModal, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, lastRollDetails, verdictBorderClass, verdictIcon, verdictTextClass,];
        }
    }
    if (__VLS_ctx.lastRollDetails.hungerDice && __VLS_ctx.lastRollDetails.hungerDice.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] font-mono uppercase tracking-widest text-red-400 block flex items-center justify-center gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        for (const [val, idx] of __VLS_vFor((__VLS_ctx.lastRollDetails.hungerDice))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: ('hung-' + idx),
                ...{ class: "w-11 h-11 rounded-lg flex items-center justify-center font-serif font-bold text-base border shadow-lg transition-transform transform hover:scale-110" },
                ...{ class: (val === 10
                        ? 'bg-red-600 text-white border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse'
                        : (val === 1 ? 'bg-black text-red-500 border-red-600 shadow-[0_0_12px_rgba(185,28,28,0.8)]' : (val >= 6 ? 'bg-red-950 text-red-200 border-red-700' : 'bg-black text-red-900 border-red-950'))) },
            });
            /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['transform']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:scale-110']} */ ;
            (val);
            if (val === 10) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] ml-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
            }
            else if (val === 1) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] ml-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
            }
            // @ts-ignore
            [lastRollDetails, lastRollDetails, lastRollDetails,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-4" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeResultModal) },
        ...{ class: "w-full py-3.5 rounded-xl border border-white/20 text-white font-serif uppercase tracking-[0.2em] text-xs font-bold hover:bg-white hover:text-black hover:border-white transition-all shadow-xl cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[0.2em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
}
// @ts-ignore
[closeResultModal,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
