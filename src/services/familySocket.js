import { io } from 'socket.io-client';
import { ref } from 'vue';
let socket = null;
export const onlineFamilyMembers = ref([]);
export const floatingReactions = ref([]);
export const familyAlerts = ref([]);
export const activePartyLobby = ref([]);
export const incomingBattleInvite = ref(null);
export function getFamilySocket() {
    if (!socket) {
        const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);
        socket = io(baseUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });
        socket.on('connect', () => {
            console.log('⚡ [Family Socket] Conectado ao servidor:', socket?.id);
        });
        socket.on('family:presence_update', (members) => {
            onlineFamilyMembers.value = members;
        });
        socket.on('family:party_lobby_updated', (party) => {
            activePartyLobby.value = party;
        });
        socket.on('family:party_invite_received', (data) => {
            incomingBattleInvite.value = data;
        });
        socket.on('family:reaction_received', (data) => {
            const id = Date.now() + Math.random();
            floatingReactions.value.push({ ...data, id });
            setTimeout(() => {
                floatingReactions.value = floatingReactions.value.filter(r => r.id !== id);
            }, 4000);
        });
        socket.on('family:task_approved_event', (data) => {
            familyAlerts.value.unshift(data);
            if (familyAlerts.value.length > 5)
                familyAlerts.value.pop();
        });
    }
    return socket;
}
export function joinFamilyRoom(characterId, name) {
    const s = getFamilySocket();
    if (s.connected) {
        s.emit('family:join_room', { characterId, name });
    }
    else {
        s.on('connect', () => {
            s.emit('family:join_room', { characterId, name });
        });
    }
}
export function sendFamilyReaction(characterId, characterName, emoji, text) {
    const s = getFamilySocket();
    s.emit('family:send_reaction', { characterId, characterName, emoji, text });
}
export function createPartyLobby(leaderCharacter) {
    const s = getFamilySocket();
    s.emit('family:create_party_lobby', { leaderCharacter });
}
export function sendPartyInvite(leaderName, leaderId, monsterName) {
    const s = getFamilySocket();
    s.emit('family:send_party_invite', { leaderName, leaderId, monsterName });
}
export function acceptPartyInvite(character) {
    const s = getFamilySocket();
    s.emit('family:accept_party_invite', { character });
    incomingBattleInvite.value = null;
}
export function joinPartyLobby(character) {
    acceptPartyInvite(character);
}
export function leavePartyLobby(characterId) {
    const s = getFamilySocket();
    s.emit('family:leave_party_lobby', { characterId });
}
export function startPartyBattle(partyMembers, isSolo = false) {
    const s = getFamilySocket();
    s.emit('family:start_party_battle', { partyMembers, isSolo });
}
export function sendFamilyBattleAction(battleId, characterId, actionType, skillName, skillId, moveAction) {
    const s = getFamilySocket();
    s.emit('family:execute_battle_action', { battleId, characterId, actionType, skillName, skillId, moveAction });
}
