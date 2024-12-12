let imagens = document.querySelectorAll('.galeria-eventos img'); // Todas as imagens da galeria
let indexImagemAtual = -1; // Inicializa com um valor inválido

function abrirImagem(imagem) {
    const modal = document.getElementById('modal');
    const imagemModal = document.getElementById('imagemModal');

    // Exibe o modal
    modal.style.display = "block";

    // Define a imagem que foi clicada no modal
    imagemModal.src = imagem.src;

    // Encontra o índice da imagem clicada
    indexImagemAtual = Array.from(imagens).indexOf(imagem);
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.style.display = "none";
}

function moverImagem(direcao) {
    // Atualiza o índice da imagem
    indexImagemAtual += direcao;

    // Garante que o índice circule entre as imagens
    if (indexImagemAtual < 0) {
        indexImagemAtual = imagens.length - 1;
    } else if (indexImagemAtual >= imagens.length) {
        indexImagemAtual = 0;
    }

    // Atualiza a imagem no modal
    const imagemModal = document.getElementById('imagemModal');
    imagemModal.src = imagens[indexImagemAtual].src;
}
