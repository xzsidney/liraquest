import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { confirmAction, notifySuccess, notifyError } from '../utils/gothicAlerts';
const router = useRouter();
const route = useRoute();
const characterId = ref('');
const character = ref(null);
const activeMission = ref(null);
const nightStatus = ref(null);
const loading = ref(true);
const isResolving = ref(false);
const isCancelling = ref(false);
const showResultModal = ref(false);
const showEmergencyModal = ref(false);
const finalReport = ref(null);
const now = ref(Date.now());
let tickerInterval = null;
// 1. Horário & Ciclo Solar
const isDaytime = computed(() => {
    const currentMinutes = nightStatus.value?.nightMinutesSpent || 0;
    return currentMinutes >= 600;
});
const isSunHazardActive = computed(() => {
    return isDaytime.value || !!nightStatus.value?.isSunHazardActive;
});
const liveNightTime = computed(() => {
    const minsSpent = nightStatus.value?.nightMinutesSpent || 0;
    const totalMin = 1200 + minsSpent; // 20:00 = 1200 min
    const h = Math.floor((totalMin % 1440) / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
});
const hoursRemaining = computed(() => {
    const minsSpent = nightStatus.value?.nightMinutesSpent || 0;
    return Math.max(0, 10 - Math.floor(minsSpent / 60));
});
// 2. Status de Conclusão da Missão
const isReady = computed(() => {
    if (isSunHazardActive.value)
        return false; // Sob o sol, a missão está paralisada
    if (activeMission.value?.readyToResolve)
        return true;
    if (activeMission.value?.currentReport?.isCompleted)
        return true;
    const steps = activeMission.value?.currentReport?.steps;
    if (steps && steps.length > 0 && steps.every((s) => s.status === 'COMPLETED'))
        return true;
    if (!activeMission.value?.expiresAt)
        return false;
    return now.value >= new Date(activeMission.value.expiresAt).getTime();
});
// Assiste isReady: ao bater 00:00, busca o relatório final atualizado imediatamente
watch(() => isReady.value, async (ready) => {
    if (ready && characterId.value) {
        await fetchActiveMission();
    }
});
const formattedTimeRemaining = computed(() => {
    if (!activeMission.value?.expiresAt)
        return '00:00';
    const diff = new Date(activeMission.value.expiresAt).getTime() - now.value;
    if (diff <= 0)
        return 'Pronto';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});
const totalStagesDisplay = computed(() => {
    return activeMission.value?.totalStages || activeMission.value?.currentReport?.steps?.length || 1;
});
const completedStagesDisplay = computed(() => {
    if (isReady.value)
        return totalStagesDisplay.value;
    return activeMission.value?.currentStage || 0;
});
const progressPercentage = computed(() => {
    if (isSunHazardActive.value)
        return 0;
    if (isReady.value)
        return 100;
    const total = totalStagesDisplay.value;
    const current = completedStagesDisplay.value;
    return Math.min(100, Math.round((current / total) * 100));
});
const displaySteps = computed(() => {
    return activeMission.value?.currentReport?.steps || [];
});
const missionCategoryLabel = computed(() => {
    const cat = activeMission.value?.DefinitionMissionIdle?.category;
    if (cat === 'HUNT')
        return '🩸 Caçada de Sangue';
    if (cat === 'RECON')
        return '🔍 Reconhecimento de Território';
    return '⚔️ Incursão Tática';
});
// FASE DO CLIMA E HORÁRIO DINÂMICO
const weatherPhase = computed(() => {
    const minsSpent = nightStatus.value?.nightMinutesSpent || 0;
    if (minsSpent >= 600)
        return 'DAYLIGHT';
    if (minsSpent >= 540)
        return 'PRE_DAWN'; // 05:00 às 06:00
    if (minsSpent >= 360)
        return 'LATE_NIGHT'; // 02:00 às 05:00
    return 'DEEP_NIGHT'; // 20:00 às 02:00
});
const ambientThemeClass = computed(() => {
    switch (weatherPhase.value) {
        case 'DAYLIGHT':
            return 'bg-[#180404]';
        case 'PRE_DAWN':
            return 'bg-[#0f0408]';
        case 'LATE_NIGHT':
            return 'bg-[#060207]';
        default:
            return 'bg-[#02050b]';
    }
});
const weatherIcon = computed(() => {
    switch (weatherPhase.value) {
        case 'DAYLIGHT':
            return '☀️';
        case 'PRE_DAWN':
            return '🌅';
        case 'LATE_NIGHT':
            return '🌫️';
        default:
            return '🌧️';
    }
});
const weatherDescription = computed(() => {
    switch (weatherPhase.value) {
        case 'DAYLIGHT':
            return 'Dia Pleno • Fogo Solar (Rötschreck)';
        case 'PRE_DAWN':
            return 'Pré-Amanhecer • Horizonte Avermelhado';
        case 'LATE_NIGHT':
            return 'Madrugada Tensa • Névoa Sombria';
        default:
            return 'Noite Fechada • Garoa Fria de Nocturna';
    }
});
const fetchCharacter = async () => {
    try {
        const res = await api.get(`/api/character-vampires/${characterId.value}`);
        character.value = res.data;
    }
    catch (e) {
        console.error('Erro ao carregar personagem:', e);
    }
};
const fetchNightStatus = async () => {
    try {
        const res = await api.get(`/api/night-cycle/${characterId.value}/status`);
        nightStatus.value = res.data;
    }
    catch (e) {
        console.error('Erro ao buscar status da noite:', e);
    }
};
const fetchActiveMission = async () => {
    try {
        const res = await api.get(`/api/missions-idle/active/${characterId.value}`);
        activeMission.value = res.data;
    }
    catch (e) {
        console.error('Erro ao carregar missão ativa:', e);
    }
};
const resolveMission = async () => {
    if (!activeMission.value)
        return;
    try {
        isResolving.value = true;
        const res = await api.post('/api/missions-idle/resolve', {
            activeMissionId: activeMission.value.id
        });
        finalReport.value = res.data.report;
        showResultModal.value = true;
        activeMission.value = null;
        await fetchCharacter();
        await fetchNightStatus();
    }
    catch (e) {
        console.error(e);
        notifyError('Erro ao Resolver', e.response?.data?.error || 'Não foi possível resolver a operação.');
    }
    finally {
        isResolving.value = false;
    }
};
const cancelMission = async () => {
    if (!activeMission.value?.id)
        return;
    const confirmed = await confirmAction('ABORTAR OPERAÇÃO?', 'Tem certeza que deseja abortar esta missão? Todo o progresso será cancelado e nenhuma recompensa será concedida.', 'Sim, Abortar', 'Manter Missão');
    if (!confirmed)
        return;
    try {
        isCancelling.value = true;
        await api.post('/api/missions-idle/cancel', {
            activeMissionId: activeMission.value.id
        });
        notifySuccess('Operação Cancelada', 'O vampiro retornou e está livre para novas missões.');
        activeMission.value = null;
        router.push(`/personagem/hub?id=${characterId.value}`);
    }
    catch (e) {
        notifyError('Erro ao Cancelar', e.response?.data?.error || 'Não foi possível cancelar a missão.');
    }
    finally {
        isCancelling.value = false;
    }
};
const onCloseResultAndReturn = () => {
    showResultModal.value = false;
    finalReport.value = null;
    router.push(`/personagem/hub?id=${characterId.value}`);
};
const triggerEmergencyShelter = () => {
    showEmergencyModal.value = true;
};
const takeShelter = async (type) => {
    try {
        if (activeMission.value?.id) {
            try {
                await api.post('/api/missions-idle/cancel', {
                    activeMissionId: activeMission.value.id
                });
                activeMission.value = null;
            }
            catch (e) { }
        }
        if (type === 'GO_HOME') {
            await api.post(`/api/night-cycle/${characterId.value}/return-haven`);
            notifySuccess('Retorno Seguro', 'Você correu com urgência ao seu refúgio antes que a luz do sol o destruísse!');
            showEmergencyModal.value = false;
            router.push(`/personagem/hub?id=${characterId.value}`);
            return;
        }
        if (type === 'BUY_MOTEL') {
            showEmergencyModal.value = false;
            router.push(`/personagem/abrigo-hotel?id=${characterId.value}`);
            return;
        }
        if (type === 'BREACH_SEWER') {
            showEmergencyModal.value = false;
            router.push(`/personagem/abrigo-esgoto?id=${characterId.value}`);
            return;
        }
    }
    catch (e) {
        notifyError('Falha no Abrigo', e.response?.data?.error || 'Não foi possível encontrar abrigo.');
    }
};
onMounted(async () => {
    characterId.value = route.query.id || localStorage.getItem('lira_active_character_id') || '';
    if (!characterId.value) {
        router.push('/jogador/vampire');
        return;
    }
    await Promise.all([
        fetchCharacter(),
        fetchNightStatus(),
        fetchActiveMission()
    ]);
    loading.value = false;
    tickerInterval = setInterval(async () => {
        now.value = Date.now();
        // Atualização das etapas a cada 5s se estiver em progresso
        if (activeMission.value && !isReady.value && Math.floor(now.value / 1000) % 5 === 0) {
            await fetchActiveMission();
        }
    }, 1000);
});
onUnmounted(() => {
    if (tickerInterval)
        clearInterval(tickerInterval);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen text-parchment font-sans relative overflow-x-hidden selection:bg-blood-red selection:text-white pb-24 select-none transition-colors duration-1000" },
    ...{ class: (__VLS_ctx.ambientThemeClass) },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-24']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
if (__VLS_ctx.weatherPhase === 'DEEP_NIGHT') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-black" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-blue-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 bg-repeat opacity-15 animate-rain" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-repeat']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-15']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-rain']} */ ;
}
else if (__VLS_ctx.weatherPhase === 'LATE_NIGHT') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 pointer-events-none z-0 opacity-45 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-red-950/25 via-purple-950/15 to-black" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-45']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-red-950/25']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-purple-950/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 bg-repeat opacity-10 animate-pulse" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-repeat']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else if (__VLS_ctx.weatherPhase === 'PRE_DAWN') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 pointer-events-none z-0 opacity-60 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/30 via-red-950/20 to-black" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-60']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-amber-900/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-600/15 via-red-600/5 to-transparent animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-amber-600/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-600/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 pointer-events-none z-0 opacity-75 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600/30 via-red-950/40 to-[#120303]" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-orange-600/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-950/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#120303]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-red-500/15 to-transparent animate-ping" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-yellow-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-500/15']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-ping']} */ ;
}
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
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "relative z-20 border-b border-cyan-500/30 bg-[#02050a]/95 backdrop-blur-md sticky top-0 shadow-2xl" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#02050a]/95']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-14']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
if (!__VLS_ctx.activeMission || __VLS_ctx.isReady) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.activeMission || __VLS_ctx.isReady))
                    throw 0;
                return (__VLS_ctx.router.push('/personagem/hub?id=' + __VLS_ctx.characterId));
                // @ts-ignore
                [ambientThemeClass, weatherPhase, weatherPhase, weatherPhase, activeMission, isReady, router, characterId,];
            } },
        ...{ class: "text-stone-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-serif text-xs uppercase tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-cyan-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 border border-red-900/60 text-[11px] font-mono text-red-400" },
        title: "A navegação externa está bloqueada durante a operação. Aguarde o desfecho ou aborte a missão.",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-900/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "h-4 w-px bg-cyan-900/60 mx-1" },
});
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-900/60']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-serif font-bold text-xs sm:text-sm tracking-widest flex items-center gap-2 text-cyan-400" },
});
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "w-2 h-2 rounded-full" },
    ...{ class: (__VLS_ctx.activeMission ? (__VLS_ctx.isReady ? 'bg-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]') : 'bg-cyan-400') },
});
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3 text-xs font-mono" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
if (__VLS_ctx.character) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3 text-[11px]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-stone-400 hidden sm:inline" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-parchment font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    (__VLS_ctx.character.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-red-400 font-bold bg-black/60 px-2.5 py-1 rounded border border-red-900/50 shadow-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-900/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
    (__VLS_ctx.character.hunger);
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
        ...{ class: "animate-spin w-12 h-12 border-2 border-cyan-900 border-t-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.3)]" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-cyan-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(0,255,255,0.3)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-cyan-500/80 font-serif text-xs tracking-widest uppercase animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['text-cyan-500/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12 relative z-10 space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    if (!__VLS_ctx.activeMission) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-cyan-500/20 bg-black/75 rounded-xl p-8 sm:p-10 text-center space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-md" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-500/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/75']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_40px_rgba(0,0,0,0.9)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-500/40 mx-auto flex items-center justify-center text-2xl text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]" },
        });
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-cyan-950/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-500/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(0,255,255,0.2)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 max-w-md mx-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "text-xl font-serif font-bold text-parchment uppercase tracking-wider" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-400 leading-relaxed font-sans" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row items-center justify-center gap-4 pt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(!__VLS_ctx.activeMission))
                        throw 0;
                    return (__VLS_ctx.router.push('/personagem/radar?id=' + __VLS_ctx.characterId));
                    // @ts-ignore
                    [activeMission, activeMission, isReady, router, characterId, character, character, character, loading,];
                } },
            ...{ class: "w-full sm:w-auto px-8 py-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)] flex items-center justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-cyan-950/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-cyan-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(0,255,255,0.25)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(!__VLS_ctx.activeMission))
                        throw 0;
                    return (__VLS_ctx.router.push('/personagem/hub?id=' + __VLS_ctx.characterId));
                    // @ts-ignore
                    [router, characterId,];
                } },
            ...{ class: "w-full sm:w-auto px-8 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-stone-300 font-serif text-xs uppercase tracking-widest transition-all" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        if (__VLS_ctx.isSunHazardActive) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border-2 border-red-600 bg-red-950/70 rounded-xl p-4 sm:p-5 shadow-[0_0_35px_rgba(255,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse backdrop-blur-md" },
            });
            /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_35px_rgba(255,0,0,0.5)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
            /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-3xl" },
            });
            /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "text-red-400 font-serif font-bold text-sm uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-stone-300" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.triggerEmergencyShelter) },
                ...{ class: "px-5 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.6)] whitespace-nowrap" },
            });
            /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(255,0,0,0.6)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-red-900/60 bg-[#090507]/90 rounded-xl p-6 sm:p-8 shadow-[0_0_50px_rgba(153,27,27,0.3)] space-y-6 relative overflow-hidden backdrop-blur-md" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-900/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#090507]/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_50px_rgba(153,27,27,0.3)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-red-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "w-2 h-2 rounded-full" },
            ...{ class: (__VLS_ctx.isReady ? 'bg-green-400' : 'bg-red-500 animate-ping') },
        });
        /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.missionCategoryLabel);
        if (__VLS_ctx.activeMission.DefinitionMissionIdle?.Location?.name) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-stone-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            (__VLS_ctx.activeMission.DefinitionMissionIdle.Location.name);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "text-xl sm:text-2xl font-serif text-parchment font-bold tracking-wide" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        (__VLS_ctx.activeMission.currentReport?.title || __VLS_ctx.activeMission.DefinitionMissionIdle?.title || 'Operação de Campo');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sm:text-right flex sm:flex-col items-center sm:items-end justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['sm:text-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] text-stone-400 font-mono uppercase" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" },
            ...{ class: (__VLS_ctx.isReady ? 'bg-green-950 text-green-400 border border-green-700/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]' : (__VLS_ctx.isSunHazardActive ? 'bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-red-950 text-red-400 border border-red-800/60 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse')) },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.isReady ? '✔' : (__VLS_ctx.isSunHazardActive ? '⏸️' : '⏳'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.isReady ? 'Pronto para Coleta' : (__VLS_ctx.isSunHazardActive ? 'Pausada (Ameaça Solar)' : 'Em Execução'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-black/60 border border-white/10 p-5 sm:p-6 rounded-xl" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center md:border-r border-white/10 md:pr-6 space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:border-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:pr-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] text-stone-400 font-mono uppercase tracking-widest" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-3xl sm:text-4xl font-mono font-bold tracking-widest" },
            ...{ class: (__VLS_ctx.isReady ? 'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]' : (__VLS_ctx.isSunHazardActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]')) },
        });
        /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-4xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        (__VLS_ctx.isReady ? '00:00' : (__VLS_ctx.isSunHazardActive ? 'PAUSADO' : __VLS_ctx.formattedTimeRemaining));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] font-mono" },
            ...{ class: (__VLS_ctx.isSunHazardActive ? 'text-amber-400 font-bold' : 'text-stone-500') },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.isReady ? 'Operação Finalizada' : (__VLS_ctx.isSunHazardActive ? '⚠️ Paralisado pelo Sol' : 'Atualização ao vivo'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "md:col-span-2 space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-xs font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-stone-300" },
        });
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-gold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        (__VLS_ctx.completedStagesDisplay);
        (__VLS_ctx.totalStagesDisplay);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-stone-400 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.progressPercentage);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-white/10 p-0.5" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-full rounded-full transition-all duration-1000" },
            ...{ class: (__VLS_ctx.isReady ? 'bg-gradient-to-r from-green-700 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-gradient-to-r from-red-900 via-red-600 to-gold shadow-[0_0_15px_rgba(192,57,43,0.8)]') },
            ...{ style: ({ width: `${__VLS_ctx.progressPercentage}%` }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-[10px] font-mono text-stone-500" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4 pt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-serif text-sm uppercase tracking-widest text-stone-300 font-bold flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] font-mono text-stone-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        for (const [step] of __VLS_vFor((__VLS_ctx.displaySteps))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (step.order),
                ...{ class: "p-4 rounded-xl border transition-all duration-300 space-y-2" },
                ...{ class: ({
                        'bg-green-950/20 border-green-700/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]': step.status === 'COMPLETED' && step.passed,
                        'bg-red-950/30 border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]': step.status === 'COMPLETED' && !step.passed,
                        'bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse': step.status === 'FROZEN_SUN',
                        'bg-yellow-950/20 border-yellow-500/50 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.15)]': step.status === 'IN_PROGRESS',
                        'bg-black/40 border-white/5 opacity-50': step.status === 'LOCKED'
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
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
            /** @type {__VLS_StyleScopedClasses['bg-amber-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-amber-500/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(245,158,11,0.2)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
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
                ...{ class: "flex items-center gap-2.5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shadow-md" },
                ...{ class: ({
                        'bg-green-600 text-black': step.status === 'COMPLETED' && step.passed,
                        'bg-red-600 text-white': step.status === 'COMPLETED' && !step.passed,
                        'bg-amber-500 text-black font-bold': step.status === 'FROZEN_SUN',
                        'bg-yellow-500 text-black animate-spin': step.status === 'IN_PROGRESS',
                        'bg-zinc-800 text-gray-400': step.status === 'LOCKED'
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-yellow-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            (step.order);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif font-bold text-sm text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (step.actionName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2 text-[11px] font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            if (step.status === 'COMPLETED') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "px-2.5 py-0.5 rounded font-bold uppercase" },
                    ...{ class: (step.passed ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800') },
                });
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                (step.passed ? '✔ Sucesso' : '✖ Falha');
            }
            else if (step.status === 'FROZEN_SUN') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500 font-bold uppercase" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-amber-950']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-amber-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            }
            else if (step.status === 'IN_PROGRESS') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "px-2.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-700 font-bold uppercase" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
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
                    ...{ class: "px-2.5 py-0.5 rounded bg-zinc-900 text-gray-500 border border-zinc-800 font-bold uppercase" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-zinc-800']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-stone-400 font-mono text-[10px] hidden sm:inline" },
            });
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
            (step.pool);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-stone-300 font-light leading-relaxed pl-8" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            /** @type {__VLS_StyleScopedClasses['pl-8']} */ ;
            (step.narrative);
            if (step.status === 'COMPLETED' && step.rolls) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "text-[11px] text-stone-400 font-mono pl-8 pt-1 flex flex-wrap items-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                    ...{ class: "text-white" },
                });
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                (Array.isArray(step.rolls) ? step.rolls.join(', ') : step.rolls);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: (step.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold') },
                });
                (step.successes);
                (step.successes === 1 ? 'sucesso' : 'sucessos');
            }
            // @ts-ignore
            [activeMission, activeMission, activeMission, activeMission, isReady, isReady, isReady, isReady, isReady, isReady, isReady, isReady, isSunHazardActive, isSunHazardActive, isSunHazardActive, isSunHazardActive, isSunHazardActive, isSunHazardActive, isSunHazardActive, isSunHazardActive, triggerEmergencyShelter, missionCategoryLabel, formattedTimeRemaining, completedStagesDisplay, totalStagesDisplay, progressPercentage, progressPercentage, displaySteps,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-black/60 border border-cyan-950 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-stone-300" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-2xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        (__VLS_ctx.weatherIcon);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] text-stone-400 uppercase block" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-bold text-cyan-300" },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
        (__VLS_ctx.weatherDescription);
        (__VLS_ctx.liveNightTime);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center sm:text-right" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-right']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] text-stone-400 uppercase block" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (__VLS_ctx.isSunHazardActive ? 'text-red-400 font-bold animate-pulse' : 'text-gold font-bold') },
        });
        (__VLS_ctx.isDaytime ? '☀️ AMANHECEU' : `${__VLS_ctx.hoursRemaining}h restantes`);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        if (__VLS_ctx.isSunHazardActive) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.triggerEmergencyShelter) },
                ...{ class: "flex-1 py-4 px-6 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse flex items-center justify-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_25px_rgba(239,68,68,0.6)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        else if (__VLS_ctx.isReady) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.resolveMission) },
                disabled: (__VLS_ctx.isResolving),
                ...{ class: "flex-1 py-4 px-6 rounded-lg bg-gold hover:bg-gold-light text-black font-serif font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.5)] animate-bounce disabled:opacity-50 flex items-center justify-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_25px_rgba(212,175,55,0.5)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.isResolving ? 'Processando Recompensas...' : '🏆 Coletar Recompensas & Finalizar Operação');
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.cancelMission) },
                disabled: (__VLS_ctx.isCancelling),
                ...{ class: "py-3 px-6 rounded-lg border border-red-700/80 bg-red-950/40 hover:bg-red-900 hover:text-white text-red-300 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(185,28,28,0.3)] disabled:opacity-50" },
            });
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-700/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(185,28,28,0.3)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
            (__VLS_ctx.isCancelling ? 'Abortando...' : '🛑 Abortar Operação (Desistir)');
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.fetchActiveMission) },
            ...{ class: "py-3 px-5 rounded-lg border border-white/10 hover:bg-white/5 text-stone-300 font-serif text-xs uppercase tracking-wider transition-all" },
            title: "Recarregar status da missão",
        });
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    }
}
if (__VLS_ctx.showResultModal && __VLS_ctx.finalReport) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-2 border-red-700/80 bg-[#0a0507] p-6 sm:p-8 max-w-lg w-full relative rounded-xl shadow-[0_0_50px_rgba(255,0,0,0.35)] space-y-6 max-h-[90vh] overflow-y-auto font-sans" },
    });
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a0507]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_50px_rgba(255,0,0,0.35)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-serif" },
        ...{ class: (__VLS_ctx.finalReport.isSuccess ? 'text-green-400' : 'text-red-500') },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    (__VLS_ctx.finalReport.isSuccess ? '🏆 OPERAÇÃO CONCLUÍDA' : '💀 OPERAÇÃO INTERROMPIDA');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "font-serif text-lg text-parchment font-bold uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.finalReport.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-400 font-light" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    (__VLS_ctx.finalReport.isSuccess ? 'O plano correu com êxito pelas sombras de Nocturna.' : 'As forças locais reagiram e interromperam a incursão.');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 max-h-[200px] overflow-y-auto pr-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[200px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
    for (const [step, index] of __VLS_vFor((__VLS_ctx.finalReport.steps || []))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "bg-black/70 border-l-2 p-3 text-xs space-y-1 rounded-r" },
            ...{ class: (step.passed ? 'border-l-green-500' : 'border-l-red-600') },
        });
        /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-r']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold uppercase tracking-widest text-[11px] font-mono" },
            ...{ class: (step.passed ? 'text-green-400' : 'text-red-400') },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (step.actionName);
        (step.pool || 'Teste');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-gray-300 leading-relaxed" },
        });
        /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        (step.narrative);
        if (step.rolls && Array.isArray(step.rolls)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] text-gray-500 font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (step.rolls.join(', '));
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: (step.passed ? 'text-green-400' : 'text-red-400') },
            });
            (step.successes || 0);
        }
        // @ts-ignore
        [isReady, isSunHazardActive, isSunHazardActive, triggerEmergencyShelter, weatherIcon, weatherDescription, liveNightTime, isDaytime, hoursRemaining, resolveMission, isResolving, isResolving, cancelMission, isCancelling, isCancelling, fetchActiveMission, showResultModal, finalReport, finalReport, finalReport, finalReport, finalReport, finalReport,];
    }
    if (__VLS_ctx.finalReport.finalChanges && __VLS_ctx.finalReport.finalChanges.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-t border-white/10 pt-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-gold font-serif uppercase tracking-widest text-xs mb-2 font-bold flex items-center gap-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1.5 text-xs text-parchment font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        for (const [change, i] of __VLS_vFor((__VLS_ctx.finalReport.finalChanges))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (i),
                ...{ class: "p-2.5 bg-black/60 border border-white/10 rounded flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (change);
            // @ts-ignore
            [finalReport, finalReport, finalReport,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.onCloseResultAndReturn) },
        ...{ class: "w-full bg-vamp-c2 hover:bg-red-600 text-white p-3 font-serif uppercase tracking-widest font-bold transition-all rounded shadow-[0_0_15px_rgba(192,57,43,0.5)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-vamp-c2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(192,57,43,0.5)]']} */ ;
}
if (__VLS_ctx.showEmergencyModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-lg w-full bg-[#0d0404] border-2 border-red-600 rounded-xl p-6 sm:p-7 shadow-[0_0_60px_rgba(255,0,0,0.6)] space-y-5 text-stone-200 relative max-h-[92vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0d0404]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_60px_rgba(255,0,0,0.6)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[92vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEmergencyModal))
                    throw 0;
                return (__VLS_ctx.showEmergencyModal = false);
                // @ts-ignore
                [onCloseResultAndReturn, showEmergencyModal, showEmergencyModal,];
            } },
        ...{ class: "absolute top-4 right-4 text-stone-500 hover:text-white text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-4xl animate-bounce" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl font-serif text-red-500 font-bold uppercase tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-300 font-sans leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEmergencyModal))
                    throw 0;
                return (__VLS_ctx.takeShelter('BUY_MOTEL'));
                // @ts-ignore
                [takeShelter,];
            } },
        ...{ class: "w-full text-left p-4 rounded-xl border border-amber-500/50 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/50 transition-all space-y-2 group shadow-[0_0_15px_rgba(245,158,11,0.15)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-amber-950/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(245,158,11,0.15)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif font-bold text-sm text-amber-300 group-hover:text-amber-200 flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-amber-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase bg-amber-950 px-2 py-0.5 rounded text-amber-400 border border-amber-700/50 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] text-stone-400 font-light leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-1.5 text-[10px] font-mono pt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blue-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEmergencyModal))
                    throw 0;
                return (__VLS_ctx.takeShelter('BREACH_SEWER'));
                // @ts-ignore
                [takeShelter,];
            } },
        ...{ class: "w-full text-left p-4 rounded-xl border border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/50 transition-all space-y-2 group shadow-[0_0_15px_rgba(16,185,129,0.15)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-emerald-950/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(16,185,129,0.15)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif font-bold text-sm text-emerald-300 group-hover:text-emerald-200 flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-emerald-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-700/50 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] text-stone-400 font-light leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-1.5 text-[10px] font-mono pt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-stone-300" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-zinc-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEmergencyModal))
                    throw 0;
                return (__VLS_ctx.takeShelter('GO_HOME'));
                // @ts-ignore
                [takeShelter,];
            } },
        ...{ class: "w-full text-left p-4 rounded-xl border border-red-600/70 hover:border-red-500 bg-red-950/30 hover:bg-red-950/60 transition-all space-y-2 group shadow-[0_0_15px_rgba(220,38,38,0.2)]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-600/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(220,38,38,0.2)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif font-bold text-sm text-red-400 group-hover:text-red-300 flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover:text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase bg-red-950 px-2 py-0.5 rounded text-red-400 border border-red-700 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] text-stone-400 font-light leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-1.5 text-[10px] font-mono pt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
