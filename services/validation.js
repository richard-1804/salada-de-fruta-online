// =====================================================
// VALIDAÇÃO DAS RESPOSTAS
// =====================================================

import { normalizeText } from "../js/utils.js";
import { ANSWER_STATUS } from "../js/constants.js";

// =====================================================
// BANCO DE PALAVRAS
// =====================================================
//
// Será preenchido posteriormente pelos arquivos da pasta
// data/.
//
// Exemplo:
//
// {
//     comida: ["arroz", "banana", "pizza"],
//     animal: ["abelha", "cachorro", "gato"]
// }
//
// =====================================================

let wordDatabase = {};

// =====================================================
// CONFIGURAR BANCO DE PALAVRAS
// =====================================================

export function setWordDatabase(database) {
  if (!database || typeof database !== "object") {
    console.error("Banco de palavras inválido.");

    return;
  }

  wordDatabase = database;
}

// =====================================================
// OBTER BANCO DE PALAVRAS
// =====================================================

export function getWordDatabase() {
  return wordDatabase;
}

// =====================================================
// VERIFICAR SE A RESPOSTA ESTÁ VAZIA
// =====================================================

export function isEmptyAnswer(answer) {
  return typeof answer !== "string" || answer.trim().length === 0;
}

// =====================================================
// VERIFICAR PRIMEIRA LETRA
// =====================================================

export function startsWithLetter(answer, letter) {
  if (isEmptyAnswer(answer) || !letter) {
    return false;
  }

  const normalizedAnswer = normalizeText(answer);

  const normalizedLetter = normalizeText(letter);

  return normalizedAnswer.startsWith(normalizedLetter);
}

// =====================================================
// VERIFICAR SE A PALAVRA EXISTE NA CATEGORIA
// =====================================================

export function isValidWord(categoryId, answer) {
  if (isEmptyAnswer(answer)) {
    return false;
  }

  const categoryWords = wordDatabase[categoryId];

  if (!Array.isArray(categoryWords)) {
    return false;
  }

  const normalizedAnswer = normalizeText(answer);

  return categoryWords.some((word) => normalizeText(word) === normalizedAnswer);
}

// =====================================================
// VALIDAR UMA RESPOSTA
// =====================================================

export function validateAnswer({ categoryId, answer, letter }) {
  // -------------------------------------------------
  // RESPOSTA VAZIA
  // -------------------------------------------------

  if (isEmptyAnswer(answer)) {
    return {
      status: ANSWER_STATUS.INVALID,

      valid: false,

      reason: "empty",
    };
  }

  // -------------------------------------------------
  // LETRA INCORRETA
  // -------------------------------------------------

  if (!startsWithLetter(answer, letter)) {
    return {
      status: ANSWER_STATUS.INVALID,

      valid: false,

      reason: "wrong-letter",
    };
  }

  // -------------------------------------------------
  // PALAVRA NÃO ENCONTRADA
  // -------------------------------------------------

  if (!isValidWord(categoryId, answer)) {
    return {
      status: ANSWER_STATUS.INVALID,

      valid: false,

      reason: "unknown-word",
    };
  }

  // -------------------------------------------------
  // RESPOSTA VÁLIDA
  // -------------------------------------------------

  return {
    status: ANSWER_STATUS.VALID,

    valid: true,

    reason: null,
  };
}

// =====================================================
// VALIDAR TODAS AS RESPOSTAS DE UM JOGADOR
// =====================================================

export function validateAnswers(answers, letter) {
  const results = {};

  if (!answers || typeof answers !== "object") {
    return results;
  }

  Object.entries(answers).forEach(([categoryId, answer]) => {
    results[categoryId] = validateAnswer({
      categoryId,

      answer,

      letter,
    });
  });

  return results;
}

// =====================================================
// VERIFICAR RESPOSTAS DUPLICADAS
// =====================================================

export function findDuplicateAnswers(answersByPlayer) {
  const duplicates = {};

  if (!answersByPlayer || typeof answersByPlayer !== "object") {
    return duplicates;
  }

  const categoryAnswers = {};

  // -------------------------------------------------
  // SEPARAR RESPOSTAS POR CATEGORIA
  // -------------------------------------------------

  Object.entries(answersByPlayer).forEach(([playerId, answers]) => {
    if (!answers || typeof answers !== "object") {
      return;
    }

    Object.entries(answers).forEach(([categoryId, answer]) => {
      if (isEmptyAnswer(answer)) {
        return;
      }

      const normalized = normalizeText(answer);

      if (!categoryAnswers[categoryId]) {
        categoryAnswers[categoryId] = {};
      }

      if (!categoryAnswers[categoryId][normalized]) {
        categoryAnswers[categoryId][normalized] = [];
      }

      categoryAnswers[categoryId][normalized].push(playerId);
    });
  });

  // -------------------------------------------------
  // ENCONTRAR REPETIDAS
  // -------------------------------------------------

  Object.entries(categoryAnswers).forEach(([categoryId, answers]) => {
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
// VERIFICAR SE DUAS RESPOSTAS SÃO IGUAIS
// =====================================================

export function areAnswersEqual(answerA, answerB) {
  if (isEmptyAnswer(answerA) || isEmptyAnswer(answerB)) {
    return false;
  }

  return normalizeText(answerA) === normalizeText(answerB);
}
