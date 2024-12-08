document.addEventListener("DOMContentLoaded", function () {
    const formCarrinho = document.getElementById("formAdicionarCarrinho");

    formCarrinho.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Capturando os dados do produto
        const tamanho = document.getElementById("Tamanho").value;
        const quantidade = parseInt(document.getElementById("quantidade").value);
        const nomeProduto = "Blusa de frio manga longa meletinho"; // Nome fixo do produto
        const preco = 500; // Preço fixo do produto

        if (!tamanho) {
            alert("Por favor, selecione um tamanho.");
            return;
        }

        // Criar objeto do produto
        const produto = {
            nome: nomeProduto,
            preco: preco,
            tamanho: tamanho,
            quantidade: quantidade,
            total: preco * quantidade,
        };

        // Salvar no localStorage (ou sessionStorage, dependendo do objetivo)
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.push(produto);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        // Redirecionar para a página do carrinho
        alert("Produto adicionado ao carrinho!");
        window.location.href = "/assets/html/carrinho.html";
    });
});
