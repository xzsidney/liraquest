import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { notifySuccess, notifyError } from '../utils/gothicAlerts';
const router = useRouter();
const route = useRoute();
const characterId = ref('');
const character = ref(null);
const loading = ref(true);
const isBooking = ref(false);
const isAwakening = ref(false);
const hasBookedRoom = ref(false);
const bookedHotelName = ref('');
const hotelTiers = [
    { stars: 1, name: 'Pensão "O Repouso das Sombras"', cost: 150, willpowerHeal: 1, hungerBonus: 0, desc: 'Quarto simples nos fundos com cortinas velhas grampeadas. Seguro porém decadente.' },
    { stars: 2, name: 'Motel Neon Blackout', cost: 350, willpowerHeal: 2, hungerBonus: 0, desc: 'Persiana blackout reforçada na beira da avenida, sem janelas externas. Privacidade padrão.' },
    { stars: 3, name: 'Grand Hotel Nocturna', cost: 800, willpowerHeal: 3, hungerBonus: 0, desc: 'Suíte executiva no centro com isolamento acústico de primeira linha e atendimento discreto.' },
    { stars: 4, name: 'Palace Boutique Hotel', cost: 1800, willpowerHeal: 4, hungerBonus: 0, desc: 'Suíte de luxo em prédio histórico, persianas automatizadas à prova de radiação e segurança privada.' },
    { stars: 5, name: 'The Elysium Royal Suite', cost: 4000, willpowerHeal: 10, hungerBonus: 1, desc: 'Suíte presidencial blindada em cobertura. Inclui frigobar privativo com bolsas de sangue O-negativo fresco e serviço de mordomo sigiloso.' }
];
const fetchCharacter = async () => {
    try {
        const res = await api.get(`/api/character-vampires/${characterId.value}`);
        character.value = res.data;
    }
    catch (e) {
        console.error('Erro ao carregar personagem:', e);
    }
};
const bookRoom = async (stars) => {
    try {
        isBooking.value = true;
        const res = await api.post(`/api/night-cycle/${characterId.value}/hotel/book`, { stars });
        if (res.data.success) {
            hasBookedRoom.value = true;
            bookedHotelName.value = res.data.hotelName;
            character.value = res.data.character;
            notifySuccess('Quarto Reservado!', res.data.message);
        }
        else {
            notifyError('Falha na Reserva', res.data.message);
        }
    }
    catch (e) {
        notifyError('Erro ao Reservar', e.response?.data?.error || 'Não foi possível alugar o quarto.');
    }
    finally {
        isBooking.value = false;
    }
};
const awakenForNextNight = async () => {
    try {
        isAwakening.value = true;
        const res = await api.post(`/api/night-cycle/${characterId.value}/awaken`);
        const { rouseSuccess, hungerIncreased, willpowerHealed } = res.data;
        let msg = `🎲 Rouse Check: ${rouseSuccess ? 'SUCESSO (Fome mantida)' : `FALHA (${hungerIncreased ? '+1 Fome!' : 'Fome no Limite'})`}`;
        if (willpowerHealed > 0)
            msg += ` | 🧠 Força de Vontade recuperada (+${willpowerHealed}).`;
        notifySuccess('Uma Nova Noite Cai Sobre Nocturna', msg);
        router.push(`/personagem/hub?id=${characterId.value}`);
    }
    catch (e) {
        notifyError('Erro ao Despertar', e.response?.data?.error || 'Não foi possível iniciar a nova noite.');
    }
    finally {
        isAwakening.value = false;
    }
};
onMounted(async () => {
    characterId.value = route.query.id || localStorage.getItem('lira_active_character_id') || '';
    if (!characterId.value) {
        router.push('/jogador/vampire');
        return;
    }
    await fetchCharacter();
    loading.value = false;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#070408] text-parchment font-sans relative overflow-x-hidden selection:bg-blood-red selection:text-white pb-24 select-none" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#070408]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-24']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-purple-950/20 to-black z-0" },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-40']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]']} */ ;
/** @type {__VLS_StyleScopedClasses['from-amber-950/30']} */ ;
/** @type {__VLS_StyleScopedClasses['via-purple-950/20']} */ ;
/** @type {__VLS_StyleScopedClasses['to-black']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
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
    ...{ class: "relative z-20 border-b border-amber-500/30 bg-[#07040a]/95 backdrop-blur-md sticky top-0 shadow-2xl" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-500/30']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#07040a]/95']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.awakenForNextNight) },
    ...{ class: "text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-serif text-xs uppercase tracking-widest" },
    title: "Ao retornar ao Hub, o personagem dorme durante o dia e desperta às 20:00 com o Rouse Check.",
});
/** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-amber-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "font-serif font-bold text-xs sm:text-sm tracking-widest flex items-center gap-2 text-amber-400" },
});
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-stone-400 hidden sm:inline" },
    });
    /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:inline']} */ ;
    (__VLS_ctx.character.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-green-400 font-bold bg-black/60 px-3 py-1 rounded border border-green-700/50 shadow-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-700/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
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
        ...{ class: "animate-spin w-12 h-12 border-2 border-amber-900 border-t-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)]" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(245,158,11,0.3)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-amber-500/80 font-serif text-xs tracking-widest uppercase animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['text-amber-500/80']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-amber-500/40 bg-black/70 rounded-xl p-5 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_30px_rgba(245,158,11,0.15)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 text-xs font-mono uppercase text-amber-400" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-stone-300 font-sans leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    if (__VLS_ctx.hasBookedRoom) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-2 border-green-600/70 bg-[#090e09]/90 rounded-xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_40px_rgba(34,197,94,0.25)] backdrop-blur-md animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-green-600/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#090e09]/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:p-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_40px_rgba(34,197,94,0.25)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-16 h-16 rounded-full bg-green-950/60 border border-green-500/50 mx-auto flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(34,197,94,0.3)]" },
        });
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-green-950/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-green-500/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(34,197,94,0.3)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 max-w-md mx-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-mono uppercase tracking-widest text-green-400 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "text-xl sm:text-2xl font-serif font-bold text-parchment" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        (__VLS_ctx.bookedHotelName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-300 leading-relaxed font-sans" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pt-4 border-t border-white/10 max-w-md mx-auto space-y-3" },
        });
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.awakenForNextNight) },
            disabled: (__VLS_ctx.isAwakening),
            ...{ class: "w-full py-4 rounded-lg bg-gold hover:bg-gold-light text-black font-serif font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.5)] animate-bounce disabled:opacity-50 flex items-center justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
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
        (__VLS_ctx.isAwakening ? 'Despertando...' : '🌙 Dormir Durante o Dia & Despertar à Noite');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[10px] font-mono text-stone-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
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
            ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        for (const [hotel] of __VLS_vFor((__VLS_ctx.hotelTiers))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (hotel.stars),
                ...{ class: "p-5 rounded-xl border transition-all duration-300 space-y-3 relative overflow-hidden flex flex-col justify-between" },
                ...{ class: ([
                        hotel.stars === 5 ? 'border-gold/50 bg-gradient-to-br from-amber-950/30 to-black md:col-span-2' : 'border-white/10 bg-black/60 hover:border-amber-500/50'
                    ]) },
            });
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-start" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-1 text-amber-400 text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            for (const [s] of __VLS_vFor((hotel.stars))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (s),
                });
                // @ts-ignore
                [awakenForNextNight, awakenForNextNight, character, character, character, loading, hasBookedRoom, bookedHotelName, isAwakening, isAwakening, hotelTiers,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif font-bold text-base text-parchment mt-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
            (hotel.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-right" },
            });
            /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm font-mono font-bold" },
                ...{ class: (__VLS_ctx.character.money >= hotel.cost ? 'text-green-400' : 'text-red-400') },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (hotel.cost.toLocaleString('pt-BR'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] block text-stone-500 uppercase font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-stone-400 font-light leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (hotel.desc);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pt-2 flex flex-wrap gap-2 text-[10px] font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blue-950/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-blue-800/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
            (hotel.willpowerHeal);
            if (hotel.hungerBonus > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-300 font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-red-950/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (hotel.hungerBonus);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-zinc-900 text-stone-400 border border-zinc-800" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-zinc-800']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.hasBookedRoom))
                            throw 0;
                        return (__VLS_ctx.bookRoom(hotel.stars));
                        // @ts-ignore
                        [character, bookRoom,];
                    } },
                disabled: (__VLS_ctx.isBooking || __VLS_ctx.character.money < hotel.cost),
                ...{ class: "w-full mt-3 py-2.5 rounded font-serif font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md" },
                ...{ class: ([
                        hotel.stars === 5 ? 'bg-gold hover:bg-gold-light text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-amber-950/70 hover:bg-amber-800 border border-amber-600/50 text-amber-200'
                    ]) },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
            (__VLS_ctx.character.money < hotel.cost ? 'Saldo Insuficiente' : (__VLS_ctx.isBooking ? 'Reservando...' : `Alugar por R$ ${hotel.cost.toLocaleString('pt-BR')}`));
            // @ts-ignore
            [character, character, isBooking, isBooking,];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
