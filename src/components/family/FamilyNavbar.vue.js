import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import { incomingBattleInvite, acceptPartyInvite, joinFamilyRoom, } from '../../services/familySocket';
const router = useRouter();
const activeHero = ref(null);
const navItems = [
    { label: 'Salão', path: '/familia/sala', icon: '🏰' },
    { label: 'Ficha', path: '/familia/ficha', icon: '🛡️' },
    { label: 'Radar', path: '/familia/radar', icon: '🧭' },
    { label: 'Arena 1v1', path: '/familia/batalha', icon: '⚔️' },
    { label: 'Raid Co-op', path: '/familia/raid', icon: '👥' },
    { label: 'Foco AFK', path: '/familia/missao-ativa', icon: '⏳' },
    { label: 'Missões', path: '/familia/tarefas', icon: '📋' },
    { label: 'Loja', path: '/familia/loja', icon: '🛍️' },
    { label: 'Contos', path: '/familia/aventuras', icon: '📜' },
    { label: 'Mural', path: '/familia/mural', icon: '🏆' },
    { label: 'Enfermaria', path: '/familia/enfermaria', icon: '🏥' },
];
function acceptInviteAndGoRaid() {
    if (activeHero.value) {
        acceptPartyInvite(activeHero.value);
        router.push('/familia/raid');
    }
}
function logout() {
    sessionStorage.removeItem('lira_token');
    sessionStorage.removeItem('lira_user');
    localStorage.removeItem('lira_token');
    localStorage.removeItem('lira_user');
    localStorage.removeItem('token');
    router.push('/login');
}
onMounted(async () => {
    try {
        const res = await familyApi.getMyCharacters();
        if (res.success && res.characters?.length > 0) {
            const savedId = localStorage.getItem('lira_active_family_char_id');
            activeHero.value = res.characters.find((c) => c.id === savedId) || res.characters[0];
            if (activeHero.value) {
                joinFamilyRoom(activeHero.value.id, activeHero.value.name);
            }
        }
    }
    catch (err) {
        console.error('Erro ao carregar herói ativo na navbar:', err);
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "slide-down",
}));
const __VLS_2 = __VLS_1({
    name: "slide-down",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.incomingBattleInvite && __VLS_ctx.activeHero && __VLS_ctx.incomingBattleInvite.leaderId !== __VLS_ctx.activeHero.id) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-r from-[#2c0312] via-[#170529] to-[#05112e] border-2 border-amber-400 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#2c0312]']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-[#170529]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#05112e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-3xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs font-black uppercase tracking-wider text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm font-bold text-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.incomingBattleInvite.leaderName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
    (__VLS_ctx.incomingBattleInvite.monsterName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.acceptInviteAndGoRaid) },
        ...{ class: "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer active:scale-95 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-emerald-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-teal-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.incomingBattleInvite && __VLS_ctx.activeHero && __VLS_ctx.incomingBattleInvite.leaderId !== __VLS_ctx.activeHero.id))
                    throw 0;
                return (__VLS_ctx.incomingBattleInvite = null);
                // @ts-ignore
                [incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, activeHero, activeHero, acceptInviteAndGoRaid,];
            } },
        ...{ class: "text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "bg-gradient-to-r from-[#20040c] via-[#120726] to-[#04132b] border-b-2 border-amber-500/40 px-4 py-3 sticky top-0 z-40 backdrop-blur-md shadow-2xl" },
});
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-[#20040c]']} */ ;
/** @type {__VLS_StyleScopedClasses['via-[#120726]']} */ ;
/** @type {__VLS_StyleScopedClasses['to-[#04132b]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3" },
});
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    to: "/familia/sala",
    ...{ class: "flex items-center space-x-2 group" },
}));
const __VLS_8 = __VLS_7({
    to: "/familia/sala",
    ...{ class: "flex items-center space-x-2 group" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 via-purple-700 to-blue-700 p-0.5 border border-amber-400 shadow-md shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform" },
});
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-rose-700']} */ ;
/** @type {__VLS_StyleScopedClasses['via-purple-700']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-amber-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-xl" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-base md:text-lg font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent" },
});
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-amber-300']} */ ;
/** @type {__VLS_StyleScopedClasses['via-yellow-200']} */ ;
/** @type {__VLS_StyleScopedClasses['to-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-[10px] text-blue-300 font-semibold flex items-center space-x-1" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" },
});
/** @type {__VLS_StyleScopedClasses['w-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-emerald-400']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center flex-wrap gap-1 md:gap-1.5 text-xs font-bold" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        key: (item.path),
        to: (item.path),
        ...{ class: ([
                'px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center space-x-1.5 border',
                __VLS_ctx.$route.path === item.path
                    ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-blue-900 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-amber-200 hover:bg-slate-800 border-slate-800 hover:border-amber-500/30'
            ]) },
    }));
    const __VLS_14 = __VLS_13({
        key: (item.path),
        to: (item.path),
        ...{ class: ([
                'px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center space-x-1.5 border',
                __VLS_ctx.$route.path === item.path
                    ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-blue-900 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-amber-200 hover:bg-slate-800 border-slate-800 hover:border-amber-500/30'
            ]) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    const { default: __VLS_17 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.icon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hidden sm:inline" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
    (item.label);
    // @ts-ignore
    [navItems, $route,];
    var __VLS_15;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
if (__VLS_ctx.activeHero) {
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        to: "/familia/ficha",
        ...{ class: "flex items-center space-x-2 bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-500/40 px-2.5 py-1.5 rounded-xl hover:border-amber-400 transition-all cursor-pointer" },
    }));
    const __VLS_20 = __VLS_19({
        to: "/familia/ficha",
        ...{ class: "flex items-center space-x-2 bg-gradient-to-r from-rose-950 to-blue-950 border border-amber-500/40 px-2.5 py-1.5 rounded-xl hover:border-amber-400 transition-all cursor-pointer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-blue-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    const { default: __VLS_23 } = __VLS_21.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.getDisplayImageUrl(__VLS_ctx.activeHero.avatarUrl)),
        ...{ class: "w-7 h-7 rounded-lg object-contain bg-slate-900 border border-amber-400" },
    });
    /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hidden md:block text-left" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] font-black text-amber-300 leading-none" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
    (__VLS_ctx.activeHero.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[9px] text-sky-300 font-semibold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.activeHero.level);
    (__VLS_ctx.activeHero.gold);
    // @ts-ignore
    [activeHero, activeHero, activeHero, activeHero, activeHero, getDisplayImageUrl,];
    var __VLS_21;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.logout) },
    ...{ class: "bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer" },
    title: "Sair da Conta",
});
/** @type {__VLS_StyleScopedClasses['bg-rose-950/70']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-rose-900']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-rose-800/80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-rose-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
// @ts-ignore
[logout,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
