// =====================================================
// TIMER DA RODADA
// =====================================================

import { GAME_CONFIG } from "./constants.js";
import { formatTime } from "./utils.js";

// =====================================================
// ESTADO DO TIMER
// =====================================================

let timerInterval = null;

let remainingSeconds = GAME_CONFIG.ROUND_TIME;

let timerRunning = false;

// =====================================================
// ELEMENTO DO TIMER
// =====================================================

function getTimerElement() {
  return document.getElementById("timer");
}

// =====================================================
// ATUALIZAR INTERFACE
// =====================================================

function updateTimerDisplay() {
  const timerElement = getTimerElement();

  if (!timerElement) {
    return;
  }

  timerElement.textContent = formatTime(remainingSeconds);

  updateTimerState();
}

// =====================================================
// ATUALIZAR ESTADO VISUAL
// =====================================================

function updateTimerState() {
  const timerElement = getTimerElement();

  if (!timerElement) {
    return;
  }

  timerElement.classList.remove("timer-warning", "timer-danger");

  if (remainingSeconds <= 10) {
    timerElement.classList.add("timer-danger");
  } else if (remainingSeconds <= 30) {
    timerElement.classList.add("timer-warning");
  }
}

// =====================================================
// INICIAR TIMER
// =====================================================

export function startTimer(seconds = GAME_CONFIG.ROUND_TIME, onFinish = null) {
  stopTimer();

  remainingSeconds = Math.max(0, Math.floor(seconds));

  timerRunning = true;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    remainingSeconds--;

    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();

      if (typeof onFinish === "function") {
        onFinish();
      }
    }
  }, 1000);
}

// =====================================================
// PARAR TIMER
// =====================================================

export function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);

    timerInterval = null;
  }

  timerRunning = false;
}

// =====================================================
// PAUSAR TIMER
// =====================================================

export function pauseTimer() {
  if (!timerRunning) {
    return;
  }

  if (timerInterval !== null) {
    clearInterval(timerInterval);

    timerInterval = null;
  }

  timerRunning = false;
}

// =====================================================
// RETOMAR TIMER
// =====================================================

export function resumeTimer() {
  if (timerRunning || remainingSeconds <= 0) {
    return;
  }

  timerRunning = true;

  timerInterval = setInterval(() => {
    remainingSeconds--;

    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();
    }
  }, 1000);
}

// =====================================================
// RESETAR TIMER
// =====================================================

export function resetTimer(seconds = GAME_CONFIG.ROUND_TIME) {
  stopTimer();

  remainingSeconds = Math.max(0, Math.floor(seconds));

  updateTimerDisplay();
}

// =====================================================
// OBTER TEMPO RESTANTE
// =====================================================

export function getRemainingTime() {
  return remainingSeconds;
}

// =====================================================
// VERIFICAR SE ESTÁ RODANDO
// =====================================================

export function isTimerRunning() {
  return timerRunning;
}
