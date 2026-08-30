import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Dice3DEngine } from '../utils/diceEngine';
const canvasRef = ref(null);
let engine = null;
const regularCount = ref(4);
const hungerCount = ref(1);
const difficulty = ref(2);
const isRolling = ref(false);
const results = ref(null);
onMounted(() => {
    if (canvasRef.value) {
        engine = new Dice3DEngine({
            canvas: canvasRef.value,
            onSettle: (rolledResults) => {
                results.value = rolledResults;
                isRolling.value = false;
            }
        });
    }
});
onUnmounted(() => {
    if (engine) {
        engine.destroy();
        engine = null;
    }
});
function handleRoll() {
    if (!engine || isRolling.value)
        return;
    if (regularCount.value === 0 && hungerCount.value === 0)
        return;
    results.value = null;
    isRolling.value = true;
    engine.rollDice(regularCount.value, hungerCount.value);
}
function handleClear() {
    if (!engine)
        return;
    results.value = null;
    isRolling.value = false;
    engine.clearDice();
}
function setPreset(reg, hung, diff) {
    regularCount.value = reg;
    hungerCount.value = hung;
    difficulty.value = diff;
    handleRoll();
}
// Apuração de Regras V5
const totalSuccesses = computed(() => {
    if (!results.value)
        return 0;
    let count = 0;
    let tensCount = 0;
    for (const d of results.value) {
        if (d.value >= 6) {
            count++;
        }
        if (d.value === 10) {
            tensCount++;
        }
    }
    // A cada par de 10s, ganha +2 sucessos extras (crítico V5)
    const critBonus = Math.floor(tensCount / 2) * 2;
    return count + critBonus;
});
const hasCritical = computed(() => {
    if (!results.value)
        return false;
    const tens = results.value.filter(d => d.value === 10).length;
    return tens >= 2;
});
const hasMessyCritical = computed(() => {
    if (!hasCritical.value || !results.value)
        return false;
    // Crítico é bestial se pelo menos um 10 estiver em um dado de fome
    return results.value.some(d => d.type === 'hunger' && d.value === 10);
});
const hasBestialFailure = computed(() => {
    if (!results.value)
        return false;
    const isFail = totalSuccesses.value < difficulty.value;
    const hasHungerOne = results.value.some(d => d.type === 'hunger' && d.value === 1);
    return isFail && hasHungerOne;
});
const isVictory = computed(() => {
    return totalSuccesses.value >= difficulty.value;
});
const verdictTitle = computed(() => {
    if (hasMessyCritical.value && isVictory.value)
        return 'Crítico Bestial! (Messy Critical)';
    if (hasCritical.value && isVictory.value)
        return 'Vitória com Crítico!';
    if (isVictory.value)
        return 'Vitória (Sucesso)';
    if (hasBestialFailure.value)
        return 'Falha Bestial! (Bestial Failure)';
    return 'Falha no Teste';
});
const verdictSubtitle = computed(() => {
    if (hasMessyCritical.value && isVictory.value) {
        return 'A Besta assumiu o controle momentâneo para garantir a vitória através de violência ou impulsos animalescos!';
    }
    if (hasCritical.value && isVictory.value) {
        return 'Um triunfo magnífico e controlado de maestria vampírica.';
    }
    if (isVictory.value) {
        return `Você alcançou a dificuldade ${difficulty.value} com sucesso.`;
    }
    if (hasBestialFailure.value) {
        return 'A fome e a Besta sabotaram suas ações resultando em uma catástrofe dramática!';
    }
    return `Você não atingiu a dificuldade ${difficulty.value}.`;
});
const verdictIcon = computed(() => {
    if (hasMessyCritical.value && isVictory.value)
        return '🩸⚡';
    if (hasCritical.value && isVictory.value)
        return '☥✨';
    if (isVictory.value)
        return '✓';
    if (hasBestialFailure.value)
        return '☠️';
    return '✗';
});
const verdictClass = computed(() => {
    if (hasMessyCritical.value && isVictory.value) {
        return 'bg-red-950/90 border-red-500 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    }
    if (hasCritical.value && isVictory.value) {
        return 'bg-amber-950/90 border-amber-400 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.5)]';
    }
    if (isVictory.value) {
        return 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
    }
    if (hasBestialFailure.value) {
        return 'bg-neutral-950/95 border-red-600 text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.6)]';
    }
    return 'bg-neutral-900/90 border-neutral-700 text-neutral-300';
});
const verdictBorderClass = computed(() => {
    if (hasMessyCritical.value && isVictory.value)
        return 'border-red-800';
    if (hasCritical.value && isVictory.value)
        return 'border-amber-800';
    if (isVictory.value)
        return 'border-emerald-800';
    if (hasBestialFailure.value)
        return 'border-red-900';
    return 'border-neutral-800';
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans relative overflow-hidden select-none" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-950']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "bg-neutral-900/90 border-b border-red-950/60 px-6 py-4 flex items-center justify-between z-10 backdrop-blur-md" },
});
/** @type {__VLS_StyleScopedClasses['bg-neutral-900/90']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-950/60']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-9 h-9 rounded-full bg-red-950/80 border border-red-600/40 flex items-center justify-center text-red-500 font-serif font-bold text-lg shadow-[0_0_15px_rgba(220,38,38,0.3)]" },
});
/** @type {__VLS_StyleScopedClasses['w-9']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-950/80']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-600/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(220,38,38,0.3)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-xl font-bold tracking-wider text-red-100 font-serif" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-100']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-neutral-400" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/dashboard",
    ...{ class: "px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-xs font-semibold uppercase tracking-wider transition-all" },
}));
const __VLS_2 = __VLS_1({
    to: "/dashboard",
    ...{ class: "px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 text-xs font-semibold uppercase tracking-wider transition-all" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 flex flex-col lg:flex-row relative" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black overflow-hidden flex items-center justify-center min-h-[500px]" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-neutral-950']} */ ;
/** @type {__VLS_StyleScopedClasses['via-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['to-black']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[500px]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.canvas, __VLS_intrinsics.canvas)({
    ref: "canvasRef",
    ...{ class: "w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-grab']} */ ;
/** @type {__VLS_StyleScopedClasses['active:cursor-grabbing']} */ ;
if (!__VLS_ctx.results && !__VLS_ctx.isRolling) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-6 left-6 pointer-events-none text-neutral-500/60 font-serif text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-neutral-500/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-red-400 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
if (__VLS_ctx.results) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-xl animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-11/12']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: ([
                'p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all',
                __VLS_ctx.verdictClass
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between border-b pb-2 mb-3" },
        ...{ class: (__VLS_ctx.verdictBorderClass) },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    (__VLS_ctx.verdictIcon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif font-bold text-lg tracking-wide uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    (__VLS_ctx.verdictTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs opacity-80" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
    (__VLS_ctx.verdictSubtitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-3xl font-black font-serif tracking-tight" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
    (__VLS_ctx.totalSuccesses);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm font-normal opacity-70" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs opacity-75" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
    (__VLS_ctx.difficulty);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-2 justify-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    for (const [die, idx] of __VLS_vFor((__VLS_ctx.results))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (die.id || idx),
            ...{ class: ([
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold font-serif text-sm border shadow transition-transform transform hover:scale-110',
                    die.type === 'hunger'
                        ? die.value === 10
                            ? 'bg-red-700 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                            : die.value === 1
                                ? 'bg-neutral-900 text-red-500 border-red-600 shadow-[0_0_12px_rgba(185,28,28,0.8)]'
                                : die.value >= 6
                                    ? 'bg-red-800 text-red-100 border-red-600'
                                    : 'bg-neutral-950 text-red-300/60 border-red-900/50'
                        : die.value === 10
                            ? 'bg-amber-600 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                            : die.value >= 6
                                ? 'bg-neutral-800 text-amber-300 border-amber-600/60'
                                : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['transform']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:scale-110']} */ ;
        (die.value);
        if (die.type === 'hunger' && die.value === 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] ml-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
        }
        else if (die.value === 10) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] ml-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
        }
        // @ts-ignore
        [results, results, results, isRolling, verdictClass, verdictBorderClass, verdictIcon, verdictTitle, verdictSubtitle, totalSuccesses, difficulty,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "w-full lg:w-96 bg-neutral-900/95 border-l border-red-950/60 p-6 flex flex-col justify-between z-10" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:w-96']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-900/95']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-950/60']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-sm font-semibold uppercase tracking-wider text-red-400 font-serif border-b border-red-950/80 pb-2" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-950/80']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between items-center mb-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "text-sm font-medium text-neutral-300 flex items-center" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "w-3 h-3 rounded-full bg-neutral-800 border border-amber-500/80 inline-block mr-2" },
});
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-500/80']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-amber-400 font-bold font-serif text-lg" },
});
/** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
(__VLS_ctx.regularCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "range",
    min: "0",
    max: "15",
    ...{ class: "w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer h-2" },
});
(__VLS_ctx.regularCount);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['accent-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between text-[11px] text-neutral-500 mt-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between items-center mb-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "text-sm font-medium text-neutral-300 flex items-center" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "w-3 h-3 rounded-full bg-red-700 border border-red-400 inline-block mr-2 animate-pulse" },
});
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-red-400 font-bold font-serif text-lg" },
});
/** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
(__VLS_ctx.hungerCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "range",
    min: "0",
    max: "5",
    ...{ class: "w-full accent-red-600 bg-neutral-800 rounded-lg cursor-pointer h-2" },
});
(__VLS_ctx.hungerCount);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['accent-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between text-[11px] text-neutral-500 mt-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between items-center mb-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "text-sm font-medium text-neutral-300" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-neutral-200 font-bold font-serif text-lg" },
});
/** @type {__VLS_StyleScopedClasses['text-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
(__VLS_ctx.difficulty);
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    type: "range",
    min: "1",
    max: "8",
    ...{ class: "w-full accent-neutral-400 bg-neutral-800 rounded-lg cursor-pointer h-2" },
});
(__VLS_ctx.difficulty);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['accent-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between text-[11px] text-neutral-500 mt-1" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pt-2" },
});
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2 block" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-2 gap-2" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setPreset(4, 1, 2));
            // @ts-ignore
            [difficulty, difficulty, regularCount, regularCount, hungerCount, hungerCount, setPreset,];
        } },
    ...{ class: "px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-neutral-300 text-left border border-neutral-700/60 transition-all hover:border-red-600/40" },
});
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700/60']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-600/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setPreset(6, 2, 3));
            // @ts-ignore
            [setPreset,];
        } },
    ...{ class: "px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-neutral-300 text-left border border-neutral-700/60 transition-all hover:border-red-600/40" },
});
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700/60']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-600/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setPreset(1, 0, 1));
            // @ts-ignore
            [setPreset,];
        } },
    ...{ class: "px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-neutral-300 text-left border border-neutral-700/60 transition-all hover:border-red-600/40" },
});
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700/60']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-600/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setPreset(7, 3, 4));
            // @ts-ignore
            [setPreset,];
        } },
    ...{ class: "px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-neutral-300 text-left border border-neutral-700/60 transition-all hover:border-red-600/40" },
});
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700/60']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-600/40']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-3 pt-6 border-t border-neutral-800" },
});
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-800']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleRoll) },
    disabled: (__VLS_ctx.isRolling || (__VLS_ctx.regularCount === 0 && __VLS_ctx.hungerCount === 0)),
    ...{ class: "w-full py-4 bg-gradient-to-r from-red-800 via-red-600 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-serif font-bold text-base tracking-wider rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform active:scale-98 flex items-center justify-center space-x-2 border border-red-500/30 cursor-pointer" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-red-800']} */ ;
/** @type {__VLS_StyleScopedClasses['via-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['to-red-900']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:from-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:to-red-800']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(220,38,38,0.4)]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-98']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500/30']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
if (__VLS_ctx.isRolling) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "inline-block animate-spin" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.isRolling ? 'ROLANDO DADOS 3D...' : 'ROLAR DADOS 3D');
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleClear) },
    disabled: (__VLS_ctx.isRolling),
    ...{ class: "w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-semibold uppercase tracking-wider border border-neutral-700/50 transition-all cursor-pointer" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-700/50']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
// @ts-ignore
[isRolling, isRolling, isRolling, isRolling, regularCount, hungerCount, handleRoll, handleClear,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
