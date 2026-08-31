/**
 * Módulo de Rastreamento de Presença de Usuários em Tempo Real
 */
const presenceMap = new Map();

export const recordUserActivity = (userId) => {
  if (userId) {
    presenceMap.set(userId, new Date());
  }
};

export const getUserPresence = (userId) => {
  const lastActive = presenceMap.get(userId);
  if (!lastActive) {
    return {
      is_online: false,
      status: 'OFFLINE',
      last_activity_at: null,
      label: 'Offline',
    };
  }

  const diffMs = Date.now() - new Date(lastActive).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 5) {
    return {
      is_online: true,
      status: 'ONLINE',
      last_activity_at: lastActive,
      label: '🟢 Online agora',
    };
  } else if (diffMinutes < 30) {
    return {
      is_online: false,
      status: 'AWAY',
      last_activity_at: lastActive,
      label: '🟡 Ausente há ' + diffMinutes + 'm',
    };
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return {
      is_online: false,
      status: 'OFFLINE',
      last_activity_at: lastActive,
      label: '⚪ Visto há ' + hours + 'h',
    };
  }

  return {
    is_online: false,
    status: 'OFFLINE',
    last_activity_at: lastActive,
    label: '⚪ Visto há mais de 1 dia',
  };
};
