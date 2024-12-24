document.addEventListener("DOMContentLoaded", () => {
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const totalResumo = document.getElementById("total"); // Sincroniza o valor aqui
    const freteSpan = document.getElementById("frete");
    const limiteFreteGratis = 300; // Valor para aplicar frete grátis
    let frete = 0; // Valor inicial do frete

    // Atualiza os subtotais e totais
    function atualizarTotais() {
        let subtotal = 0;

        // Calcula o subtotal baseado nas quantidades
        document.querySelectorAll(".quantidade").forEach((input) => {
            const preco = parseFloat(input.dataset.preco);
            const quantidade = parseInt(input.value) || 0;

            const subtotalProduto = preco * quantidade;
            input.closest("tr").querySelector(".subtotal").textContent = `R$ ${subtotalProduto.toFixed(2)}`;
            subtotal += subtotalProduto;
        });

        // Atualiza o subtotal e total
        subtotalGeral.textContent = `R$ ${subtotal.toFixed(2)}`;
        const total = subtotal + frete;

        // Aplica frete grátis automaticamente se atingir o limite
        if (total >= limiteFreteGratis) {
            freteSpan.textContent = "Frete Grátis aplicado!";
            freteSpan.style.display = "inline"; // Mostra o texto
            frete = 0; // Zera o frete
        } else {
            freteSpan.style.display = "none"; // Esconde o texto
        }

        // Atualiza os valores totais
        totalGeral.textContent = `R$ ${total.toFixed(2)}`;
        totalResumo.textContent = total.toFixed(2); // Sincroniza o valor com o resumo
    }

    // Finalizar Compra
    window.finalizarCompra = function () {
        const total = parseFloat(totalResumo.textContent) || 0;

        if (total === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        alert(`Compra finalizada com sucesso! Total: R$ ${total.toFixed(2)}`);
        // Aqui você pode redirecionar para outra página ou salvar no banco
    };

    // Atualiza os valores iniciais
    atualizarTotais();

    // Adiciona evento para atualizar ao alterar quantidade
    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("change", atualizarTotais);
    });
});
