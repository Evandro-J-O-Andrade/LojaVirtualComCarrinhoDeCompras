// Variável para controlar o timer de inatividade do usuário no chat
let inactivityTimer;

// Tempo limite para fechar o chat por inatividade (5 minutos)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos
// Função para fechar chat ao clicar fora da janela do chatbot
document.addEventListener('click', function(event) {
  const chatWindow = document.getElementById('chatbot-window');
  const botaoChat = document.getElementById('chatbot-button');

  // Se o chat estiver aberto e o clique NÃO foi dentro do chat nem no botão do chat
  if (chatWindow.style.display === 'block' &&
      !chatWindow.contains(event.target) &&
      event.target !== botaoChat) {
    chatWindow.style.display = 'none'; // Fecha a janela do chat
  }
});

// Função para abrir/fechar o chat (ligada ao botão)
function toggleChat() {
  const chatWindow = document.getElementById('chatbot-window');
  if (chatWindow.style.display === 'block') {
    chatWindow.style.display = 'none';
  } else {
    chatWindow.style.display = 'block';
    scrollToBottom(); // Sempre que abrir, vai para o fim do chat
  }
}

// Função para adicionar mensagem ao chat e rolar scroll para o fim
function appendMessage(content, sender) {
  const chatbotBody = document.getElementById('chatbot-body');
  const messageElement = document.createElement('p');
  messageElement.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageElement.textContent = content;
  chatbotBody.appendChild(messageElement);

  // Rola o scroll para a última mensagem
  scrollToBottom();
}

// Função que rola o scroll para a última mensagem
function scrollToBottom() {
  const chatbotBody = document.getElementById('chatbot-body');
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

/**
 * Envia mensagem ao backend quando o usuário pressiona a tecla Enter no input do chat
 * @param {KeyboardEvent} event - Evento do teclado
 */
async function sendMessage(event) {
  // Verifica se a tecla pressionada foi Enter
  if (event.key === "Enter") {
    // Pega o campo de input do chat
    const inputField = document.getElementById("chatbot-input");
    
    // Remove espaços em branco do texto digitado pelo usuário
    const userMessage = inputField.value.trim();
    
    // Se o input estiver vazio, não faz nada
    if (!userMessage) return;

    // Adiciona a mensagem do usuário na tela do chat
    appendMessage(userMessage, "user");
    
    // Limpa o campo de input para próxima mensagem
    inputField.value = "";

    // Esconde sugestões de perguntas, pois o usuário digitou uma mensagem
    esconderSugestoes();

    try {
      // Envia a mensagem para a API do backend via POST com JSON
      const response = await fetch("https://angel-cosmeticos.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: userMessage })
      });

      // Converte a resposta JSON do backend
      const data = await response.json();

      // Adiciona a resposta do bot no chat, ou uma mensagem padrão caso não tenha resposta
      appendMessage(data.resposta || "Desculpe, não entendi sua solicitação.", "bot");

    } catch (error) {
      // Se der erro na conexão, informa o usuário no chat
      appendMessage("Erro ao se conectar ao servidor.", "bot");
      // Também exibe o erro no console para debug
      console.error("Erro:", error);
    }
  }
}

/**
 * Envia mensagem de sugestão para o backend quando o usuário clica numa delas
 * @param {string} text - Texto da sugestão clicada
 */
function sendSuggestion(text) {
  // Adiciona a mensagem do usuário no chat
  appendMessage(text, "user");

  // Esconde as sugestões após clique
  esconderSugestoes();

  // Envia a mensagem para o backend
  fetch("https://angel-cosmeticos.onrender.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem: text })
  })
    .then(res => res.json()) // Converte a resposta para JSON
    .then(data => {
      // Adiciona resposta do bot ou mensagem padrão
      appendMessage(data.resposta || "Desculpe, sem resposta no momento.", "bot");
    })
    .catch(() => {
      // Se der erro na conexão, informa o usuário
      appendMessage("Erro ao se conectar ao servidor.", "bot");
    });
}

/**
 * Adiciona uma mensagem (do usuário ou do bot) no corpo do chat e faz scroll automático
 * @param {string} content - Texto da mensagem
 * @param {string} sender - "user" para usuário, "bot" para respostas do bot
 */
function appendMessage(content, sender) {
  // Pega a div que contém as mensagens do chat
  const chatbotBody = document.getElementById("chatbot-body");

  // Cria um parágrafo novo para a mensagem
  const messageElement = document.createElement("p");

  // Define a classe CSS de acordo com quem enviou a mensagem (usuario ou bot)
  messageElement.className = sender === "user" ? "user-message" : "bot-message";

  // Define o texto da mensagem
  messageElement.textContent = content;

  // Adiciona a mensagem no final do corpo do chat
  chatbotBody.appendChild(messageElement);

  // Faz o scroll descer para a última mensagem (scroll automático)
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

/**
 * Alterna a visibilidade da janela do chatbot
 */
function toggleChat() {
  // Pega o elemento da janela do chat
  const chatbotWindow = document.getElementById("chatbot-window");

  // Se o chat estiver fechado ou oculto, abre ele e mostra sugestões
  if (chatbotWindow.style.display === "none" || chatbotWindow.style.display === "") {
    chatbotWindow.style.display = "block";
    mostrarSugestoes();
  } else {
    // Se o chat estiver aberto, fecha ele
    chatbotWindow.style.display = "none";
  }
}

/**
 * Esconde a seção de sugestões no chat
 */
function esconderSugestoes() {
  const sugestoes = document.getElementById("chatbot-suggestions");
  if (sugestoes) {
    sugestoes.style.display = "none";
  }
}

/**
 * Mostra a seção de sugestões no chat
 */
function mostrarSugestoes() {
  const sugestoes = document.getElementById("chatbot-suggestions");
  if (sugestoes) {
    sugestoes.style.display = "block";
  }
}

/**
 * Reseta o timer de inatividade para fechar o chat
 */
function resetInactivityTimer() {
  // Limpa timer anterior, se existir
  clearTimeout(inactivityTimer);

  // Configura timer para fechar chat após tempo definido (5 minutos)
  inactivityTimer = setTimeout(closeChatAfterInactivity, INACTIVITY_TIMEOUT);
}

/**
 * Fecha o chat após o período de inatividade
 */
function closeChatAfterInactivity() {
  // Pega a janela do chat
  const chatWindow = document.getElementById('chatbot-window');

  // Oculta o chat
  chatWindow.style.display = 'none';

  // Limpa as mensagens do chat
  const chatbotBody = document.getElementById('chatbot-body');
  chatbotBody.innerHTML = '';

  // Loga no console para controle
  console.log("Chat fechado por inatividade.");
}
window.addEventListener('scroll', () => {
  const botaoChat = document.getElementById('chatbot-button');
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  // Se rolou 50% ou mais da página, mostra o botão
  if (scrollTop / docHeight >= 0.6) {
    botaoChat.style.display = 'block';
  } else {
    botaoChat.style.display = 'none';
  }
});
