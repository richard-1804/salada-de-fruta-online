// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

// =====================================================
// GERAR ID ÚNICO
// =====================================================

export function generateId(length = 12) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let id = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);

    id += characters[randomIndex];
  }

  return id;
}

// =====================================================
// GERAR CÓDIGO DA SALA
// =====================================================

export function generateRoomCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);

    code += characters[randomIndex];
  }

  return code;
}

// =====================================================
// NORMALIZAR TEXTO
// =====================================================

export function normalizeText(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// =====================================================
// CAPITALIZAR TEXTO
// =====================================================

export function capitalize(text) {
  if (typeof text !== "string" || text.length === 0) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// =====================================================
// LIMITAR TEXTO
// =====================================================

export function limitText(text, maxLength) {
  if (typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
}

// =====================================================
// EMBARALHAR ARRAY
// =====================================================

export function shuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

// =====================================================
// ESCOLHER ITEM ALEATÓRIO
// =====================================================

export function randomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
}

// =====================================================
// ATRASO / DELAY
// =====================================================

export function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// =====================================================
// VERIFICAR SE É UM NÚMERO
// =====================================================

export function isNumber(value) {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    !Number.isNaN(Number(value))
  );
}

// =====================================================
// CONVERTER SEGUNDOS PARA MM:SS
// =====================================================

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));

  const minutes = Math.floor(safeSeconds / 60);

  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}
