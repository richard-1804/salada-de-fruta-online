// =====================================================
// APLICAÇÃO PRINCIPAL
// =====================================================

// =====================================================
// APLICAÇÃO PRINCIPAL
// =====================================================

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
  createRoomData,
  addPlayerToRoom,
  removePlayerFromRoom,
  isCurrentPlayerHost,
  canStartGame,
  renderPlayersList,
  clearCurrentRoom,
} from "./rooms.js";

import { startGame } from "./game.js";

// =====================================================
// ESTADO DA APLICAÇÃO
// =====================================================

const appState = {
  initialized: false,
  playerName: "",
  roomCode: null,
  isHost: false,
};

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
    // ---------------------------------------------
    // CRIAR JOGADOR
    // ---------------------------------------------

    const player = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,

      name: appState.playerName,
    };

    setCurrentPlayer(player);

    // ---------------------------------------------
    // CRIAR SALA
    // ---------------------------------------------

    const room = createRoomData();

    setCurrentRoom(room);

    appState.roomCode = room.id;
    appState.isHost = true;

    // ---------------------------------------------
    // ATUALIZAR INTERFACE
    // ---------------------------------------------

    updatePlayerName(player.name);

    updateRoomCode(room.id);

    updateHostControls(true);

    renderPlayersList(room);

    showLobby();

    showToast("Sala criada com sucesso!");
  } catch (error) {
    console.error("Erro ao criar sala:", error);

    showToast("Não foi possível criar a sala.");
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

  showToast(
    "O sistema de salas online ainda será conectado ao serviço multiplayer.",
  );
}

// =====================================================
// SAIR DA SALA
// =====================================================

async function handleLeaveRoom() {
  try {
    const room = getCurrentRoom();
    const player = getCurrentPlayer();

    if (room && player) {
      removePlayerFromRoom(room, player.id);
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
// CONFIGURAR EVENTOS
// =====================================================

function setupEventListeners() {
  const createButton = getElement("create-room-btn");
  const joinButton = getElement("join-room-btn");
  const leaveButton = getElement("leave-room-btn");
  const startButton = getElement("start-game-btn");
  const copyButton = getElement("copy-room-code");

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
