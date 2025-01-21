// Função para atualizar o ícone do carrinho em qualquer página

function atualizarIconeCarrinho() {
    const produtosNoCarrinho = !carrinhoVazio(); // Verifica se o carrinho tem produtos
    const cartIcons = document.querySelectorAll(".cart-icon");

    cartIcons.forEach(cartIcon => {
        if (produtosNoCarrinho) {
            cartIcon.src = "/assets/img/carrinho!.png"; // Ícone com alerta (!)
        } else {
            cartIcon.src = "/assets/img/carrinho.png"; // Ícone padrão do carrinho
        }
    });
}
function atualizarIconeCarrinho() {
    const produtosNoCarrinho = JSON.parse(localStorage.getItem('cart'))?.length > 0; // Verifica se há produtos no carrinho
    const cartIcon = document.getElementById(".cart-icon"); // Seleciona o ícone do carrinho

    if (cartIcon) {
        cartIcon.src = produtosNoCarrinho ? "/assets/img/carrinho!.png" : "/assets/img/carrinho.png"; // Atualiza o ícone
    }
}

// Atualiza o ícone automaticamente ao carregar a página
document.addEventListener("DOMContentLoaded", atualizarIconeCarrinho);
