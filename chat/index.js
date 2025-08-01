let inactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos

// Função para enviar a mensagem do usuário ao backend
async function sendMessage(event) {
  if (event.key === "Enter") {
    const inputField = document.getElementById("chatbot-input");
    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, "user");
    inputField.value = "";

    resetInactivityTimer();

    try {
      const response = await fetch("https://angel-cosmeticos.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pergunta: userMessage }) // <-- Corrigido para 'pergunta'
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
    resetInactivityTimer();
  } else {
    chatbotWindow.style.display = "none";
    clearTimeout(inactivityTimer);
  }
}

// Timer de inatividade
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(closeChatAfterInactivity, INACTIVITY_TIMEOUT);
}

// Fecha o chat após inatividade
function closeChatAfterInactivity() {
  const chatWindow = document.getElementById('chatbot-window');
  chatWindow.style.display = 'none';
  const chatbotBody = document.getElementById('chatbot-body');
  chatbotBody.innerHTML = '';
  console.log("Chat fechado por inatividade.");
}
