// =====================================================
// SISTEMA DE PONTUAÇÃO
// =====================================================

import { normalizeText } from "../js/utils.js";
import { SCORE_VALUES } from "../js/constants.js";

// =====================================================
// OBTER PONTOS DE UMA RESPOSTA
// =====================================================

export function getPointsForAnswer({ valid, duplicated = false }) {
  // Resposta inválida
  if (!valid) {
    return SCORE_VALUES.INVALID;
  }

  // Resposta válida, mas repetida
  if (duplicated) {
    return SCORE_VALUES.DUPLICATE;
  }

  // Resposta válida e única
  return SCORE_VALUES.UNIQUE;
}

// =====================================================
// ENCONTRAR RESPOSTAS REPETIDAS
// =====================================================

export function findDuplicates(answersByPlayer) {
  const duplicates = {};

  if (!answersByPlayer || typeof answersByPlayer !== "object") {
    return duplicates;
  }

  const categories = {};

  // -------------------------------------------------
  // ORGANIZAR RESPOSTAS POR CATEGORIA
  // -------------------------------------------------

  Object.entries(answersByPlayer).forEach(([playerId, answers]) => {
    if (!answers || typeof answers !== "object") {
      return;
    }

    Object.entries(answers).forEach(([categoryId, answerData]) => {
      if (!answerData || !answerData.answer) {
        return;
      }

      if (!answerData.valid) {
        return;
      }

      const normalizedAnswer = normalizeText(answerData.answer);

      if (!normalizedAnswer) {
        return;
      }

      if (!categories[categoryId]) {
        categories[categoryId] = {};
      }

      if (!categories[categoryId][normalizedAnswer]) {
        categories[categoryId][normalizedAnswer] = [];
      }

      categories[categoryId][normalizedAnswer].push(playerId);
    });
  });

  // -------------------------------------------------
  // SELECIONAR APENAS REPETIDAS
  // -------------------------------------------------

  Object.entries(categories).forEach(([categoryId, answers]) => {
    Object.entries(answers).forEach(([answer, players]) => {
      if (players.length > 1) {
        if (!duplicates[categoryId]) {
          duplicates[categoryId] = {};
        }

        duplicates[categoryId][answer] = players;
      }
    });
  });

  return duplicates;
}

// =====================================================
// VERIFICAR SE UMA RESPOSTA É DUPLICADA
// =====================================================

export function isDuplicateAnswer({
  playerId,
  categoryId,
  answer,
  duplicates,
}) {
  if (!answer || !duplicates || !duplicates[categoryId]) {
    return false;
  }

  const normalizedAnswer = normalizeText(answer);

  const players = duplicates[categoryId][normalizedAnswer];

  if (!Array.isArray(players)) {
    return false;
  }

  return players.includes(playerId);
}

// =====================================================
// CALCULAR PONTUAÇÃO DE UMA RODADA
// =====================================================

export function calculateRoundScores(answersByPlayer) {
  const scores = {};

  const duplicates = findDuplicates(answersByPlayer);

  // -------------------------------------------------
  // ANALISAR CADA JOGADOR
  // -------------------------------------------------

  Object.entries(answersByPlayer).forEach(([playerId, answers]) => {
    let total = 0;

    const categories = {};

    Object.entries(answers || {}).forEach(([categoryId, answerData]) => {
      // ---------------------------------
      // RESPOSTA AUSENTE
      // ---------------------------------

      if (!answerData || !answerData.answer) {
        categories[categoryId] = {
          points: SCORE_VALUES.INVALID,

          status: "invalid",

          duplicated: false,
        };

        return;
      }

      const valid = answerData.valid === true;

      const duplicated =
        valid &&
        isDuplicateAnswer({
          playerId,

          categoryId,

          answer: answerData.answer,

          duplicates,
        });

      const points = getPointsForAnswer({
        valid,

        duplicated,
      });

      total += points;

      categories[categoryId] = {
        points,

        status: !valid ? "invalid" : duplicated ? "duplicate" : "unique",

        duplicated,
      };
    });

    scores[playerId] = {
      total,

      categories,
    };
  });

  return scores;
}

// =====================================================
// SOMAR PONTUAÇÃO AO PLACAR ATUAL
// =====================================================

export function applyRoundScores(scoreboard, roundScores) {
  if (!scoreboard || !roundScores) {
    return scoreboard;
  }

  Object.entries(roundScores).forEach(([playerId, result]) => {
    if (!scoreboard[playerId]) {
      return;
    }

    scoreboard[playerId].score += result.total || 0;
  });

  return scoreboard;
}

// =====================================================
// OBTER RANKING
// =====================================================

export function getRanking(scoreboard) {
  if (!scoreboard) {
    return [];
  }

  return Object.values(scoreboard).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Desempate:
    // quem chegou primeiro
    // continua na frente.

    return 0;
  });
}

// =====================================================
// OBTER VENCEDOR
// =====================================================

export function getWinnerFromScoreboard(scoreboard) {
  const ranking = getRanking(scoreboard);

  if (ranking.length === 0) {
    return null;
  }

  return ranking[0];
}
