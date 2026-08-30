import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
const router = useRouter();
const route = useRoute();
const characterId = ref('');
const loading = ref(true);
const missions = ref([]);
const activeMission = ref(null);
const showResultModal = ref(false);
const finalReport = ref(null);
const timeRemainingDisplay = ref('00:00');
let timerInterval = null;
let pollInterval = null;
const fetchMissions = async () => {
    try {
        const res = await api.get('/api/missions-idle');
        missions.value = res.data;
    }
    catch (e) {
        console.error(e);
    }
};
const fetchActiveMission = async () => {
    try {
        if (!characterId.value)
            return;
        const res = await api.get(`/api/missions-idle/active/${characterId.value}`);
        activeMission.value = res.data || null;
        updateTimer();
    }
    catch (e) {
        console.error(e);
    }
};
const startMission = async (missionId, forcedActionId) => {
    try {
        loading.value = true;
        await api.post('/api/missions-idle/start', {
            characterId: characterId.value,
            definitionMissionIdleId: missionId,
            forcedActionId
        });
        await fetchActiveMission();
    }
    catch (e) {
        alert(e.response?.data?.error || 'Erro ao iniciar missão');
    }
    finally {
        loading.value = false;
    }
};
const resolveActiveMission = async () => {
    try {
        loading.value = true;
        const res = await api.post('/api/missions-idle/resolve', {
            activeMissionId: activeMission.value.id
        });
        finalReport.value = res.data.report;
        showResultModal.value = true;
        activeMission.value = null;
    }
    catch (e) {
        alert(e.response?.data?.error || 'Erro ao resolver');
    }
    finally {
        loading.value = false;
    }
};
const cancelActiveMission = async () => {
    if (!confirm('Tem certeza que deseja abortar esta missão? Todo o progresso será perdido e nenhuma recompensa será ganha.'))
        return;
    try {
        loading.value = true;
        await api.post('/api/missions-idle/cancel', {
            activeMissionId: activeMission.value.id
        });
        activeMission.value = null;
    }
    catch (e) {
        alert(e.response?.data?.error || 'Erro ao cancelar missão');
    }
    finally {
        loading.value = false;
    }
};
const closeModal = () => {
    showResultModal.value = false;
    finalReport.value = null;
};
const updateTimer = () => {
    if (!activeMission.value || activeMission.value.readyToResolve) {
        timeRemainingDisplay.value = '00:00';
        return;
    }
    const now = new Date().getTime();
    const expiresAt = new Date(activeMission.value.expiresAt).getTime();
    const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    timeRemainingDisplay.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
onMounted(async () => {
    characterId.value = route.query.id || localStorage.getItem('lira_active_character_id') || '';
    await Promise.all([fetchMissions(), fetchActiveMission()]);
    loading.value = false;
    // Auto-poll a cada 3 segundos para revelar etapas em tempo real!
    pollInterval = setInterval(() => {
        if (activeMission.value && !activeMission.value.readyToResolve) {
            fetchActiveMission();
        }
    }, 3000);
    // Timer local por segundo para o relógio
    timerInterval = setInterval(updateTimer, 1000);
});
onUnmounted(() => {
    if (pollInterval)
        clearInterval(pollInterval);
    if (timerInterval)
        clearInterval(timerInterval);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#050505] text-parchment font-sans pb-20 selection:bg-blood-red selection:text-white" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#050505]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "border-b border-vamp-border bg-black/80 backdrop-blur-md sticky top-0 z-20" },
});
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['max-w-[1200px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.router.push(`/personagem/hub?id=${__VLS_ctx.characterId}`));
            // @ts-ignore
            [router, characterId,];
        } },
    ...{ class: "text-[10px] text-gray-400 hover:text-white flex items-center gap-1 font-serif uppercase tracking-widest transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-[10px] font-serif tracking-widest uppercase text-vamp-c2 flex items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "max-w-[1200px] mx-auto px-4 py-8 space-y-10" },
});
/** @type {__VLS_StyleScopedClasses['max-w-[1200px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "text-center border-b border-vamp-border pb-6" },
});
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "font-serif text-3xl md:text-5xl text-vamp-c2 mb-2 uppercase tracking-widest" },
});
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-parchment-dim uppercase tracking-widest font-serif max-w-2xl mx-auto" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center py-20 text-vamp-c2 text-sm uppercase tracking-widest font-serif animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else if (__VLS_ctx.activeMission) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-vamp-c2/80 bg-zinc-950/90 p-6 md:p-8 rounded-xl shadow-[0_0_40px_rgba(192,57,43,0.25)] space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-vamp-c2/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_40px_rgba(192,57,43,0.25)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-vamp-c2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-vamp-c2 animate-ping" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-ping']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-2xl font-serif text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.activeMission.currentReport?.title || __VLS_ctx.activeMission.DefinitionMissionIdle?.title || 'Caçada Urbana');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-400 font-mono block uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-base font-serif font-bold text-gold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    (__VLS_ctx.activeMission.readyToResolve ? 'Tempo Esgotado' : __VLS_ctx.timeRemainingDisplay);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-black/60 border border-white/10 p-4 rounded-lg space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between text-xs font-mono uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-gold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    (__VLS_ctx.activeMission.currentStage);
    (__VLS_ctx.activeMission.totalStages);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (__VLS_ctx.activeMission.readyToResolve ? 'text-green-400 font-bold' : 'text-vamp-c2 animate-pulse') },
    });
    (__VLS_ctx.activeMission.readyToResolve ? 'Pronto para Coleta' : 'Em Execução...');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full bg-zinc-900 h-2.5 rounded overflow-hidden border border-white/5" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-r from-red-900 to-vamp-c2 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(192,57,43,0.8)]" },
        ...{ style: ({ width: ((__VLS_ctx.activeMission.currentStage || 1) / (__VLS_ctx.activeMission.totalStages || 1)) * 100 + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-red-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_10px_rgba(192,57,43,0.8)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-xs uppercase tracking-widest text-parchment-dim font-bold flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [step] of __VLS_vFor((__VLS_ctx.activeMission.currentReport?.steps || []))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (step.order),
            ...{ class: "p-4 rounded-lg border transition-all duration-300 space-y-2" },
            ...{ class: ({
                    'bg-green-950/20 border-green-700/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]': step.status === 'COMPLETED' && step.passed,
                    'bg-red-950/30 border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]': step.status === 'COMPLETED' && !step.passed,
                    'bg-yellow-950/20 border-yellow-500/50 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.15)]': step.status === 'IN_PROGRESS',
                    'bg-black/40 border-white/5 opacity-50': step.status === 'LOCKED'
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-green-950/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-green-700/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(34,197,94,0.1)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-800/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(239,68,68,0.15)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-yellow-950/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-yellow-500/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(234,179,8,0.15)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center" },
            ...{ class: ({
                    'bg-green-600 text-black': step.status === 'COMPLETED' && step.passed,
                    'bg-red-600 text-white': step.status === 'COMPLETED' && !step.passed,
                    'bg-yellow-500 text-black': step.status === 'IN_PROGRESS',
                    'bg-zinc-800 text-gray-400': step.status === 'LOCKED'
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        (step.order);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "font-serif font-bold text-sm text-parchment" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        (step.actionName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 text-[10px] font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        if (step.status === 'COMPLETED') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded font-bold uppercase" },
                ...{ class: (step.passed ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800') },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            (step.passed ? '✔ Sucesso no Teste' : '✖ Falha no Teste');
        }
        else if (step.status === 'IN_PROGRESS') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-700 font-bold uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-yellow-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-yellow-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-zinc-900 text-gray-500 font-mono uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        }
        if (step.pool) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            (step.pool);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-gray-300 leading-relaxed font-light pl-7" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
        /** @type {__VLS_StyleScopedClasses['pl-7']} */ ;
        (step.narrative);
        if (step.status === 'COMPLETED' && step.rolls && Array.isArray(step.rolls)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pl-7 text-[10px] font-mono text-gray-500 flex items-center gap-3 pt-1 border-t border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['pl-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "text-gray-300" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            (step.rolls?.join ? step.rolls.join(', ') : step.rolls);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: (step.passed ? 'text-green-400' : 'text-red-400') },
            });
            (step.successes || 0);
        }
        // @ts-ignore
        [loading, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, activeMission, timeRemainingDisplay,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    if (__VLS_ctx.activeMission.readyToResolve) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.resolveActiveMission) },
            ...{ class: "flex-1 bg-gold hover:bg-gold-light text-black py-3.5 px-6 font-serif font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] animate-bounce" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gold-light']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_25px_rgba(212,175,55,0.4)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.cancelActiveMission) },
            ...{ class: "py-3 px-6 border border-vamp-c2/60 text-vamp-c2 hover:bg-vamp-c2 hover:text-white font-serif uppercase tracking-widest text-xs transition-all font-bold opacity-80" },
        });
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-vamp-c2/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-8" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    for (const [mission] of __VLS_vFor((__VLS_ctx.missions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (mission.id),
            ...{ class: "border border-vamp-border bg-black/40 p-6 hover:border-vamp-c2 transition-colors flex flex-col rounded-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between items-start mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-lg text-white uppercase tracking-widest" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        (mission.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] px-2 py-1 bg-vamp-bg border border-vamp-border text-vamp-c2 uppercase font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-vamp-bg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (mission.category === 'HUNT' ? 'Caçada' : 'Operação');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-parchment-dim mb-4 italic" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        (mission.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-xs text-gray-400 mb-6 font-mono space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (mission.durationMinutes);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (mission.baseDifficulty);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (mission.Actions?.length || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-auto space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        if (mission.category === 'HUNT') {
            for (const [action] of __VLS_vFor((mission.Actions))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.activeMission))
                                throw 0;
                            if (!(mission.category === 'HUNT'))
                                throw 0;
                            return (__VLS_ctx.startMission(mission.id, action.id));
                            // @ts-ignore
                            [activeMission, resolveActiveMission, cancelActiveMission, missions, startMission,];
                        } },
                    key: (action.id),
                    ...{ class: "w-full border border-vamp-border bg-vamp-bg hover:border-vamp-c2 hover:text-vamp-c2 transition-colors p-3 flex justify-between items-center group text-xs uppercase tracking-widest font-serif rounded" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-vamp-bg']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-vamp-c2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-vamp-c2']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['group']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (action.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] text-gray-500 group-hover:text-vamp-c2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:text-vamp-c2']} */ ;
                (action.attributeReq);
                (action.skillReq);
                // @ts-ignore
                [];
            }
        }
        if (mission.category === 'OPERATION') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.activeMission))
                            throw 0;
                        if (!(mission.category === 'OPERATION'))
                            throw 0;
                        return (__VLS_ctx.startMission(mission.id));
                        // @ts-ignore
                        [startMission,];
                    } },
                ...{ class: "w-full border border-vamp-c2 bg-black hover:bg-vamp-c2 hover:text-black transition-colors p-3 text-center text-xs uppercase tracking-widest font-serif font-bold text-vamp-c2 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-vamp-c2']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-vamp-c2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.showResultModal && __VLS_ctx.finalReport) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-vamp-c2 bg-vamp-bg p-8 max-w-lg w-full relative rounded-lg space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-vamp-bg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-2xl text-center uppercase tracking-widest" },
        ...{ class: (__VLS_ctx.finalReport.isSuccess ? 'text-green-500' : 'text-vamp-c2') },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    (__VLS_ctx.finalReport.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 max-h-[250px] overflow-y-auto pr-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[250px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
    for (const [step, index] of __VLS_vFor((__VLS_ctx.finalReport.steps || []))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "bg-black/80 border-l-2 p-3 text-xs space-y-1" },
            ...{ class: (step.passed ? 'border-l-green-600' : 'border-l-vamp-c2') },
        });
        /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold uppercase tracking-widest text-[11px]" },
            ...{ class: (step.passed ? 'text-green-500' : 'text-vamp-c2') },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        (step.actionName);
        (step.pool || 'Teste');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-gray-300" },
        });
        /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
        (step.narrative);
        if (step.rolls && Array.isArray(step.rolls)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] text-gray-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            (step.rolls?.join ? step.rolls.join(', ') : step.rolls);
            (step.successes || 0);
        }
        // @ts-ignore
        [showResultModal, finalReport, finalReport, finalReport, finalReport,];
    }
    if (__VLS_ctx.finalReport.finalChanges && __VLS_ctx.finalReport.finalChanges.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "text-gold font-serif uppercase tracking-widest text-xs mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1 text-xs text-parchment font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        for (const [change, i] of __VLS_vFor((__VLS_ctx.finalReport.finalChanges))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (i),
                ...{ class: "p-2 bg-black border border-vamp-border rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-vamp-border']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            (change);
            // @ts-ignore
            [finalReport, finalReport, finalReport,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "w-full bg-vamp-c2 text-black p-3 font-serif uppercase tracking-widest font-bold hover:bg-white transition-colors rounded" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
}
// @ts-ignore
[closeModal,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
