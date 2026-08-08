// =====================================================
// PLACAR
// =====================================================

// =====================================================
// ESTADO DO PLACAR
// =====================================================

let scoreboard = {};

// =====================================================
// RESETAR PLACAR
// =====================================================

export function resetScoreboard() {
  scoreboard = {};
}

// =====================================================
// REGISTRAR JOGADOR
// =====================================================

export function registerPlayer(playerId, playerName) {
  if (!playerId) {
    return;
  }

  if (!scoreboard[playerId]) {
    scoreboard[playerId] = {
      id: playerId,

      name: playerName || "Jogador",

      score: 0,

      rounds: 0,
    };
  } else if (playerName) {
    scoreboard[playerId].name = playerName;
  }
}

// =====================================================
// ADICIONAR PONTOS
// =====================================================

export function addPoints(playerId, points) {
  if (!scoreboard[playerId]) {
    return;
  }

  scoreboard[playerId].score += Number(points) || 0;
}

// =====================================================
// REGISTRAR RODADA
// =====================================================

export function registerRound(playerId) {
  if (!scoreboard[playerId]) {
    return;
  }

  scoreboard[playerId].rounds++;
}

// =====================================================
// OBTER PONTUAÇÃO
// =====================================================

export function getPlayerScore(playerId) {
  return scoreboard[playerId]?.score || 0;
}

// =====================================================
// OBTER PLACAR
// =====================================================

export function getScoreboard() {
  return Object.values(scoreboard).sort((a, b) => b.score - a.score);
}

// =====================================================
// OBTER JOGADOR VENCEDOR
// =====================================================

export function getWinner() {
  const players = getScoreboard();

  if (players.length === 0) {
    return null;
  }

  return players[0];
}

// =====================================================
// RENDERIZAR PLACAR
// =====================================================

export function renderScoreboard() {
  const container = document.getElementById("scoreboard");

  if (!container) {
    console.error("Container do placar não encontrado.");

    return;
  }

  container.innerHTML = "";

  const players = getScoreboard();

  if (players.length === 0) {
    const empty = document.createElement("p");

    empty.textContent = "Nenhuma pontuação registrada.";

    container.appendChild(empty);

    return;
  }

  players.forEach((player, index) => {
    const row = document.createElement("div");

    row.className = "score-player";

    // -------------------------------------------------
    // POSIÇÃO
    // -------------------------------------------------

    const position = document.createElement("span");

    position.className = "score-position";

    position.textContent = `${index + 1}º`;

    // -------------------------------------------------
    // NOME
    // -------------------------------------------------

    const name = document.createElement("strong");

    name.className = "score-name";

    name.textContent = player.name;

    // -------------------------------------------------
    // PONTOS
    // -------------------------------------------------

    const points = document.createElement("span");

    points.className = "score-points";

    points.textContent = `${player.score} pts`;

    row.appendChild(position);

    row.appendChild(name);

    row.appendChild(points);

    container.appendChild(row);
  });
}

// =====================================================
// RENDERIZAR VENCEDOR
// =====================================================

export function renderWinner() {
  const container = document.getElementById("winner-ranking");

  if (!container) {
    console.error("Ranking do vencedor não encontrado.");

    return;
  }

  container.innerHTML = "";

  const players = getScoreboard();

  if (players.length === 0) {
    return;
  }

  players.forEach((player, index) => {
    const row = document.createElement("div");

    row.className = "winner-player";

    if (index === 0) {
      row.classList.add("winner");
    }

    const position = document.createElement("span");

    position.textContent = `${index + 1}º`;

    const name = document.createElement("strong");

    name.textContent = player.name;

    const points = document.createElement("span");

    points.textContent = `${player.score} pts`;

    row.appendChild(position);

    row.appendChild(name);

    row.appendChild(points);

    container.appendChild(row);
  });
}

// =====================================================
// HISTÓRICO — APENAS RESULTADO
// =====================================================

export function createRoundHistory(roundNumber) {
  const players = getScoreboard();

  return {
    round: roundNumber,

    scores: players.map((player) => ({
      playerId: player.id,

      playerName: player.name,

      score: player.score,
    })),
  };
}

// =====================================================
// OBTER CÓPIA DO PLACAR
// =====================================================

export function getScoreboardSnapshot() {
  return structuredClone(scoreboard);
}
