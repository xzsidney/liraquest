import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';

let socket: Socket | null = null;
export const onlineFamilyMembers = ref<any[]>([]);
export const floatingReactions = ref<any[]>([]);
export const familyAlerts = ref<any[]>([]);
export const activePartyLobby = ref<any[]>([]);
export const incomingBattleInvite = ref<any | null>(null);

export function getFamilySocket(): Socket {
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

    socket.on('family:presence_update', (members: any[]) => {
      onlineFamilyMembers.value = members;
    });

    socket.on('family:party_lobby_updated', (party: any[]) => {
      activePartyLobby.value = party;
    });

    socket.on('family:party_invite_received', (data: any) => {
      incomingBattleInvite.value = data;
    });

    socket.on('family:reaction_received', (data: any) => {
      const id = Date.now() + Math.random();
      floatingReactions.value.push({ ...data, id });
      setTimeout(() => {
        floatingReactions.value = floatingReactions.value.filter(r => r.id !== id);
      }, 4000);
    });

    socket.on('family:task_approved_event', (data: any) => {
      familyAlerts.value.unshift(data);
      if (familyAlerts.value.length > 5) familyAlerts.value.pop();
    });
  }

  return socket;
}

export function joinFamilyRoom(characterId?: string, name?: string) {
  const s = getFamilySocket();
  if (s.connected) {
    s.emit('family:join_room', { characterId, name });
  } else {
    s.on('connect', () => {
      s.emit('family:join_room', { characterId, name });
    });
  }
}

export function sendFamilyReaction(characterId: string, characterName: string, emoji: string, text?: string) {
  const s = getFamilySocket();
  s.emit('family:send_reaction', { characterId, characterName, emoji, text });
}

export function createPartyLobby(leaderCharacter: any) {
  const s = getFamilySocket();
  s.emit('family:create_party_lobby', { leaderCharacter });
}

export function sendPartyInvite(leaderName: string, leaderId: string, monsterName: string) {
  const s = getFamilySocket();
  s.emit('family:send_party_invite', { leaderName, leaderId, monsterName });
}

export function acceptPartyInvite(character: any) {
  const s = getFamilySocket();
  s.emit('family:accept_party_invite', { character });
  incomingBattleInvite.value = null;
}

export function joinPartyLobby(character: any) {
  acceptPartyInvite(character);
}

export function leavePartyLobby(characterId: string) {
  const s = getFamilySocket();
  s.emit('family:leave_party_lobby', { characterId });
}

export function startPartyBattle(partyMembers: any[], isSolo: boolean = false) {
  const s = getFamilySocket();
  s.emit('family:start_party_battle', { partyMembers, isSolo });
}

export function sendFamilyBattleAction(
  battleId: string, 
  characterId: string, 
  actionType: 'ATTACK' | 'SKILL' | 'DEFEND' | 'HEAL' | 'MOVE', 
  skillName?: string,
  skillId?: string,
  moveAction?: 'LEFT' | 'RIGHT' | 'STAY'
) {
  const s = getFamilySocket();
  s.emit('family:execute_battle_action', { battleId, characterId, actionType, skillName, skillId, moveAction });
}
