document.addEventListener("DOMContentLoaded", () => {
    const tabelaCarrinho = document.getElementById("tabelaCarrinho");
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    let frete = 0; // Valor inicial do frete

    function getImagemProduto(id) {
        // A partir do id, você gera dinamicamente o caminho da imagem.
        // Assumindo que as imagens seguem esse padrão: produto-1.jpg, produto-2.jpg, etc.
        let imagem = `/assets/img/produto-${id}.jpg`;
    
        // Retorna a imagem gerada com base no id
        return imagem;
    }

    // Função para atualizar o carrinho na página
    function atualizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        tabelaCarrinho.innerHTML = ""; // Limpar tabela
        let subtotal = 0;

        // Adiciona cada produto à tabela
        carrinho.forEach((item, index) => {
            const linha = document.createElement("tr");

            const subtotalProduto = item.preco * item.quantidade;
            subtotal += subtotalProduto;

            // Usando a função getImagemProduto para buscar a imagem baseada no id
            const imagemProduto = getImagemProduto(item.id); // Pega a imagem com base no id do produto

            linha.innerHTML = `
                <td>
                    <img src="${imagemProduto}" alt="${item.nome}"> <!-- Usando a imagem dinâmica -->
                    <div>
                        <p>${item.nome}</p>
                        <small>Valor unitário: R$${item.preco.toFixed(2)}</small>
                        <br><a href="#" onclick="removerProduto(${index})">Remover</a>
                    </div>
                </td>
                <td>
                    <input type="number" class="quantidade" value="${item.quantidade}" min="1" 
                        data-index="${index}" data-preco="${item.preco}">
                </td>
                <td class="subtotal">R$${subtotalProduto.toFixed(2)}</td>
            `;

            tabelaCarrinho.appendChild(linha);
        });

        // Atualiza o subtotal e total
        subtotalGeral.textContent = `R$${subtotal.toFixed(2)}`;
        calcularTotal(subtotal);
    }

    // Função para calcular o total (subtotal + frete)
    function calcularTotal(subtotal) {
        // Calcula o frete com base na região usando a API ViaCEP
        const freteValor = calcularFrete();
        freteSpan.textContent = `R$ ${freteValor.toFixed(2)}`;
        totalGeral.textContent = `R$ ${(subtotal + freteValor).toFixed(2)}`;
    }

    // Atualiza os valores ao alterar a quantidade
    tabelaCarrinho.addEventListener("change", function (e) {
        if (e.target.classList.contains("quantidade")) {
            const index = e.target.getAttribute("data-index");
            const quantidade = parseInt(e.target.value);
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            if (quantidade > 0) {
                carrinho[index].quantidade = quantidade;
                localStorage.setItem("carrinho", JSON.stringify(carrinho));
                atualizarCarrinho();
            }
        }
    });

    // Função para remover produto do carrinho
    window.removerProduto = function (index) {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.splice(index, 1); // Remove o item pelo índice
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        atualizarCarrinho();
    };

    // Inicializa o carrinho ao carregar a página
    atualizarCarrinho();
});

// Função para atualizar os totais
function atualizarTotais() {
    let subtotal = 0;

    // Calcula o subtotal baseado nas quantidades
    document.querySelectorAll(".quantidade").forEach((input) => {
        const preco = parseFloat(input.dataset.preco);
        const quantidade = parseInt(input.value) || 0;
        subtotal += preco * quantidade;
    });

    // Se não houver produtos, mostra subtotal e total zerados
    if (subtotal === 0) {
        document.getElementById("subtotal-geral").textContent = `R$ 0,00`;
        document.getElementById("total-geral").textContent = `R$ 0,00`;
    } else {
        // Atualiza o subtotal
        document.getElementById("subtotal-geral").textContent = `R$ ${subtotal.toFixed(2)}`;
        // Calcula o total (subtotal + frete)
        const frete = parseFloat(document.getElementById("frete").textContent.replace("R$", "").trim()) || 0;
        const total = subtotal + frete;
        document.getElementById("total-geral").textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Função para adicionar o produto ao carrinho
function adicionarCarrinho(id) {
    // Captura os dados do produto do HTML com base no ID
    let produtoElemento = document.getElementById(id);
    let nome = produtoElemento.querySelector(".produto-nome").innerText;
    let preco = parseFloat(produtoElemento.querySelector(".produto-preco").innerText);

    // Manipula o carrinho no localStorage
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let produto = carrinho.find(item => item.id === id);

    if (produto) {
        produto.quantidade += 1; // Se o produto já estiver no carrinho, aumenta a quantidade
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }

    // Atualiza o localStorage com o novo carrinho
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${nome} adicionado ao carrinho!`);
}
