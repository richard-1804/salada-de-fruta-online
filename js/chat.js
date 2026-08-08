// =====================================================
// CHAT DA SALA
// =====================================================

// =====================================================
// ESTADO
// =====================================================

let chatMessages = [];

let chatInitialized = false;

// =====================================================
// ELEMENTOS
// =====================================================

function getChatElements() {
  return {
    container: document.getElementById("chat-messages"),
    input: document.getElementById("chat-input"),
    form: document.getElementById("chat-form"),
    button: document.getElementById("chat-send-btn"),
  };
}

// =====================================================
// CRIAR MENSAGEM NA INTERFACE
// =====================================================

export function renderChatMessage(message) {
  const { container } = getChatElements();

  if (!container) {
    return;
  }

  const messageElement = document.createElement("div");

  messageElement.className = "chat-message";

  const sender = document.createElement("strong");

  sender.className = "chat-message-sender";

  sender.textContent = message.sender || "Jogador";

  const text = document.createElement("span");

  text.className = "chat-message-text";

  text.textContent = message.text || "";

  messageElement.appendChild(sender);

  messageElement.appendChild(text);

  container.appendChild(messageElement);

  container.scrollTop = container.scrollHeight;
}

// =====================================================
// ADICIONAR MENSAGEM
// =====================================================

export function addChatMessage(sender, text) {
  if (!text || !text.trim()) {
    return;
  }

  const message = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,

    sender: sender || "Jogador",

    text: text.trim(),

    timestamp: Date.now(),
  };

  chatMessages.push(message);

  renderChatMessage(message);
}

// =====================================================
// LIMPAR CHAT
// =====================================================

export function clearChat() {
  chatMessages = [];

  const { container } = getChatElements();

  if (!container) {
    return;
  }

  container.innerHTML = "";
}

// =====================================================
// OBTER MENSAGENS
// =====================================================

export function getChatMessages() {
  return [...chatMessages];
}

// =====================================================
// ENVIAR MENSAGEM
// =====================================================

function handleSendMessage() {
  const { input } = getChatElements();

  if (!input) {
    return;
  }

  const text = input.value.trim();

  if (!text) {
    return;
  }

  /*
   * Por enquanto utilizamos um evento.
   *
   * O Firebase será conectado posteriormente.
   */

  document.dispatchEvent(
    new CustomEvent("chat:send", {
      detail: {
        text,
      },
    }),
  );

  input.value = "";

  input.focus();
}

// =====================================================
// CONFIGURAR ENTER
// =====================================================

function handleInputKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  if (event.shiftKey) {
    return;
  }

  event.preventDefault();

  handleSendMessage();
}

// =====================================================
// INICIALIZAR CHAT
// =====================================================

export function initializeChat() {
  if (chatInitialized) {
    return;
  }

  const { form, input } = getChatElements();

  if (!form || !input) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    handleSendMessage();
  });

  input.addEventListener("keydown", handleInputKeydown);

  chatInitialized = true;
}

// =====================================================
// RECEBER MENSAGEM EXTERNA
// =====================================================

export function receiveChatMessage(message) {
  if (!message) {
    return;
  }

  chatMessages.push(message);

  renderChatMessage(message);
}
