import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import NightClockWidget from '../components/NightClockWidget.vue';
import { notifySuccess, notifyError } from '../utils/gothicAlerts';
const router = useRouter();
const route = useRoute();
const characterId = ref('');
const loading = ref(true);
const exploring = ref(false);
const dispatching = ref(false);
const currentNightStatus = ref(null);
const onNightStatusUpdated = (status) => {
    currentNightStatus.value = status;
};
const mapNodes = ref([]);
const sidebarNode = ref(null);
const activeMission = ref(null);
// ESTADOS REATIVOS DE BUSCA, FILTRO E ORDENAÇÃO DE MISSÕES
const searchMissionQuery = ref('');
const selectedCategory = ref('ALL'); // 'ALL' | 'HUNT' | 'OPERATION'
const sortBy = ref('DEFAULT'); // 'DEFAULT' | 'DURATION_ASC' | 'DURATION_DESC' | 'DIFF_ASC' | 'DIFF_DESC' | 'NAME_ASC'
const filteredAndSortedMissions = computed(() => {
    const missions = sidebarNode.value?.missions || [];
    if (!missions.length)
        return [];
    let list = [...missions];
    // 1. Filtro por Categoria
    if (selectedCategory.value === 'HUNT') {
        list = list.filter((m) => m.category === 'HUNT');
    }
    else if (selectedCategory.value === 'OPERATION') {
        list = list.filter((m) => m.category !== 'HUNT');
    }
    // 2. Filtro por Busca de Texto (Título e Descrição)
    if (searchMissionQuery.value.trim()) {
        const q = searchMissionQuery.value.toLowerCase().trim();
        list = list.filter((m) => (m.title && m.title.toLowerCase().includes(q)) ||
            (m.description && m.description.toLowerCase().includes(q)));
    }
    // 3. Ordenação Dinâmica
    if (sortBy.value === 'DURATION_ASC') {
        list.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    }
    else if (sortBy.value === 'DURATION_DESC') {
        list.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
    }
    else if (sortBy.value === 'DIFF_ASC') {
        list.sort((a, b) => (a.baseDifficulty || 0) - (b.baseDifficulty || 0));
    }
    else if (sortBy.value === 'DIFF_DESC') {
        list.sort((a, b) => (b.baseDifficulty || 0) - (a.baseDifficulty || 0));
    }
    else if (sortBy.value === 'NAME_ASC') {
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
});
const returnToHaven = () => {
    router.push(`/personagem/hub?id=${characterId.value}`);
};
const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    zona: '',
    sectorCode: '',
    nome: '',
    faccao: '',
    facColor: ''
});
const getFactionColor = (dom = '', status = 'DISCOVERED') => {
    if (status === 'RUMOR')
        return '#9ca3af'; // Cinza para boato/rumor
    const d = dom.toLowerCase();
    if (d.includes('vampiro'))
        return '#ff3333';
    if (d.includes('lobisomem'))
        return '#33ff33';
    if (d.includes('mago'))
        return '#cc33ff';
    if (d.includes('caçador') || d.includes('cacador'))
        return '#ff9933';
    return '#00ffff';
};
const getFactionIcon = (dom = '', status = 'DISCOVERED') => {
    if (status === 'RUMOR')
        return '❔';
    const d = dom.toLowerCase();
    if (d.includes('vampiro'))
        return '🩸';
    if (d.includes('lobisomem'))
        return '🐺';
    if (d.includes('mago'))
        return '🔮';
    if (d.includes('caçador') || d.includes('cacador'))
        return '🔫';
    return '🏙️';
};
// Configuração Tática dos 4 Quadrantes e Anéis Concêntricos
const QUADRANTS_CONFIG = {
    'zona_norte': { quadrantNum: '01', name: 'Zona Norte', minA: 1.25 * Math.PI, maxA: 1.75 * Math.PI },
    'zona_leste': { quadrantNum: '02', name: 'Zona Leste', minA: 1.75 * Math.PI, maxA: 2.25 * Math.PI },
    'zona_sul': { quadrantNum: '03', name: 'Zona Sul', minA: 0.25 * Math.PI, maxA: 0.75 * Math.PI },
    'zona_oeste': { quadrantNum: '04', name: 'Zona Oeste', minA: 0.75 * Math.PI, maxA: 1.25 * Math.PI },
    'zona_central': { quadrantNum: '00', name: 'Zona Central', minA: 0, maxA: 2 * Math.PI }
};
const RINGS = [
    { letter: 'B', r: 0.38 }, // Anel B (Próximo)
    { letter: 'C', r: 0.62 }, // Anel C (Intermediário)
    { letter: 'D', r: 0.84 } // Anel D (Fronteira/Periferia)
];
const fetchLocations = async () => {
    try {
        characterId.value = route.query.id || localStorage.getItem('lira_active_character_id') || '';
        const res = await api.get(`/api/radar?characterId=${characterId.value}`);
        const zones = res.data;
        const nodes = [];
        zones.forEach((zone) => {
            let zoneAttrs = zone.attributes || {};
            if (typeof zoneAttrs === 'string') {
                try {
                    zoneAttrs = JSON.parse(zoneAttrs);
                }
                catch (e) { }
            }
            const zoneKey = zoneAttrs.key || 'zona_central';
            const quad = QUADRANTS_CONFIG[zoneKey] || QUADRANTS_CONFIG['zona_central'];
            if (zone.children && Array.isArray(zone.children)) {
                // Ordenação alfabética estrita para garantir posições 100% fixas e imutáveis
                const sortedBairros = [...zone.children].sort((a, b) => a.name.localeCompare(b.name));
                const totalBairros = sortedBairros.length || 1;
                sortedBairros.forEach((bairro, index) => {
                    let bairroAttrs = bairro.attributes || {};
                    if (typeof bairroAttrs === 'string') {
                        try {
                            bairroAttrs = JSON.parse(bairroAttrs);
                        }
                        catch (e) { }
                    }
                    let r;
                    let a;
                    let sectorCode;
                    if (zoneKey === 'zona_central') {
                        // Centro fica no Anel A (Raio 0.16)
                        r = 0.16;
                        a = (index / totalBairros) * 2 * Math.PI;
                        sectorCode = `00-A`;
                    }
                    else {
                        // Anéis B, C, D alternados deterministicamente
                        const ring = RINGS[index % 3];
                        r = ring.r;
                        sectorCode = `${quad.quadrantNum}${ring.letter}`;
                        // Ângulo distribuído uniformemente na fatia angular do quadrante
                        a = quad.minA + ((index + 0.5) / totalBairros) * (quad.maxA - quad.minA);
                    }
                    const x = 50 + (r * Math.cos(a) * 50);
                    const y = 50 + (r * Math.sin(a) * 50);
                    const status = bairro.knownStatus || 'DISCOVERED';
                    const faccao = status === 'RUMOR' ? 'Boato Não Confirmado' : (bairroAttrs.dominio_faccao || 'Desconhecido');
                    nodes.push({
                        id: bairro.id,
                        nome: bairro.name,
                        zona: zone.name || quad.name,
                        sectorCode,
                        x,
                        y,
                        delay: (index * 0.3) % 2,
                        blinking: true,
                        knownStatus: status,
                        color: getFactionColor(faccao, status),
                        faccao: faccao,
                        icon: getFactionIcon(faccao, status),
                        attributes: bairroAttrs,
                        missions: bairro.missions || []
                    });
                });
            }
        });
        mapNodes.value = nodes;
    }
    catch (err) {
        console.error('Erro ao buscar locations:', err);
    }
    finally {
        loading.value = false;
    }
};
const fetchActiveMission = async () => {
    if (!characterId.value)
        return;
    try {
        const res = await api.get(`/api/missions-idle/active/${characterId.value}`);
        activeMission.value = res.data;
    }
    catch (e) {
        console.error('Erro ao buscar missão ativa:', e);
    }
};
const startReconMission = async () => {
    if (!sidebarNode.value || !characterId.value)
        return;
    try {
        exploring.value = true;
        await api.post(`/api/radar/locations/${sidebarNode.value.id}/start-recon`, {
            characterId: characterId.value
        });
        notifySuccess('Expedição Iniciada', `Missão de Reconhecimento iniciada para ${sidebarNode.value.nome}!`);
        router.push(`/personagem/missao-ativa?id=${characterId.value}`);
    }
    catch (e) {
        console.error('Erro ao iniciar reconhecimento:', e);
        notifyError('Falha no Reconhecimento', e.response?.data?.error || 'Não foi possível iniciar a expedição.');
    }
    finally {
        exploring.value = false;
    }
};
const dispatchMission = async (mission) => {
    if (!characterId.value)
        return;
    try {
        dispatching.value = true;
        await api.post('/api/missions-idle/start', {
            characterId: characterId.value,
            definitionMissionIdleId: mission.id
        });
        notifySuccess('Incursão Iniciada', `Operação '${mission.title}' iniciada no distrito!`);
        router.push(`/personagem/missao-ativa?id=${characterId.value}`);
    }
    catch (e) {
        console.error(e);
        notifyError('Falha no Despacho', e.response?.data?.error || 'Não foi possível iniciar a operação.');
    }
    finally {
        dispatching.value = false;
    }
};
const showTooltip = (e, node) => {
    const target = e.target;
    const rect = target.getBoundingClientRect();
    tooltip.value = {
        visible: true,
        x: rect.left + (rect.width / 2),
        y: rect.top - 10,
        zona: node.zona,
        sectorCode: node.sectorCode || '00-A',
        nome: node.nome,
        faccao: node.faccao,
        facColor: node.color
    };
};
const hideTooltip = () => {
    tooltip.value.visible = false;
};
const openSidebar = (node) => {
    sidebarNode.value = node;
};
const closeSidebar = () => {
    sidebarNode.value = null;
};
const closeSidebarIfClickOutside = (e) => {
    const target = e.target;
    if (target.closest('.mapa-container') && !target.closest('.radar') && !target.closest('aside')) {
        closeSidebar();
    }
};
onMounted(async () => {
    await fetchLocations();
    await fetchActiveMission();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#02050a] text-stone-300 font-sans relative overflow-x-hidden selection:bg-cyan-900 selection:text-white pb-20 select-none" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#02050a]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-cyan-900']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-[rgba(0,150,255,0.3)] gap-4 sticky top-0 bg-[#02050a]/90 backdrop-blur-sm z-20" },
});
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['md:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.3)]']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#02050a]/90']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-cyan-400 text-2xl drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" },
});
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-cyan-400 font-serif text-xl tracking-widest uppercase" },
});
/** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[rgba(0,150,255,0.8)] text-xs tracking-widest uppercase" },
});
/** @type {__VLS_StyleScopedClasses['text-[rgba(0,150,255,0.8)]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
if (__VLS_ctx.activeMission) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeMission))
                    throw 0;
                return (__VLS_ctx.router.push('/personagem/missao-ativa?id=' + __VLS_ctx.characterId));
                // @ts-ignore
                [activeMission, router, characterId,];
            } },
        ...{ class: "flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-xs font-mono text-red-300 shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all animate-pulse" },
        title: "Ver missão em andamento",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(255,0,0,0.2)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-red-400" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "uppercase tracking-wider font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.returnToHaven) },
    ...{ class: "text-cyan-500 hover:text-cyan-300 transition text-xs uppercase tracking-widest font-serif border border-cyan-500/30 px-4 py-2 rounded hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:bg-cyan-900/20 flex items-center gap-1.5" },
});
/** @type {__VLS_StyleScopedClasses['text-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-cyan-300']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-900/20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 max-w-7xl mx-auto px-6 py-20 text-center text-cyan-500 font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-spin w-8 h-8 border-2 border-cyan-900 border-t-transparent rounded-full mx-auto mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ onClick: (__VLS_ctx.closeSidebarIfClickOutside) },
        ...{ class: "mapa-container relative w-full h-[calc(100vh-85px)] overflow-hidden flex items-center justify-center bg-[#02050a]" },
    });
    /** @type {__VLS_StyleScopedClasses['mapa-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[calc(100vh-85px)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#02050a]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "radar relative w-[85vh] h-[85vh] max-w-[800px] max-h-[800px] rounded-full border-2 border-[rgba(0,150,255,0.4)] bg-[radial-gradient(circle_at_center,rgba(0,50,100,0.15)_0%,rgba(0,10,20,0.9)_100%)] shadow-[0_0_50px_rgba(0,150,255,0.15),inset_0_0_80px_rgba(0,150,255,0.2)] overflow-hidden font-mono select-none" },
    });
    /** @type {__VLS_StyleScopedClasses['radar']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[85vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[85vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[800px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[800px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.4)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(circle_at_center,rgba(0,50,100,0.15)_0%,rgba(0,10,20,0.9)_100%)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_50px_rgba(0,150,255,0.15),inset_0_0_80px_rgba(0,150,255,0.2)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-y-0 left-1/2 w-px bg-[rgba(0,150,255,0.3)] -translate-x-1/2 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[rgba(0,150,255,0.3)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-x-0 top-1/2 h-px bg-[rgba(0,150,255,0.3)] -translate-y-1/2 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[rgba(0,150,255,0.3)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 border-t border-[rgba(0,150,255,0.12)] top-1/2 rotate-45 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.12)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rotate-45']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 border-t border-[rgba(0,150,255,0.12)] top-1/2 -rotate-45 pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.12)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-rotate-45']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/20 rounded-full pointer-events-none w-[20%] h-[20%]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[20%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[20%]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/25 rounded-full pointer-events-none w-[45%] h-[45%]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/25']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[45%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[45%]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/25 rounded-full pointer-events-none w-[70%] h-[70%]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/25']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[70%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[70%]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/20 rounded-full pointer-events-none w-[92%] h-[92%]" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-[92%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[92%]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-4 left-6 text-2xl sm:text-3xl font-mono font-bold text-yellow-400/40 pointer-events-none tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] text-cyan-400/40 uppercase block font-sans -mt-1 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-4 right-6 text-2xl sm:text-3xl font-mono font-bold text-yellow-400/40 pointer-events-none tracking-widest text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] text-cyan-400/40 uppercase block font-sans -mt-1 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-4 right-6 text-2xl sm:text-3xl font-mono font-bold text-yellow-400/40 pointer-events-none tracking-widest text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] text-cyan-400/40 uppercase block font-sans -mt-1 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-4 left-6 text-2xl sm:text-3xl font-mono font-bold text-yellow-400/40 pointer-events-none tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] text-cyan-400/40 uppercase block font-sans -mt-1 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['-mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[43%] left-[44%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[43%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[44%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[32%] left-[41%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[32%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[41%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[20%] left-[34%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[20%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[34%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[10%] left-[27%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[10%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[27%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[43%] right-[44%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[43%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[44%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[38%] right-[32%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[38%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[32%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[28%] right-[22%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[28%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[22%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-[18%] right-[12%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-[18%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[12%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[43%] right-[44%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[43%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[44%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[35%] right-[38%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[35%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[38%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[22%] right-[34%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[22%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[34%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[10%] right-[30%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[10%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-[30%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[43%] left-[44%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[43%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[44%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[38%] left-[32%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[38%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[32%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[28%] left-[22%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[28%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[22%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-[18%] left-[12%] text-[9px] font-mono text-yellow-400/30 pointer-events-none font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-[18%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-[12%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 origin-center rounded-full pointer-events-none z-10 animate-sweep" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['origin-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-sweep']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute top-1/2 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_15px_#00ffff] z-20" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cyan-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_#00ffff]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 z-20" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    for (const [node, index] of __VLS_vFor((__VLS_ctx.mapNodes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onMouseenter: ((e) => __VLS_ctx.showTooltip(e, node)) },
            ...{ onMouseleave: (__VLS_ctx.hideTooltip) },
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    return (__VLS_ctx.openSidebar(node));
                    // @ts-ignore
                    [returnToHaven, loading, closeSidebarIfClickOutside, mapNodes, showTooltip, hideTooltip, openSidebar,];
                } },
            key: (index),
            ...{ class: "absolute w-2 h-2 rounded-full cursor-pointer transition-all duration-200 ease-out hover:scale-[2.5] hover:z-30 hover:opacity-100 flex items-center justify-center text-[8px]" },
            ...{ class: ([node.blinking ? 'animate-[blipBlink_2s_infinite]' : 'opacity-80', node.knownStatus === 'RUMOR' ? 'border border-dashed border-gray-400' : '']) },
            ...{ style: ({ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${node.delay}s`, backgroundColor: node.color, boxShadow: `0 0 10px ${node.color}` }) },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:scale-[2.5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:z-30']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:opacity-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[8px]']} */ ;
        if (node.knownStatus === 'RUMOR') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[7px] text-black font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[7px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-current opacity-0 transition-all duration-200 hover:opacity-100 hover:scale-150" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-current']} */ ;
        /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:opacity-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:scale-150']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed pointer-events-none opacity-0 bg-[rgba(2,5,10,0.95)] border border-cyan-500/60 px-3.5 py-2 rounded-lg z-[100] font-mono text-[11px] tracking-widest text-cyan-300 uppercase -translate-x-1/2 -translate-y-[120%] transition-opacity duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.9)] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] whitespace-nowrap" },
        ...{ class: ({ 'opacity-100': __VLS_ctx.tooltip.visible }) },
        ...{ style: ({ left: __VLS_ctx.tooltip.x + 'px', top: __VLS_ctx.tooltip.y + 'px' }) },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[rgba(2,5,10,0.95)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[100]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-[120%]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_4px_20px_rgba(0,0,0,0.9)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between gap-3 text-[9px] text-white/50 mb-0.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.tooltip.zona);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-yellow-400 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.tooltip.sectorCode);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block text-white font-serif font-bold tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.tooltip.nome);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "block text-[10px] mt-1 font-mono" },
        ...{ style: ({ color: __VLS_ctx.tooltip.facColor }) },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.tooltip.faccao);
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "absolute top-0 bottom-0 w-full md:w-[420px] bg-[rgba(5,5,12,0.96)] backdrop-blur-md border-l border-[rgba(0,150,255,0.3)] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-30 p-6 md:p-8 overflow-y-auto transition-all duration-300 ease-out space-y-6" },
        ...{ class: (__VLS_ctx.sidebarNode ? 'right-0' : '-right-[100%] md:-right-[450px]') },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-[420px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[rgba(5,5,12,0.96)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.3)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[-10px_0_30px_rgba(0,0,0,0.8)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeSidebar) },
        ...{ class: "absolute top-5 right-5 text-[rgba(0,150,255,0.7)] text-2xl hover:text-cyan-400 hover:drop-shadow-[0_0_10px_#00ffff] transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[rgba(0,150,255,0.7)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-cyan-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:drop-shadow-[0_0_10px_#00ffff]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    if (__VLS_ctx.sidebarNode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pb-4 border-b border-[rgba(0,150,255,0.3)]" },
        });
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.3)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between items-center text-[10px] font-mono tracking-widest uppercase mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-cyan-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
        (__VLS_ctx.sidebarNode.zona);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-500/40 text-yellow-300 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-yellow-950/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-yellow-500/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.sidebarNode.sectorCode);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "font-serif text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] leading-tight mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.sidebarNode.nome);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[11px] tracking-widest uppercase" },
            ...{ style: ({ color: __VLS_ctx.sidebarNode.color, borderColor: `${__VLS_ctx.sidebarNode.color}55`, backgroundColor: `${__VLS_ctx.sidebarNode.color}22` }) },
        });
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        (__VLS_ctx.sidebarNode.icon);
        (__VLS_ctx.sidebarNode.faccao);
        if (__VLS_ctx.sidebarNode.knownStatus === 'RUMOR') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-500/50 text-yellow-400 font-mono text-[9px] uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-yellow-950/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-yellow-500/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-green-950/80 border border-green-500/50 text-green-400 font-mono text-[9px] uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-950/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-green-500/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        }
    }
    if (__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-4 rounded-xl border border-yellow-500/30 bg-yellow-950/20 text-xs font-serif leading-relaxed text-yellow-200/90 space-y-2.5" },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-yellow-500/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-yellow-950/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-200/90']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-2.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pt-2.5 border-t border-yellow-500/20 space-y-1.5 font-mono text-[11px] text-yellow-300/80" },
        });
        /** @type {__VLS_StyleScopedClasses['pt-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-yellow-500/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-300/80']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-cyan-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-red-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "text-stone-300" },
        });
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-green-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-red-400" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.startReconMission) },
            disabled: (!!__VLS_ctx.activeMission || __VLS_ctx.exploring || __VLS_ctx.currentNightStatus?.isDaytime),
            ...{ class: "w-full py-3.5 rounded-lg border border-cyan-400 bg-cyan-950/70 hover:bg-cyan-500 hover:text-black text-cyan-300 font-serif font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-cyan-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-cyan-950/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(0,255,255,0.25)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (__VLS_ctx.exploring) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "animate-spin" },
            });
            /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.activeMission ? 'Vampiro Ocupado em Missão' : (__VLS_ctx.currentNightStatus?.isDaytime ? '☀️ Operação Bloqueada (Dia)' : (__VLS_ctx.exploring ? 'Iniciando Expedição...' : 'Iniciar Missão de Reconhecimento')));
    }
    else if (__VLS_ctx.sidebarNode) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-2 gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-[rgba(0,150,255,0.2)] rounded p-2.5 text-center bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.2)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block font-mono text-[9px] tracking-widest uppercase text-white/50 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-serif text-xs tracking-widest text-white uppercase" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        (__VLS_ctx.sidebarNode.attributes.riqueza);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-[rgba(0,150,255,0.2)] rounded p-2.5 text-center bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.2)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block font-mono text-[9px] tracking-widest uppercase text-white/50 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-serif text-xs tracking-widest text-white uppercase" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        (__VLS_ctx.sidebarNode.attributes.criminalidade);
        if (__VLS_ctx.sidebarNode.attributes.seguranca_publica) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[rgba(0,150,255,0.05)] border border-[rgba(0,150,255,0.2)] rounded p-3.5" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[rgba(0,150,255,0.05)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.2)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-mono text-[10px] tracking-widest uppercase text-[rgba(0,200,255,0.8)] mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[rgba(0,200,255,0.8)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-sans text-xs text-[#dcd1b3] leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#dcd1b3]']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (__VLS_ctx.sidebarNode.attributes.seguranca_publica);
        }
        if (__VLS_ctx.sidebarNode.attributes.visibilidade_midiatica) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[rgba(0,150,255,0.05)] border border-[rgba(0,150,255,0.2)] rounded p-3.5" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[rgba(0,150,255,0.05)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.2)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-mono text-[10px] tracking-widest uppercase text-[rgba(0,200,255,0.8)] mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[rgba(0,200,255,0.8)]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-sans text-xs text-[#dcd1b3] leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#dcd1b3]']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (__VLS_ctx.sidebarNode.attributes.visibilidade_midiatica);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-t border-[rgba(0,150,255,0.2)] pt-4 space-y-3.5" },
        });
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[rgba(0,150,255,0.2)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-xs text-gold uppercase tracking-widest font-bold flex items-center gap-1.5" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] text-gray-400 font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.filteredAndSortedMissions.length);
        (__VLS_ctx.sidebarNode.missions?.length || 0);
        if (__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                value: (__VLS_ctx.searchMissionQuery),
                type: "text",
                placeholder: "🔍 Buscar por nome ou palavra-chave...",
                ...{ class: "w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-parchment placeholder-stone-500 font-sans outline-none transition-all pr-7" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:border-cyan-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['placeholder-stone-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
            /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['pr-7']} */ ;
            if (__VLS_ctx.searchMissionQuery) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR'))
                                throw 0;
                            if (!(__VLS_ctx.sidebarNode))
                                throw 0;
                            if (!(__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0))
                                throw 0;
                            if (!(__VLS_ctx.searchMissionQuery))
                                throw 0;
                            return (__VLS_ctx.searchMissionQuery = '');
                            // @ts-ignore
                            [activeMission, activeMission, tooltip, tooltip, tooltip, tooltip, tooltip, tooltip, tooltip, tooltip, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, sidebarNode, closeSidebar, startReconMission, exploring, exploring, exploring, currentNightStatus, currentNightStatus, filteredAndSortedMissions, searchMissionQuery, searchMissionQuery, searchMissionQuery,];
                        } },
                    ...{ class: "absolute right-2 top-1.5 text-stone-400 hover:text-white text-xs font-bold" },
                    title: "Limpar busca",
                });
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['top-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap items-center justify-between gap-2 pt-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-0.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-1 text-[10px] font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR'))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0))
                            throw 0;
                        return (__VLS_ctx.selectedCategory = 'ALL');
                        // @ts-ignore
                        [selectedCategory,];
                    } },
                ...{ class: "px-2 py-1 rounded transition-all" },
                ...{ class: (__VLS_ctx.selectedCategory === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold' : 'bg-black/40 text-stone-400 border border-white/10 hover:text-white') },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR'))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0))
                            throw 0;
                        return (__VLS_ctx.selectedCategory = 'HUNT');
                        // @ts-ignore
                        [selectedCategory, selectedCategory,];
                    } },
                ...{ class: "px-2 py-1 rounded transition-all" },
                ...{ class: (__VLS_ctx.selectedCategory === 'HUNT' ? 'bg-red-950 text-red-300 border border-red-500/60 font-bold' : 'bg-black/40 text-stone-400 border border-white/10 hover:text-white') },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR'))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode))
                            throw 0;
                        if (!(__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0))
                            throw 0;
                        return (__VLS_ctx.selectedCategory = 'OPERATION');
                        // @ts-ignore
                        [selectedCategory, selectedCategory,];
                    } },
                ...{ class: "px-2 py-1 rounded transition-all" },
                ...{ class: (__VLS_ctx.selectedCategory === 'OPERATION' ? 'bg-blue-950 text-blue-300 border border-blue-500/60 font-bold' : 'bg-black/40 text-stone-400 border border-white/10 hover:text-white') },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                value: (__VLS_ctx.sortBy),
                ...{ class: "bg-black/80 border border-white/15 focus:border-cyan-400 rounded px-2 py-1 text-[10px] font-mono text-stone-300 outline-none cursor-pointer" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/15']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:border-cyan-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "DEFAULT",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "DURATION_ASC",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "DURATION_DESC",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "DIFF_ASC",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "DIFF_DESC",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                value: "NAME_ASC",
            });
        }
        if (__VLS_ctx.filteredAndSortedMissions.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            for (const [m] of __VLS_vFor((__VLS_ctx.filteredAndSortedMissions))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (m.id),
                    ...{ class: "p-3.5 rounded-lg border border-white/10 bg-black/60 hover:border-gold/40 transition-all space-y-2" },
                });
                /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-start" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                    ...{ class: "font-serif text-sm text-parchment font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (m.title);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] px-1.5 py-0.5 rounded uppercase font-mono" },
                    ...{ class: (m.category === 'HUNT' ? 'bg-red-950 text-red-400 border border-red-800/40' : 'bg-blue-950 text-cyan-400 border border-cyan-800/40') },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                (m.category === 'HUNT' ? 'Caçada' : 'Operação');
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-gray-400 font-light line-clamp-2 leading-relaxed" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                (m.description);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (m.durationMinutes);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (m.baseDifficulty);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.sidebarNode && __VLS_ctx.sidebarNode.knownStatus === 'RUMOR'))
                                throw 0;
                            if (!(__VLS_ctx.sidebarNode))
                                throw 0;
                            if (!(__VLS_ctx.filteredAndSortedMissions.length > 0))
                                throw 0;
                            return (__VLS_ctx.dispatchMission(m));
                            // @ts-ignore
                            [filteredAndSortedMissions, filteredAndSortedMissions, selectedCategory, sortBy, dispatchMission,];
                        } },
                    disabled: (!!__VLS_ctx.activeMission || __VLS_ctx.dispatching || __VLS_ctx.currentNightStatus?.isDaytime),
                    ...{ class: "w-full mt-2 py-2 rounded border border-vamp-c2 bg-vamp-c2/10 hover:bg-vamp-c2 hover:text-white text-vamp-c2 text-xs font-serif font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-vamp-c2']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-vamp-c2/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-vamp-c2']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-vamp-c2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
                /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
                (__VLS_ctx.activeMission ? 'Vampiro Ocupado em Missão' : (__VLS_ctx.currentNightStatus?.isDaytime ? '☀️ Operação Bloqueada (Dia)' : 'Despachar Personagem'));
                // @ts-ignore
                [activeMission, activeMission, currentNightStatus, currentNightStatus, dispatching,];
            }
        }
        else if (__VLS_ctx.sidebarNode.missions && __VLS_ctx.sidebarNode.missions.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-center py-4 text-xs text-gray-500 font-serif italic border border-white/5 rounded-lg bg-black/20" },
            });
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-center py-4 text-xs text-gray-500 font-serif italic border border-white/5 rounded-lg bg-black/20" },
            });
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
        }
    }
}
if (__VLS_ctx.characterId) {
    const __VLS_0 = NightClockWidget;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onStatusUpdated': {} },
        characterId: (__VLS_ctx.characterId),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onStatusUpdated': {} },
        characterId: (__VLS_ctx.characterId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.statusUpdated} */
        onStatusUpdated: (__VLS_ctx.onNightStatusUpdated),
    };
    var __VLS_3;
    var __VLS_4;
}
// @ts-ignore
[characterId, characterId, sidebarNode, sidebarNode, onNightStatusUpdated,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
