// Função para adicionar o produto ao carrinho
function adicionarCarrinho(id, nome, preco) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let produto = carrinho.find(item => item.id === id);

    if (produto) {
        produto.quantidade += 1;  // Se o produto já estiver no carrinho, aumenta a quantidade
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }

    // Atualiza o localStorage com o novo carrinho
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${nome} adicionado ao carrinho!`);
}
