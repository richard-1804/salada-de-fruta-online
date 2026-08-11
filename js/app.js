// =====================================================
// APLICAÇÃO PRINCIPAL
// =====================================================

import {
  createRoom,
  joinRoom,
  removePlayerFromRoom,
  subscribeToRoom,
  updateRoom,
} from "../services/firebase-service.js";

import {
  initializeUI,
  showHome,
  showLobby,
  showGame,
  showToast,
  updatePlayerName,
  updateRoomCode,
  updateHostControls,
  hideLoading,
} from "./ui.js";

import {
  setCurrentPlayer,
  getCurrentPlayer,
  setCurrentRoom,
  getCurrentRoom,
  canStartGame,
  renderPlayersList,
  clearCurrentRoom,
} from "./rooms.js";

import {
  startGame,
  submitAnswers,
  applyRemoteGameState,
  getCurrentLetter,
} from "./game.js";

// =====================================================
// ESTADO DA APLICAÇÃO
// =====================================================

const appState = {
  initialized: false,
  playerName: "",
  roomCode: null,
  playerId: null,
  isHost: false,
  unsubscribeRoom: null,
};

// =====================================================
// OUVIR ALTERAÇÕES DA SALA
// =====================================================

let unsubscribeRoom = null;

function subscribeToCurrentRoom(roomCode) {
  // -------------------------------------------------
  // CANCELAR OBSERVADOR ANTERIOR
  // -------------------------------------------------

  if (unsubscribeRoom) {
    unsubscribeRoom();
    unsubscribeRoom = null;
  }

  if (!roomCode) {
    return;
  }

  // -------------------------------------------------
  // OBSERVAR FIRESTORE
  // -------------------------------------------------

  unsubscribeRoom = subscribeToRoom(roomCode, (room) => {
    console.log("🔥 Listener da sala recebeu atualização:", room);

    // -------------------------------------------------
    // SALA EXCLUÍDA
    // -------------------------------------------------

    if (!room) {
      console.warn("A sala não existe mais.");
      unsubscribeRoom = null;
      return;
    }

    // -------------------------------------------------
    // ATUALIZAR ESTADO LOCAL
    // -------------------------------------------------

    console.log("➡️ Chamando updateRoomState()");

    updateRoomState(room);

    console.log("✅ updateRoomState() terminou");

    // -------------------------------------------------
    // VERIFICAR STATUS DA PARTIDA
    // -------------------------------------------------

    console.log("🎮 Status recebido:", room.status);

    if (room.status === "playing") {
      console.log("🎮 Chamando showGame()");

      showGame();

      console.log("🎮 Chamando applyRemoteGameState()");

      applyRemoteGameState(room);

      console.log("✅ applyRemoteGameState() terminou");
    }

    // -------------------------------------------------
    // PARTIDA FINALIZADA
    // -------------------------------------------------

    if (room.status === "finished") {
      console.log("🏆 Partida finalizada.");

      applyRemoteGameState(room);
    }
  });
}

// =====================================================
// OBTER ELEMENTOS
// =====================================================

function getElement(id) {
  return document.getElementById(id);
}

// =====================================================
// LER NOME DO JOGADOR
// =====================================================

function getPlayerName() {
  const input = getElement("player-name");

  if (!input) {
    return "";
  }

  return input.value.trim();
}

// =====================================================
// VALIDAR NOME
// =====================================================

function validatePlayerName() {
  const name = getPlayerName();

  if (!name) {
    showToast("Digite seu nome antes de continuar.");
    return false;
  }

  if (name.length < 2) {
    showToast("Seu nome precisa ter pelo menos 2 caracteres.");
    return false;
  }

  appState.playerName = name;

  return true;
}

// =====================================================
// ATUALIZAR ESTADO DA SALA
// =====================================================

function updateRoomState(room) {
  if (!room) {
    return;
  }

  // -------------------------------------------------
  // SALVAR SALA LOCALMENTE
  // -------------------------------------------------

  setCurrentRoom(room);

  appState.roomCode = room.code;

  appState.isHost = room.hostId === appState.playerId;

  // -------------------------------------------------
  // ATUALIZAR INTERFACE
  // -------------------------------------------------

  updateRoomCode(room.code);

  updateHostControls(appState.isHost);

  renderPlayersList(room);

  // -------------------------------------------------
  // ATUALIZAR INFORMAÇÕES DO LOBBY
  // -------------------------------------------------

  const playerCount = Array.isArray(room.players) ? room.players.length : 0;

  const playerElement = getElement("info-players");

  const roundsElement = getElement("info-rounds");

  const timeElement = getElement("info-time");

  if (playerElement) {
    playerElement.textContent = `${playerCount} / 8`;
  }

  if (roundsElement) {
    roundsElement.textContent = room.totalRounds ?? 10;
  }

  if (timeElement) {
    timeElement.textContent = `${room.roundTime ?? 90} s`;
  }
}

// =====================================================
// CRIAR SALA
// =====================================================

async function handleCreateRoom() {
  if (!validatePlayerName()) {
    return;
  }

  const button = getElement("create-room-btn");

  if (button) {
    button.disabled = true;
    button.textContent = "Criando sala...";
  }

  try {
    // -------------------------------------------------
    // CRIAR SALA NO FIREBASE
    // -------------------------------------------------

    const result = await createRoom(appState.playerName);

    if (!result || !result.room) {
      throw new Error("Não foi possível criar a sala.");
    }

    const { room, playerId, roomCode } = result;

    // -------------------------------------------------
    // JOGADOR ATUAL
    // -------------------------------------------------

    setCurrentPlayer({
      id: playerId,

      name: appState.playerName,
    });

    appState.playerId = playerId;

    // -------------------------------------------------
    // SALA ATUAL
    // -------------------------------------------------

    setCurrentRoom(room);

    appState.roomCode = roomCode;

    appState.isHost = true;

    // -------------------------------------------------
    // INTERFACE
    // -------------------------------------------------

    updatePlayerName(appState.playerName);

    updateRoomCode(roomCode);

    updateHostControls(true);

    renderPlayersList(room);

    showLobby();

    subscribeToCurrentRoom(room.id);

    showToast("Sala criada com sucesso!");
  } catch (error) {
    console.error("Erro ao criar sala:", error);

    showToast(error.message || "Não foi possível criar a sala.");
  } finally {
    if (button) {
      button.disabled = false;

      button.textContent = "🎲 Criar Sala";
    }
  }
}

// =====================================================
// ENTRAR NA SALA
// =====================================================

async function handleJoinRoom() {
  if (!validatePlayerName()) {
    return;
  }

  const roomInput = getElement("room-code");

  if (!roomInput) {
    return;
  }

  const roomCode = roomInput.value.trim().toUpperCase();

  if (!roomCode) {
    showToast("Digite o código da sala.");

    return;
  }

  if (roomCode.length !== 6) {
    showToast("O código da sala deve ter 6 caracteres.");

    return;
  }

  const button = getElement("join-room-btn");

  if (button) {
    button.disabled = true;

    button.textContent = "Entrando...";
  }

  try {
    // -------------------------------------------------
    // ENTRAR NO FIREBASE
    // -------------------------------------------------

    const result = await joinRoom(roomCode, appState.playerName);

    if (!result || !result.room) {
      throw new Error("Não foi possível entrar na sala.");
    }

    const { room, playerId } = result;

    // -------------------------------------------------
    // JOGADOR
    // -------------------------------------------------

    setCurrentPlayer({
      id: playerId,

      name: appState.playerName,
    });

    appState.playerId = playerId;

    // -------------------------------------------------
    // SALA
    // -------------------------------------------------

    setCurrentRoom(room);

    appState.roomCode = result.roomCode;

    appState.isHost = room.hostId === playerId;

    // -------------------------------------------------
    // INTERFACE
    // -------------------------------------------------

    updatePlayerName(appState.playerName);

    updateRoomCode(result.roomCode);

    updateHostControls(appState.isHost);

    renderPlayersList(room);

    showLobby();

    showToast("Você entrou na sala!");

    // -------------------------------------------------
    // TEMPO REAL
    // -------------------------------------------------

    subscribeToCurrentRoom(result.roomCode);
  } catch (error) {
    console.error("Erro ao entrar na sala:", error);

    showToast(error.message || "Não foi possível entrar na sala.");
  } finally {
    if (button) {
      button.disabled = false;

      button.textContent = "🚪 Entrar na Sala";
    }
  }
}

// =====================================================
// SAIR DA SALA
// =====================================================

async function handleLeaveRoom() {
  try {
    if (unsubscribeRoom) {
      unsubscribeRoom();
      unsubscribeRoom = null;
    }
    const room = getCurrentRoom();

    const player = getCurrentPlayer();

    if (room && player) {
      await removePlayerFromFirebase(room.id || room.code, player.id);
    }

    clearCurrentRoom();

    appState.roomCode = null;

    appState.isHost = false;

    appState.playerName = "";

    updateRoomCode("---");

    updatePlayerName("");

    updateHostControls(false);

    showHome();
  } catch (error) {
    console.error("Erro ao sair da sala:", error);

    showToast("Não foi possível sair da sala.");
  }
}

// =====================================================
// INICIAR PARTIDA
// =====================================================

async function handleStartGame() {
  const room = getCurrentRoom();

  if (!room) {
    showToast("Você não está em uma sala.");
    return;
  }

  if (!canStartGame(room)) {
    showToast("A partida não pode ser iniciada.");
    return;
  }

  try {
    const success = startGame();

    if (!success) {
      showToast("Não foi possível iniciar a partida.");
      return;
    }

    // ---------------------------------------------
    // SINCRONIZAR INÍCIO DA PARTIDA NO FIRESTORE
    // ---------------------------------------------

    await updateRoom(appState.roomCode, {
      status: "playing",
      currentRound: 1,
      currentLetter: getCurrentLetter(),
    });

    // ---------------------------------------------
    // MOSTRAR JOGO NO HOST
    // ---------------------------------------------

    showGame();
  } catch (error) {
    console.error("Erro ao iniciar partida:", error);

    showToast("Não foi possível iniciar a partida.");
  }
}

// =====================================================
// COPIAR CÓDIGO DA SALA
// =====================================================

async function handleCopyRoomCode() {
  if (!appState.roomCode) {
    showToast("Nenhuma sala ativa.");

    return;
  }

  try {
    await navigator.clipboard.writeText(appState.roomCode);

    showToast("Código da sala copiado!");
  } catch (error) {
    console.error("Erro ao copiar código:", error);

    showToast("Não foi possível copiar o código.");
  }
}

// =====================================================
// ATUALIZAR SALA EM TEMPO REAL
// =====================================================

function handleRoomUpdate(room) {
  if (!room) {
    return;
  }

  // -------------------------------------------------
  // ATUALIZAR ESTADO LOCAL
  // -------------------------------------------------

  setCurrentRoom(room);

  appState.roomCode = room.id || room.code;

  appState.isHost = room.hostId === getCurrentPlayer()?.id;

  // -------------------------------------------------
  // ATUALIZAR INTERFACE
  // -------------------------------------------------

  updateRoomCode(room.id || room.code);

  updateHostControls(appState.isHost);

  renderPlayersList(room);
}

// =====================================================
// CONFIGURAR EVENTOS
// =====================================================

function setupEventListeners() {
  const createButton = getElement("create-room-btn");

  const joinButton = getElement("join-room-btn");

  const leaveButton = getElement("leave-room-btn");

  const startButton = getElement("start-game-btn");

  const copyButton = getElement("copy-room-code");

  const answersForm = getElement("answers-form");

  if (createButton) {
    createButton.addEventListener("click", handleCreateRoom);
  }

  if (joinButton) {
    joinButton.addEventListener("click", handleJoinRoom);
  }

  if (leaveButton) {
    leaveButton.addEventListener("click", handleLeaveRoom);
  }

  if (startButton) {
    startButton.addEventListener("click", handleStartGame);
  }

  if (copyButton) {
    copyButton.addEventListener("click", handleCopyRoomCode);
  }

  // -------------------------------------------------
  // FINALIZAR RESPOSTAS
  // -------------------------------------------------

  if (answersForm) {
    answersForm.addEventListener("submit", (event) => {
      event.preventDefault();

      submitAnswers();
    });
  }
}

// =====================================================
// INICIALIZAR APLICAÇÃO
// =====================================================

export function initializeApp() {
  try {
    initializeUI();

    setupEventListeners();

    hideLoading();

    console.log("🍓 Salada de Fruta inicializada.");

    appState.initialized = true;
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);

    hideLoading();

    showHome();

    showToast("Erro ao carregar o jogo.");
  }
}

// =====================================================
// INICIAR QUANDO O DOM ESTIVER PRONTO
// =====================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
