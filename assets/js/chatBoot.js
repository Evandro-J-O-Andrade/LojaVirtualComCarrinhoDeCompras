let inactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos
// Função para enviar a mensagem do usuário ao backend
async function sendMessage(event) {
  // Verifica se a tecla pressionada foi "Enter"
  if (event.key === "Enter") {
    const inputField = document.getElementById("chatbot-input");
    const userMessage = inputField.value.trim();
    if (!userMessage) return; // Ignorar mensagens vazias

    // Exibe a mensagem do usuário no chatbot
    appendMessage(userMessage, "user");

    // Limpa o campo de entrada
    inputField.value = "";

    // Envia a mensagem para o servidor e obtém a resposta
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (data.reply) {
        appendMessage(data.reply, "bot");
      } else {
        appendMessage("Desculpe, não entendi sua solicitação.", "bot");
      }
    } catch (error) {
      appendMessage("Erro ao se conectar ao servidor.", "bot");
      console.error("Erro:", error);
    }
  }
}

// Função para adicionar mensagens ao corpo do chatbot
function appendMessage(content, sender) {
  const chatbotBody = document.getElementById("chatbot-body");

  // Cria um elemento <p> para a mensagem
  const messageElement = document.createElement("p");
  messageElement.className = sender === "user" ? "user-message" : "bot-message";
  messageElement.textContent = content;

  // Adiciona a mensagem ao chatbot
  chatbotBody.appendChild(messageElement);

  // Scroll automático para a mensagem mais recente
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Função para abrir/fechar o chatbot
function toggleChat() {
  const chatbotWindow = document.getElementById("chatbot-window");
  chatbotWindow.style.display =
    chatbotWindow.style.display === "none" ? "block" : "none";
}
// Função para resetar o temporizador de inatividade
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(closeChatAfterInactivity, INACTIVITY_TIMEOUT);
}

// Função para fechar o chat após 5 minutos de inatividade
function closeChatAfterInactivity() {
  const chatWindow = document.getElementById('chatbot-window');
  chatWindow.style.display = 'none'; // Fecha o chatbot
  const chatbotBody = document.getElementById('chatbot-body');
  chatbotBody.innerHTML = ''; // Limpa o texto do chatbot
  console.log("Chat fechado por inatividade.");
}