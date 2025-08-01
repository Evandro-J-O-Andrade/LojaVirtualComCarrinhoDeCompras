const modal = document.getElementById("imagemModal");
const imgExpandida = document.getElementById("imgExpandida");
const descricao = document.getElementById("descricao");
const fechar = document.querySelector(".fechar");
const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");

const imagens = Array.from(document.querySelectorAll(".galeria-eventos .evento img"));
let imagemAtualIndex = 0;
let ultimoFocoAntesModal;

// Abre o modal com a imagem selecionada
imagens.forEach((img, index) => {
    img.addEventListener("click", () => {
        ultimoFocoAntesModal = document.activeElement; // salva foco anterior
        imagemAtualIndex = index;
        mostrarImagem(imagemAtualIndex);
        modal.style.display = "block";
        modal.setAttribute("tabindex", "-1");
        modal.focus(); // foca no modal
    });
});

// Fecha o modal
fechar.addEventListener("click", () => {
    modal.style.display = "none";
    if (ultimoFocoAntesModal) ultimoFocoAntesModal.focus();
});

// Mostra a imagem no modal
function mostrarImagem(index) {
    imgExpandida.src = imagens[index].src;
    imgExpandida.alt = imagens[index].alt;
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
        if (ultimoFocoAntesModal) ultimoFocoAntesModal.focus();
    }
});

// Fechar modal com ESC e navegação com setas
document.addEventListener("keydown", (e) => {
    if (modal.style.display === "block") {
        if (e.key === "Escape") {
            modal.style.display = "none";
            if (ultimoFocoAntesModal) ultimoFocoAntesModal.focus();
        } else if (e.key === "ArrowLeft") {
            anterior.click();
        } else if (e.key === "ArrowRight") {
            proximo.click();
        }
    }
});
