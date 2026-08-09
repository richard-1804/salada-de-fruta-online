// =====================================================
// SERVIÇOS DO FIREBASE
// =====================================================

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { app } from "./firebase.js";

import { generateId, generateRoomCode } from "../js/utils.js";

import { GAME_CONFIG, ROOM_STATUS } from "../js/constants.js";

// =====================================================
// FIRESTORE
// =====================================================

const db = getFirestore(app);

// =====================================================
// REFERÊNCIA DAS SALAS
// =====================================================

const roomsCollection = collection(db, "rooms");

// =====================================================
// NORMALIZAR DADOS DA SALA
// =====================================================
//
// Garante que qualquer sala recebida do Firestore
// tenha exatamente a estrutura utilizada pelo jogo.
// =====================================================

function normalizeRoom(room, roomId = null) {
  if (!room) {
    return null;
  }

  const players = {};

  // -------------------------------------------------
  // Firebase pode ter jogadores em array
  // ou objeto dependendo da versão dos dados.
  // -------------------------------------------------

  if (Array.isArray(room.players)) {
    room.players.forEach((player) => {
      if (!player || !player.id) {
        return;
      }

      players[player.id] = {
        id: player.id,
        name: player.name || "Jogador",
        score: Number(player.score) || 0,
        ready: player.ready !== false,
        joinedAt: player.joinedAt || Date.now(),
      };
    });
  } else if (room.players && typeof room.players === "object") {
    Object.entries(room.players).forEach(([playerId, player]) => {
      if (!player) {
        return;
      }

      players[playerId] = {
        id: player.id || playerId,
        name: player.name || "Jogador",
        score: Number(player.score) || 0,
        ready: player.ready !== false,
        joinedAt: player.joinedAt || Date.now(),
      };
    });
  }

  // -------------------------------------------------
  // CONFIGURAÇÕES
  // -------------------------------------------------

  const settings = {
    rounds:
      room.settings?.rounds ?? room.totalRounds ?? GAME_CONFIG.TOTAL_ROUNDS,

    roundTime:
      room.settings?.roundTime ?? room.roundTime ?? GAME_CONFIG.ROUND_TIME,

    maxPlayers: room.settings?.maxPlayers ?? GAME_CONFIG.MAX_PLAYERS,
  };

  // -------------------------------------------------
  // SALA PADRONIZADA
  // -------------------------------------------------

  return {
    id: room.id || roomId || room.code,

    code: room.code || room.id || roomId,

    hostId: room.hostId || null,

    hostName: room.hostName || players[room.hostId]?.name || null,

    status: room.status || ROOM_STATUS.WAITING,

    players,

    settings,

    currentRound: room.currentRound || 0,

    currentLetter: room.currentLetter || null,

    createdAt: room.createdAt || null,

    updatedAt: room.updatedAt || null,
  };
}

// =====================================================
// CRIAR SALA
// =====================================================

export async function createRoom(playerName) {
  if (!playerName || !playerName.trim()) {
    throw new Error("Nome do jogador inválido.");
  }

  const playerId = generateId();

  let roomCode = null;
  let roomRef = null;

  // -------------------------------------------------
  // GERAR CÓDIGO ÚNICO
  // -------------------------------------------------

  for (let attempt = 0; attempt < 10; attempt++) {
    const possibleCode = generateRoomCode(GAME_CONFIG.ROOM_CODE_LENGTH);

    const possibleRoomRef = doc(roomsCollection, possibleCode);

    const existingRoom = await getDoc(possibleRoomRef);

    if (!existingRoom.exists()) {
      roomCode = possibleCode;
      roomRef = possibleRoomRef;
      break;
    }
  }

  if (!roomCode || !roomRef) {
    throw new Error("Não foi possível gerar um código de sala.");
  }

  // -------------------------------------------------
  // JOGADOR
  // -------------------------------------------------

  const player = {
    id: playerId,

    name: playerName.trim(),

    score: 0,

    ready: true,

    joinedAt: Date.now(),
  };

  // -------------------------------------------------
  // SALA
  // -------------------------------------------------

  const roomData = {
    code: roomCode,

    hostId: playerId,

    hostName: player.name,

    status: ROOM_STATUS.WAITING,

    players: {
      [playerId]: player,
    },

    settings: {
      rounds: GAME_CONFIG.TOTAL_ROUNDS,

      roundTime: GAME_CONFIG.ROUND_TIME,

      maxPlayers: GAME_CONFIG.MAX_PLAYERS,
    },

    currentRound: 0,

    currentLetter: null,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  // -------------------------------------------------
  // SALVAR
  // -------------------------------------------------

  await setDoc(roomRef, roomData);

  // -------------------------------------------------
  // RETORNAR SALA PADRONIZADA
  // -------------------------------------------------

  const normalizedRoom = normalizeRoom(
    {
      ...roomData,

      createdAt: Date.now(),

      updatedAt: Date.now(),
    },
    roomCode,
  );

  return {
    room: normalizedRoom,

    roomCode,

    playerId,
  };
}

// =====================================================
// ENTRAR NA SALA
// =====================================================

export async function joinRoom(roomCode, playerName) {
  if (!roomCode) {
    throw new Error("Código da sala não informado.");
  }

  if (!playerName || !playerName.trim()) {
    throw new Error("Nome do jogador inválido.");
  }

  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(roomsCollection, normalizedCode);

  const roomSnapshot = await getDoc(roomRef);

  if (!roomSnapshot.exists()) {
    throw new Error("Sala não encontrada.");
  }

  const rawRoom = {
    id: roomSnapshot.id,

    ...roomSnapshot.data(),
  };

  const room = normalizeRoom(rawRoom, roomSnapshot.id);

  // -------------------------------------------------
  // STATUS
  // -------------------------------------------------

  if (room.status !== ROOM_STATUS.WAITING) {
    throw new Error("Essa partida já foi iniciada.");
  }

  // -------------------------------------------------
  // LIMITE
  // -------------------------------------------------

  const players = Object.values(room.players);

  if (players.length >= room.settings.maxPlayers) {
    throw new Error("A sala está cheia.");
  }

  // -------------------------------------------------
  // JOGADOR
  // -------------------------------------------------

  const playerId = generateId();

  const player = {
    id: playerId,

    name: playerName.trim(),

    score: 0,

    ready: true,

    joinedAt: Date.now(),
  };

  // -------------------------------------------------
  // ATUALIZAR SALA
  // -------------------------------------------------

  await updateDoc(roomRef, {
    [`players.${playerId}`]: player,

    updatedAt: serverTimestamp(),
  });

  // -------------------------------------------------
  // RETORNAR
  // -------------------------------------------------

  const updatedRoom = {
    ...room,

    players: {
      ...room.players,

      [playerId]: player,
    },
  };

  return {
    room: updatedRoom,

    roomCode: normalizedCode,

    playerId,
  };
}

// =====================================================
// OBTER SALA
// =====================================================

export async function getRoom(roomCode) {
  if (!roomCode) {
    return null;
  }

  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(roomsCollection, normalizedCode);

  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeRoom(
    {
      id: snapshot.id,

      ...snapshot.data(),
    },
    snapshot.id,
  );
}

// =====================================================
// REMOVER JOGADOR
// =====================================================

export async function removePlayerFromRoom(roomCode, playerId) {
  if (!roomCode || !playerId) {
    return;
  }

  const roomRef = doc(roomsCollection, roomCode);

  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    return;
  }

  const room = normalizeRoom(
    {
      id: snapshot.id,

      ...snapshot.data(),
    },
    snapshot.id,
  );

  const players = {
    ...room.players,
  };

  delete players[playerId];

  let hostId = room.hostId;
  let hostName = room.hostName;

  // -------------------------------------------------
  // SE O HOST SAIU
  // -------------------------------------------------

  if (hostId === playerId) {
    const remainingPlayers = Object.values(players);

    if (remainingPlayers.length > 0) {
      const newHost = remainingPlayers[0];

      hostId = newHost.id;

      hostName = newHost.name;
    } else {
      hostId = null;

      hostName = null;
    }
  }

  // -------------------------------------------------
  // ATUALIZAR
  // -------------------------------------------------

  await updateDoc(roomRef, {
    players,

    hostId,

    hostName,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// EXCLUIR SALA
// =====================================================

export async function deleteRoom(roomCode) {
  if (!roomCode) {
    return;
  }

  const roomRef = doc(roomsCollection, roomCode);

  await deleteDoc(roomRef);
}

// =====================================================
// ATUALIZAR SALA
// =====================================================

export async function updateRoom(roomCode, data) {
  if (!roomCode || !data) {
    return;
  }

  const roomRef = doc(roomsCollection, roomCode);

  await updateDoc(roomRef, {
    ...data,

    updatedAt: serverTimestamp(),
  });
}

// =====================================================
// OUVIR ALTERAÇÕES DA SALA
// =====================================================

export function subscribeToRoom(roomCode, callback) {
  if (!roomCode || typeof callback !== "function") {
    return () => {};
  }

  const roomRef = doc(roomsCollection, roomCode);

  return onSnapshot(
    roomRef,

    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);

        return;
      }

      const room = normalizeRoom(
        {
          id: snapshot.id,

          ...snapshot.data(),
        },
        snapshot.id,
      );

      callback(room);
    },

    (error) => {
      console.error("Erro ao observar sala:", error);
    },
  );
}

// =====================================================
// VERIFICAR SE A SALA EXISTE
// =====================================================

export async function roomExists(roomCode) {
  return (await getRoom(roomCode)) !== null;
}

// =====================================================
// EXPORTAR FIRESTORE
// =====================================================

export { db };
