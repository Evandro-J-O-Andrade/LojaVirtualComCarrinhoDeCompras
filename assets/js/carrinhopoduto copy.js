document.addEventListener("DOMContentLoaded", () => {
    const tabelaCarrinho = document.getElementById("tabelaCarrinho");
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    let frete = 0; // Valor inicial do frete

    // Função para obter os caminhos das imagens do produto e galeria com base no 'data-id' ou 'data-prdoutoid'
    function getImagemProduto(id) {
        let imagemProduto = `/assets/img/produto-${id}.jpg`;  // Caminho da imagem do produto
        let imagemGaleria = `/assets/img/galeria-${id}.jpg`;  // Caminho da imagem de galeria
        return [imagemProduto, imagemGaleria];
    }

    // Função para atualizar o carrinho
    function atualizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        tabelaCarrinho.innerHTML = ""; // Limpar tabela
        let subtotal = 0;

        // Adiciona cada produto à tabela
        carrinho.forEach((item, index) => {
            const linha = document.createElement("tr");
            const subtotalProduto = item.preco * item.quantidade;
            subtotal += subtotalProduto;

            const [imagem, imagemProduto] = getImagemProduto(item.id); // Pega os dois caminhos de imagem

            linha.innerHTML = `
                <td>
                    <img src="${imagem}" alt="${item.nome}">
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

        subtotalGeral.textContent = `R$${subtotal.toFixed(2)}`;
        calcularTotal(subtotal);
    }

    // Função para calcular o total
    function calcularTotal(subtotal) {
        const freteValor = frete; // Usar valor fixo ou lógica para calcular
        freteSpan.textContent = `R$ ${freteValor.toFixed(2)}`;
        totalGeral.textContent = `R$ ${(subtotal + freteValor).toFixed(2)}`;
    }

    // Atualiza os valores ao alterar a quantidade
    tabelaCarrinho.addEventListener("change", (e) => {
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

    // Função para adicionar produtos ao carrinho
    window.adicionarCarrinho = function (id) {
        // Captura dados de ambos os tipos de atributos
        let produtoElemento = document.querySelector(`[data-id="${id}"], [data-prdoutoid="${id}"]`);
        if (!produtoElemento) return alert("Produto não encontrado!");

        let nome = produtoElemento.querySelector(".produto-nome").innerText;
        let preco = parseFloat(produtoElemento.querySelector(".produto-preco").innerText);

        // Manipula o carrinho no localStorage
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        let produto = carrinho.find(item => item.id === id); // Usando 'data-id' ou 'data-prdoutoid'

        if (produto) {
            produto.quantidade += 1;
        } else {
            carrinho.push({ id, nome, preco, quantidade: 1 });
        }

        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        alert(`${nome} adicionado ao carrinho!`);
    };

    // Função para remover produto
    window.removerProduto = function (index) {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        atualizarCarrinho();
    };

    // Inicializa o carrinho
    atualizarCarrinho();
});
