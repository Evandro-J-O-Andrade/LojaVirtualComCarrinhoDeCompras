document.addEventListener("DOMContentLoaded", () => {
    // Elementos do DOM
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    const resumoTotal = document.getElementById("total");

    // Variáveis
    let frete = 0;
    const LIMITE_FRETE_GRATIS = 360;

    // Função para formatar valores em moeda brasileira
    const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace(".", ",")}`;

    // Atualiza os totais do carrinho
    const atualizarTotais = () => {
        let subtotal = 0;

        document.querySelectorAll(".quantidade").forEach((input) => {
            const preco = parseFloat(input.dataset.preco);
            const quantidade = parseInt(input.value, 10) || 0;

            const subtotalProduto = preco * quantidade;
            input.closest("tr").querySelector(".subtotal").textContent = formatarMoeda(subtotalProduto);
            subtotal += subtotalProduto;
        });

        // Atualiza informações de frete e total
        freteSpan.textContent =
            subtotal >= LIMITE_FRETE_GRATIS
                ? "Parabéns você ganhou frete grátis!"
                : formatarMoeda(frete);

        subtotalGeral.textContent = formatarMoeda(subtotal);
        totalGeral.textContent = formatarMoeda(subtotal + frete);
        resumoTotal.textContent = formatarMoeda(subtotal + frete);
    };

    // Calcula o valor do frete com base no CEP
    const calcularFrete = async () => {
        const cep = cepInput.value.replace(/\D/g, "");

        if (cep.length !== 8) {
            enderecoSpan.textContent = "";
            frete = 0;
            atualizarTotais();
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert("CEP inválido!");
                enderecoSpan.textContent = "";
                frete = 0;
                atualizarTotais();
                return;
            }

            enderecoSpan.textContent = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

            frete = ["SP", "RJ"].includes(data.uf)
                ? 30
                : ["RS", "SC", "PR"].includes(data.uf)
                ? 50
                : 70;

            atualizarTotais();
        } catch (error) {
            console.error("Erro ao buscar o CEP:", error);
        }
    };

    // Inicializa eventos
    cepInput.addEventListener("input", () => {
        if (cepInput.value.replace(/\D/g, "").length === 8) {
            calcularFrete();
        } else {
            enderecoSpan.textContent = "";
            frete = 0;
            atualizarTotais();
        }
    });

    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("input", atualizarTotais);
    });

    // Atualiza totais ao carregar a página
    atualizarTotais();
});
