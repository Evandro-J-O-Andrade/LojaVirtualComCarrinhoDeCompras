// Variável para controlar o timer de inatividade do usuário no chat
let inactivityTimer;

// Tempo limite para fechar o chat por inatividade (5 minutos)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos

// Função para fechar chat ao clicar fora da janela do chatbot
document.addEventListener('click', function(event) {
  const chatWindow = document.getElementById('chatbot-window'); // Obtém a janela do chat
  const botaoChat = document.getElementById('chatbot-button'); // Obtém o botão que abre o chat

  // Se o chat estiver aberto e o clique NÃO foi dentro do chat nem no botão do chat
  if (chatWindow.style.display === 'block' &&
      !chatWindow.contains(event.target) && // Verifica se o clique não foi dentro do chat
      event.target !== botaoChat) { // Verifica se o clique não foi no botão do chat
    chatWindow.style.display = 'none'; // Fecha a janela do chat
  }
});

// Função para abrir/fechar o chat (ligada ao botão)
function toggleChat() {
  const chatWindow = document.getElementById('chatbot-window'); // Pega a janela do chat
  if (chatWindow.style.display === 'block') { // Se o chat estiver aberto
    chatWindow.style.display = 'none'; // Fecha o chat
  } else {
    chatWindow.style.display = 'block'; // Abre o chat
    scrollToBottom(); // Vai para o fim do chat ao abrir
    mostrarSugestoes(); // Mostra as sugestões de perguntas
  }
  resetInactivityTimer(); // Reset timer ao abrir/fechar
}

// Função que rola o scroll para a última mensagem de forma suave
function scrollToBottom() {
  const chatbotBody = document.getElementById('chatbot-body');

  // Verifica se o scroll está perto do fim (ex: até 50px do final)
  const distanciaDoFim = chatbotBody.scrollHeight - chatbotBody.scrollTop - chatbotBody.clientHeight;
  
  if (distanciaDoFim < 50) {
    // Se o usuário está praticamente no final, rola suavemente para o fim
    chatbotBody.scrollTo({
      top: chatbotBody.scrollHeight,
      behavior: 'smooth'
    });
  }
  // Se não estiver no fim, não faz nada, respeitando o que o usuário está lendo
}


// Função para adicionar mensagem ao chat e rolar scroll para o fim
function appendMessage(content, sender) {
  const chatbotBody = document.getElementById('chatbot-body');

  // Distância do scroll até o fim
  const distanciaDoFim = chatbotBody.scrollHeight - chatbotBody.scrollTop - chatbotBody.clientHeight;

  // Se estiver longe do fim, significa que o usuário está lendo mensagens antigas
  if (distanciaDoFim > 50) {
    // Limpa o chat antes de adicionar a nova mensagem
    chatbotBody.innerHTML = '';
  }

  // Cria a nova mensagem
  const messageElement = document.createElement('p');
  messageElement.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageElement.textContent = content;

  chatbotBody.appendChild(messageElement);

  // Rola para o fim pra mostrar a mensagem nova
  chatbotBody.scrollTo({
    top: chatbotBody.scrollHeight,
    behavior: 'smooth'
  });

  return messageElement;
}


/**
 * Envia mensagem ao backend quando o usuário pressiona a tecla Enter no input do chat
 * @param {KeyboardEvent} event - Evento do teclado
 */
async function sendMessage(event) {
  if (event.key === "Enter") { // Só reage ao Enter
    resetInactivityTimer();

    const inputField = document.getElementById("chatbot-input"); // Input do usuário
    const userMessage = inputField.value.trim(); // Texto digitado, sem espaços extras
    if (!userMessage) return; // Não envia mensagem vazia

    appendMessage(userMessage, "user"); // Mostra mensagem do usuário no chat
    inputField.value = ""; // Limpa input para próxima mensagem
    esconderSugestoes(); // Esconde sugestões de perguntas

    // Adiciona mensagem "Digitando..." enquanto espera resposta
    const typingEl = appendMessage("Digitando...", "bot");

    try {
      // Envia mensagem para backend via POST
      const response = await fetch("https://angel-cosmeticos.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: userMessage })
      });

      const data = await response.json(); // Recebe resposta JSON

      typingEl.remove(); // Remove "Digitando..." do chat
      appendMessage(data.resposta || "Desculpe, não entendi sua solicitação.", "bot");

    } catch (error) {
      typingEl.remove();
      appendMessage("Erro ao se conectar ao servidor.", "bot");
      console.error("Erro:", error);
    }
  }
}

/**
 * Envia mensagem de sugestão para o backend quando o usuário clica numa delas
 * @param {string} text - Texto da sugestão clicada
 */
function sendSuggestion(text) {
  resetInactivityTimer();

  appendMessage(text, "user"); // Mostra mensagem do usuário
  esconderSugestoes(); // Esconde sugestões após clique

  const typingEl = appendMessage("Digitando...", "bot");

  fetch("https://angel-cosmeticos.onrender.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagem: text })
  })
    .then(res => res.json())
    .then(data => {
      typingEl.remove();
      appendMessage(data.resposta || "Desculpe, sem resposta no momento.", "bot");
    })
    .catch(() => {
      typingEl.remove();
      appendMessage("Erro ao se conectar ao servidor.", "bot");
    });
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
  clearTimeout(inactivityTimer); // Limpa timer antigo, se houver
  inactivityTimer = setTimeout(closeChatAfterInactivity, INACTIVITY_TIMEOUT); // Define novo timer
}

// Espera o DOM carregar para garantir que o botão exista
document.addEventListener('DOMContentLoaded', () => {
  const btnFecharChat = document.getElementById('chatbot-close-btn');
  if (btnFecharChat) {
    btnFecharChat.addEventListener('click', function(event) {
      event.stopPropagation(); // evita fechar por clique fora
      toggleChat();             // chama a função que fecha ou abre o chat
    });
  }

  // Resetar timer quando digitar no input
  const inputField = document.getElementById('chatbot-input');
  if (inputField) {
    inputField.addEventListener('input', resetInactivityTimer);
  }
});

/**
 * Fecha o chat após o período de inatividade
 */
function closeChatAfterInactivity() {
  const chatWindow = document.getElementById('chatbot-window'); // Janela do chat
  chatWindow.style.display = 'none'; // Fecha chat

  const chatbotBody = document.getElementById('chatbot-body');
  chatbotBody.innerHTML = ''; // Limpa mensagens do chat

  console.log("Chat fechado por inatividade.");
}

// Exibe ou oculta o botão do chatbot dependendo da posição do scroll da página
window.addEventListener('scroll', () => {
  const botaoChat = document.getElementById('chatbot-button'); // Botão do chat
  const scrollTop = window.scrollY; // Posição vertical atual
  const docHeight = document.body.scrollHeight - window.innerHeight; // Altura total da página visível

  if (scrollTop / docHeight >= 0.6) {
    botaoChat.style.display = 'block';
  } else {
    botaoChat.style.display = 'none';
  }
});
