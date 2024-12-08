// listaDeProdutos.js
document.addEventListener("DOMContentLoaded", function () {
    // Simula um carregamento do banco de dados
    const produtos = carregarProdutos();

    // Renderiza os produtos na tabela do carrinho
    exibirProdutosNaTabela(produtos);
});

// Função simulando produtos vindos de um banco de dados
function carregarProdutos() {
    // Aqui você pode substituir por uma chamada a um backend futuramente.
    return [
        { id: 1, nome: "Camiseta", tamanho: "M", preco: 50.0 },
        { id: 2, nome: "Calça", tamanho: "G", preco: 100.0 },
        { id: 3, nome: "Tênis", tamanho: "40", preco: 200.0 },
        { id: 4, nome: "Boné", tamanho: "Único", preco: 30.0 },
        { id: 5, nome: "Mochila", tamanho: "Padrão", preco: 150.0 },
    ];
}

// Renderiza os produtos na tabela HTML
function exibirProdutosNaTabela(produtos) {
    const tabela = document.getElementById("tabelaProdutos");
    const tbody = tabela.querySelector("tbody");

    // Limpa o corpo da tabela antes de adicionar novos itens
    tbody.innerHTML = "";

    produtos.forEach((produto) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.tamanho}</td>
            <td>R$${produto.preco.toFixed(2)}</td>
            <td><button onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button></td>
        `;

        tbody.appendChild(linha);
    });
}

// Adiciona o produto ao carrinho
function adicionarAoCarrinho(produtoId) {
    const produtos = carregarProdutos();
    const produto = produtos.find((p) => p.id === produtoId);

    if (!produto) return alert("Produto não encontrado!");

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
        itemExistente.total = itemExistente.quantidade * itemExistente.preco;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1,
            total: produto.preco,
        });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${produto.nome} foi adicionado ao carrinho!`);
}
