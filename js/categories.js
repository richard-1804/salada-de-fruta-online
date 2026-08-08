// =====================================================
// CATEGORIAS
// =====================================================

import { CATEGORIES } from "./constants.js";

// =====================================================
// OBTER CATEGORIAS
// =====================================================

export function getCategories() {
  return CATEGORIES;
}

// =====================================================
// ENCONTRAR CATEGORIA PELO ID
// =====================================================

export function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId) || null;
}

// =====================================================
// CRIAR CARD DE CATEGORIA
// =====================================================

export function createCategoryCard(category) {
  const card = document.createElement("div");

  card.className = "category-card";

  card.dataset.category = category.id;

  card.innerHTML = `
        <div class="category-header">

            <span class="category-icon">
                ${category.icon}
            </span>

            <label for="answer-${category.id}">
                ${category.name}
            </label>

        </div>

        <input
            type="text"
            id="answer-${category.id}"
            name="${category.id}"
            class="category-input"
            maxlength="30"
            autocomplete="off"
            spellcheck="false"
            placeholder="Digite uma resposta..."
        />

        <span
            class="category-status"
            aria-live="polite">
        </span>
    `;

  return card;
}

// =====================================================
// RENDERIZAR CATEGORIAS
// =====================================================

export function renderCategories(container) {
  if (!container) {
    console.error("Container de categorias não encontrado.");

    return;
  }

  container.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const card = createCategoryCard(category);

    container.appendChild(card);
  });
}

// =====================================================
// OBTER RESPOSTAS DO FORMULÁRIO
// =====================================================

export function getAnswers() {
  const answers = {};

  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`answer-${category.id}`);

    answers[category.id] = input ? input.value.trim() : "";
  });

  return answers;
}

// =====================================================
// LIMPAR RESPOSTAS
// =====================================================

export function clearAnswers() {
  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`answer-${category.id}`);

    if (input) {
      input.value = "";

      input.disabled = false;
    }

    const card = document.querySelector(`[data-category="${category.id}"]`);

    if (card) {
      card.classList.remove("answered", "invalid", "valid");
    }

    const status = card?.querySelector(".category-status");

    if (status) {
      status.textContent = "";
    }
  });
}

// =====================================================
// BLOQUEAR RESPOSTAS
// =====================================================

export function disableAnswers() {
  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`answer-${category.id}`);

    if (input) {
      input.disabled = true;
    }
  });
}

// =====================================================
// LIBERAR RESPOSTAS
// =====================================================

export function enableAnswers() {
  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`answer-${category.id}`);

    if (input) {
      input.disabled = false;
    }
  });
}

// =====================================================
// MARCAR CATEGORIA COMO PREENCHIDA
// =====================================================

export function updateCategoryStatus(categoryId) {
  const input = document.getElementById(`answer-${categoryId}`);

  const card = document.querySelector(`[data-category="${categoryId}"]`);

  if (!input || !card) {
    return;
  }

  const hasAnswer = input.value.trim().length > 0;

  card.classList.toggle("answered", hasAnswer);
}

// =====================================================
// CONFIGURAR INDICADORES DOS CAMPOS
// =====================================================

export function setupCategoryInputs() {
  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`answer-${category.id}`);

    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      updateCategoryStatus(category.id);
    });
  });
}
