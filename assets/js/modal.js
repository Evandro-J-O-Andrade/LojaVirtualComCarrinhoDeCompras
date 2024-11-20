
    // Seleciona o modal
    const modal = document.getElementById("imagemModal");
    const imgExpandida = document.getElementById("imgExpandida");
    const descricao = document.getElementById("descricao");
    const fechar = document.querySelector(".fechar");

    // Adiciona o evento de clique para todas as imagens
    document.querySelectorAll(".galeria-eventos img").forEach((img) => {
        img.addEventListener("click", () => {
            modal.style.display = "block"; // Exibe o modal
            imgExpandida.src = img.src; // Define o src da imagem expandida
            descricao.innerText = img.alt; // Mostra o texto do atributo alt
        });
    });

    // Fecha o modal ao clicar no botão fechar
    fechar.onclick = () => {
        modal.style.display = "none";
    };

    // Fecha o modal ao clicar fora da imagem
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    };

