import { ref, onMounted, onUnmounted, computed } from 'vue';
import FamilyNavbar from '../../components/family/FamilyNavbar.vue';
import { familyApi, getDisplayImageUrl } from '../../services/familyApi';
import { getFamilySocket, onlineFamilyMembers, activePartyLobby, incomingBattleInvite, joinFamilyRoom, createPartyLobby, sendPartyInvite, acceptPartyInvite, startPartyBattle, sendFamilyBattleAction, } from '../../services/familySocket';
import confetti from 'canvas-confetti';
import SpriteFighter from '../../components/family/SpriteFighter.vue';
const battle = ref(null);
const members = ref([]);
const activeCharacter = ref(null);
const equippedSkills = ref([]);
const monsterHit = ref(false);
const heroTookHit = ref(false);
const lastDamageTaken = ref(15);
const battleState = ref('LOBBY');
const showInfirmaryModal = ref(false);
const heroSpriteState = ref('idle');
const monsterSpriteState = ref('idle');
const heroFighterSprite = computed(() => {
    if (activeCharacter.value?.avatarUrl?.startsWith('sprite:')) {
        return activeCharacter.value.avatarUrl.replace('sprite:', '');
    }
    return 'capamerica';
});
const infirmarySecondsLeft = ref(0);
let timerInterval = null;
const monsterInfo = {
    name: 'O Golem da Bagunça',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60',
    description: 'Criatura colossal feita de brinquedos fora do lugar e roupas espalhadas pelo quarto. Reúna seus irmãos ou lute sozinho para vencê-lo!',
};
const isHeroInInfirmary = computed(() => {
    if (!activeCharacter.value)
        return false;
    if (activeCharacter.value.hpCurrent <= 0)
        return true;
    if (activeCharacter.value.inInfirmaryUntil && new Date(activeCharacter.value.inInfirmaryUntil).getTime() > Date.now()) {
        return true;
    }
    return false;
});
const formattedInfirmaryTime = computed(() => {
    if (infirmarySecondsLeft.value <= 0)
        return '00:00 (Pronto para Alta!)';
    const m = Math.floor(infirmarySecondsLeft.value / 60);
    const s = infirmarySecondsLeft.value % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});
function updateInfirmaryCountdown() {
    if (activeCharacter.value && activeCharacter.value.inInfirmaryUntil) {
        const diff = Math.floor((new Date(activeCharacter.value.inInfirmaryUntil).getTime() - Date.now()) / 1000);
        infirmarySecondsLeft.value = Math.max(0, diff);
    }
    else {
        infirmarySecondsLeft.value = 0;
    }
}
async function recoverFromInfirmary() {
    if (!activeCharacter.value)
        return;
    try {
        const res = await familyApi.recoverFromInfirmary(activeCharacter.value.id, true);
        if (res.success) {
            alert(`🎉 ${res.message}`);
            activeCharacter.value = res.character;
            showInfirmaryModal.value = false;
            infirmarySecondsLeft.value = 0;
            await loadData();
        }
        else {
            alert(res.error || 'Erro ao receber alta.');
        }
    }
    catch (err) {
        console.error('Erro ao receber alta da enfermaria:', err);
    }
}
// Posições no Grid de 10 Casas (0 a 9)
const heroGridPos = computed(() => {
    if (!battle.value?.gridPositions || !activeCharacter.value)
        return 3;
    const p = battle.value.gridPositions;
    return p[activeCharacter.value.id] !== undefined ? Number(p[activeCharacter.value.id]) : 3;
});
const monsterGridPos = computed(() => {
    if (!battle.value?.gridPositions)
        return 6;
    const p = battle.value.gridPositions;
    return p.monster !== undefined ? Number(p.monster) : 6;
});
const currentDistance = computed(() => {
    return Math.abs(monsterGridPos.value - heroGridPos.value);
});
function isSkillOutOfRange(skill) {
    if (!skill)
        return false;
    const isRanged = skill.effectType?.includes('RANGED') || activeCharacter.value?.characterClass === 'ARQUEIRO';
    const isHeal = skill.effectType?.includes('HEAL') || activeCharacter.value?.characterClass === 'CURANDEIRA';
    const isMagic = skill.effectType?.includes('MAGIC') || activeCharacter.value?.characterClass === 'MAGO';
    if (isRanged || isHeal || isMagic || skill.effectType === 'SHIELD') {
        return false;
    }
    return currentDistance.value > 1;
}
function moveHero(direction) {
    if (!isMyTurn.value || !battle.value || !activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    heroSpriteState.value = direction === 'LEFT' ? 'walkBack' : 'walk';
    setTimeout(() => { heroSpriteState.value = 'idle'; }, 600);
    // 1. Atualiza otimisticamente a posição local imediatamente
    if (direction === 'LEFT' && heroGridPos.value > 0) {
        if (!battle.value.gridPositions)
            battle.value.gridPositions = {};
        battle.value.gridPositions[activeCharacter.value.id] = heroGridPos.value - 1;
    }
    else if (direction === 'RIGHT' && heroGridPos.value + 1 < monsterGridPos.value) {
        if (!battle.value.gridPositions)
            battle.value.gridPositions = {};
        battle.value.gridPositions[activeCharacter.value.id] = heroGridPos.value + 1;
    }
    // 2. Envia imediatamente para o backend persistir e sincronizar no socket
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'MOVE', undefined, undefined, direction);
}
function isMemberOnline(characterId) {
    return onlineFamilyMembers.value.some(m => m.characterId === characterId);
}
function isInParty(characterId) {
    return activePartyLobby.value.some(p => p.characterId === characterId);
}
const normalizedTurnOrder = computed(() => {
    if (!battle.value || !battle.value.currentTurnOrder)
        return [];
    if (Array.isArray(battle.value.currentTurnOrder))
        return battle.value.currentTurnOrder;
    if (typeof battle.value.currentTurnOrder === 'string') {
        try {
            const parsed = JSON.parse(battle.value.currentTurnOrder);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (e) {
            return [];
        }
    }
    return [];
});
const formattedBattleLogs = computed(() => {
    if (!battle.value || !battle.value.battleLogs)
        return [];
    if (Array.isArray(battle.value.battleLogs))
        return battle.value.battleLogs;
    if (typeof battle.value.battleLogs === 'string') {
        try {
            const parsed = JSON.parse(battle.value.battleLogs);
            return Array.isArray(parsed) ? parsed : [battle.value.battleLogs];
        }
        catch (e) {
            return [battle.value.battleLogs];
        }
    }
    return [];
});
const currentTurnHeroId = computed(() => {
    const turns = normalizedTurnOrder.value;
    if (turns.length === 0)
        return activeCharacter.value?.id || null;
    const idx = (battle.value?.activeTurnIndex ?? 0) % turns.length;
    return turns[idx];
});
const isMyTurn = computed(() => {
    if (!activeCharacter.value || isHeroInInfirmary.value)
        return false;
    const turns = normalizedTurnOrder.value;
    if (turns.length === 0)
        return true;
    const heroId = currentTurnHeroId.value;
    if (heroId === 'MONSTER')
        return false;
    const activeHeroes = turns.filter(id => id !== 'MONSTER');
    if (activeHeroes.length === 1 && activeHeroes[0] === activeCharacter.value.id) {
        return true;
    }
    return heroId === activeCharacter.value.id;
});
function formatLog(log) {
    if (typeof log !== 'string')
        return '';
    return log.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>');
}
function inviteOnlineMembers() {
    if (!activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    sendPartyInvite(activeCharacter.value.name, activeCharacter.value.id, monsterInfo.name);
    alert('📢 Convite de batalha enviado para todos os membros online na casa!');
}
function acceptInvite() {
    if (!activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    acceptPartyInvite(activeCharacter.value);
}
function startSoloBattle() {
    if (!activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    const soloParty = [{
            characterId: activeCharacter.value.id,
            name: activeCharacter.value.name,
            characterClass: activeCharacter.value.characterClass,
            avatarUrl: activeCharacter.value.avatarUrl,
            isLeader: true,
        }];
    startPartyBattle(soloParty, true);
}
function startPartyBattleGroup() {
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    startPartyBattle(activePartyLobby.value, false);
}
function resetToLobby() {
    battleState.value = 'LOBBY';
    battle.value = null;
    heroTookHit.value = false;
    monsterHit.value = false;
    heroSpriteState.value = 'idle';
    monsterSpriteState.value = 'idle';
    if (activeCharacter.value) {
        createPartyLobby(activeCharacter.value);
    }
    loadData();
}
async function loadData() {
    try {
        const savedCharId = localStorage.getItem('lira_active_family_char_id');
        const membersRes = await familyApi.getMembers();
        if (membersRes.success && membersRes.members.length > 0) {
            members.value = membersRes.members;
            activeCharacter.value = members.value.find((m) => m.id === savedCharId) || members.value[0];
        }
        if (activeCharacter.value) {
            updateInfirmaryCountdown();
            joinFamilyRoom(activeCharacter.value.id, activeCharacter.value.name);
            createPartyLobby(activeCharacter.value);
            const treeRes = await familyApi.getSkillTree(activeCharacter.value.id);
            if (treeRes.success) {
                equippedSkills.value = treeRes.skills.filter((s) => treeRes.equippedSkillIds.includes(s.id));
            }
        }
    }
    catch (error) {
        console.error('Erro ao carregar batalha:', error);
    }
}
function executeMugenAttack(type) {
    if (!battle.value || !activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    if (type === 'LIGHT') {
        heroSpriteState.value = 'attackLight';
        setTimeout(() => {
            heroSpriteState.value = 'idle';
            monsterHit.value = true;
            monsterSpriteState.value = 'hit';
            setTimeout(() => {
                monsterHit.value = false;
                monsterSpriteState.value = 'idle';
            }, 500);
        }, 350);
        sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'ATTACK', 'Golpe Rápido', undefined, 'STAY');
    }
    else if (type === 'HEAVY') {
        heroSpriteState.value = 'attackHeavy';
        setTimeout(() => {
            heroSpriteState.value = 'idle';
            monsterHit.value = true;
            monsterSpriteState.value = 'hit';
            setTimeout(() => {
                monsterHit.value = false;
                monsterSpriteState.value = 'idle';
            }, 600);
        }, 450);
        sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'ATTACK', 'Golpe Forte', undefined, 'STAY');
    }
    else if (type === 'RANGED') {
        heroSpriteState.value = 'special';
        setTimeout(() => {
            heroSpriteState.value = 'idle';
            monsterHit.value = true;
            monsterSpriteState.value = 'hit';
            setTimeout(() => {
                monsterHit.value = false;
                monsterSpriteState.value = 'idle';
            }, 600);
        }, 550);
        sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'SKILL', 'Disparo à Distância', 'ranged_move', 'STAY');
    }
}
function executeTurnAction(actionType) {
    if (!battle.value || !activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    if (actionType === 'ATTACK') {
        heroSpriteState.value = 'attackHeavy';
        setTimeout(() => {
            heroSpriteState.value = 'idle';
            monsterHit.value = true;
            monsterSpriteState.value = 'hit';
            setTimeout(() => {
                monsterHit.value = false;
                monsterSpriteState.value = 'idle';
            }, 600);
        }, 450);
    }
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, actionType, undefined, undefined, 'STAY');
}
function executeTurnSkill(skill) {
    if (!battle.value || !activeCharacter.value)
        return;
    if (isHeroInInfirmary.value) {
        showInfirmaryModal.value = true;
        return;
    }
    heroSpriteState.value = 'special';
    setTimeout(() => {
        heroSpriteState.value = 'idle';
        monsterHit.value = true;
        monsterSpriteState.value = 'hit';
        setTimeout(() => {
            monsterHit.value = false;
            monsterSpriteState.value = 'idle';
        }, 600);
    }, 550);
    sendFamilyBattleAction(battle.value.id, activeCharacter.value.id, 'SKILL', skill.name, skill.id, 'STAY');
}
onMounted(() => {
    loadData();
    timerInterval = setInterval(updateInfirmaryCountdown, 1000);
    const socket = getFamilySocket();
    socket.on('family:action_error', (data) => {
        alert(data.message || 'Ação inválida!');
    });
    socket.on('family:hero_knocked_out', (data) => {
        if (activeCharacter.value && data.characterId === activeCharacter.value.id) {
            activeCharacter.value.hpCurrent = 0;
            activeCharacter.value.inInfirmaryUntil = data.inInfirmaryUntil;
            heroTookHit.value = true;
            heroSpriteState.value = 'hit';
            showInfirmaryModal.value = true;
            updateInfirmaryCountdown();
        }
    });
    socket.on('family:battle_party_started', (data) => {
        battle.value = data.battle;
        battleState.value = 'BATTLE';
        if (data.characters) {
            members.value = data.characters;
            if (activeCharacter.value) {
                activeCharacter.value = members.value.find((m) => m.id === activeCharacter.value.id) || activeCharacter.value;
            }
        }
    });
    socket.on('family:battle_updated', (data) => {
        battle.value = data.battle;
        battleState.value = 'BATTLE';
        if (data.lastAction) {
            const act = data.lastAction;
            if (act.includes('contra-atacou') || act.includes('golpeou') || act.includes('foi atingido')) {
                monsterSpriteState.value = 'attackHeavy';
                setTimeout(() => {
                    monsterSpriteState.value = 'idle';
                    heroTookHit.value = true;
                    heroSpriteState.value = 'hit';
                    setTimeout(() => {
                        heroTookHit.value = false;
                        heroSpriteState.value = 'idle';
                    }, 600);
                }, 350);
            }
            else if (act.includes('avançou')) {
                monsterSpriteState.value = 'walk';
                setTimeout(() => { monsterSpriteState.value = 'idle'; }, 600);
            }
        }
        if (data.characters) {
            members.value = data.characters;
            if (activeCharacter.value) {
                activeCharacter.value = members.value.find((m) => m.id === activeCharacter.value.id) || activeCharacter.value;
                if (activeCharacter.value.hpCurrent <= 0) {
                    showInfirmaryModal.value = true;
                }
            }
        }
    });
    socket.on('family:battle_victory', (data) => {
        battle.value = data.battle;
        heroSpriteState.value = 'win';
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#f59e0b', '#fbbf24', '#e11d48', '#10b981', '#6366f1']
        });
    });
});
onUnmounted(() => {
    if (timerInterval)
        clearInterval(timerInterval);
    const socket = getFamilySocket();
    socket.off('family:action_error');
    socket.off('family:hero_knocked_out');
    socket.off('family:battle_party_started');
    socket.off('family:battle_updated');
    socket.off('family:battle_victory');
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen bg-gradient-to-b from-[#140207] via-[#090614] to-[#020817] text-slate-100 font-sans relative overflow-hidden pb-12" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-[#140207]']} */ ;
/** @type {__VLS_StyleScopedClasses['via-[#090614]']} */ ;
/** @type {__VLS_StyleScopedClasses['to-[#020817]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-12']} */ ;
const __VLS_0 = FamilyNavbar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-3 md:p-6 max-w-6xl mx-auto space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    name: "slide-down",
}));
const __VLS_7 = __VLS_6({
    name: "slide-down",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
if (__VLS_ctx.incomingBattleInvite && __VLS_ctx.incomingBattleInvite.leaderId !== __VLS_ctx.activeCharacter?.id) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-purple-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-indigo-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-slate-900']} */ ;
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
        ...{ class: "text-xs font-extrabold uppercase tracking-wider text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
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
        ...{ onClick: (__VLS_ctx.acceptInvite) },
        ...{ class: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow transition-all active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-emerald-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.incomingBattleInvite && __VLS_ctx.incomingBattleInvite.leaderId !== __VLS_ctx.activeCharacter?.id))
                    throw 0;
                return (__VLS_ctx.incomingBattleInvite = null);
                // @ts-ignore
                [incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, incomingBattleInvite, activeCharacter, acceptInvite,];
            } },
        ...{ class: "text-slate-400 hover:text-slate-200 text-xs px-2 py-1 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
}
// @ts-ignore
[];
var __VLS_8;
if (__VLS_ctx.battleState === 'LOBBY') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between pb-4 border-b border-rose-900/60" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-900/60']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "text-2xl md:text-3xl font-black text-rose-400 flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs md:text-sm text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "w-2 h-2 rounded-full bg-rose-500 animate-ping" },
    });
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-ping']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 border-2 border-rose-500/40 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-rose-950/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-28 h-28 md:w-36 md:h-36 mx-auto rounded-3xl overflow-hidden border-4 border-rose-500 shadow-2xl shadow-rose-500/30 mb-4 bg-slate-800" },
    });
    /** @type {__VLS_StyleScopedClasses['w-28']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-28']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-36']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-36']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-rose-500/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.monsterInfo.avatar),
        alt: (__VLS_ctx.monsterInfo.name),
        ...{ class: "w-full h-full object-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-2 inline-block" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-2xl md:text-3xl font-black text-slate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
    (__VLS_ctx.monsterInfo.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-slate-400 mt-1 max-w-md mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    (__VLS_ctx.monsterInfo.description);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-base font-black text-slate-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/20']} */ ;
    (__VLS_ctx.activePartyLobby.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    for (const [p] of __VLS_vFor((__VLS_ctx.activePartyLobby))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (p.characterId),
            ...{ class: "flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.getDisplayImageUrl(p.avatarUrl)),
            ...{ class: "w-10 h-10 rounded-xl object-cover border border-amber-400/60" },
        });
        /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-amber-400/60']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs font-bold text-slate-100" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-100']} */ ;
        (p.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[10px] text-amber-400 font-semibold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (p.characterClass);
        if (p.isLeader) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-purple-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-purple-500/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-purple-500/30']} */ ;
        }
        // @ts-ignore
        [battleState, monsterInfo, monsterInfo, monsterInfo, monsterInfo, activePartyLobby, activePartyLobby, getDisplayImageUrl,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 pt-4 border-t border-slate-800" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.startSoloBattle) },
        ...{ class: "w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-rose-600/30 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-rose-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-rose-600/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:scale-[1.02]']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.activePartyLobby.length > 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.startPartyBattleGroup) },
            ...{ class: "w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-3 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center space-x-2" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-amber-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-yellow-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-amber-500/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:scale-[1.02]']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.activePartyLobby.length);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-base font-black text-slate-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-emerald-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-500/20']} */ ;
    (__VLS_ctx.onlineFamilyMembers.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2 max-h-52 overflow-y-auto pr-1" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-52']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
    for (const [m] of __VLS_vFor((__VLS_ctx.members))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (m.id),
            ...{ class: "flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-800/80']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center space-x-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.getDisplayImageUrl(m.avatarUrl)),
            ...{ class: "w-9 h-9 rounded-xl object-cover border border-slate-700" },
        });
        /** @type {__VLS_StyleScopedClasses['w-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-700']} */ ;
        if (__VLS_ctx.isMemberOnline(m.id)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['-bottom-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['-right-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-emerald-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-slate-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs font-bold text-slate-200" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
        (m.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[10px] text-slate-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
        (m.characterClass);
        (m.level);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (__VLS_ctx.isInParty(m.id)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-emerald-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-emerald-500/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        }
        else if (__VLS_ctx.isMemberOnline(m.id)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sky-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-sky-500/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
        }
        // @ts-ignore
        [activePartyLobby, activePartyLobby, getDisplayImageUrl, startSoloBattle, startPartyBattleGroup, onlineFamilyMembers, members, isMemberOnline, isMemberOnline, isInParty,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.inviteOnlineMembers) },
        ...{ class: "w-full mt-4 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-blue-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-indigo-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-indigo-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
}
else if (__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-6" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-950/95 border-2 border-amber-500/60 rounded-3xl p-3 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-12 gap-2 md:gap-4 items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "col-span-5 flex items-center space-x-2 md:space-x-4" },
    });
    /** @type {__VLS_StyleScopedClasses['col-span-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:space-x-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 md:border-4 border-amber-400 shadow-xl bg-slate-900 transform -skew-x-6" },
    });
    /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:border-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['-skew-x-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.getDisplayImageUrl(__VLS_ctx.activeCharacter?.avatarUrl)),
        ...{ class: "w-full h-full object-cover transform skew-x-6 scale-110" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['skew-x-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['scale-110']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "absolute -bottom-1.5 -left-1 bg-amber-400 text-slate-950 text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-bottom-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['-left-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between text-xs font-black" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-amber-300 truncate max-w-[120px] md:max-w-none" },
    });
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[120px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:max-w-none']} */ ;
    (__VLS_ctx.activeCharacter?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-rose-400 font-mono text-[10px] md:text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-xs']} */ ;
    (__VLS_ctx.activeCharacter?.hpCurrent);
    (__VLS_ctx.activeCharacter?.hpMax);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full bg-slate-900 h-4 md:h-6 rounded-lg border-2 border-amber-400/80 p-0.5 overflow-hidden transform -skew-x-12 shadow-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['-skew-x-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-400 rounded-sm transition-all duration-500 shadow-md shadow-emerald-500/50" },
        ...{ style: ({ width: `${Math.min(100, Math.max(0, ((__VLS_ctx.activeCharacter?.hpCurrent || 0) / (__VLS_ctx.activeCharacter?.hpMax || 1)) * 100))}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-emerald-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-yellow-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-emerald-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-emerald-500/50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full bg-slate-900 h-2 md:h-2.5 rounded-md border border-sky-400/60 p-0.5 overflow-hidden transform -skew-x-12" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-400/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['-skew-x-12']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-sm transition-all duration-300" },
        ...{ style: ({ width: `${Math.min(100, Math.max(0, ((__VLS_ctx.activeCharacter?.mpCurrent || 0) / (__VLS_ctx.activeCharacter?.mpMax || 1)) * 100))}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-sky-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "col-span-2 text-center flex flex-col items-center justify-center" },
    });
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-red-600 to-yellow-400 p-0.5 border-2 border-yellow-200 shadow-xl shadow-red-600/40 flex items-center justify-center animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-tr']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-yellow-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-yellow-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-red-600/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-sm md:text-xl font-black italic tracking-tighter text-slate-950" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-tighter']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] md:text-[10px] font-black uppercase text-amber-300 mt-1 tracking-wider" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    (__VLS_ctx.isMyTurn ? 'SUA VEZ!' : 'VEZ DO CHEFE');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "col-span-5 flex items-center justify-end space-x-2 md:space-x-4 flex-row-reverse" },
    });
    /** @type {__VLS_StyleScopedClasses['col-span-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:space-x-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-row-reverse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 md:border-4 border-rose-500 shadow-xl bg-slate-900 transform skew-x-6" },
    });
    /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:w-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:border-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['skew-x-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.battle.monsterAvatar || __VLS_ctx.monsterInfo.avatar),
        ...{ class: "w-full h-full object-cover transform -skew-x-6 scale-110" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['-skew-x-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['scale-110']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "absolute -bottom-1.5 -right-1 bg-rose-600 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-bottom-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['-right-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 space-y-1 text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between text-xs font-black flex-row-reverse" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-row-reverse']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-rose-400 truncate max-w-[120px] md:max-w-none" },
    });
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[120px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:max-w-none']} */ ;
    (__VLS_ctx.battle.monsterName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-rose-400 font-mono text-[10px] md:text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-xs']} */ ;
    (__VLS_ctx.battle.monsterHpCurrent);
    (__VLS_ctx.battle.monsterHpMax);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full bg-slate-900 h-4 md:h-6 rounded-lg border-2 border-rose-500/80 p-0.5 overflow-hidden transform skew-x-12 shadow-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['skew-x-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-inner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 rounded-sm transition-all duration-500 ml-auto shadow-md shadow-rose-500/50" },
        ...{ style: ({ width: `${Math.min(100, Math.max(0, (__VLS_ctx.battle.monsterHpCurrent / __VLS_ctx.battle.monsterHpMax) * 100))}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-rose-500/50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[9px] md:text-[10px] text-slate-400 font-bold uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    (__VLS_ctx.battle.monsterAttack);
    (__VLS_ctx.battle.monsterDefense);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-[#1b0816] via-[#100c24] to-[#0a1226] border-2 border-amber-500/40 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden min-h-[320px] md:min-h-[380px] flex flex-col justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#1b0816]']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-[#100c24]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#0a1226]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[320px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:min-h-[380px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 opacity-20 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[radial-gradient(#e11d48_1px,transparent_1px)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['[background-size:16px_16px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center relative z-10 pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bg-slate-950/80 border border-amber-400/50 px-4 py-1 rounded-full text-xs font-black text-amber-300 shadow-md" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "text-white font-mono text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.currentDistance);
    if (__VLS_ctx.currentDistance === 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-rose-400 ml-1.5 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sky-300 ml-1.5 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sky-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative w-full h-44 md:h-52 my-auto flex items-end" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-44']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-52']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-1 transition-all duration-500 ease-out flex flex-col items-center z-20" },
        ...{ style: ({ left: `${(__VLS_ctx.heroGridPos / 9) * 82 + 3}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    if (__VLS_ctx.heroTookHit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xl md:text-2xl font-black text-rose-500 animate-bounce mb-1 drop-shadow-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['drop-shadow-lg']} */ ;
        (__VLS_ctx.lastDamageTaken);
    }
    const __VLS_11 = SpriteFighter;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        character: (__VLS_ctx.heroFighterSprite),
        state: (__VLS_ctx.heroSpriteState),
        flip: (false),
        scale: (1.35),
    }));
    const __VLS_13 = __VLS_12({
        character: (__VLS_ctx.heroFighterSprite),
        state: (__VLS_ctx.heroSpriteState),
        flip: (false),
        scale: (1.35),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bg-amber-500 text-slate-950 font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mt-1 shadow" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    (__VLS_ctx.activeCharacter?.name);
    (__VLS_ctx.heroGridPos);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-1 transition-all duration-500 ease-out flex flex-col items-center z-20" },
        ...{ style: ({ left: `${(__VLS_ctx.monsterGridPos / 9) * 82 + 3}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    if (__VLS_ctx.monsterHit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xl md:text-2xl font-black text-yellow-300 animate-bounce mb-1 drop-shadow-lg" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-yellow-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['drop-shadow-lg']} */ ;
    }
    const __VLS_16 = SpriteFighter;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        character: "colossus",
        state: (__VLS_ctx.monsterSpriteState),
        flip: (true),
        scale: (1.45),
    }));
    const __VLS_18 = __VLS_17({
        character: "colossus",
        state: (__VLS_ctx.monsterSpriteState),
        flip: (true),
        scale: (1.45),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bg-rose-600 text-white font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mt-1 shadow" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    (__VLS_ctx.monsterGridPos);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 pt-4 border-t-2 border-amber-500/40" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[10px] text-amber-300 font-extrabold uppercase tracking-widest text-center mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-10 gap-1 md:gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:gap-2']} */ ;
    for (const [idx] of __VLS_vFor((10))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (idx - 1),
            ...{ class: ([
                    'h-10 md:h-12 rounded-xl border flex flex-col items-center justify-center transition-all font-mono font-bold text-xs',
                    __VLS_ctx.heroGridPos === (idx - 1)
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                        : __VLS_ctx.monsterGridPos === (idx - 1)
                            ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/30 scale-105'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400'
                ]) },
        });
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:h-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs md:text-sm font-black" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        (idx - 1);
        if (__VLS_ctx.heroGridPos === (idx - 1)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[8px] text-amber-300 font-sans font-black leading-none" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[8px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
        }
        else if (__VLS_ctx.monsterGridPos === (idx - 1)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[8px] text-rose-400 font-sans font-black leading-none" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[8px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
        }
        else if (idx - 1 === 3) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[7px] text-slate-500 leading-none" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[7px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
        }
        else if (idx - 1 === 6) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[7px] text-slate-500 leading-none" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[7px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
        }
        // @ts-ignore
        [activeCharacter, activeCharacter, activeCharacter, activeCharacter, activeCharacter, activeCharacter, activeCharacter, activeCharacter, activeCharacter, battleState, monsterInfo, getDisplayImageUrl, inviteOnlineMembers, battle, battle, battle, battle, battle, battle, battle, battle, battle, isMyTurn, currentDistance, currentDistance, heroGridPos, heroGridPos, heroGridPos, heroGridPos, heroTookHit, lastDamageTaken, heroFighterSprite, heroSpriteState, monsterGridPos, monsterGridPos, monsterGridPos, monsterGridPos, monsterHit, monsterSpriteState,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lg:col-span-2 bg-slate-950/90 border-2 border-amber-500/50 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['lg:col-span-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between pb-3 border-b border-slate-800" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-base font-black text-amber-300 flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['text-xs font-black px-3 py-1 rounded-full border', __VLS_ctx.isMyTurn ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700']) },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    (__VLS_ctx.isMyTurn ? '⚡ SEU TURNO DE ATUAR' : '⏳ AGUARDANDO TURNO DO CHEFE');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-mono font-bold text-amber-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    (__VLS_ctx.heroGridPos);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.moveHero('LEFT'));
                // @ts-ignore
                [isMyTurn, isMyTurn, heroGridPos, moveHero,];
            } },
        disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.heroGridPos <= 0),
        ...{ class: "py-3 px-4 rounded-2xl border border-sky-400 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs md:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-sky-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-blue-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-indigo-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-indigo-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-blue-600/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-left" },
    });
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "leading-tight" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[10px] text-sky-200 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    (Math.max(0, __VLS_ctx.heroGridPos - 1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.moveHero('RIGHT'));
                // @ts-ignore
                [isMyTurn, heroGridPos, heroGridPos, moveHero,];
            } },
        disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.heroGridPos + 1 >= __VLS_ctx.monsterGridPos),
        ...{ class: "py-3 px-4 rounded-2xl border border-rose-400 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs md:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-rose-600/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "leading-tight" },
    });
    /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[10px] text-rose-200 font-normal" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
    (Math.min(__VLS_ctx.monsterGridPos - 1, __VLS_ctx.heroGridPos + 1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-extrabold uppercase tracking-wider text-slate-300 block" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-950/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/30']} */ ;
    (__VLS_ctx.currentDistance);
    (__VLS_ctx.currentDistance === 1 ? 'Casa (Lado a Lado)' : 'Casas');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 md:grid-cols-4 gap-2.5" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.executeMugenAttack('LIGHT'));
                // @ts-ignore
                [isMyTurn, currentDistance, currentDistance, heroGridPos, heroGridPos, monsterGridPos, monsterGridPos, executeMugenAttack,];
            } },
        disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.currentDistance > 1),
        ...{ class: "bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-600 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-orange-500/40" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-orange-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-amber-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-orange-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-orange-500/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.currentDistance > 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-amber-200" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-amber-200']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-orange-200 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-orange-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.executeMugenAttack('HEAVY'));
                // @ts-ignore
                [isMyTurn, currentDistance, currentDistance, executeMugenAttack,];
            } },
        disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.currentDistance > 1),
        ...{ class: "bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-rose-500/40" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.currentDistance > 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-amber-200" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-amber-200']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-rose-200 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-rose-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.executeMugenAttack('RANGED'));
                // @ts-ignore
                [isMyTurn, currentDistance, currentDistance, executeMugenAttack,];
            } },
        disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.currentDistance < 2),
        ...{ class: "bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-teal-400/40" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-teal-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-emerald-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-teal-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-emerald-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-teal-400/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (__VLS_ctx.currentDistance < 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-teal-200" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-teal-200']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[9px] text-emerald-200 font-bold" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-emerald-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.battleState === 'LOBBY'))
                    throw 0;
                if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                    throw 0;
                return (__VLS_ctx.executeTurnAction('DEFEND'));
                // @ts-ignore
                [isMyTurn, currentDistance, currentDistance, executeTurnAction,];
            } },
        disabled: (!__VLS_ctx.isMyTurn),
        ...{ class: "bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-blue-400/40" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-blue-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-indigo-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-indigo-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-blue-400/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-[9px] text-blue-200 font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    for (const [skill] of __VLS_vFor((__VLS_ctx.equippedSkills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.battleState === 'LOBBY'))
                        throw 0;
                    if (!(__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle))
                        throw 0;
                    return (__VLS_ctx.executeTurnSkill(skill));
                    // @ts-ignore
                    [isMyTurn, equippedSkills, executeTurnSkill,];
                } },
            key: (skill.id),
            disabled: (!__VLS_ctx.isMyTurn || __VLS_ctx.isSkillOutOfRange(skill)),
            ...{ class: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black text-xs py-2.5 px-2 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 cursor-pointer border border-amber-300 col-span-2 md:col-span-2" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-amber-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-yellow-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:from-amber-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:to-yellow-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-amber-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xl" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        (skill.icon || '🔥');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "truncate max-w-[180px]" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[180px]']} */ ;
        (skill.name);
        if (__VLS_ctx.isSkillOutOfRange(skill)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] text-red-950 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-950']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[9px] text-slate-900 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (skill.costMp);
        }
        // @ts-ignore
        [isMyTurn, isSkillOutOfRange, isSkillOutOfRange,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-950/90 border border-slate-800 rounded-3xl p-4 flex flex-col h-[380px]" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[380px]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2 flex items-center space-x-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 overflow-y-auto space-y-2 pr-1 text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    for (const [log, idx] of __VLS_vFor((__VLS_ctx.formattedBattleLogs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (idx),
            ...{ class: "bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed text-slate-300" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.formatLog(log)), }, null, null);
        /** @type {__VLS_StyleScopedClasses['bg-slate-900/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-slate-800/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
        // @ts-ignore
        [formattedBattleLogs, formatLog,];
    }
}
if (__VLS_ctx.battleState === 'BATTLE' && __VLS_ctx.battle?.status === 'VICTORY') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/85']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-slate-900 via-[#1c1206] to-amber-950 border-2 border-amber-400 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-5 animate-bounce" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-[#1c1206]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-amber-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-6xl" },
    });
    /** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-3xl font-black text-amber-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-slate-300" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.battle.monsterName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex justify-around" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-amber-500/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-lg font-black text-amber-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    (__VLS_ctx.battle.rewardXp);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-slate-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-lg font-black text-yellow-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
    (__VLS_ctx.battle.rewardGold);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.resetToLobby) },
        ...{ class: "w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-amber-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-yellow-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-amber-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        to: "/familia/sala",
        ...{ class: "block w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl text-center text-xs transition-all active:scale-95" },
    }));
    const __VLS_23 = __VLS_22({
        to: "/familia/sala",
        ...{ class: "block w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl text-center text-xs transition-all active:scale-95" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    const { default: __VLS_26 } = __VLS_24.slots;
    // @ts-ignore
    [battleState, battle, battle, battle, battle, resetToLobby,];
    var __VLS_24;
}
if (__VLS_ctx.showInfirmaryModal || (__VLS_ctx.isHeroInInfirmary && __VLS_ctx.battleState === 'BATTLE')) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/85']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gradient-to-b from-[#25040e] via-[#15071e] to-[#080d24] border-2 border-rose-500 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl space-y-5" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-[#25040e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-[#15071e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-[#080d24]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-6xl animate-bounce" },
    });
    /** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-bounce']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-700/60" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-rose-950/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-700/60']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-2xl md:text-3xl font-black text-rose-200 mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-rose-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-slate-300 mt-2 leading-relaxed" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.activeCharacter?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-slate-950/90 p-4 rounded-2xl border border-rose-800/60 text-center space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-slate-950/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-rose-800/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-[11px] font-bold text-slate-400 uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-2xl md:text-3xl font-mono font-black text-amber-300 tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    (__VLS_ctx.formattedInfirmaryTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3 pt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    if (__VLS_ctx.infirmarySecondsLeft <= 0 || __VLS_ctx.activeCharacter?.isParent) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.recoverFromInfirmary) },
            ...{ class: "w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-emerald-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-teal-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:from-emerald-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:to-teal-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center space-x-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        to: "/familia/enfermaria",
        ...{ class: "flex-1 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs py-3 px-4 rounded-xl text-center shadow transition-all active:scale-95" },
    }));
    const __VLS_29 = __VLS_28({
        to: "/familia/enfermaria",
        ...{ class: "flex-1 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs py-3 px-4 rounded-xl text-center shadow transition-all active:scale-95" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-rose-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    const { default: __VLS_32 } = __VLS_30.slots;
    // @ts-ignore
    [activeCharacter, activeCharacter, battleState, showInfirmaryModal, isHeroInInfirmary, formattedInfirmaryTime, infirmarySecondsLeft, recoverFromInfirmary,];
    var __VLS_30;
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        to: "/familia/sala",
        ...{ class: "flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs py-3 px-4 rounded-xl text-center transition-all active:scale-95" },
    }));
    const __VLS_35 = __VLS_34({
        to: "/familia/sala",
        ...{ class: "flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs py-3 px-4 rounded-xl text-center transition-all active:scale-95" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-slate-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-slate-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
    const { default: __VLS_38 } = __VLS_36.slots;
    // @ts-ignore
    [];
    var __VLS_36;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
