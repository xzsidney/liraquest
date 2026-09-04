/**
 * Gerenciador de WebSockets para o Duelo de Arqueiros 1v1 (Real-time Multiplayer Familiar)
 * Namespace: /duel
 */

const duelRooms = new Map();

export function initDuelSocket(io) {
  const duelNamespace = io.of('/duel');

  duelNamespace.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // 1. Entrar no Lobby de Duelo Familiar
    socket.on('join_duel_lobby', ({ roomId, user, stage, difficulty }) => {
      currentRoomId = roomId;
      currentUser = {
        id: socket.id,
        userId: user?.id,
        name: user?.name || 'Arqueiro do Clã',
        role: user?.role || 'CHILD',
        photo: user?.profile_photo_url || null,
        stage: stage || 'fundamental_1',
        difficulty: difficulty || 'facil',
        isReady: false,
        score: 0,
        hits: 0,
        misses: 0,
        combo: 0,
        snitchHits: 0,
      };

      socket.join(roomId);

      if (!duelRooms.has(roomId)) {
        duelRooms.set(roomId, {
          id: roomId,
          hostId: socket.id,
          players: new Map(),
          state: 'LOBBY', // 'LOBBY' | 'STARTING' | 'PLAYING' | 'FINISHED'
          countdown: 3,
        });
      }

      const room = duelRooms.get(roomId);

      // Limita a sala a 2 duelistas
      if (room.players.size >= 2 && !room.players.has(socket.id)) {
        socket.emit('duel_error', { message: 'A arena de duelo já atingiu o limite de 2 duelistas.' });
        return;
      }

      room.players.set(socket.id, currentUser);

      // Notifica todos na sala sobre o estado do lobby
      duelNamespace.to(roomId).emit('duel_lobby_updated', {
        roomId,
        hostId: room.hostId,
        state: room.state,
        players: Array.from(room.players.values()),
      });
    });

    // 2. Atualizar configurações pedagógicas (Etapa / Dificuldade)
    socket.on('update_player_settings', ({ stage, difficulty }) => {
      if (!currentRoomId || !duelRooms.has(currentRoomId)) return;
      const room = duelRooms.get(currentRoomId);
      const player = room.players.get(socket.id);
      if (player && room.state === 'LOBBY') {
        if (stage) player.stage = stage;
        if (difficulty) player.difficulty = difficulty;

        duelNamespace.to(currentRoomId).emit('duel_lobby_updated', {
          roomId: currentRoomId,
          hostId: room.hostId,
          state: room.state,
          players: Array.from(room.players.values()),
        });
      }
    });

    // 3. Jogador Alterna Estado "Pronto para o Combate"
    socket.on('player_toggle_ready', () => {
      if (!currentRoomId || !duelRooms.has(currentRoomId)) return;
      const room = duelRooms.get(currentRoomId);
      const player = room.players.get(socket.id);
      if (player && room.state === 'LOBBY') {
        player.isReady = !player.isReady;

        duelNamespace.to(currentRoomId).emit('duel_lobby_updated', {
          roomId: currentRoomId,
          hostId: room.hostId,
          state: room.state,
          players: Array.from(room.players.values()),
        });

        // Se ambos estiverem prontos (2 duelistas), inicia contagem regressiva
        const playersList = Array.from(room.players.values());
        if (playersList.length === 2 && playersList.every((p) => p.isReady)) {
          room.state = 'STARTING';
          room.countdown = 3;

          duelNamespace.to(currentRoomId).emit('duel_countdown_tick', { countdown: room.countdown });

          const interval = setInterval(() => {
            room.countdown -= 1;
            if (room.countdown > 0) {
              duelNamespace.to(currentRoomId).emit('duel_countdown_tick', { countdown: room.countdown });
            } else {
              clearInterval(interval);
              room.state = 'PLAYING';
              // Resetar placares para garantir início limpo
              playersList.forEach((p) => {
                p.score = 0;
                p.hits = 0;
                p.misses = 0;
                p.combo = 0;
                p.snitchHits = 0;
              });

              duelNamespace.to(currentRoomId).emit('duel_started', {
                durationSeconds: 60,
                players: playersList,
              });
            }
          }, 1000);
        }
      }
    });

    // 4. Atualização de Pontuação em Tempo Real (Eventos de Tiro)
    socket.on('duel_score_update', ({ scoreDelta, isHit, isMiss, combo, isSnitch }) => {
      if (!currentRoomId || !duelRooms.has(currentRoomId)) return;
      const room = duelRooms.get(currentRoomId);
      if (room.state !== 'PLAYING') return;

      const player = room.players.get(socket.id);
      if (!player) return;

      if (scoreDelta) player.score = Math.max(0, player.score + scoreDelta);
      if (isHit) player.hits += 1;
      if (isMiss) player.misses += 1;
      if (combo !== undefined) player.combo = combo;
      if (isSnitch) player.snitchHits += 1;

      // Emite placar atualizado para ambos os jogadores na sala
      duelNamespace.to(currentRoomId).emit('duel_scores_synced', {
        players: Array.from(room.players.values()),
        lastEvent: {
          socketId: socket.id,
          playerName: player.name,
          scoreDelta,
          isHit,
          isMiss,
          combo,
          isSnitch,
        },
      });
    });

    // 5. Finalização de Partida
    socket.on('duel_client_finished', ({ finalScore, finalHits, finalMisses, maxCombo }) => {
      if (!currentRoomId || !duelRooms.has(currentRoomId)) return;
      const room = duelRooms.get(currentRoomId);
      const player = room.players.get(socket.id);
      if (player) {
        if (finalScore !== undefined) player.score = finalScore;
        if (finalHits !== undefined) player.hits = finalHits;
        if (finalMisses !== undefined) player.misses = finalMisses;
        if (maxCombo !== undefined) player.maxCombo = maxCombo;
      }

      // Se ambos concluíram ou o tempo acabou
      if (room.state !== 'FINISHED') {
        room.state = 'FINISHED';

        const playersList = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
        const winner = playersList[0] || null;
        const isTie = playersList.length === 2 && playersList[0].score === playersList[1].score;

        duelNamespace.to(currentRoomId).emit('duel_match_over', {
          isTie,
          winner: isTie ? null : winner,
          leaderboard: playersList,
        });
      }
    });

    // 6. Solicitar Revanche / Voltar ao Lobby
    socket.on('duel_request_rematch', () => {
      if (!currentRoomId || !duelRooms.has(currentRoomId)) return;
      const room = duelRooms.get(currentRoomId);
      room.state = 'LOBBY';
      room.players.forEach((p) => {
        p.isReady = false;
        p.score = 0;
        p.hits = 0;
        p.misses = 0;
        p.combo = 0;
        p.snitchHits = 0;
      });

      duelNamespace.to(currentRoomId).emit('duel_lobby_updated', {
        roomId: currentRoomId,
        hostId: room.hostId,
        state: room.state,
        players: Array.from(room.players.values()),
      });
    });

    // 7. Desconexão de Jogador
    socket.on('disconnect', () => {
      if (currentRoomId && duelRooms.has(currentRoomId)) {
        const room = duelRooms.get(currentRoomId);
        room.players.delete(socket.id);

        if (room.players.size === 0) {
          duelRooms.delete(currentRoomId);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = Array.from(room.players.keys())[0];
          }

          duelNamespace.to(currentRoomId).emit('duel_player_disconnected', {
            disconnectedPlayerName: currentUser ? currentUser.name : 'Um duelista',
            players: Array.from(room.players.values()),
            hostId: room.hostId,
            state: 'LOBBY',
          });

          room.state = 'LOBBY';
          room.players.forEach((p) => (p.isReady = false));
        }
      }
    });
  });
}
