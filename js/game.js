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

    totalRounds: GAME_CONFIG.ROUNDS,

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

function updateRoundDisplay() {
  const element = document.getElementById("round-number");

  if (!element) {
    return;
  }

  element.textContent = gameState.round;
}

// =====================================================
// INICIAR PARTIDA
// =====================================================

export function startGame() {
  if (!isCurrentPlayerHost()) {
    console.warn("Somente o host pode iniciar a partida.");

    return false;
  }

  gameState.round = 0;

  gameState.status = "playing";

  gameState.answers = {};

  gameState.roundFinished = false;

  setRoomStatus("playing");

  startNextRound();

  return true;
}

// =====================================================
// INICIAR PRÓXIMA RODADA
// =====================================================

export function startNextRound() {
  if (gameState.round >= gameState.totalRounds) {
    finishGame();

    return;
  }

  gameState.round++;

  gameState.status = "playing";

  gameState.roundFinished = false;

  gameState.answers = {};

  // -------------------------------------------------
  // SORTEAR LETRA
  // -------------------------------------------------

  const letter = drawLetter();

  gameState.currentLetter = letter;

  // -------------------------------------------------
  // ATUALIZAR INTERFACE
  // -------------------------------------------------

  updateRoundDisplay();

  updateLetterDisplay(letter);

  // -------------------------------------------------
  // PREPARAR CATEGORIAS E RESPOSTAS
  // -------------------------------------------------

  const categoriesContainer = document.getElementById("categories-container");

  if (categoriesContainer) {
    renderCategories(categoriesContainer);

    setupCategoryInputs();
  }

  clearAnswers();

  enableAnswers();

  // -------------------------------------------------
  // RESETAR TIMER
  // -------------------------------------------------

  resetTimer(GAME_CONFIG.ROUND_TIME);

  // -------------------------------------------------
  // INICIAR TIMER
  // -------------------------------------------------

  startTimer(GAME_CONFIG.ROUND_TIME, () => {
    finishRound();
  });
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

export function finishRound() {
  if (gameState.roundFinished) {
    return;
  }

  gameState.roundFinished = true;

  gameState.status = "voting";

  stopTimer();

  disableAnswers();

  /*
   * Neste momento o jogo ainda não envia
   * as respostas para o Firebase.
   *
   * Quando o firebase-service estiver pronto,
   * esta função passará a sincronizar
   * as respostas entre os jogadores.
   */

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

export function finishGame() {
  stopTimer();

  gameState.status = "finished";

  setRoomStatus("finished");

  document.dispatchEvent(
    new CustomEvent("game:finished", {
      detail: {
        ...gameState,
      },
    }),
  );
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
