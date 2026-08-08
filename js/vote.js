// =====================================================
// VOTAÇÃO DAS RESPOSTAS
// =====================================================

// =====================================================
// ESTADO DA VOTAÇÃO
// =====================================================

let voteState = {};

// =====================================================
// RESETAR VOTAÇÃO
// =====================================================

export function resetVote() {
  voteState = {};
}

// =====================================================
// REGISTRAR VOTO
// =====================================================

export function setVote(playerId, categoryId, status) {
  if (!playerId || !categoryId || !status) {
    return;
  }

  if (!voteState[playerId]) {
    voteState[playerId] = {};
  }

  voteState[playerId][categoryId] = status;
}

// =====================================================
// OBTER VOTO
// =====================================================

export function getVote(playerId, categoryId) {
  return voteState[playerId]?.[categoryId] || null;
}

// =====================================================
// OBTER TODOS OS VOTOS
// =====================================================

export function getAllVotes() {
  return structuredClone(voteState);
}

// =====================================================
// VERIFICAR SE TODAS AS RESPOSTAS
// FORAM VOTADAS
// =====================================================

export function hasFinishedVoting(answers) {
  if (!Array.isArray(answers)) {
    return false;
  }

  for (const answer of answers) {
    if (!answer.playerId || !answer.categoryId) {
      continue;
    }

    const vote = getVote(answer.playerId, answer.categoryId);

    if (!vote) {
      return false;
    }
  }

  return true;
}

// =====================================================
// CRIAR ELEMENTO DE UMA RESPOSTA
// =====================================================

function createVoteAnswer(answer, currentPlayerId) {
  const wrapper = document.createElement("div");

  wrapper.className = "vote-answer";

  wrapper.dataset.playerId = answer.playerId;

  wrapper.dataset.categoryId = answer.categoryId;

  // -------------------------------------------------
  // INFORMAÇÕES
  // -------------------------------------------------

  const info = document.createElement("div");

  info.className = "vote-answer-info";

  const player = document.createElement("strong");

  player.textContent = answer.playerName || "Jogador";

  const category = document.createElement("span");

  category.textContent = answer.categoryName || answer.categoryId;

  const response = document.createElement("p");

  response.textContent = answer.answer || "(Sem resposta)";

  info.appendChild(player);

  info.appendChild(category);

  info.appendChild(response);

  // -------------------------------------------------
  // BOTÕES
  // -------------------------------------------------

  const buttons = document.createElement("div");

  buttons.className = "vote-buttons";

  /*
   * O jogador não pode votar na própria resposta.
   */

  if (answer.playerId === currentPlayerId) {
    const ownAnswer = document.createElement("span");

    ownAnswer.className = "vote-own-answer";

    ownAnswer.textContent = "Sua resposta";

    buttons.appendChild(ownAnswer);
  } else {
    const validButton = document.createElement("button");

    validButton.type = "button";

    validButton.className = "vote-valid";

    validButton.textContent = "✓ Válida";

    const invalidButton = document.createElement("button");

    invalidButton.type = "button";

    invalidButton.className = "vote-invalid";

    invalidButton.textContent = "✕ Inválida";

    const contestButton = document.createElement("button");

    contestButton.type = "button";

    contestButton.className = "vote-contest";

    contestButton.textContent = "⚠ Contestar";

    validButton.addEventListener("click", () => {
      setVote(answer.playerId, answer.categoryId, "valid");

      updateVoteButtonState(buttons, "valid");
    });

    invalidButton.addEventListener("click", () => {
      setVote(answer.playerId, answer.categoryId, "invalid");

      updateVoteButtonState(buttons, "invalid");
    });

    contestButton.addEventListener("click", () => {
      setVote(answer.playerId, answer.categoryId, "contested");

      updateVoteButtonState(buttons, "contested");
    });

    buttons.appendChild(validButton);

    buttons.appendChild(invalidButton);

    buttons.appendChild(contestButton);
  }

  wrapper.appendChild(info);

  wrapper.appendChild(buttons);

  return wrapper;
}

// =====================================================
// ATUALIZAR ESTADO VISUAL DOS BOTÕES
// =====================================================

function updateVoteButtonState(buttons, status) {
  const buttonMap = {
    valid: ".vote-valid",

    invalid: ".vote-invalid",

    contested: ".vote-contest",
  };

  buttons.querySelectorAll("button").forEach((button) => {
    button.classList.remove("selected");
  });

  const selectedButton = buttons.querySelector(buttonMap[status]);

  if (selectedButton) {
    selectedButton.classList.add("selected");
  }
}

// =====================================================
// RENDERIZAR VOTAÇÃO
// =====================================================

export function renderVoting(answers, currentPlayerId) {
  const container = document.getElementById("vote-content");

  if (!container) {
    console.error("Container de votação não encontrado.");

    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(answers) || answers.length === 0) {
    const empty = document.createElement("p");

    empty.textContent = "Nenhuma resposta para votar.";

    container.appendChild(empty);

    return;
  }

  answers.forEach((answer) => {
    const element = createVoteAnswer(answer, currentPlayerId);

    container.appendChild(element);
  });
}

// =====================================================
// OBTER RESULTADO DA VOTAÇÃO
// =====================================================

export function getVotingResults() {
  const results = [];

  Object.entries(voteState).forEach(([playerId, categories]) => {
    Object.entries(categories).forEach(([categoryId, status]) => {
      results.push({
        playerId,

        categoryId,

        status,
      });
    });
  });

  return results;
}
