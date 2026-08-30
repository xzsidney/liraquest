import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
const router = useRouter();
// ==================== STATE ====================
const activeTab = ref('overview');
const compendiumCategory = ref('npcs');
const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const masterInfo = ref(null);
const isLeadMaster = ref(false);
const overviewStats = ref(null);
const recentLogs = ref([]);
const playersList = ref([]);
// Compendium Data
const compendiumNpcs = ref([]);
const compendiumLocations = ref([]);
const compendiumEquipments = ref([]);
// Stories & Adventures
const adventures = ref([]);
const activeAdventureDetail = ref(null);
const selectedNode = ref(null);
// Missions AFK
const missions = ref([]);
// Constants for V5 Rolls
const attributesList = [
    'Força', 'Destreza', 'Vigor',
    'Carisma', 'Manipulação', 'Autocontrole',
    'Inteligência', 'Raciocínio', 'Percepção'
];
const skillsList = [
    'Briga', 'Armas Brancas', 'Armas de Fogo', 'Furtividade', 'Atletismo', 'Ladroagem', 'Condução',
    'Persuasão', 'Lábia', 'Intimidação', 'Liderança', 'Etiqueta', 'Performance', 'Subterfúgio', 'Manha',
    'Investigação', 'Ocultismo', 'Medicina', 'Ciência', 'Tecnologia', 'Finanças', 'Política', 'Erudição', 'Sobrevivência'
];
// Forms
const showAdventureModal = ref(false);
const adventureForm = ref({ id: '', title: '', description: '', maxCompletions: null });
const showNodeModal = ref(false);
const nodeForm = ref({ id: '', adventureId: '', narrativeText: '', isEnding: false, speakerName: '', backgroundImageUrl: '', leftCharacterImageUrl: '', rightCharacterImageUrl: '' });
const showChoiceModal = ref(false);
const choiceForm = ref({ id: '', nodeId: '', choiceText: '', attributeReq: '', skillReq: '', difficulty: 1, successNodeId: '', failureNodeId: '', customStyle: null });
const showMissionModal = ref(false);
const defaultMissionForm = () => ({
    id: '',
    title: '',
    description: '',
    locationId: null,
    durationMinutes: 2,
    baseDifficulty: 5,
    category: 'OPERATION',
    maxCompletions: null,
    rewardsJson: {
        exp: 5,
        hunger: -2,
        money: 0,
        equipmentDropId: '',
        willpowerDamageSuperficial: 0,
        humanity: 0,
        skillBonus: { name: '', value: 1 },
        attributeBonus: { name: '', value: 1 }
    },
    penaltiesJson: {
        hunger: 1,
        money: 0,
        lostEquipmentId: '',
        healthDamageSuperficial: 1,
        healthDamageAggravated: 0,
        willpowerDamageSuperficial: 1,
        stains: 0
    }
});
const missionForm = ref(defaultMissionForm());
const showPlayerLocationsModal = ref(false);
const selectedPlayerForLocations = ref(null);
const grantLocationForm = ref({ locationId: '', status: 'DISCOVERED' });
const grantingLocation = ref(false);
const showMissionStepsModal = ref(false);
const activeMissionForSteps = ref(null);
const showActionFormModal = ref(false);
const actionForm = ref({
    id: '',
    missionId: '',
    name: '',
    description: '',
    stepOrder: 1,
    difficulty: 6,
    attributeReq: 'Destreza',
    skillReq: 'Furtividade',
    successText: '',
    failureText: ''
});
// ==================== LIFECYCLE ====================
onMounted(async () => {
    await checkStatus();
    await loadOverview();
    await loadAdventures();
    await loadMissions();
});
const setTab = (tab) => {
    activeTab.value = tab;
    if (tab === 'overview')
        loadOverview();
    if (tab === 'stories' && !activeAdventureDetail.value)
        loadAdventures();
    if (tab === 'missions')
        loadMissions();
    if (tab === 'players')
        loadPlayers();
    if (tab === 'compendium')
        loadCompendium();
};
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
// ==================== API ACTIONS ====================
const checkStatus = async () => {
    try {
        const res = await api.get('/api/gm/status');
        masterInfo.value = res.data.master;
        isLeadMaster.value = masterInfo.value?.id === '37339df8-b042-458d-8d9c-d15cf18adbd8' || masterInfo.value?.role === 'ADMIN';
    }
    catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
            router.push('/login');
        }
    }
};
const loadOverview = async () => {
    try {
        const res = await api.get('/api/gm/dashboard/overview');
        overviewStats.value = res.data.stats;
        recentLogs.value = res.data.recentLogs || [];
        isLeadMaster.value = res.data.isLeadMaster || isLeadMaster.value;
    }
    catch (err) {
        console.error('Erro ao carregar dashboard:', err);
    }
};
const loadPlayers = async () => {
    try {
        const res = await api.get('/api/gm/players');
        playersList.value = res.data;
    }
    catch (err) {
        console.error('Erro ao carregar jogadores:', err);
    }
};
const getPlayerDiscoveredCount = (player) => {
    return (player.CharacterKnownLocations || []).filter((k) => k.status === 'DISCOVERED').length;
};
const getPlayerRumorCount = (player) => {
    return (player.CharacterKnownLocations || []).filter((k) => k.status === 'RUMOR').length;
};
const openPlayerLocationsModal = async (player) => {
    if (compendiumLocations.value.length === 0) {
        await loadCompendium();
    }
    selectedPlayerForLocations.value = player;
    grantLocationForm.value = { locationId: '', status: 'DISCOVERED' };
    showPlayerLocationsModal.value = true;
};
const submitGrantLocation = async () => {
    if (!selectedPlayerForLocations.value || !grantLocationForm.value.locationId)
        return;
    try {
        grantingLocation.value = true;
        const res = await api.post(`/api/gm/players/${selectedPlayerForLocations.value.id}/locations`, grantLocationForm.value);
        successMsg.value = res.data.message || 'Local registrado no mapa do jogador!';
        await loadPlayers();
        selectedPlayerForLocations.value = playersList.value.find(p => p.id === selectedPlayerForLocations.value.id) || selectedPlayerForLocations.value;
        grantLocationForm.value.locationId = '';
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao conceder local';
    }
    finally {
        grantingLocation.value = false;
    }
};
const loadCompendium = async () => {
    try {
        const [npcsRes, locsRes, eqsRes] = await Promise.all([
            api.get('/api/gm/compendium/npcs'),
            api.get('/api/gm/compendium/locations'),
            api.get('/api/gm/compendium/equipments')
        ]);
        compendiumNpcs.value = npcsRes.data;
        compendiumLocations.value = locsRes.data;
        compendiumEquipments.value = eqsRes.data;
    }
    catch (err) {
        console.error('Erro ao carregar compêndio:', err);
    }
};
const loadAdventures = async () => {
    loading.value = true;
    try {
        const res = await api.get('/api/gm/story/adventures');
        adventures.value = res.data;
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao carregar crônicas';
    }
    finally {
        loading.value = false;
    }
};
const openAdventureDetail = async (adventureId) => {
    loading.value = true;
    try {
        const res = await api.get(`/api/gm/story/adventures/${adventureId}`);
        activeAdventureDetail.value = res.data;
        if (res.data.nodes && res.data.nodes.length > 0) {
            // Se tiver nó inicial, seleciona ele, senão seleciona o primeiro
            const initialNode = res.data.nodes.find((n) => n.id === res.data.firstNodeId) || res.data.nodes[0];
            selectedNode.value = initialNode;
        }
        else {
            selectedNode.value = null;
        }
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao abrir crônica';
    }
    finally {
        loading.value = false;
    }
};
const closeAdventureDetail = () => {
    activeAdventureDetail.value = null;
    selectedNode.value = null;
    loadAdventures();
};
const selectNode = (node) => {
    selectedNode.value = node;
};
const getNodeName = (nodeId) => {
    if (!nodeId)
        return 'Nenhum (Finaliza)';
    const node = activeAdventureDetail.value?.nodes?.find((n) => n.id === nodeId);
    if (!node)
        return 'Cena #' + nodeId.substring(0, 6);
    return `#${node.speakerName || 'Cena'}: ${node.narrativeText.substring(0, 20)}...`;
};
// ==================== CRÔNICA CRUD ====================
const openAdventureModal = (adv) => {
    if (adv) {
        adventureForm.value = { id: adv.id, title: adv.title, description: adv.description, maxCompletions: adv.maxCompletions };
    }
    else {
        adventureForm.value = { id: '', title: '', description: '', maxCompletions: null };
    }
    showAdventureModal.value = true;
};
const saveAdventure = async () => {
    try {
        if (adventureForm.value.id) {
            await api.put(`/api/gm/story/adventures/${adventureForm.value.id}`, adventureForm.value);
            successMsg.value = 'Crônica atualizada com sucesso!';
        }
        else {
            await api.post('/api/gm/story/adventures', adventureForm.value);
            successMsg.value = 'Nova crônica criada com sucesso!';
        }
        showAdventureModal.value = false;
        await loadAdventures();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao salvar crônica';
    }
};
const confirmDeleteAdventure = async (adv) => {
    if (!confirm(`Deseja realmente excluir a crônica "${adv.title}" e todas as suas cenas?`))
        return;
    try {
        await api.delete(`/api/gm/story/adventures/${adv.id}`);
        successMsg.value = 'Crônica excluída com sucesso!';
        await loadAdventures();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao excluir crônica';
    }
};
// ==================== NODE CRUD ====================
const openNodeModal = (node) => {
    if (node) {
        nodeForm.value = { ...node };
    }
    else {
        nodeForm.value = {
            id: '',
            adventureId: activeAdventureDetail.value?.id,
            narrativeText: '',
            isEnding: false,
            speakerName: '',
            backgroundImageUrl: '',
            leftCharacterImageUrl: '',
            rightCharacterImageUrl: ''
        };
    }
    showNodeModal.value = true;
};
const saveNode = async () => {
    try {
        if (nodeForm.value.id) {
            await api.put(`/api/gm/story/nodes/${nodeForm.value.id}`, nodeForm.value);
            successMsg.value = 'Cena atualizada com sucesso!';
        }
        else {
            await api.post('/api/gm/story/nodes', nodeForm.value);
            successMsg.value = 'Nova cena adicionada!';
        }
        showNodeModal.value = false;
        await openAdventureDetail(activeAdventureDetail.value.id);
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao salvar cena';
    }
};
const setAsStartingNode = async (nodeId) => {
    try {
        await api.put(`/api/gm/story/adventures/${activeAdventureDetail.value.id}`, { firstNodeId: nodeId });
        activeAdventureDetail.value.firstNodeId = nodeId;
        successMsg.value = 'Nó inicial da crônica definido com sucesso!';
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao definir nó inicial';
    }
};
const confirmDeleteNode = async (node) => {
    if (!confirm('Deseja realmente excluir esta cena e suas escolhas?'))
        return;
    try {
        await api.delete(`/api/gm/story/nodes/${node.id}`);
        successMsg.value = 'Cena excluída com sucesso!';
        await openAdventureDetail(activeAdventureDetail.value.id);
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao excluir cena';
    }
};
// ==================== CHOICE CRUD ====================
const openChoiceModal = (choice, nodeId) => {
    if (choice) {
        choiceForm.value = { ...choice };
    }
    else {
        choiceForm.value = {
            id: '',
            nodeId: nodeId || selectedNode.value?.id,
            choiceText: '',
            attributeReq: '',
            skillReq: '',
            difficulty: 1,
            successNodeId: '',
            failureNodeId: '',
            customStyle: null
        };
    }
    showChoiceModal.value = true;
};
const saveChoice = async () => {
    if (!choiceForm.value.choiceText || !choiceForm.value.choiceText.trim()) {
        alert('Por favor, digite o Texto do Botão de Escolha (ex: Investigar a sala, Atacar, Fugir).');
        return;
    }
    if (!choiceForm.value.nodeId) {
        choiceForm.value.nodeId = selectedNode.value?.id;
    }
    try {
        if (choiceForm.value.id) {
            await api.put(`/api/gm/story/choices/${choiceForm.value.id}`, choiceForm.value);
            successMsg.value = 'Escolha atualizada!';
        }
        else {
            await api.post('/api/gm/story/choices', choiceForm.value);
            successMsg.value = 'Nova escolha vinculada!';
        }
        showChoiceModal.value = false;
        await openAdventureDetail(activeAdventureDetail.value.id);
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao salvar escolha';
    }
};
const confirmDeleteChoice = async (choice) => {
    if (!confirm('Deseja excluir esta opção de escolha?'))
        return;
    try {
        await api.delete(`/api/gm/story/choices/${choice.id}`);
        successMsg.value = 'Escolha excluída!';
        await openAdventureDetail(activeAdventureDetail.value.id);
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao excluir escolha';
    }
};
// ==================== MISSIONS CRUD ====================
const loadMissions = async () => {
    try {
        const res = await api.get('/api/gm/missions-idle');
        missions.value = res.data;
    }
    catch (err) {
        console.error('Erro ao carregar missões:', err);
    }
};
const openMissionModal = async (mission) => {
    if (compendiumLocations.value.length === 0 || compendiumEquipments.value.length === 0) {
        try {
            const [locRes, eqRes] = await Promise.all([
                api.get('/api/gm/compendium/locations'),
                api.get('/api/gm/compendium/equipments')
            ]);
            compendiumLocations.value = locRes.data;
            compendiumEquipments.value = eqRes.data;
        }
        catch (e) { }
    }
    if (mission) {
        const rawRewards = typeof mission.rewardsJson === 'string' ? JSON.parse(mission.rewardsJson) : (mission.rewardsJson || {});
        const rawPenalties = typeof mission.penaltiesJson === 'string' ? JSON.parse(mission.penaltiesJson) : (mission.penaltiesJson || {});
        missionForm.value = {
            ...mission,
            locationId: mission.locationId || null,
            maxCompletions: mission.maxCompletions ?? null,
            rewardsJson: {
                exp: rawRewards.exp ?? 5,
                hunger: rawRewards.hunger ?? -2,
                money: rawRewards.money ?? 0,
                equipmentDropId: rawRewards.equipmentDropId || '',
                willpowerDamageSuperficial: rawRewards.willpowerDamageSuperficial ?? 0,
                humanity: rawRewards.humanity ?? 0,
                skillBonus: rawRewards.skillBonus || { name: '', value: 1 },
                attributeBonus: rawRewards.attributeBonus || { name: '', value: 1 }
            },
            penaltiesJson: {
                hunger: rawPenalties.hunger ?? 1,
                money: rawPenalties.money ?? 0,
                lostEquipmentId: rawPenalties.lostEquipmentId || '',
                healthDamageSuperficial: rawPenalties.healthDamageSuperficial ?? 1,
                healthDamageAggravated: rawPenalties.healthDamageAggravated ?? 0,
                willpowerDamageSuperficial: rawPenalties.willpowerDamageSuperficial ?? 1,
                stains: rawPenalties.stains ?? 0
            }
        };
    }
    else {
        missionForm.value = defaultMissionForm();
    }
    showMissionModal.value = true;
};
const saveMission = async () => {
    try {
        if (missionForm.value.id) {
            await api.put(`/api/gm/missions-idle/${missionForm.value.id}`, missionForm.value);
            successMsg.value = 'Missão AFK atualizada!';
        }
        else {
            await api.post('/api/gm/missions-idle', missionForm.value);
            successMsg.value = 'Nova missão AFK criada!';
        }
        showMissionModal.value = false;
        await loadMissions();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao salvar missão';
    }
};
const openMissionDetail = async (missionId) => {
    try {
        const res = await api.get(`/api/gm/missions-idle/${missionId}`);
        activeMissionForSteps.value = res.data;
        showMissionStepsModal.value = true;
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao carregar etapas da missão';
    }
};
const openNewActionModal = () => {
    const currentCount = activeMissionForSteps.value?.Actions?.length || 0;
    actionForm.value = {
        id: '',
        missionId: activeMissionForSteps.value?.id || '',
        name: '',
        description: '',
        stepOrder: currentCount + 1,
        difficulty: activeMissionForSteps.value?.baseDifficulty || 6,
        attributeReq: 'Destreza',
        skillReq: 'Furtividade',
        successText: '',
        failureText: ''
    };
    showActionFormModal.value = true;
};
const editAction = (act) => {
    actionForm.value = { ...act };
    showActionFormModal.value = true;
};
const saveAction = async () => {
    if (!actionForm.value.name || !actionForm.value.successText || !actionForm.value.failureText) {
        errorMsg.value = 'Preencha o nome da etapa e os textos de sucesso e falha.';
        return;
    }
    try {
        if (actionForm.value.id) {
            await api.put(`/api/gm/missions-idle/actions/${actionForm.value.id}`, actionForm.value);
            successMsg.value = 'Etapa mecânica atualizada!';
        }
        else {
            await api.post(`/api/gm/missions-idle/${activeMissionForSteps.value.id}/actions`, actionForm.value);
            successMsg.value = 'Nova etapa mecânica criada!';
        }
        showActionFormModal.value = false;
        await openMissionDetail(activeMissionForSteps.value.id);
        await loadMissions();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao salvar etapa';
    }
};
const confirmDeleteAction = async (act) => {
    if (!confirm(`Deseja excluir a etapa "${act.name}"?`))
        return;
    try {
        await api.delete(`/api/gm/missions-idle/actions/${act.id}`);
        successMsg.value = 'Etapa excluída!';
        await openMissionDetail(activeMissionForSteps.value.id);
        await loadMissions();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao excluir etapa';
    }
};
const confirmDeleteMission = async (mission) => {
    if (!confirm(`Deseja excluir a missão "${mission.title}"?`))
        return;
    try {
        await api.delete(`/api/gm/missions-idle/${mission.id}`);
        successMsg.value = 'Missão excluída com sucesso!';
        await loadMissions();
    }
    catch (err) {
        errorMsg.value = err.response?.data?.error || 'Erro ao excluir missão';
    }
};
// ==================== AUTH ====================
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-[#030304] text-parchment font-sans relative overflow-x-hidden selection:bg-blood-red selection:text-white flex flex-col" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#030304]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:bg-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['selection:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay z-0" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-20']} */ ;
/** @type {__VLS_StyleScopedClasses['mix-blend-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blood-red/10 blur-[180px] rounded-full pointer-events-none z-0" },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[500px]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blood-red/10']} */ ;
/** @type {__VLS_StyleScopedClasses['blur-[180px]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "relative z-30 border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 h-16 flex items-center px-6 justify-between" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center bg-black shadow-[0_0_12px_rgba(212,175,55,0.2)]" },
});
/** @type {__VLS_StyleScopedClasses['w-9']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-[0_0_12px_rgba(212,175,55,0.2)]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-gold font-serif text-lg font-bold" },
});
/** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex flex-col" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "font-serif text-base tracking-widest text-parchment font-bold" },
});
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-blood-red" },
});
/** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-[9px] font-serif uppercase tracking-widest text-gold font-bold" },
});
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gold/10']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[9px] uppercase tracking-[2px] text-gray-500 font-serif" },
});
/** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[2px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
if (__VLS_ctx.isLeadMaster) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-serif tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.2)]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.2)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-gold animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.masterInfo?.name || 'Sid');
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs font-serif tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-green-500 animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-green-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.masterInfo?.name || 'Narrador');
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "font-serif text-[10px] tracking-[2px] uppercase text-gray-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded bg-black/40 hover:bg-black/80" },
});
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[2px]']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-black/80']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1 flex relative z-10" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "w-64 border-r border-white/5 bg-black/60 backdrop-blur-sm flex flex-col justify-between p-4 hidden md:flex shrink-0" },
});
/** @type {__VLS_StyleScopedClasses['w-64']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "px-3 py-2 text-[10px] font-serif uppercase tracking-[2px] text-gray-500 font-bold" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[2px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('overview'));
            // @ts-ignore
            [isLeadMaster, masterInfo, masterInfo, handleLogout, setTab,];
        } },
    ...{ class: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-left" },
    ...{ class: (__VLS_ctx.activeTab === 'overview' ? 'bg-gold/10 text-gold border border-gold/30 font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'text-gray-400 hover:text-parchment hover:bg-white/5') },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('stories'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-left" },
    ...{ class: (__VLS_ctx.activeTab === 'stories' ? 'bg-gold/10 text-gold border border-gold/30 font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'text-gray-400 hover:text-parchment hover:bg-white/5') },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex-1" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-sans" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
(__VLS_ctx.adventures.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('missions'));
            // @ts-ignore
            [setTab, activeTab, adventures,];
        } },
    ...{ class: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-left" },
    ...{ class: (__VLS_ctx.activeTab === 'missions' ? 'bg-blood-red/10 text-blood-red border border-blood-red/30 font-bold shadow-[0_0_10px_rgba(192,57,43,0.15)]' : 'text-gray-400 hover:text-parchment hover:bg-white/5') },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "flex-1" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-sans" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
(__VLS_ctx.missions.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pt-4 px-3 py-2 text-[10px] font-serif uppercase tracking-[2px] text-gray-500 font-bold" },
});
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[2px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('players'));
            // @ts-ignore
            [setTab, activeTab, missions,];
        } },
    ...{ class: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-left" },
    ...{ class: (__VLS_ctx.activeTab === 'players' ? 'bg-white/10 text-parchment border border-white/20 font-bold' : 'text-gray-400 hover:text-parchment hover:bg-white/5') },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('compendium'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-serif uppercase tracking-wider transition-all text-left" },
    ...{ class: (__VLS_ctx.activeTab === 'compendium' ? 'bg-gold/10 text-gold border border-gold/30 font-bold' : 'text-gray-400 hover:text-parchment hover:bg-white/5') },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "border-t border-white/5 pt-4" },
});
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] text-gray-400 space-y-1" },
});
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "text-gold font-serif font-bold uppercase tracking-wider text-[10px]" },
});
/** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-[10px] text-gray-500 leading-tight" },
});
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "flex-1 flex flex-col overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full" },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex md:hidden gap-2 pb-4 overflow-x-auto border-b border-white/5 mb-6 shrink-0" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('overview'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: (__VLS_ctx.activeTab === 'overview' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-gray-400') },
    ...{ class: "px-3 py-1.5 rounded text-xs font-serif uppercase whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('stories'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: (__VLS_ctx.activeTab === 'stories' ? 'bg-gold text-black font-bold' : 'bg-black/60 text-gray-400') },
    ...{ class: "px-3 py-1.5 rounded text-xs font-serif uppercase whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('missions'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: (__VLS_ctx.activeTab === 'missions' ? 'bg-blood-red text-white font-bold' : 'bg-black/60 text-gray-400') },
    ...{ class: "px-3 py-1.5 rounded text-xs font-serif uppercase whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('players'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: (__VLS_ctx.activeTab === 'players' ? 'bg-white/20 text-white' : 'bg-black/60 text-gray-400') },
    ...{ class: "px-3 py-1.5 rounded text-xs font-serif uppercase whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.setTab('compendium'));
            // @ts-ignore
            [setTab, activeTab,];
        } },
    ...{ class: (__VLS_ctx.activeTab === 'compendium' ? 'bg-gold/30 text-gold' : 'bg-black/60 text-gray-400') },
    ...{ class: "px-3 py-1.5 rounded text-xs font-serif uppercase whitespace-nowrap" },
});
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
if (__VLS_ctx.successMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-6 p-4 rounded-lg bg-green-950/60 border border-green-500/50 text-green-300 text-xs font-serif tracking-wider flex justify-between items-center animate-fade-in shadow-lg" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-green-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.successMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.successMsg))
                    throw 0;
                return (__VLS_ctx.successMsg = '');
                // @ts-ignore
                [activeTab, successMsg, successMsg, successMsg,];
            } },
        ...{ class: "text-gray-400 hover:text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
}
if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-6 p-4 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-serif tracking-wider flex justify-between items-center animate-fade-in shadow-lg" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.errorMsg))
                    throw 0;
                return (__VLS_ctx.errorMsg = '');
                // @ts-ignore
                [errorMsg, errorMsg, errorMsg,];
            } },
        ...{ class: "text-gray-400 hover:text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
}
if (__VLS_ctx.activeTab === 'overview') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-8 animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-gold/30 bg-gradient-to-r from-black via-zinc-950 to-black p-8 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.08)]" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_30px_rgba(212,175,55,0.08)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 max-w-3xl space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 text-gold font-serif uppercase tracking-[3px] text-xs font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-3xl md:text-4xl text-parchment font-bold leading-tight" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs md:text-sm text-gray-400 leading-relaxed font-light" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-wrap gap-3 pt-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'overview'))
                    throw 0;
                __VLS_ctx.setTab('stories');
                __VLS_ctx.openAdventureModal();
                // @ts-ignore
                [setTab, activeTab, openAdventureModal,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-gold text-black font-serif text-xs uppercase tracking-widest font-bold hover:bg-gold-dim transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.3)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'overview'))
                    throw 0;
                __VLS_ctx.setTab('missions');
                __VLS_ctx.openMissionModal();
                // @ts-ignore
                [setTab, openMissionModal,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-blood-red/20 border border-blood-red/50 text-blood-red hover:bg-blood-red hover:text-white font-serif text-xs uppercase tracking-widest font-bold transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blood-red/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'overview'))
                    throw 0;
                return (__VLS_ctx.setTab('compendium'));
                // @ts-ignore
                [setTab,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-serif text-xs uppercase tracking-widest transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-gold/40 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-gold mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.adventuresCount ?? __VLS_ctx.adventures.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-gold/40 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-parchment mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.nodesCount ?? 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-blood-red/40 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-blood-red/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-blood-red mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.missionsCount ?? __VLS_ctx.missions.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-white/30 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-purple-400 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.npcsCount ?? 25);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-white/30 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-blue-400 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.locationsCount ?? 35);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 p-4 rounded-xl flex flex-col justify-between hover:border-white/30 transition-all" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "font-serif text-2xl font-bold text-emerald-400 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.overviewStats?.equipmentsCount ?? 55);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-gray-500 mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-white/10 bg-black/60 rounded-2xl p-6 space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center pb-3 border-b border-white/5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-base font-serif font-bold text-parchment" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    if (__VLS_ctx.recentLogs.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-8 text-xs text-gray-500 font-serif" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "divide-y divide-white/5" },
        });
        /** @type {__VLS_StyleScopedClasses['divide-y']} */ ;
        /** @type {__VLS_StyleScopedClasses['divide-white/5']} */ ;
        for (const [log] of __VLS_vFor((__VLS_ctx.recentLogs))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (log.id),
                ...{ class: "py-3 flex items-center justify-between text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-8 h-8 rounded-full border border-white/10 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            if (log.character?.avatarUrl) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (log.character.avatarUrl),
                    ...{ class: "w-full h-full object-cover" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (log.character?.name || 'Vampiro Anônimo');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-500 ml-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gold font-serif ml-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
            (log.activityType === 'STORY_ADVENTURE' ? 'uma Crônica Narrativa' : 'uma Incursão / Caçada');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-gray-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            (__VLS_ctx.formatDate(log.createdAt));
            // @ts-ignore
            [adventures, missions, overviewStats, overviewStats, overviewStats, overviewStats, overviewStats, overviewStats, recentLogs, recentLogs, formatDate,];
        }
    }
}
if (__VLS_ctx.activeTab === 'stories') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    if (!__VLS_ctx.activeAdventureDetail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "font-serif text-2xl md:text-3xl text-parchment font-bold tracking-wide" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-gray-400 font-light mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'stories'))
                        throw 0;
                    if (!(!__VLS_ctx.activeAdventureDetail))
                        throw 0;
                    return (__VLS_ctx.openAdventureModal());
                    // @ts-ignore
                    [activeTab, openAdventureModal, activeAdventureDetail,];
                } },
            ...{ class: "px-5 py-2.5 rounded-lg bg-gold text-black hover:bg-gold-dim font-serif text-xs uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.2)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        if (__VLS_ctx.loading) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-center py-20 text-gold text-xs font-serif uppercase tracking-widest animate-pulse" },
            });
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-20']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        }
        else if (__VLS_ctx.adventures.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border border-white/5 bg-black/40 p-12 rounded-2xl text-center space-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-5xl" },
            });
            /** @type {__VLS_StyleScopedClasses['text-5xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-lg text-parchment font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 max-w-md mx-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'stories'))
                            throw 0;
                        if (!(!__VLS_ctx.activeAdventureDetail))
                            throw 0;
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.adventures.length === 0))
                            throw 0;
                        return (__VLS_ctx.openAdventureModal());
                        // @ts-ignore
                        [adventures, openAdventureModal, loading,];
                    } },
                ...{ class: "px-5 py-2.5 rounded-lg bg-gold text-black font-serif text-xs uppercase tracking-widest font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
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
            for (const [adv] of __VLS_vFor((__VLS_ctx.adventures))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (adv.id),
                    ...{ class: "border border-white/10 bg-gradient-to-b from-zinc-950 to-black hover:border-gold/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl" },
                });
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['from-zinc-950']} */ ;
                /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-gold/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['group']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "h-28 bg-zinc-900 relative p-4 flex flex-col justify-between border-b border-white/5 overflow-hidden" },
                });
                /** @type {__VLS_StyleScopedClasses['h-28']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500" },
                    ...{ style: {} },
                });
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-cover']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['opacity-40']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:scale-105']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
                /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" },
                });
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
                /** @type {__VLS_StyleScopedClasses['from-zinc-950']} */ ;
                /** @type {__VLS_StyleScopedClasses['via-zinc-950/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "relative z-10 flex justify-between items-start" },
                });
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-serif uppercase tracking-widest text-gold font-bold backdrop-blur-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
                (adv.nodes?.length || 0);
                if (adv.firstNodeId) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "px-2 py-0.5 rounded bg-green-950/80 border border-green-500/40 text-[9px] font-serif uppercase tracking-widest text-green-300 font-bold backdrop-blur-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-green-950/80']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-green-500/40']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-serif uppercase tracking-widest text-red-300 font-bold backdrop-blur-sm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-red-950/80']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-red-500/40']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                    ...{ class: "relative z-10 font-serif text-lg text-parchment font-bold group-hover:text-gold transition-colors truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['relative']} */ ;
                /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['group-hover:text-gold']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (adv.title);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "p-5 space-y-4 flex-1 flex flex-col justify-between" },
                });
                /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-gray-400 line-clamp-3 leading-relaxed font-light" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
                (adv.description || 'Sem descrição informada.');
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "space-y-2 pt-3 border-t border-white/5" },
                });
                /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab === 'stories'))
                                throw 0;
                            if (!(!__VLS_ctx.activeAdventureDetail))
                                throw 0;
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.adventures.length === 0))
                                throw 0;
                            return (__VLS_ctx.openAdventureDetail(adv.id));
                            // @ts-ignore
                            [adventures, openAdventureDetail,];
                        } },
                    ...{ class: "w-full py-2.5 rounded-lg bg-gold text-black hover:bg-gold-dim text-xs font-serif uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.15)]']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab === 'stories'))
                                throw 0;
                            if (!(!__VLS_ctx.activeAdventureDetail))
                                throw 0;
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.adventures.length === 0))
                                throw 0;
                            return (__VLS_ctx.openAdventureModal(adv));
                            // @ts-ignore
                            [openAdventureModal,];
                        } },
                    ...{ class: "flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-[10px] font-serif uppercase tracking-widest text-gray-300" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab === 'stories'))
                                throw 0;
                            if (!(!__VLS_ctx.activeAdventureDetail))
                                throw 0;
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.adventures.length === 0))
                                throw 0;
                            return (__VLS_ctx.confirmDeleteAdventure(adv));
                            // @ts-ignore
                            [confirmDeleteAdventure,];
                        } },
                    ...{ class: "px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 hover:bg-red-900/50 text-[10px] font-serif uppercase tracking-widest text-red-300" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-red-500/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-red-900/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
                // @ts-ignore
                [];
            }
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-1" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.closeAdventureDetail) },
            ...{ class: "text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 font-serif uppercase tracking-widest transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "font-serif text-2xl md:text-3xl text-gold font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.activeAdventureDetail.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-[10px] font-serif uppercase tracking-widest text-gold font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gold/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.activeAdventureDetail.nodes?.length || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'stories'))
                        throw 0;
                    if (!!(!__VLS_ctx.activeAdventureDetail))
                        throw 0;
                    return (__VLS_ctx.openNodeModal());
                    // @ts-ignore
                    [activeAdventureDetail, activeAdventureDetail, closeAdventureDetail, openNodeModal,];
                } },
            ...{ class: "px-4 py-2 rounded-lg bg-gold text-black hover:bg-gold-dim font-serif text-xs uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.2)]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[650px]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:col-span-4 border border-white/10 bg-black/60 rounded-2xl p-4 flex flex-col space-y-3 overflow-hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:col-span-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between items-center pb-2 border-b border-white/5" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs font-serif font-bold uppercase tracking-widest text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[10px] text-gray-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        (__VLS_ctx.activeAdventureDetail.nodes?.length || 0);
        if (!__VLS_ctx.activeAdventureDetail.nodes || __VLS_ctx.activeAdventureDetail.nodes.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-8 text-center text-gray-500 text-xs font-serif" },
            });
            /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 overflow-y-auto space-y-2 pr-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
            for (const [node, index] of __VLS_vFor((__VLS_ctx.activeAdventureDetail.nodes))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab === 'stories'))
                                throw 0;
                            if (!!(!__VLS_ctx.activeAdventureDetail))
                                throw 0;
                            if (!!(!__VLS_ctx.activeAdventureDetail.nodes || __VLS_ctx.activeAdventureDetail.nodes.length === 0))
                                throw 0;
                            return (__VLS_ctx.selectNode(node));
                            // @ts-ignore
                            [activeAdventureDetail, activeAdventureDetail, activeAdventureDetail, activeAdventureDetail, selectNode,];
                        } },
                    key: (node.id),
                    ...{ class: "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2" },
                    ...{ class: (__VLS_ctx.selectedNode?.id === node.id
                            ? 'border-gold bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                            : 'border-white/5 bg-zinc-950/60 hover:border-white/20 hover:bg-white/5') },
                });
                /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-center" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[10px] font-serif font-bold px-1.5 py-0.5 rounded" },
                    ...{ class: (__VLS_ctx.selectedNode?.id === node.id ? 'bg-gold text-black' : 'bg-white/10 text-gray-400') },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                ((Number(index) || 0) + 1);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs font-serif font-bold truncate text-parchment" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                (node.speakerName || 'Narrativa');
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-1.5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
                if (__VLS_ctx.activeAdventureDetail.firstNodeId === node.id) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "px-1.5 py-0.5 rounded bg-green-950 border border-green-500 text-[8px] text-green-300 font-bold uppercase tracking-wider" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-green-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-green-500']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[8px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                }
                if (node.isEnding) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-[8px] text-red-300 font-bold uppercase tracking-wider" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-red-950']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[8px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-[11px] text-gray-400 line-clamp-2 font-light leading-snug" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-snug']} */ ;
                (node.narrativeText);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-center text-[9px] text-gray-500 pt-2 border-t border-white/5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (node.choices?.length || 0);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-gold-dim" },
                });
                /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
                // @ts-ignore
                [activeAdventureDetail, selectedNode, selectedNode,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:col-span-8 border border-white/10 bg-black/60 rounded-2xl p-6 flex flex-col space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:col-span-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        if (!__VLS_ctx.selectedNode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-500 space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-4xl" },
            });
            /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-lg text-parchment font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs max-w-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-6" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-serif text-xl font-bold text-gold" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-gray-400 font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (__VLS_ctx.selectedNode.id);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            if (__VLS_ctx.activeAdventureDetail.firstNodeId !== __VLS_ctx.selectedNode.id) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab === 'stories'))
                                throw 0;
                            if (!!(!__VLS_ctx.activeAdventureDetail))
                                throw 0;
                            if (!!(!__VLS_ctx.selectedNode))
                                throw 0;
                            if (!(__VLS_ctx.activeAdventureDetail.firstNodeId !== __VLS_ctx.selectedNode.id))
                                throw 0;
                            return (__VLS_ctx.setAsStartingNode(__VLS_ctx.selectedNode.id));
                            // @ts-ignore
                            [activeAdventureDetail, selectedNode, selectedNode, selectedNode, selectedNode, setAsStartingNode,];
                        } },
                    ...{ class: "px-3 py-1.5 rounded-lg bg-green-950/60 border border-green-500/40 text-green-300 hover:bg-green-900/60 text-xs font-serif uppercase tracking-wider font-bold transition-all" },
                });
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-green-950/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-green-500/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-green-900/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'stories'))
                            throw 0;
                        if (!!(!__VLS_ctx.activeAdventureDetail))
                            throw 0;
                        if (!!(!__VLS_ctx.selectedNode))
                            throw 0;
                        return (__VLS_ctx.openNodeModal(__VLS_ctx.selectedNode));
                        // @ts-ignore
                        [openNodeModal, selectedNode,];
                    } },
                ...{ class: "px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-xs font-serif uppercase tracking-wider text-gray-300" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'stories'))
                            throw 0;
                        if (!!(!__VLS_ctx.activeAdventureDetail))
                            throw 0;
                        if (!!(!__VLS_ctx.selectedNode))
                            throw 0;
                        return (__VLS_ctx.confirmDeleteNode(__VLS_ctx.selectedNode));
                        // @ts-ignore
                        [selectedNode, confirmDeleteNode,];
                    } },
                ...{ class: "px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 text-xs font-serif uppercase tracking-wider text-red-300" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-500/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-900/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "border border-white/10 rounded-xl overflow-hidden bg-zinc-950" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "h-48 bg-zinc-900 relative flex items-end justify-between px-8 pb-2 overflow-hidden border-b border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['h-48']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute inset-0 bg-cover bg-center opacity-60" },
                ...{ style: (__VLS_ctx.selectedNode.backgroundImageUrl ? `background-image: url('${__VLS_ctx.selectedNode.backgroundImageUrl}')` : `background-image: url('https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=1200&auto=format&fit=crop')`) },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['opacity-60']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['via-black/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative z-10 w-24 h-36 flex items-end justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-36']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            if (__VLS_ctx.selectedNode.leftCharacterImageUrl) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (__VLS_ctx.selectedNode.leftCharacterImageUrl),
                    ...{ class: "max-h-full object-contain filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" },
                });
                /** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
                /** @type {__VLS_StyleScopedClasses['filter']} */ ;
                /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] text-gray-500 bg-black/70 px-2 py-0.5 rounded border border-white/10" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative z-10 mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-3 py-1 rounded-full bg-gold/20 border border-gold/50 text-gold text-xs font-serif font-bold uppercase tracking-widest backdrop-blur-md" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gold/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
            (__VLS_ctx.selectedNode.speakerName || 'O Narrador');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "relative z-10 w-24 h-36 flex items-end justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-36']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            if (__VLS_ctx.selectedNode.rightCharacterImageUrl) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (__VLS_ctx.selectedNode.rightCharacterImageUrl),
                    ...{ class: "max-h-full object-contain filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" },
                });
                /** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
                /** @type {__VLS_StyleScopedClasses['filter']} */ ;
                /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] text-gray-500 bg-black/70 px-2 py-0.5 rounded border border-white/10" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-5 bg-black/80 space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-parchment font-serif leading-relaxed font-light whitespace-pre-wrap" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
            (__VLS_ctx.selectedNode.narrativeText);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-center pb-2 border-b border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-serif text-sm font-bold text-parchment uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            (__VLS_ctx.selectedNode.choices?.length || 0);
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'stories'))
                            throw 0;
                        if (!!(!__VLS_ctx.activeAdventureDetail))
                            throw 0;
                        if (!!(!__VLS_ctx.selectedNode))
                            throw 0;
                        return (__VLS_ctx.openChoiceModal(null, __VLS_ctx.selectedNode.id));
                        // @ts-ignore
                        [selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, openChoiceModal,];
                    } },
                ...{ class: "px-3 py-1 rounded-lg bg-gold/10 border border-gold/30 hover:bg-gold hover:text-black text-gold text-xs font-serif uppercase tracking-wider font-bold transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            if (!__VLS_ctx.selectedNode.choices || __VLS_ctx.selectedNode.choices.length === 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500 font-serif" },
                });
                /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                if (__VLS_ctx.selectedNode.isEnding) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-red-400" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
                }
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "grid grid-cols-1 gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['grid']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                for (const [choice] of __VLS_vFor((__VLS_ctx.selectedNode.choices))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        key: (choice.id),
                        ...{ class: "p-4 rounded-xl border border-white/10 bg-zinc-950/80 flex flex-col justify-between gap-3 hover:border-gold/40 transition-all" },
                    });
                    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-zinc-950/80']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
                    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex justify-between items-start" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "space-y-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "font-serif text-sm text-parchment font-bold" },
                    });
                    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    (choice.choiceText);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex flex-wrap gap-2 text-[10px]" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    if (choice.attributeReq) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300 font-bold uppercase" },
                        });
                        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                        /** @type {__VLS_StyleScopedClasses['bg-blue-950/60']} */ ;
                        /** @type {__VLS_StyleScopedClasses['border']} */ ;
                        /** @type {__VLS_StyleScopedClasses['border-blue-500/30']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                        (choice.attributeReq);
                        (choice.skillReq || 'Perícia');
                        (choice.difficulty);
                    }
                    else {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "px-2 py-0.5 rounded bg-white/5 text-gray-400 font-bold uppercase" },
                        });
                        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                        /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    }
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex gap-1.5" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.activeTab === 'stories'))
                                    throw 0;
                                if (!!(!__VLS_ctx.activeAdventureDetail))
                                    throw 0;
                                if (!!(!__VLS_ctx.selectedNode))
                                    throw 0;
                                if (!!(!__VLS_ctx.selectedNode.choices || __VLS_ctx.selectedNode.choices.length === 0))
                                    throw 0;
                                return (__VLS_ctx.openChoiceModal(choice, __VLS_ctx.selectedNode.id));
                                // @ts-ignore
                                [selectedNode, selectedNode, selectedNode, selectedNode, selectedNode, openChoiceModal,];
                            } },
                        ...{ class: "px-2 py-1 rounded bg-white/5 border border-white/10 hover:border-white/30 text-[10px] text-gray-300" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.activeTab === 'stories'))
                                    throw 0;
                                if (!!(!__VLS_ctx.activeAdventureDetail))
                                    throw 0;
                                if (!!(!__VLS_ctx.selectedNode))
                                    throw 0;
                                if (!!(!__VLS_ctx.selectedNode.choices || __VLS_ctx.selectedNode.choices.length === 0))
                                    throw 0;
                                return (__VLS_ctx.confirmDeleteChoice(choice));
                                // @ts-ignore
                                [confirmDeleteChoice,];
                            } },
                        ...{ class: "px-2 py-1 rounded bg-red-950/30 border border-red-500/30 hover:bg-red-900/50 text-[10px] text-red-300" },
                    });
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-red-500/30']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:bg-red-900/50']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "text-[10px] text-gray-400 flex flex-wrap items-center gap-3 pt-2 border-t border-white/5" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "flex items-center gap-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-green-400" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-parchment font-bold" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                    (__VLS_ctx.getNodeName(choice.successNodeId));
                    if (choice.attributeReq) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            ...{ class: "flex items-center gap-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "text-red-400" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "text-parchment font-bold" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                        (__VLS_ctx.getNodeName(choice.failureNodeId));
                    }
                    // @ts-ignore
                    [getNodeName, getNodeName,];
                }
            }
        }
    }
}
if (__VLS_ctx.activeTab === 'missions') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-2xl md:text-3xl text-parchment font-bold tracking-wide" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-gray-400 font-light mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'missions'))
                    throw 0;
                return (__VLS_ctx.openMissionModal());
                // @ts-ignore
                [activeTab, openMissionModal,];
            } },
        ...{ class: "px-5 py-2.5 rounded-lg bg-blood-red text-white hover:bg-red-700 font-serif text-xs uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(192,57,43,0.3)] flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(192,57,43,0.3)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.missions.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border border-white/5 bg-black/40 p-12 rounded-2xl text-center space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-5xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-5xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-lg text-parchment font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-gray-400 max-w-md mx-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'missions'))
                        throw 0;
                    if (!(__VLS_ctx.missions.length === 0))
                        throw 0;
                    return (__VLS_ctx.openMissionModal());
                    // @ts-ignore
                    [missions, openMissionModal,];
                } },
            ...{ class: "px-5 py-2.5 rounded-lg bg-blood-red text-white font-serif text-xs uppercase tracking-widest font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
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
        for (const [mission] of __VLS_vFor((__VLS_ctx.missions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (mission.id),
                ...{ class: "border border-white/10 bg-gradient-to-b from-zinc-950 to-black hover:border-blood-red/60 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xl" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-zinc-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-blood-red/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between text-[10px] font-serif uppercase tracking-widest" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded font-bold" },
                ...{ class: (mission.category === 'HUNT' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-blue-950 text-blue-300 border border-blue-500/40') },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (mission.category === 'HUNT' ? '🩸 Caçada de Sangue' : '🎯 Operação Tática');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-400 font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (mission.durationMinutes);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-xl text-parchment font-bold group-hover:text-blood-red transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            (mission.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 line-clamp-3 leading-relaxed font-light" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            (mission.description);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[10px] text-gray-500 pt-2 border-t border-white/5 space-y-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-parchment font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (mission.baseDifficulty);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gold font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (mission.Actions?.length || 0);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2 pt-4 border-t border-white/5 mt-4" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'missions'))
                            throw 0;
                        if (!!(__VLS_ctx.missions.length === 0))
                            throw 0;
                        return (__VLS_ctx.openMissionDetail(mission.id));
                        // @ts-ignore
                        [missions, openMissionDetail,];
                    } },
                ...{ class: "w-full py-2.5 rounded-lg bg-blood-red/20 border border-blood-red/40 hover:bg-blood-red hover:text-white text-blood-red text-xs font-serif uppercase tracking-widest font-bold transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blood-red/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-blood-red/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            (mission.Actions?.length || 0);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'missions'))
                            throw 0;
                        if (!!(__VLS_ctx.missions.length === 0))
                            throw 0;
                        return (__VLS_ctx.openMissionModal(mission));
                        // @ts-ignore
                        [openMissionModal,];
                    } },
                ...{ class: "flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-[10px] font-serif uppercase tracking-widest text-gray-300" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-white/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'missions'))
                            throw 0;
                        if (!!(__VLS_ctx.missions.length === 0))
                            throw 0;
                        return (__VLS_ctx.confirmDeleteMission(mission));
                        // @ts-ignore
                        [confirmDeleteMission,];
                    } },
                ...{ class: "px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 hover:bg-red-900/50 text-[10px] font-serif uppercase tracking-widest text-red-300" },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-500/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-900/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
            // @ts-ignore
            [];
        }
    }
}
if (__VLS_ctx.activeTab === 'players') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-6 border-b border-white/5" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-2xl md:text-3xl text-parchment font-bold tracking-wide" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-gray-400 font-light mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    if (__VLS_ctx.playersList.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-16 text-xs text-gray-500 font-serif border border-white/5 rounded-2xl bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
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
        for (const [player] of __VLS_vFor((__VLS_ctx.playersList))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (player.id),
                ...{ class: "border border-white/10 bg-zinc-950/80 rounded-2xl p-5 space-y-4 hover:border-gold/40 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-950/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-12 h-12 rounded-full border border-gold/30 overflow-hidden bg-black shrink-0 flex items-center justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gold/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            if (player.avatarUrl) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (player.avatarUrl),
                    ...{ class: "w-full h-full object-cover" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-lg" },
                });
                /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-base font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (player.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-[10px] text-gold font-serif uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            (player.DefinitionClan?.name || player.clan?.name || 'Caitiff');
            (player.generation);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-[9px] text-gray-500 font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (player.User?.name || player.user?.name || player.User?.email || player.user?.email || 'N/A');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-3 gap-2 text-center text-[10px] pt-3 border-t border-white/5 font-serif" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-2 rounded bg-black/60 border border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-500 block" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-blood-red font-bold text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (player.hunger);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-2 rounded bg-black/60 border border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-500 block" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gold font-bold text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (player.humanity);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-2 rounded bg-black/60 border border-white/5" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-500 block" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-green-400 font-bold text-[10px]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            (player.isAwake ? 'Ativo' : 'Torpor');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pt-3 border-t border-white/5 space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-center text-[10px] font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-cyan-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-gray-300" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-green-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.getPlayerDiscoveredCount(player));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-yellow-400 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.getPlayerRumorCount(player));
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'players'))
                            throw 0;
                        if (!!(__VLS_ctx.playersList.length === 0))
                            throw 0;
                        return (__VLS_ctx.openPlayerLocationsModal(player));
                        // @ts-ignore
                        [activeTab, playersList, playersList, getPlayerDiscoveredCount, getPlayerRumorCount, openPlayerLocationsModal,];
                    } },
                ...{ class: "w-full py-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-500 hover:text-black text-cyan-300 text-[10px] uppercase font-serif font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(0,255,255,0.15)]" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-cyan-950/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-cyan-500/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-cyan-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-[0_0_10px_rgba(0,255,255,0.15)]']} */ ;
            // @ts-ignore
            [];
        }
    }
}
if (__VLS_ctx.activeTab === 'compendium') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-6 animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pb-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['pb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-2xl md:text-3xl text-parchment font-bold tracking-wide" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-gray-400 font-light mt-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'compendium'))
                    throw 0;
                return (__VLS_ctx.compendiumCategory = 'npcs');
                // @ts-ignore
                [activeTab, compendiumCategory,];
            } },
        ...{ class: (__VLS_ctx.compendiumCategory === 'npcs' ? 'bg-gold text-black font-bold' : 'bg-white/5 text-gray-400') },
        ...{ class: "px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.compendiumNpcs.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'compendium'))
                    throw 0;
                return (__VLS_ctx.compendiumCategory = 'locations');
                // @ts-ignore
                [compendiumCategory, compendiumCategory, compendiumNpcs,];
            } },
        ...{ class: (__VLS_ctx.compendiumCategory === 'locations' ? 'bg-gold text-black font-bold' : 'bg-white/5 text-gray-400') },
        ...{ class: "px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.compendiumLocations.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'compendium'))
                    throw 0;
                return (__VLS_ctx.compendiumCategory = 'equipments');
                // @ts-ignore
                [compendiumCategory, compendiumCategory, compendiumLocations,];
            } },
        ...{ class: (__VLS_ctx.compendiumCategory === 'equipments' ? 'bg-gold text-black font-bold' : 'bg-white/5 text-gray-400') },
        ...{ class: "px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.compendiumEquipments.length);
    if (__VLS_ctx.compendiumCategory === 'npcs') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        for (const [npc] of __VLS_vFor((__VLS_ctx.compendiumNpcs))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (npc.id),
                ...{ class: "border border-white/10 bg-zinc-950 rounded-2xl p-5 space-y-3 hover:border-gold/40 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-gold/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-12 h-12 rounded-full border border-gold/40 overflow-hidden bg-black shrink-0 flex items-center justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            if (npc.avatarUrl) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (npc.avatarUrl),
                    ...{ class: "w-full h-full object-cover" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-lg" },
                });
                /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-base font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (npc.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-gold font-serif uppercase tracking-wider" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            (npc.DefinitionClan?.name || npc.clan?.name || 'Ancião');
            (npc.generation);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 font-light line-clamp-3 leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (npc.history || npc.concept || 'Personagem canônico de Nocturna.');
            // @ts-ignore
            [compendiumCategory, compendiumCategory, compendiumNpcs, compendiumEquipments,];
        }
    }
    if (__VLS_ctx.compendiumCategory === 'locations') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        for (const [loc] of __VLS_vFor((__VLS_ctx.compendiumLocations))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (loc.id),
                ...{ class: "border border-white/10 bg-zinc-950 rounded-2xl p-5 space-y-2 hover:border-blue-500/40 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-blue-500/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-center" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-base font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (loc.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300 font-bold uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blue-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-blue-500/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blue-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            (loc.level === 1 ? 'Metrópole' : loc.level === 2 ? 'Zona' : 'Bairro');
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 font-light line-clamp-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
            (loc.description || 'Zona urbana de Nocturna.');
            // @ts-ignore
            [compendiumCategory, compendiumLocations,];
        }
    }
    if (__VLS_ctx.compendiumCategory === 'equipments') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        for (const [eq] of __VLS_vFor((__VLS_ctx.compendiumEquipments))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (eq.id),
                ...{ class: "border border-white/10 bg-zinc-950 rounded-xl p-4 space-y-1 hover:border-emerald-500/40 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-emerald-500/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-center text-[9px] text-gray-500 uppercase font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (eq.type);
            if (eq.damage) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-blood-red font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (eq.damage);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-sm font-bold text-parchment truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (eq.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-[10px] text-gray-400 line-clamp-2 font-light" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            (eq.description);
            // @ts-ignore
            [compendiumCategory, compendiumEquipments,];
        }
    }
}
if (__VLS_ctx.showAdventureModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-zinc-950 border border-gold/40 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-xl text-gold font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.adventureForm.id ? 'Editar Crônica' : 'Nova Crônica');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 text-xs font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-3 text-parchment focus:border-gold outline-none" },
        placeholder: "Ex: A Noite Inicial",
    });
    (__VLS_ctx.adventureForm.title);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.adventureForm.description),
        rows: "3",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-3 text-parchment focus:border-gold outline-none" },
        placeholder: "Uma breve introdução à história...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-3 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAdventureModal))
                    throw 0;
                return (__VLS_ctx.showAdventureModal = false);
                // @ts-ignore
                [showAdventureModal, showAdventureModal, adventureForm, adventureForm, adventureForm,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveAdventure) },
        ...{ class: "px-5 py-2 rounded-lg bg-gold text-black hover:bg-gold-dim text-xs uppercase font-serif font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
if (__VLS_ctx.showNodeModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-zinc-950 border border-gold/40 w-full max-w-2xl rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-xl text-gold font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.nodeForm.id ? 'Editar Cena' : 'Nova Cena');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 text-xs font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-3 text-parchment focus:border-gold outline-none" },
        placeholder: "Ex: O Narrador, André Maranhão, Vítima Embriagada",
    });
    (__VLS_ctx.nodeForm.speakerName);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.nodeForm.narrativeText),
        rows: "4",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-3 text-parchment focus:border-gold outline-none leading-relaxed" },
        placeholder: "Descreva o ambiente, os diálogos e o suspense...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment text-[11px] focus:border-gold outline-none font-mono" },
        placeholder: "URL ou /story_assets/...",
    });
    (__VLS_ctx.nodeForm.backgroundImageUrl);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment text-[11px] focus:border-gold outline-none font-mono" },
        placeholder: "Sprite NPC...",
    });
    (__VLS_ctx.nodeForm.leftCharacterImageUrl);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment text-[11px] focus:border-gold outline-none font-mono" },
        placeholder: "Sprite Jogador...",
    });
    (__VLS_ctx.nodeForm.rightCharacterImageUrl);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
        id: "isEndingCheck",
        ...{ class: "rounded accent-blood-red" },
    });
    (__VLS_ctx.nodeForm.isEnding);
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['accent-blood-red']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "isEndingCheck",
        ...{ class: "text-red-300 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-3 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showNodeModal))
                    throw 0;
                return (__VLS_ctx.showNodeModal = false);
                // @ts-ignore
                [saveAdventure, showNodeModal, showNodeModal, nodeForm, nodeForm, nodeForm, nodeForm, nodeForm, nodeForm, nodeForm,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveNode) },
        ...{ class: "px-5 py-2 rounded-lg bg-gold text-black hover:bg-gold-dim text-xs uppercase font-serif font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
if (__VLS_ctx.showChoiceModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-zinc-950 border border-gold/40 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-xl text-gold font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.choiceForm.id ? 'Editar Escolha' : 'Nova Escolha');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 text-xs font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-red-400 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-3 text-parchment focus:border-gold outline-none" },
        placeholder: "Digite a ação do jogador (Ex: Investigar a sala, Atacar, Fugir...)",
        required: true,
    });
    (__VLS_ctx.choiceForm.choiceText);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-gold font-bold uppercase tracking-wider text-[11px]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.choiceForm.attributeReq),
        ...{ class: "w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [attr] of __VLS_vFor((__VLS_ctx.attributesList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (attr),
            value: (attr),
        });
        (attr);
        // @ts-ignore
        [saveNode, showChoiceModal, choiceForm, choiceForm, choiceForm, attributesList,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.choiceForm.skillReq),
        ...{ class: "w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [sk] of __VLS_vFor((__VLS_ctx.skillsList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (sk),
            value: (sk),
        });
        (sk);
        // @ts-ignore
        [choiceForm, skillsList,];
    }
    if (__VLS_ctx.choiceForm.attributeReq) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-gray-400 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "number",
            min: "1",
            max: "10",
            ...{ class: "w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-parchment outline-none" },
        });
        (__VLS_ctx.choiceForm.difficulty);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-green-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.choiceForm.successNodeId),
        ...{ class: "w-full bg-black border border-green-500/40 rounded-lg p-2.5 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [node] of __VLS_vFor((__VLS_ctx.activeAdventureDetail?.nodes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (node.id),
            value: (node.id),
        });
        (node.speakerName || 'Cena');
        (node.narrativeText.substring(0, 45));
        // @ts-ignore
        [activeAdventureDetail, choiceForm, choiceForm, choiceForm,];
    }
    if (__VLS_ctx.choiceForm.attributeReq) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-red-400 uppercase tracking-wider mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.choiceForm.failureNodeId),
            ...{ class: "w-full bg-black border border-red-500/40 rounded-lg p-2.5 text-parchment outline-none" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-500/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
        /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
        });
        for (const [node] of __VLS_vFor((__VLS_ctx.activeAdventureDetail?.nodes))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (node.id),
                value: (node.id),
            });
            (node.speakerName || 'Cena');
            (node.narrativeText.substring(0, 45));
            // @ts-ignore
            [activeAdventureDetail, choiceForm, choiceForm,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-3 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showChoiceModal))
                    throw 0;
                return (__VLS_ctx.showChoiceModal = false);
                // @ts-ignore
                [showChoiceModal,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveChoice) },
        ...{ class: "px-5 py-2 rounded-lg bg-gold text-black hover:bg-gold-dim text-xs uppercase font-serif font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
if (__VLS_ctx.showMissionModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-zinc-950 border border-blood-red/40 w-full max-w-2xl rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blood-red/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start border-b border-white/10 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase tracking-widest text-blood-red" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-xl md:text-2xl text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.missionForm.id ? 'Editar Missão AFK' : 'Nova Missão AFK');
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMissionModal))
                    throw 0;
                return (__VLS_ctx.showMissionModal = false);
                // @ts-ignore
                [saveChoice, showMissionModal, showMissionModal, missionForm,];
            } },
        ...{ class: "text-gray-400 hover:text-white text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-5 text-xs font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment focus:border-blood-red outline-none" },
        placeholder: "Ex: Caçada pelas Ruas da Sé",
    });
    (__VLS_ctx.missionForm.title);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:border-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.category),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "HUNT",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "OPERATION",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.locationId),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (null),
    });
    for (const [loc] of __VLS_vFor((__VLS_ctx.compendiumLocations))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (loc.id),
            value: (loc.id),
        });
        (loc.name);
        (loc.attributes?.dominio_faccao || 'Zona');
        // @ts-ignore
        [compendiumLocations, missionForm, missionForm, missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.durationMinutes);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        max: "10",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.baseDifficulty);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        placeholder: "Vazio = Ilimitado",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.maxCompletions);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.missionForm.description),
        rows: "2",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
        placeholder: "Contexto da operação...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 rounded-xl border border-green-700/40 bg-green-950/20 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-700/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-green-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-xs font-serif uppercase tracking-widest text-green-400 font-bold flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-green-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "100",
        ...{ class: "w-full bg-black border border-green-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.rewardsJson.exp);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-green-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.rewardsJson.hunger),
        ...{ class: "w-full bg-black border border-green-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (0),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (-1),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (-2),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (-3),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (-5),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-green-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "-5",
        max: "0",
        placeholder: "Ex: -1",
        ...{ class: "w-full bg-black border border-green-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.rewardsJson.willpowerDamageSuperficial);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-green-800/20" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-green-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "50000",
        placeholder: "Ex: 500",
        ...{ class: "w-full bg-black border border-green-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.rewardsJson.money);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-green-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.rewardsJson.equipmentDropId),
        ...{ class: "w-full bg-black border border-green-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [eq] of __VLS_vFor((__VLS_ctx.compendiumEquipments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (eq.id),
            value: (eq.id),
        });
        (eq.name);
        (eq.type);
        (eq.damage || 'N/A');
        // @ts-ignore
        [compendiumEquipments, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-green-800/20" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-green-800/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.rewardsJson.skillBonus.name),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [sk] of __VLS_vFor((__VLS_ctx.skillsList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (sk),
            value: (sk),
        });
        (sk);
        // @ts-ignore
        [skillsList, missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.rewardsJson.attributeBonus.name),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [attr] of __VLS_vFor((__VLS_ctx.attributesList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (attr),
            value: (attr),
        });
        (attr);
        // @ts-ignore
        [attributesList, missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 rounded-xl border border-red-800/40 bg-red-950/20 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-xs font-serif uppercase tracking-widest text-red-400 font-bold flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.penaltiesJson.hunger),
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (0),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (1),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (2),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (3),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "10",
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.penaltiesJson.healthDamageSuperficial);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "5",
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.penaltiesJson.healthDamageAggravated);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-red-800/20" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "10",
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.penaltiesJson.willpowerDamageSuperficial);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "5",
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.penaltiesJson.stains);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-red-800/20" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "50000",
        placeholder: "Ex: 200",
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    (__VLS_ctx.missionForm.penaltiesJson.money);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-red-300 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.missionForm.penaltiesJson.lostEquipmentId),
        ...{ class: "w-full bg-black border border-red-800/40 rounded-lg p-2 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-800/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [eq] of __VLS_vFor((__VLS_ctx.compendiumEquipments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (eq.id),
            value: (eq.id),
        });
        (eq.name);
        (eq.type);
        // @ts-ignore
        [compendiumEquipments, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm, missionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-3 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMissionModal))
                    throw 0;
                return (__VLS_ctx.showMissionModal = false);
                // @ts-ignore
                [showMissionModal,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveMission) },
        ...{ class: "px-5 py-2 rounded-lg bg-blood-red text-white hover:bg-red-700 text-xs uppercase font-serif font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
}
if (__VLS_ctx.showPlayerLocationsModal && __VLS_ctx.selectedPlayerForLocations) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-cyan-500/40 bg-zinc-950 max-w-2xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_40px_rgba(0,150,255,0.2)] max-h-[90vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_40px_rgba(0,150,255,0.2)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start border-b border-white/10 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase tracking-widest text-cyan-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl md:text-2xl font-serif text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.selectedPlayerForLocations.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPlayerLocationsModal && __VLS_ctx.selectedPlayerForLocations))
                    throw 0;
                return (__VLS_ctx.showPlayerLocationsModal = false);
                // @ts-ignore
                [saveMission, showPlayerLocationsModal, showPlayerLocationsModal, selectedPlayerForLocations, selectedPlayerForLocations,];
            } },
        ...{ class: "text-gray-400 hover:text-white text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-cyan-500/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cyan-950/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-xs font-serif uppercase tracking-widest text-cyan-300 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-cyan-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.grantLocationForm.locationId),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [loc] of __VLS_vFor((__VLS_ctx.compendiumLocations))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (loc.id),
            value: (loc.id),
        });
        (loc.name);
        (loc.attributes?.dominio_faccao || 'Zona');
        // @ts-ignore
        [compendiumLocations, grantLocationForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-[10px] text-gray-400 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.grantLocationForm.status),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-xs text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "DISCOVERED",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "RUMOR",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.submitGrantLocation) },
        disabled: (!__VLS_ctx.grantLocationForm.locationId || __VLS_ctx.grantingLocation),
        ...{ class: "w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-serif font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-40" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-cyan-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-cyan-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-40']} */ ;
    (__VLS_ctx.grantingLocation ? 'Registrando no Mapa...' : 'Liberar Local no Radar do Jogador');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-xs font-serif uppercase tracking-widest text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.selectedPlayerForLocations.CharacterKnownLocations?.length || 0);
    if (!__VLS_ctx.selectedPlayerForLocations.CharacterKnownLocations || __VLS_ctx.selectedPlayerForLocations.CharacterKnownLocations.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-6 text-xs text-gray-500 font-serif italic border border-white/5 rounded-lg bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
        for (const [kl] of __VLS_vFor((__VLS_ctx.selectedPlayerForLocations.CharacterKnownLocations))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (kl.id),
                ...{ class: "p-3 rounded-lg border border-white/10 bg-black/60 flex items-center justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "text-xs font-serif font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (kl.DefinitionLocation?.name || 'Distrito');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] text-gray-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
            (kl.DefinitionLocation?.attributes?.dominio_faccao || 'Domínio');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] px-2 py-0.5 rounded font-mono uppercase" },
                ...{ class: (kl.status === 'DISCOVERED' ? 'bg-green-950 text-green-400 border border-green-800/40' : 'bg-yellow-950 text-yellow-400 border border-yellow-800/40') },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            (kl.status === 'DISCOVERED' ? 'Explorado' : 'Boato');
            // @ts-ignore
            [selectedPlayerForLocations, selectedPlayerForLocations, selectedPlayerForLocations, selectedPlayerForLocations, grantLocationForm, grantLocationForm, submitGrantLocation, grantingLocation, grantingLocation,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showPlayerLocationsModal && __VLS_ctx.selectedPlayerForLocations))
                    throw 0;
                return (__VLS_ctx.showPlayerLocationsModal = false);
                // @ts-ignore
                [showPlayerLocationsModal,];
            } },
        ...{ class: "px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
}
if (__VLS_ctx.showMissionStepsModal && __VLS_ctx.activeMissionForSteps) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-blood-red/40 bg-zinc-950 max-w-3xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_40px_rgba(192,57,43,0.3)] max-h-[90vh] overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blood-red/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_40px_rgba(192,57,43,0.3)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start border-b border-white/10 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase tracking-widest text-blood-red" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] px-2 py-0.5 rounded font-mono uppercase" },
        ...{ class: (__VLS_ctx.activeMissionForSteps.category === 'HUNT' ? 'bg-red-950 text-red-300' : 'bg-blue-950 text-blue-300') },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    (__VLS_ctx.activeMissionForSteps.category === 'HUNT' ? 'Caçada' : 'Operação');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl md:text-2xl font-serif text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.activeMissionForSteps.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-gray-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMissionStepsModal && __VLS_ctx.activeMissionForSteps))
                    throw 0;
                return (__VLS_ctx.showMissionStepsModal = false);
                // @ts-ignore
                [showMissionStepsModal, showMissionStepsModal, activeMissionForSteps, activeMissionForSteps, activeMissionForSteps, activeMissionForSteps,];
            } },
        ...{ class: "text-gray-400 hover:text-white text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-gray-400 font-mono" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    (__VLS_ctx.activeMissionForSteps.Actions?.length || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openNewActionModal) },
        ...{ class: "px-4 py-2 rounded-lg bg-blood-red hover:bg-red-700 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(192,57,43,0.4)]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(192,57,43,0.4)]']} */ ;
    if (!__VLS_ctx.activeMissionForSteps.Actions || __VLS_ctx.activeMissionForSteps.Actions.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-10 text-xs text-gray-500 font-serif italic border border-white/5 rounded-xl bg-black/40" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        for (const [act, idx] of __VLS_vFor((__VLS_ctx.activeMissionForSteps.Actions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (act.id),
                ...{ class: "border border-white/10 bg-black/60 rounded-xl p-4 space-y-3 hover:border-gold/30 transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-gold/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between items-start" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "w-6 h-6 rounded-full bg-blood-red text-white text-xs font-mono font-bold flex items-center justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            (act.stepOrder || Number(idx) + 1);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-serif text-sm font-bold text-parchment" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            (act.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-gold text-[10px] font-mono" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-zinc-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (act.attributeReq || 'Atributo');
            (act.skillReq || 'Perícia');
            (act.difficulty);
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showMissionStepsModal && __VLS_ctx.activeMissionForSteps))
                            throw 0;
                        if (!!(!__VLS_ctx.activeMissionForSteps.Actions || __VLS_ctx.activeMissionForSteps.Actions.length === 0))
                            throw 0;
                        return (__VLS_ctx.editAction(act));
                        // @ts-ignore
                        [activeMissionForSteps, activeMissionForSteps, activeMissionForSteps, activeMissionForSteps, openNewActionModal, editAction,];
                    } },
                ...{ class: "px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 text-[10px] uppercase font-serif" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-white/15']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showMissionStepsModal && __VLS_ctx.activeMissionForSteps))
                            throw 0;
                        if (!!(!__VLS_ctx.activeMissionForSteps.Actions || __VLS_ctx.activeMissionForSteps.Actions.length === 0))
                            throw 0;
                        return (__VLS_ctx.confirmDeleteAction(act));
                        // @ts-ignore
                        [confirmDeleteAction,];
                    } },
                ...{ class: "px-2 py-1 rounded bg-red-950/40 hover:bg-red-900 text-red-300 text-[10px] uppercase font-serif" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/40']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 font-light leading-relaxed" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            (act.description);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-2.5 rounded bg-green-950/20 border border-green-800/30 text-green-300" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-green-950/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-green-800/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-bold block text-[10px] uppercase tracking-wider text-green-400 mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-light italic" },
            });
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            (act.successText);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300" },
            });
            /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-950/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-800/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-bold block text-[10px] uppercase tracking-wider text-red-400 mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-light italic" },
            });
            /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            (act.failureText);
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMissionStepsModal && __VLS_ctx.activeMissionForSteps))
                    throw 0;
                return (__VLS_ctx.showMissionStepsModal = false);
                // @ts-ignore
                [showMissionStepsModal,];
            } },
        ...{ class: "px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
}
if (__VLS_ctx.showActionFormModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border border-blood-red/40 bg-zinc-950 max-w-xl w-full rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blood-red/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-zinc-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-between items-start border-b border-white/10 pb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[10px] font-mono uppercase tracking-widest text-blood-red" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
    (__VLS_ctx.actionForm.id ? 'Editar Etapa' : 'Nova Etapa');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl font-serif text-parchment font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.actionForm.id ? 'Modificar Teste Mecânico' : 'Criar Teste da Missão');
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showActionFormModal))
                    throw 0;
                return (__VLS_ctx.showActionFormModal = false);
                // @ts-ignore
                [showActionFormModal, showActionFormModal, actionForm, actionForm,];
            } },
        ...{ class: "text-gray-400 hover:text-white text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4 text-xs font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "col-span-2" },
    });
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
        placeholder: "Ex: Infiltração Silenciosa",
    });
    (__VLS_ctx.actionForm.name);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    (__VLS_ctx.actionForm.stepOrder);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-3 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.actionForm.attributeReq),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    for (const [attr] of __VLS_vFor((__VLS_ctx.attributesList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (attr),
            value: (attr),
        });
        (attr);
        // @ts-ignore
        [attributesList, actionForm, actionForm, actionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.actionForm.skillReq),
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    for (const [sk] of __VLS_vFor((__VLS_ctx.skillsList))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (sk),
            value: (sk),
        });
        (sk);
        // @ts-ignore
        [skillsList, actionForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        max: "10",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
    });
    (__VLS_ctx.actionForm.difficulty);
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-gray-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.actionForm.description),
        rows: "2",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-parchment outline-none" },
        placeholder: "Descreva o que o vampiro faz nesta etapa...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-green-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.actionForm.successText),
        rows: "2",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-green-200 outline-none" },
        placeholder: "Narrativa exibida quando o teste for bem-sucedido...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "block text-red-400 uppercase tracking-wider mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.actionForm.failureText),
        rows: "2",
        ...{ class: "w-full bg-black border border-white/10 rounded-lg p-2.5 text-red-200 outline-none" },
        placeholder: "Narrativa exibida quando o teste falhar...",
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-end gap-3 pt-4 border-t border-white/10" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showActionFormModal))
                    throw 0;
                return (__VLS_ctx.showActionFormModal = false);
                // @ts-ignore
                [showActionFormModal, actionForm, actionForm, actionForm, actionForm,];
            } },
        ...{ class: "px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs uppercase font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveAction) },
        ...{ class: "px-5 py-2 rounded-lg bg-blood-red hover:bg-red-700 text-white font-serif font-bold text-xs uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-blood-red']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
}
// @ts-ignore
[saveAction,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
