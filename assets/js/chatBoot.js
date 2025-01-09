let currentStep = 0;

function toggleChat() {
  const chatWindow = document.getElementById('chatbot-window');
  chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
}

function handleOption(option) {
  const chatbotBody = document.getElementById('chatbot-body');
  const suggestions = document.getElementById('chatbot-suggestions');

  // Esconde as sugestões
  suggestions.style.display = 'none';

  let response = '';
  switch (option) {
    case 1:
      response = "Você selecionou 'Login'. Como posso te ajudar com isso?";
      showNextOptions(['1 - Fazer login', '2 - Fazer logout', '3 - Cadastrar']);
      break;
    case 2:
      response = "Você selecionou 'Ver Carrinho'. O que você deseja fazer?";
      showNextOptions(['1 - Adicionar produtos', '2 - Finalizar compra']);
      break;
    case 3:
      response = "Você selecionou 'Próximos Eventos'. Aqui estão as opções:";
      showNextOptions(['1 - Ver agenda de eventos', '2 - Comprar ingressos']);
      break;
    default:
      response = "Desculpe, não entendi. Por favor, selecione uma opção válida.";
      break;
  }

  // Exibe a resposta
  appendMessage(response, 'bot');
}

function showNextOptions(options) {
  const suggestions = document.getElementById('chatbot-suggestions');
  suggestions.style.display = 'block';
  suggestions.innerHTML = ''; // Limpa as sugestões anteriores

  options.forEach((option) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => handleUserInput(option);
    suggestions.appendChild(button);
  });
}

function handleUserInput(input) {
  const chatbotBody = document.getElementById('chatbot-body');
  const p = document.createElement('p');
  p.textContent = `Você escolheu: ${input}`;

  // Aqui, tratamos as opções específicas de cada caso
  if (input === '1 - Fazer login') {
    p.textContent += " Por favor, insira suas credenciais para fazer login.";
  } else if (input === '2 - Fazer logout') {
    p.textContent += " Você foi desconectado.";
  } else if (input === '3 - Cadastrar') {
    p.textContent += " Você será direcionado para o formulário de cadastro.";
  } else if (input === '1 - Adicionar produtos') {
    p.textContent += " O que você gostaria de adicionar ao seu carrinho?";
  } else if (input === '2 - Finalizar compra') {
    p.textContent += " Você deseja finalizar sua compra?";
  } else if (input === '1 - Ver agenda de eventos') {
    p.textContent += " Aqui estão os próximos eventos.";
  } else if (input === '2 - Comprar ingressos') {
    p.textContent += " Você quer comprar ingressos para um evento?";
  }

  chatbotBody.appendChild(p);

  // Rola para o fundo da conversa
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function sendMessage(event) {
  if (event.key === 'Enter') {
    const input = document.getElementById('chatbot-input').value.trim();
    const numberInput = parseInt(input, 10); // Verifica se é um número

    if (!isNaN(numberInput)) {
      // Se o input for número, chama a função correta dependendo da entrada numérica
      handleOption(numberInput);
    } else {
      // Se for texto, chama a função de input normal
      handleUserInput(input);
    }

    document.getElementById('chatbot-input').value = ''; // Limpa o campo de entrada
  }
}

function appendMessage(message, sender) {
  const chatbotBody = document.getElementById('chatbot-body');
  const p = document.createElement('p');
  p.textContent = message;

  // Adiciona a classe para distinguir a resposta do usuário e do bot
  if (sender === 'user') {
    p.classList.add('chatbot-user');
  } else {
    p.classList.add('chatbot-bot');
  }

  chatbotBody.appendChild(p);
  chatbotBody.scrollTop = chatbotBody.scrollHeight; // Rola para o fundo
}

const chatbotbutton = document.getElementById(".chatbot-button");
// Mostra ou esconde o botão dependendo da rolagem
window.onscroll = function () {
    const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (document.documentElement.scrollTop > scrollTotal * 0.3) {
        btnTopo.style.display = "block"; // Mostra o botão
    } else {
        btnTopo.style.display = "none"; // Esconde o botão
    }
};

// Rola suavemente para o topo ao clicar no botão
btnTopo.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});