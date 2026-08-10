// =====================================================
// LÓGICA PRINCIPAL DO JOGO
// =====================================================

import { GAME_CONFIG } from "./constants.js";

import {
  getCurrentPlayer,
  getCurrentRoom,
  setRoomStatus,
  isCurrentPlayerHost,
} from "./rooms.js";

import {
  renderCategories,
  getAnswers,
  clearAnswers,
  enableAnswers,
  disableAnswers,
  setupCategoryInputs,
} from "./categories.js";

import { startTimer, stopTimer, resetTimer } from "./timer.js";

import { updateRoom, getRoom } from "../services/firebase-service.js";

// =====================================================
// ESTADO DA PARTIDA
// =====================================================

let gameState = {
  round: 0,

  totalRounds: GAME_CONFIG.TOTAL_ROUNDS,

  currentLetter: null,

  status: "waiting",

  answers: {},

  roundFinished: false,
};

// =====================================================
// LETRAS DISPONÍVEIS
// =====================================================

const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

// =====================================================
// OBTER ESTADO DO JOGO
// =====================================================

export function getGameState() {
  return {
    ...gameState,

    answers: {
      ...gameState.answers,
    },
  };
}

// =====================================================
// RESETAR ESTADO
// =====================================================

export function resetGameState() {
  stopTimer();

  gameState = {
    round: 0,

    totalRounds: GAME_CONFIG.TOTAL_ROUNDS,

    currentLetter: null,

    status: "waiting",

    answers: {},

    roundFinished: false,
  };
}

// =====================================================
// SORTEAR LETRA
// =====================================================

export function drawLetter() {
  const randomIndex = Math.floor(Math.random() * LETTERS.length);

  return LETTERS[randomIndex];
}

// =====================================================
// ATUALIZAR LETRA NA INTERFACE
// =====================================================

function updateLetterDisplay(letter) {
  const element = document.getElementById("current-letter");

  if (!element) {
    return;
  }

  element.textContent = letter;
}

// =====================================================
// ATUALIZAR NÚMERO DA RODADA
// =====================================================

function updateRoundDisplay(round = gameState.round) {
  const element = document.getElementById("round-number");

  if (!element) {
    return;
  }

  element.textContent = round;
}

// =====================================================
// PREPARAR INTERFACE DA RODADA
// =====================================================

function prepareRoundInterface() {
  const categoriesContainer = document.getElementById("categories-container");

  if (categoriesContainer) {
    renderCategories(categoriesContainer);

    setupCategoryInputs();
  }

  clearAnswers();

  enableAnswers();
}

// =====================================================
// INICIAR PARTIDA
// =====================================================

export async function startGame() {
  if (!isCurrentPlayerHost()) {
    console.warn("Somente o host pode iniciar a partida.");

    return false;
  }

  const room = getCurrentRoom();

  if (!room) {
    console.error("Sala atual não encontrada.");

    return false;
  }

  const firstRound = 1;

  const firstLetter = drawLetter();

  gameState.round = firstRound;

  gameState.status = "playing";

  gameState.currentLetter = firstLetter;

  gameState.answers = {};

  gameState.roundFinished = false;

  setRoomStatus("playing");

  // -------------------------------------------------
  // SALVAR ESTADO DA PARTIDA NO FIRESTORE
  // -------------------------------------------------

  try {
    await updateRoom(room.id, {
      status: "playing",

      currentRound: firstRound,

      currentLetter: firstLetter,

      totalRounds: GAME_CONFIG.TOTAL_ROUNDS,

      roundTime: GAME_CONFIG.ROUND_TIME,
    });
  } catch (error) {
    console.error("Erro ao sincronizar início da partida:", error);

    return false;
  }

  // -------------------------------------------------
  // ATUALIZAR INTERFACE DO HOST
  // -------------------------------------------------

  updateRoundDisplay(firstRound);

  updateLetterDisplay(firstLetter);

  prepareRoundInterface();

  resetTimer(GAME_CONFIG.ROUND_TIME);

  startTimer(GAME_CONFIG.ROUND_TIME, () => {
    finishRound();
  });

  return true;
}

// =====================================================
// INICIAR PRÓXIMA RODADA
// =====================================================

export async function startNextRound() {
  const room = getCurrentRoom();

  if (!room) {
    console.error("Sala atual não encontrada.");

    return false;
  }

  if (gameState.round >= gameState.totalRounds) {
    await finishGame();

    return false;
  }

  const nextRound = gameState.round + 1;

  const nextLetter = drawLetter();

  gameState.round = nextRound;

  gameState.status = "playing";

  gameState.currentLetter = nextLetter;

  gameState.roundFinished = false;

  gameState.answers = {};

  // -------------------------------------------------
  // SINCRONIZAR FIRESTORE
  // -------------------------------------------------

  try {
    await updateRoom(room.id, {
      status: "playing",

      currentRound: nextRound,

      currentLetter: nextLetter,
    });
  } catch (error) {
    console.error("Erro ao sincronizar próxima rodada:", error);

    return false;
  }

  // -------------------------------------------------
  // ATUALIZAR INTERFACE
  // -------------------------------------------------

  updateRoundDisplay(nextRound);

  updateLetterDisplay(nextLetter);

  prepareRoundInterface();

  resetTimer(GAME_CONFIG.ROUND_TIME);

  startTimer(GAME_CONFIG.ROUND_TIME, () => {
    finishRound();
  });

  return true;
}

// =====================================================
// FINALIZAR RESPOSTAS DO JOGADOR
// =====================================================

export function submitAnswers() {
  if (gameState.status !== "playing") {
    return false;
  }

  if (gameState.roundFinished) {
    return false;
  }

  const player = getCurrentPlayer();

  if (!player) {
    console.error("Jogador atual não encontrado.");

    return false;
  }

  const answers = getAnswers();

  gameState.answers[player.id] = {
    playerId: player.id,

    playerName: player.name,

    answers,
  };

  disableAnswers();

  stopTimer();

  finishRound();

  return true;
}

// =====================================================
// FINALIZAR RODADA
// =====================================================

export async function finishRound() {
  if (gameState.roundFinished) {
    return;
  }

  gameState.roundFinished = true;

  gameState.status = "voting";

  stopTimer();

  disableAnswers();

  document.dispatchEvent(
    new CustomEvent("game:round-finished", {
      detail: {
        round: gameState.round,

        letter: gameState.currentLetter,

        answers: gameState.answers,
      },
    }),
  );
}

// =====================================================
// FINALIZAR PARTIDA
// =====================================================

export async function finishGame() {
  stopTimer();

  gameState.status = "finished";

  setRoomStatus("finished");

  const room = getCurrentRoom();

  if (room) {
    try {
      await updateRoom(room.id, {
        status: "finished",
      });
    } catch (error) {
      console.error("Erro ao sincronizar fim da partida:", error);
    }
  }

  document.dispatchEvent(
    new CustomEvent("game:finished", {
      detail: {
        ...gameState,
      },
    }),
  );
}

// =====================================================
// APLICAR ESTADO RECEBIDO DO FIRESTORE
// =====================================================

export function applyRemoteGameState(room) {
  if (!room) {
    return;
  }

  const remoteRound = Number(room.currentRound || 0);

  const remoteLetter = room.currentLetter || null;

  const remoteStatus = room.status || "waiting";

  gameState.round = remoteRound;

  gameState.currentLetter = remoteLetter;

  gameState.status = remoteStatus;

  gameState.totalRounds = Number(room.totalRounds || GAME_CONFIG.TOTAL_ROUNDS);

  gameState.roundFinished = false;

  // -------------------------------------------------
  // SALA AGUARDANDO
  // -------------------------------------------------

  if (remoteStatus === "waiting") {
    stopTimer();

    return;
  }

  // -------------------------------------------------
  // PARTIDA FINALIZADA
  // -------------------------------------------------

  if (remoteStatus === "finished") {
    stopTimer();

    return;
  }

  // -------------------------------------------------
  // PARTIDA EM ANDAMENTO
  // -------------------------------------------------

  if (remoteStatus === "playing" && remoteRound > 0 && remoteLetter) {
    updateRoundDisplay(remoteRound);

    updateLetterDisplay(remoteLetter);

    prepareRoundInterface();

    resetTimer(Number(room.roundTime || GAME_CONFIG.ROUND_TIME));

    startTimer(Number(room.roundTime || GAME_CONFIG.ROUND_TIME), () => {
      finishRound();
    });
  }
}

// =====================================================
// VERIFICAR SE A PARTIDA TERMINOU
// =====================================================

export function isGameFinished() {
  return gameState.round >= gameState.totalRounds;
}

// =====================================================
// OBTER LETRA ATUAL
// =====================================================

export function getCurrentLetter() {
  return gameState.currentLetter;
}

// =====================================================
// OBTER RODADA ATUAL
// =====================================================

export function getCurrentRound() {
  return gameState.round;
}

// =====================================================
// OBTER RESPOSTAS DO JOGADOR
// =====================================================

export function getPlayerAnswers(playerId) {
  return gameState.answers[playerId]?.answers || null;
}
