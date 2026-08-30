import { ref, computed, onMounted, onUnmounted } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi } from '../../services/familyApi';
const activeMission = ref(null);
const hero = ref(null);
const remainingSeconds = ref(0);
let timerInterval = null;
const missionForm = ref({
    title: 'Lição de Casa & Estudos',
    category: 'STUDY',
    durationMinutes: 20,
});
const progressPercentage = computed(() => {
    if (!activeMission.value)
        return 0;
    const totalSecs = activeMission.value.durationMinutes * 60;
    const elapsed = totalSecs - remainingSeconds.value;
    return Math.min(100, Math.max(0, Math.floor((elapsed / totalSecs) * 100)));
});
function formatTime(seconds) {
    if (seconds <= 0)
        return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
function updateTimer() {
    if (!activeMission.value)
        return;
    const now = new Date().getTime();
    const ends = new Date(activeMission.value.endsAt).getTime();
    const diff = Math.floor((ends - now) / 1000);
    remainingSeconds.value = Math.max(0, diff);
}
async function loadData() {
    try {
        const heroRes = await familyApi.getMyCharacters();
        if (heroRes.success && heroRes.characters?.length > 0) {
            const savedId = localStorage.getItem('lira_active_family_char_id');
            hero.value = heroRes.characters.find((c) => c.id === savedId) || heroRes.characters[0];
            if (hero.value) {
                const missionRes = await familyApi.getCurrentActiveMission(hero.value.id);
                if (missionRes.success && missionRes.mission) {
                    activeMission.value = missionRes.mission;
                    updateTimer();
                }
            }
        }
    }
    catch (err) {
        console.error('Erro ao carregar missão ativa:', err);
    }
}
async function startMission() {
    if (!hero.value) {
        alert('Nenhum herói selecionado.');
        return;
    }
    try {
        const res = await familyApi.startActiveMission({
            characterId: hero.value.id,
            title: missionForm.value.title,
            category: missionForm.value.category,
            durationMinutes: missionForm.value.durationMinutes,
        });
        if (res.success && res.mission) {
            activeMission.value = res.mission;
            updateTimer();
        }
    }
    catch (err) {
        console.error('Erro ao iniciar missão:', err);
    }
}
async function completeMission() {
    if (!activeMission.value)
        return;
    try {
        const res = await familyApi.completeActiveMission(activeMission.value.id);
        if (res.success) {
            alert(`🎉 ${res.message}`);
            activeMission.value = null;
            await loadData();
        }
        else {
            alert(res.error || 'Erro ao concluir missão.');
        }
    }
    catch (err) {
        console.error('Erro ao concluir missão:', err);
    }
}
onMounted(() => {
    loadData();
    timerInterval = setInterval(updateTimer, 1000);
});
onUnmounted(() => {
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
    ...{ class: "min-h-screen bg-gradient-to-b from-[#180309] via-[#0d0a1a] to-[#040e24] text-slate-100 font-sans pb-12" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-[#180309]']} */ ;
/** @type {__VLS_StyleScopedClasses['via-[#0d0a1a]']} */ ;
/** @type {__VLS_StyleScopedClasses['to-[#040e24]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-12']} */ ;
const __VLS_0 = FamilyNavbar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "max-w-4xl mx-auto px-4 py-8 space-y-8" },
});
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-center space-y-2 border-b border-rose-900/60 pb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-rose-900/60']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-2xl md:text-3xl font-black text-amber-300 flex items-center justify-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs md:text-sm text-blue-200" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-200']} */ ;
if (!__VLS_ctx.activeMission) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-[#250610] to-[#091533] border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#250610]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#091533]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-4xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl font-black text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-slate-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-xs font-bold text-slate-300 block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        placeholder: "Ex: Fazer lição de matemática, Ler 10 páginas, Arrumar os armários...",
        ...{ class: "w-full bg-slate-950 border border-rose-900/60 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400" },
    });
    (__VLS_ctx.missionForm.title);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-900/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-amber-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-xs font-bold text-slate-300 block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.activeMission))
                    throw 0;
                return (__VLS_ctx.missionForm.category = 'STUDY');
                // @ts-ignore
                [activeMission, missionForm, missionForm,];
            } },
        type: "button",
        ...{ class: (['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', __VLS_ctx.missionForm.category === 'STUDY' ? 'bg-blue-900/60 border-blue-400 text-sky-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']) },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.activeMission))
                    throw 0;
                return (__VLS_ctx.missionForm.category = 'CHORE');
                // @ts-ignore
                [missionForm, missionForm,];
            } },
        type: "button",
        ...{ class: (['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', __VLS_ctx.missionForm.category === 'CHORE' ? 'bg-rose-900/60 border-rose-400 text-rose-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']) },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.activeMission))
                    throw 0;
                return (__VLS_ctx.missionForm.category = 'READING');
                // @ts-ignore
                [missionForm, missionForm,];
            } },
        type: "button",
        ...{ class: (['p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1', __VLS_ctx.missionForm.category === 'READING' ? 'bg-purple-900/60 border-purple-400 text-purple-300 shadow' : 'bg-slate-950/80 border-slate-800 text-slate-400']) },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "text-xs font-bold text-slate-300 block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-4 gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    for (const [mins] of __VLS_vFor(([10, 20, 30, 45]))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.activeMission))
                        throw 0;
                    return (__VLS_ctx.missionForm.durationMinutes = mins);
                    // @ts-ignore
                    [missionForm, missionForm,];
                } },
            type: "button",
            key: (mins),
            ...{ class: ([
                    'py-3 rounded-xl border text-center transition-all font-black text-xs',
                    __VLS_ctx.missionForm.durationMinutes === mins ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        (mins);
        // @ts-ignore
        [missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-slate-300 font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-3 font-black" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    (__VLS_ctx.missionForm.durationMinutes * 4);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-yellow-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
    (Math.floor(__VLS_ctx.missionForm.durationMinutes * 1.5));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startMission) },
        ...{ class: "w-full bg-gradient-to-r from-rose-700 via-purple-700 to-blue-700 hover:from-rose-600 hover:to-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-rose-900/40 transition-transform active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-purple-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-blue-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-rose-900/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-[#2a0512] to-[#0a1538] border-2 border-amber-400 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 text-center relative overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#2a0512]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#0a1538]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "inline-block bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black px-4 py-1 rounded-full mb-2 animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-2xl md:text-3xl font-black text-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
    (__VLS_ctx.activeMission.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-blue-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-56 h-56 mx-auto rounded-full bg-slate-950 border-4 border-amber-400/80 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20 relative" },
    });
    /** @type {__VLS_StyleScopedClasses['w-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-56']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-amber-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-4xl md:text-5xl font-black text-amber-300 tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.formatTime(__VLS_ctx.remainingSeconds));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[11px] text-sky-400 font-bold uppercase mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 max-w-md mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between text-xs font-bold text-slate-300" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.progressPercentage);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full bg-slate-950 h-3 rounded-full border border-blue-900 overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-r from-rose-600 via-amber-500 to-blue-500 h-full rounded-full transition-all duration-1000" },
        ...{ style: ({ width: `${__VLS_ctx.progressPercentage}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-blue-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-1000']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pt-4 flex flex-col sm:flex-row items-center justify-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    if (__VLS_ctx.remainingSeconds <= 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.completeMission) },
            ...{ class: "w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-emerald-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-teal-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:from-emerald-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:to-teal-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-emerald-500/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.completeMission) },
            ...{ class: "w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow active:scale-95 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:w-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-amber-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-yellow-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    }
}
// @ts-ignore
[activeMission, missionForm, missionForm, startMission, formatTime, remainingSeconds, remainingSeconds, progressPercentage, progressPercentage, completeMission, completeMission,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
