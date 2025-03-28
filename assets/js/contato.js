// Função para capturar o envio do formulário
document.getElementById('formContato').addEventListener('submit', function(e) {
    e.preventDefault();  // Impede o envio padrão do formulário

    // Captura os valores dos campos
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const mensagem = document.getElementById('mensagem').value;

    // Criação do objeto com os dados
    const dados = {
        nome: nome,
        email: email,
        mensagem: mensagem
    };

    // Enviar via fetch (AJAX)
    fetch('https://formspree.io/f/xrbglbod', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())  // Quando a resposta for recebida
    .then(data => {
        console.log('Sucesso:', data);
        alert('Mensagem enviada com sucesso!');
        // Limpa os campos após envio
        document.getElementById('formContato').reset();
    })
    .catch((error) => {
        console.error('Erro:', error);
        alert('Houve um erro ao enviar a mensagem.');
    });
});




 
    

// Seleciona o elemento pai e o span
// Seleciona o elemento pai e o span
const btnForm = document.querySelector('.btn-form');
const spanElement = btnForm.querySelector('span');

// Aplica os estilos no elemento pai




// Aplica os estilos no span (apenas para garantir)

spanElement.style.display = 'inline';

// Aplica os estilos no span

spanElement.style.whiteSpace = 'nowrap'; // Evita quebra de linha


    

// Aplica os estilos no elemento pai




// Aplica os estilos no span (apenas para garantir)

spanElement.style.display = 'inline';

// Aplica os estilos no span




    






