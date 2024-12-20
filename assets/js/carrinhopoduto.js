document.addEventListener("DOMContentLoaded", () => {
    const tabelaCarrinho = document.getElementById("tabelaCarrinho");
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    let frete = 0; // Valor inicial do frete

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

            linha.innerHTML = `
                <td>
                    <img src="/assets/img/produto-${item.id}.jpg" alt="${item.nome}">
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

    // Função para calcular o frete com base no CEP
    function calcularFrete() {
        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        if (cep.length !== 8) {
            alert("Por favor, insira um CEP válido!");
            return 0;
        }

        // Faz uma consulta na API ViaCEP
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) {
                    alert("CEP inválido! Tente novamente.");
                    return 0;
                }

                // Exibe o endereço (opcional)
                enderecoSpan.textContent = `Endereço: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                // Calcula o frete com base na região (exemplo simplificado)
                if (data.uf === "SP" || data.uf === "RJ") {
                    frete = 20.00; // Sudeste
                } else if (data.uf === "RS" || data.uf === "SC" || data.uf === "PR") {
                    frete = 30.00; // Sul
                } else {
                    frete = 50.00; // Demais regiões
                }

                // Atualiza o valor do frete e o total
                return frete;
            })
            .catch((error) => {
                alert("Erro ao buscar o CEP. Tente novamente.");
                console.error("Erro na API ViaCEP:", error);
            });
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
