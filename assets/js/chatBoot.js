let inactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos

// Função para enviar a mensagem do usuário ao backend
async function sendMessage(event) {
  if (event.key === "Enter") {
    const inputField = document.getElementById("chatbot-input");
    const userMessage = inputField.value.trim();
    if (!userMessage) return; // Ignorar mensagens vazias

    appendMessage(userMessage, "user");
    inputField.value = "";

    resetInactivityTimer(); // Reseta o timer de inatividade ao enviar mensagem

    try {
      const response = await fetch("https://angel-cosmeticos.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensagem: userMessage }),  // Note "mensagem"
      });

      const data = await response.json();

      if (data.resposta) {
        appendMessage(data.resposta, "bot");
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
  const messageElement = document.createElement("p");
  messageElement.className = sender === "user" ? "user-message" : "bot-message";
  messageElement.textContent = content;
  chatbotBody.appendChild(messageElement);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Função para abrir/fechar o chatbot
function toggleChat() {
  const chatbotWindow = document.getElementById("chatbot-window");
  if (chatbotWindow.style.display === "none" || chatbotWindow.style.display === "") {
    chatbotWindow.style.display = "block";
    resetInactivityTimer(); // Reinicia timer ao abrir o chat
  } else {
    chatbotWindow.style.display = "none";
    clearTimeout(inactivityTimer); // Para timer ao fechar
  }
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
  chatbotBody.innerHTML = ''; // Limpa as mensagens do chatbot
  console.log("Chat fechado por inatividade.");
}
