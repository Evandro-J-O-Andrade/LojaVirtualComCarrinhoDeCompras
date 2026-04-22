document.addEventListener("DOMContentLoaded", function () {
    const produtosContainer = document.getElementById("produtos-container");
    const categoriaBtns = document.querySelectorAll(".categoria-btn");

    if (!produtosContainer) {
        return;
    }

    function renderizarProdutos(produtos) {
        produtosContainer.innerHTML = "";
        produtos.forEach(produto => {
            const produtoDiv = document.createElement("div");
            produtoDiv.className = "produto-card";
            produtoDiv.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2)}</p>
                <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
            `;
            produtosContainer.appendChild(produtoDiv);
        });
    }

    function adicionarAoCarrinho(id) {
        console.log("Adicionando produto", id, "ao carrinho");
    }

    window.adicionarAoCarrinho = adicionarAoCarrinho;
});