/**
 * Gerenciador de WebSockets para o Multiplayer Familiar do Esconde-Esconde Camaleão
 */

const gameRooms = new Map();

export function initChameleonSocket(io) {
  const chameleonNamespace = io.of('/chameleon');

  chameleonNamespace.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // 1. Entrar no Lobby da Família
    socket.on('join_lobby', ({ roomId, user, color }) => {
      currentRoomId = roomId;
      currentUser = {
        id: socket.id,
        userId: user?.id,
        name: user?.name || 'Membro do Clã',
        role: user?.role || 'CHILD',
        photo: user?.profile_photo_url || null,
        color: color || '#ef4444',
        isReady: true,
        isSeeker: false,
        isCaught: false,
        x: 400,
        y: 250,
        angle: 0,
      };

      socket.join(roomId);

      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          id: roomId,
          hostId: socket.id,
          players: new Map(),
          state: 'LOBBY',
          seekerId: null,
          timeRemaining: 45,
        });
      }

      const room = gameRooms.get(roomId);
      room.players.set(socket.id, currentUser);

      chameleonNamespace.to(roomId).emit('lobby_updated', {
        players: Array.from(room.players.values()),
        hostId: room.hostId,
        state: room.state,
      });
    });

    // 2. Trocar Cor no Lobby
    socket.on('select_color', ({ color }) => {
      if (!currentRoomId || !gameRooms.has(currentRoomId)) return;
      const room = gameRooms.get(currentRoomId);
      const player = room.players.get(socket.id);
      if (player) {
        player.color = color;
        chameleonNamespace.to(currentRoomId).emit('lobby_updated', {
          players: Array.from(room.players.values()),
          hostId: room.hostId,
          state: room.state,
        });
      }
    });

    // 3. Iniciar Sorteio Aleatório do Caçador 🎲
    socket.on('start_spin_lottery', () => {
      if (!currentRoomId || !gameRooms.has(currentRoomId)) return;
      const room = gameRooms.get(currentRoomId);
      const playersList = Array.from(room.players.values());

      if (playersList.length < 1) return;

      room.state = 'COUNTDOWN';

      // Sorteia aleatoriamente um jogador como CAÇADOR
      const randomIndex = Math.floor(Math.random() * playersList.length);
      const chosenSeeker = playersList[randomIndex];
      room.seekerId = chosenSeeker.id;

      for (const [pId, p] of room.players.entries()) {
        p.isSeeker = pId === chosenSeeker.id;
        p.isCaught = false;
        p.x = p.isSeeker ? 100 : 400;
        p.y = p.isSeeker ? 100 : 250;
      }

      chameleonNamespace.to(currentRoomId).emit('seeker_chosen', {
        seekerId: chosenSeeker.id,
        seekerName: chosenSeeker.name,
        countdownSeconds: 10,
        players: Array.from(room.players.values()),
      });

      setTimeout(() => {
        if (!gameRooms.has(currentRoomId)) return;
        room.state = 'PLAYING';
        room.timeRemaining = 45;

        chameleonNamespace.to(currentRoomId).emit('match_started', {
          timeLimit: 45,
          players: Array.from(room.players.values()),
        });

        // Timer oficial do servidor
        if (room.timer) clearInterval(room.timer);
        room.timer = setInterval(() => {
          if (!gameRooms.has(currentRoomId)) {
            clearInterval(room.timer);
            return;
          }
          room.timeRemaining--;
          if (room.timeRemaining <= 0) {
            clearInterval(room.timer);
            room.state = 'ENDED';
            // Se o tempo acabou e sobrou camaleão vivo, os camaleões vencem!
            chameleonNamespace.to(currentRoomId).emit('game_over_chameleons_win', {
              seekerId: room.seekerId,
            });
          }
        }, 1000);
      }, 10000);
    });

    // 4. Sincronização de Movimento & Lanterna
    socket.on('player_move', (moveData) => {
      if (!currentRoomId || !gameRooms.has(currentRoomId)) return;
      const room = gameRooms.get(currentRoomId);
      const player = room.players.get(socket.id);
      if (!player) return;

      player.x = moveData.x;
      player.y = moveData.y;
      player.angle = moveData.angle;
      player.isCamouflaged = moveData.isCamouflaged;

      socket.to(currentRoomId).emit('player_moved', {
        id: socket.id,
        x: moveData.x,
        y: moveData.y,
        angle: moveData.angle,
        isCamouflaged: moveData.isCamouflaged,
      });
    });

    // 5. Caçador Captura um Camaleão
    socket.on('tag_chameleon', ({ targetSocketId }) => {
      if (!currentRoomId || !gameRooms.has(currentRoomId)) return;
      const room = gameRooms.get(currentRoomId);
      const target = room.players.get(targetSocketId);
      if (target && !target.isCaught) {
        target.isCaught = true;
        chameleonNamespace.to(currentRoomId).emit('chameleon_caught', {
          targetId: targetSocketId,
          targetName: target.name,
        });

        const allCaught = Array.from(room.players.values())
          .filter((p) => !p.isSeeker)
          .every((p) => p.isCaught);

        if (allCaught) {
          if (room.timer) clearInterval(room.timer);
          room.state = 'ENDED';
          chameleonNamespace.to(currentRoomId).emit('game_over_seeker_win', {
            seekerId: room.seekerId,
          });
        }
      }
    });

    // 6. Desconexão
    socket.on('disconnect', () => {
      if (currentRoomId && gameRooms.has(currentRoomId)) {
        const room = gameRooms.get(currentRoomId);
        room.players.delete(socket.id);

        if (room.players.size === 0) {
          gameRooms.delete(currentRoomId);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = Array.from(room.players.keys())[0];
          }
          chameleonNamespace.to(currentRoomId).emit('lobby_updated', {
            players: Array.from(room.players.values()),
            hostId: room.hostId,
            state: room.state,
          });
        }
      }
    });
  });
}