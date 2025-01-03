document.addEventListener("DOMContentLoaded", () => {
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    let frete = 0; // Valor inicial do frete

    // Atualiza os subtotais e totais
    function atualizarTotais() {
        let subtotal = 0;

        // Para cada produto, calcular o subtotal
        document.querySelectorAll(".quantidade").forEach((input) => {
            const preco = parseFloat(input.dataset.preco); // Preço do produto
            const quantidade = parseInt(input.value) || 0; // Quantidade do produto (ou 0 se não houver valor)

            const subtotalProduto = preco * quantidade;
            input.closest("tr").querySelector(".subtotal").textContent = `R$ ${subtotalProduto.toFixed(2)}`; // Atualiza o subtotal do produto
            subtotal += subtotalProduto; // Soma ao subtotal geral
        });

        // Se não houver nenhum produto no carrinho, zera o subtotal e o total
        if (subtotal === 0) {
            subtotalGeral.textContent = `R$ 0,00`;
            totalGeral.textContent = `R$ 0,00`;
        } else {
            // Atualiza o subtotal geral
            subtotalGeral.textContent = `R$ ${subtotal.toFixed(2)}`;
            // Atualiza o total geral (com frete)
            totalGeral.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
        }
    }

    // Atualiza os valores ao alterar a quantidade
    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("change", atualizarTotais);
    });

    // Calcula o frete com base no CEP usando a API ViaCEP
    function calcularFrete() {
        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        if (cep.length !== 9) {
        
            return;
        }

        // Faz uma consulta na API ViaCEP
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) {
                    alert("CEP inválido! Tente novamente.");
                    return;
                }

                // Exibe o endereço (opcional)
                enderecoSpan.textContent = `Endereço: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                // Calcula o frete com base na região (exemplo simplificado)
                if (data.uf === "SP" || data.uf === "RJ") {
                    frete = 30.00; // Sudeste
                } else if (data.uf === "RS" || data.uf === "SC" || data.uf === "PR") {
                    frete = 50.00; // Sul
                } else {
                    frete = 70.00; // Demais regiões
                }

                // Atualiza o valor do frete e o total
                freteSpan.textContent = `R$ ${frete.toFixed(2)}`;
                atualizarTotais();
            })
            .catch((error) => {
                alert("Erro ao buscar o CEP. Tente novamente.");
                console.error("Erro na API ViaCEP:", error);
            });
    }

    // Expor a função para o botão no HTML
    window.calcularFrete = calcularFrete;

    // Atualiza os valores iniciais
    atualizarTotais();
});

// Função para remover produtos
function removerProduto(botaoRemover) {
    const linha = botaoRemover.closest("tr"); // Linha correspondente
    const precoProduto = parseFloat(linha.querySelector("td:nth-child(3)").innerText.replace("R$", "").trim()); // Preço do produto
    const quantidadeInput = linha.querySelector("input.quantidade"); // Campo de quantidade
    let quantidade = parseInt(quantidadeInput.value); // Valor da quantidade

    // Se a quantidade for maior que 1, diminui em 1
    if (quantidade > 1) {
        quantidade -= 1;
        quantidadeInput.value = quantidade;

        // Atualiza o subtotal do produto
        const subtotalProduto = precoProduto * quantidade;
        linha.querySelector(".subtotal").textContent = `R$ ${subtotalProduto.toFixed(2)}`;
    } else {
        // Se a quantidade for 1, remove a linha inteira
        linha.remove();
    }

    // Atualiza os totais
    atualizarTotais();
}
