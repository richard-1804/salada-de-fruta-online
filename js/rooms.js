// =====================================================
// SALAS
// =====================================================

import { generateRoomCode } from "./utils.js";

// =====================================================
// ESTADO DA SALA
// =====================================================

let currentRoom = null;

let currentPlayer = null;

let isHost = false;

// =====================================================
// DEFINIR JOGADOR ATUAL
// =====================================================

export function setCurrentPlayer(player) {
  if (!player) {
    return;
  }

  currentPlayer = {
    id: player.id,
    name: player.name,
  };
}

// =====================================================
// OBTER JOGADOR ATUAL
// =====================================================

export function getCurrentPlayer() {
  return currentPlayer;
}

// =====================================================
// DEFINIR SALA ATUAL
// =====================================================

export function setCurrentRoom(room) {
  if (!room) {
    return;
  }

  currentRoom = room;

  isHost = room.hostId === currentPlayer?.id;
}

// =====================================================
// OBTER SALA ATUAL
// =====================================================

export function getCurrentRoom() {
  return currentRoom;
}

// =====================================================
// VERIFICAR SE É HOST
// =====================================================

export function isCurrentPlayerHost() {
  return isHost;
}

// =====================================================
// GERAR NOVA SALA
// =====================================================

export function createRoomData() {
  if (!currentPlayer) {
    throw new Error("É necessário definir o jogador antes de criar uma sala.");
  }

  const roomCode = generateRoomCode(6);

  const room = {
    id: roomCode,

    hostId: currentPlayer.id,

    hostName: currentPlayer.name,

    status: "waiting",

    players: {
      [currentPlayer.id]: {
        id: currentPlayer.id,

        name: currentPlayer.name,

        score: 0,

        ready: true,
      },
    },

    settings: {
      rounds: 10,

      roundTime: 90,

      maxPlayers: 8,
    },

    currentRound: 0,

    currentLetter: null,

    createdAt: Date.now(),
  };

  currentRoom = room;

  isHost = true;

  return room;
}

// =====================================================
// ADICIONAR JOGADOR À SALA
// =====================================================

export function addPlayerToRoom(room, player) {
  if (!room || !player) {
    return {
      success: false,
      reason: "invalid-data",
    };
  }

  if (!room.players) {
    room.players = {};
  }

  const players = Object.values(room.players);

  // -------------------------------------------------
  // VERIFICAR LIMITE
  // -------------------------------------------------

  if (players.length >= room.settings.maxPlayers) {
    return {
      success: false,

      reason: "room-full",
    };
  }

  // -------------------------------------------------
  // VERIFICAR SE JÁ ESTÁ NA SALA
  // -------------------------------------------------

  if (room.players[player.id]) {
    return {
      success: true,

      alreadyJoined: true,
    };
  }

  // -------------------------------------------------
  // ADICIONAR
  // -------------------------------------------------

  room.players[player.id] = {
    id: player.id,

    name: player.name,

    score: 0,

    ready: true,
  };

  return {
    success: true,

    alreadyJoined: false,
  };
}

// =====================================================
// REMOVER JOGADOR
// =====================================================

export function removePlayerFromRoom(room, playerId) {
  if (!room || !room.players || !playerId) {
    return false;
  }

  if (!room.players[playerId]) {
    return false;
  }

  delete room.players[playerId];

  // -------------------------------------------------
  // SE O HOST SAIU
  // -------------------------------------------------

  if (room.hostId === playerId) {
    const remainingPlayers = Object.values(room.players);

    if (remainingPlayers.length > 0) {
      const newHost = remainingPlayers[0];

      room.hostId = newHost.id;

      room.hostName = newHost.name;
    } else {
      room.hostId = null;

      room.hostName = null;
    }
  }

  return true;
}

// =====================================================
// OBTER LISTA DE JOGADORES
// =====================================================

export function getPlayersFromRoom(room = currentRoom) {
  if (!room || !room.players) {
    return [];
  }

  return Object.values(room.players);
}

// =====================================================
// CONTAR JOGADORES
// =====================================================

export function getPlayerCount(room = currentRoom) {
  return getPlayersFromRoom(room).length;
}

// =====================================================
// VERIFICAR SE A SALA ESTÁ CHEIA
// =====================================================

export function isRoomFull(room = currentRoom) {
  if (!room) {
    return false;
  }

  return getPlayerCount(room) >= room.settings.maxPlayers;
}

// =====================================================
// VERIFICAR SE A SALA PODE COMEÇAR
// =====================================================

export function canStartGame(room = currentRoom) {
  if (!room) {
    return false;
  }

  // Apenas o host inicia

  if (room.hostId !== currentPlayer?.id) {
    return false;
  }

  // Pelo menos 1 jogador

  if (getPlayerCount(room) < 1) {
    return false;
  }

  // Sala precisa estar aguardando

  if (room.status !== "waiting") {
    return false;
  }

  return true;
}

// =====================================================
// ALTERAR STATUS DA SALA
// =====================================================

export function setRoomStatus(status) {
  if (!currentRoom) {
    return false;
  }

  currentRoom.status = status;

  return true;
}

// =====================================================
// OBTER STATUS DA SALA
// =====================================================

export function getRoomStatus() {
  return currentRoom?.status || null;
}

// =====================================================
// LIMPAR SALA LOCAL
// =====================================================

export function clearCurrentRoom() {
  currentRoom = null;

  currentPlayer = null;

  isHost = false;
}

// =====================================================
// ATUALIZAR INTERFACE DOS JOGADORES
// =====================================================

export function renderPlayersList(room = currentRoom) {
  const container = document.getElementById("players-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const players = getPlayersFromRoom(room);

  if (players.length === 0) {
    const empty = document.createElement("p");

    empty.textContent = "Nenhum jogador na sala.";

    container.appendChild(empty);

    return;
  }

  players.forEach((player) => {
    const item = document.createElement("div");

    item.className = "player-item";

    const name = document.createElement("span");

    name.className = "player-name";

    name.textContent = player.name;

    // -------------------------------------------------
    // IDENTIFICAR HOST
    // -------------------------------------------------

    if (player.id === room.hostId) {
      const host = document.createElement("span");

      host.className = "player-host";

      host.textContent = "👑 Host";

      item.appendChild(host);
    }

    item.appendChild(name);

    container.appendChild(item);
  });

  updateLobbyPlayerCount(players.length, room.settings.maxPlayers);
}

// =====================================================
// ATUALIZAR CONTADOR DO LOBBY
// =====================================================

export function updateLobbyPlayerCount(current, maximum = 8) {
  const element = document.getElementById("info-players");

  if (!element) {
    return;
  }

  element.textContent = `${current} / ${maximum}`;
}
