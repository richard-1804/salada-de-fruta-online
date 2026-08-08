// =====================================================
// CONFIGURAÇÕES DA PARTIDA
// =====================================================

export const GAME_CONFIG = {
  // Quantidade máxima de jogadores em uma sala
  MAX_PLAYERS: 8,

  // Quantidade mínima de jogadores para iniciar
  MIN_PLAYERS: 1,

  // Quantidade de rodadas
  TOTAL_ROUNDS: 10,

  // Tempo de cada rodada em segundos
  ROUND_TIME: 90,

  // Quantidade máxima de caracteres para o nome
  MAX_NAME_LENGTH: 20,

  // Quantidade de caracteres do código da sala
  ROOM_CODE_LENGTH: 6,
};

// =====================================================
// CATEGORIAS
// =====================================================

export const CATEGORIES = [
  {
    id: "nome",
    name: "Nome",
    icon: "👤",
  },

  {
    id: "cep",
    name: "CEP",
    icon: "📍",
  },

  {
    id: "objeto",
    name: "Objeto",
    icon: "📦",
  },

  {
    id: "comida",
    name: "Comida",
    icon: "🍕",
  },

  {
    id: "animal",
    name: "Animal",
    icon: "🐶",
  },

  {
    id: "marca",
    name: "Marca",
    icon: "🏷️",
  },
];

// =====================================================
// LETRAS
// =====================================================

export const LETTERS = [
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
// PONTUAÇÃO
// =====================================================

export const POINTS = {
  // Resposta válida e diferente
  UNIQUE: 10,

  // Resposta válida, mas igual à de outro jogador
  DUPLICATE: 5,

  // Resposta inválida
  INVALID: 0,
};

// =====================================================
// STATUS DA RESPOSTA
// =====================================================

export const ANSWER_STATUS = {
  VALID: "valid",

  INVALID: "invalid",

  DUPLICATE: "duplicate",

  CONTESTED: "contested",
};

// =====================================================
// STATUS DA SALA
// =====================================================

export const ROOM_STATUS = {
  WAITING: "waiting",

  PLAYING: "playing",

  VOTING: "voting",

  SCORE: "score",

  FINISHED: "finished",
};

// =====================================================
// STATUS DO JOGADOR
// =====================================================

export const PLAYER_STATUS = {
  WAITING: "waiting",

  PLAYING: "playing",

  FINISHED: "finished",
};

// =====================================================
// CHAVES UTILIZADAS NO JOGO
// =====================================================

export const STORAGE_KEYS = {
  PLAYER_NAME: "salada_player_name",

  ROOM_CODE: "salada_room_code",

  PLAYER_ID: "salada_player_id",
};

export const SCORE_VALUES = {
  UNIQUE: 10,

  DUPLICATE: 5,

  INVALID: 0,
};
