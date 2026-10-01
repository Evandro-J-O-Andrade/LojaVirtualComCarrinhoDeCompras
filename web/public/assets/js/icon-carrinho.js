// carrinho-global.js - Gerencia o carrinho no localStorage e atualiza o ícone do carrinho

// Função para ler o carrinho do localStorage, retorna array vazio se não existir
function lerCarrinho() {
  const carrinhoJSON = localStorage.getItem("carrinho");
  if (!carrinhoJSON) return [];
  try {
    return JSON.parse(carrinhoJSON);
  } catch {
    return [];
  }
}

// Função para salvar o carrinho no localStorage
function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Verifica se o carrinho está vazio (quantidade total 0)
function carrinhoVazio() {
  const carrinho = lerCarrinho();
  let totalQuantidade = 0;
  carrinho.forEach(produto => {
    totalQuantidade += produto.quantidade || 0;
  });
  return totalQuantidade === 0;
}

// Atualiza o ícone do carrinho conforme estado do carrinho
function atualizarIconeCarrinho() {
  const produtosNoCarrinho = !carrinhoVazio();
  const cartIcons = document.querySelectorAll(".cart-icon");
  cartIcons.forEach(cartIcon => {
    cartIcon.src = produtosNoCarrinho
      ? "/assets/img/carrinhocheio.png"
      : "/assets/img/carrinho2.png";
  });
}

// Adiciona um produto no carrinho (para testes)
// id: string ou número único do produto
// nome: string nome do produto
// preco: número preço unitário
function adicionarProduto(id, nome, preco) {
  let carrinho = lerCarrinho();
  const index = carrinho.findIndex(prod => prod.id === id);
  if (index !== -1) {
    // Produto já existe, incrementa quantidade
    carrinho[index].quantidade += 1;
  } else {
    // Produto novo, adiciona ao carrinho
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }
  salvarCarrinho(carrinho);
  atualizarIconeCarrinho();
}

// Remove um produto do carrinho (diminui 1 unidade, remove se quantidade 0)
function removerProduto(id) {
  let carrinho = lerCarrinho();
  const index = carrinho.findIndex(prod => prod.id === id);
  if (index !== -1) {
    carrinho[index].quantidade -= 1;
    if (carrinho[index].quantidade <= 0) {
      carrinho.splice(index, 1); // Remove produto do array
    }
    salvarCarrinho(carrinho);
    atualizarIconeCarrinho();
  }
}

// Limpa o carrinho inteiro (apaga todos os produtos)
function limparCarrinho() {
  localStorage.removeItem("carrinho");
  atualizarIconeCarrinho();
}

// Executa ao carregar a página para atualizar o ícone imediatamente
document.addEventListener("DOMContentLoaded", () => {
  atualizarIconeCarrinho();
});

// Expondo funções para uso em HTML ou console (para testes)
window.adicionarProduto = adicionarProduto;
window.removerProduto = removerProduto;
window.limparCarrinho = limparCarrinho;
window.atualizarIconeCarrinho = atualizarIconeCarrinho;
window.lerCarrinho = lerCarrinho;
window.carrinhoVazio = carrinhoVazio;
// Função para atualizar o ícone do carrinho em qualquer página