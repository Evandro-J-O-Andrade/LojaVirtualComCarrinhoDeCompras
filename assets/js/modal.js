const modal = document.getElementById("imagemModal");
const imgExpandida = document.getElementById("imgExpandida");
const descricao = document.getElementById("descricao");
const fechar = document.querySelector(".fechar");
const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");

const imagens = Array.from(document.querySelectorAll(".galeria-eventos .evento img"));
let imagemAtualIndex = 0;

// Abre o modal com a imagem selecionada
imagens.forEach((img, index) => {
    img.addEventListener("click", () => {
        imagemAtualIndex = index;
        mostrarImagem(imagemAtualIndex);
        modal.style.display = "block";
    });
});

// Fecha o modal
fechar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Mostra a imagem no modal
function mostrarImagem(index) {
    imgExpandida.src = imagens[index].src;
    descricao.textContent = imagens[index].alt;
}

// Navegar para a imagem anterior
anterior.addEventListener("click", () => {
    imagemAtualIndex = (imagemAtualIndex - 1 + imagens.length) % imagens.length;
    mostrarImagem(imagemAtualIndex);
});

// Navegar para a próxima imagem
proximo.addEventListener("click", () => {
    imagemAtualIndex = (imagemAtualIndex + 1) % imagens.length;
    mostrarImagem(imagemAtualIndex);
});

// Fechar modal ao clicar fora da imagem
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
