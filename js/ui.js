// =====================================================
// INTERFACE DO JOGO
// =====================================================

// =====================================================
// TELAS DISPONÍVEIS
// =====================================================

const SCREENS = {
  HOME: "home-screen",

  LOBBY: "lobby-screen",

  GAME: "game-screen",

  VOTE: "vote-screen",

  SCORE: "score-screen",

  WINNER: "winner-screen",
};

// =====================================================
// OBTER TELA
// =====================================================

function getScreenElement(screenId) {
  return document.getElementById(screenId);
}

// =====================================================
// MOSTRAR TELA
// =====================================================

export function showScreen(screenId) {
  Object.values(SCREENS).forEach((id) => {
    const screen = getScreenElement(id);

    if (!screen) {
      return;
    }

    screen.classList.remove("active");
  });

  const target = getScreenElement(screenId);

  if (!target) {
    console.warn(`Tela "${screenId}" não encontrada.`);

    return false;
  }

  target.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  return true;
}

// =====================================================
// TELAS ESPECÍFICAS
// =====================================================

export function showHome() {
  return showScreen(SCREENS.HOME);
}

export function showLobby() {
  return showScreen(SCREENS.LOBBY);
}

export function showGame() {
  return showScreen(SCREENS.GAME);
}

export function showVote() {
  return showScreen(SCREENS.VOTE);
}

export function showScore() {
  return showScreen(SCREENS.SCORE);
}

export function showWinner() {
  return showScreen(SCREENS.WINNER);
}

// =====================================================
// ESCONDER LOADING
// =====================================================

export function hideLoading() {
  const loading = document.getElementById("loading-screen");

  if (!loading) {
    return;
  }

  loading.classList.add("hidden");

  setTimeout(() => {
    loading.style.display = "none";
  }, 300);
}

// =====================================================
// MOSTRAR LOADING
// =====================================================

export function showLoading(message = "Conectando...") {
  const loading = document.getElementById("loading-screen");

  if (!loading) {
    return;
  }

  const text = loading.querySelector("p");

  if (text) {
    text.textContent = message;
  }

  loading.style.display = "flex";

  loading.classList.remove("hidden");
}

// =====================================================
// ATUALIZAR NOME DO JOGADOR
// =====================================================

export function updatePlayerName(name) {
  const element = document.getElementById("player-name-header");

  if (!element) {
    return;
  }

  element.textContent = name || "Não conectado";
}

// =====================================================
// ATUALIZAR CÓDIGO DA SALA
// =====================================================

export function updateRoomCode(roomCode) {
  const element = document.getElementById("room-id");

  if (!element) {
    return;
  }

  element.textContent = roomCode || "---";
}

// =====================================================
// ATUALIZAR INFORMAÇÕES DO LOBBY
// =====================================================

export function updateLobbyInfo({
  players,
  maxPlayers,
  rounds,
  time,
  categories,
  letters,
}) {
  const playerElement = document.getElementById("info-players");

  const roundsElement = document.getElementById("info-rounds");

  const timeElement = document.getElementById("info-time");

  const categoriesElement = document.getElementById("info-categories");

  const lettersElement = document.getElementById("info-letters");

  if (playerElement) {
    playerElement.textContent = `${players} / ${maxPlayers}`;
  }

  if (roundsElement) {
    roundsElement.textContent = rounds;
  }

  if (timeElement) {
    timeElement.textContent = `${time} s`;
  }

  if (categoriesElement) {
    categoriesElement.textContent = categories;
  }

  if (lettersElement) {
    lettersElement.textContent = letters;
  }
}

// =====================================================
// ATUALIZAR BOTÃO DO HOST
// =====================================================

export function updateHostControls(isHost) {
  const startButton = document.getElementById("start-game-btn");

  if (!startButton) {
    return;
  }

  startButton.style.display = isHost ? "" : "none";
}

// =====================================================
// COPIAR CÓDIGO DA SALA
// =====================================================

export async function copyRoomCode(roomCode) {
  if (!roomCode) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(roomCode);

    showToast("Código da sala copiado!");

    return true;
  } catch (error) {
    console.error("Não foi possível copiar o código:", error);

    return false;
  }
}

// =====================================================
// TOAST
// =====================================================

let toastTimeout = null;

export function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");

  const toastMessage = document.getElementById("toast-message");

  if (!toast || !toastMessage) {
    return;
  }

  toastMessage.textContent = message;

  toast.classList.add("show");

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// =====================================================
// MODAL GENÉRICO
// =====================================================

export function openModal({
  title = "",
  message = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm = null,
  onCancel = null,
}) {
  const modal = document.getElementById("modal");

  const titleElement = document.getElementById("modal-title");

  const bodyElement = document.getElementById("modal-body");

  const footerElement = document.getElementById("modal-footer");

  const closeButton = document.getElementById("close-modal");

  if (!modal) {
    console.warn("Modal não encontrado.");

    return;
  }

  // -------------------------------------------------
  // TÍTULO
  // -------------------------------------------------

  if (titleElement) {
    titleElement.textContent = title;
  }

  // -------------------------------------------------
  // CONTEÚDO
  // -------------------------------------------------

  if (bodyElement) {
    bodyElement.textContent = message;
  }

  // -------------------------------------------------
  // RODAPÉ
  // -------------------------------------------------

  if (footerElement) {
    footerElement.innerHTML = "";

    // Botão cancelar
    if (cancelText) {
      const cancelButton = document.createElement("button");

      cancelButton.type = "button";

      cancelButton.className = "secondary-button";

      cancelButton.textContent = cancelText;

      cancelButton.addEventListener("click", () => {
        if (typeof onCancel === "function") {
          onCancel();
        }

        closeModal();
      });

      footerElement.appendChild(cancelButton);
    }

    // Botão confirmar
    if (confirmText) {
      const confirmButton = document.createElement("button");

      confirmButton.type = "button";

      confirmButton.className = "primary-button";

      confirmButton.textContent = confirmText;

      confirmButton.addEventListener("click", () => {
        if (typeof onConfirm === "function") {
          onConfirm();
        }

        closeModal();
      });

      footerElement.appendChild(confirmButton);
    }
  }

  // -------------------------------------------------
  // BOTÃO X
  // -------------------------------------------------

  if (closeButton) {
    closeButton.onclick = () => {
      if (typeof onCancel === "function") {
        onCancel();
      }

      closeModal();
    };
  }

  // -------------------------------------------------
  // ABRIR
  // -------------------------------------------------

  modal.classList.add("active");
}

// =====================================================
// FECHAR MODAL
// =====================================================

export function closeModal() {
  const modal = document.getElementById("modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("active");
}

// =====================================================
// HABILITAR / DESABILITAR BOTÃO
// =====================================================

export function setButtonEnabled(buttonId, enabled) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.disabled = !enabled;
}

// =====================================================
// ALTERAR TEXTO DE BOTÃO
// =====================================================

export function setButtonText(buttonId, text) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.textContent = text;
}

// =====================================================
// INICIALIZAR INTERFACE
// =====================================================

export function initializeUI() {
  showHome();
}
