// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
    if (!window.fetch) {
        console.error("Fetch API não é suportada neste navegador.");
        alert("Seu navegador não suporta algumas funcionalidades deste site. Atualize seu navegador.");
        return; // Impede execução do código se fetch não estiver disponível
    }

    // Elementos da página utilizados
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    const resumoTotal = document.getElementById("total");

    let frete = 0;                      // Valor inicial do frete
    const limiteFreteGratis = 360;     // Limite para frete grátis
    let isCepValidated = false;        // Controla se o CEP foi validado
    let isPurchaseFinalized = false;   // Controla se a compra foi finalizada

    // Atualiza o ícone do carrinho com base nos produtos
    function atualizarIconeCarrinho() {
        const produtosNoCarrinho = !carrinhoVazio();
        const cartIcons = document.querySelectorAll(".cart-icon");

        cartIcons.forEach(cartIcon => {
            cartIcon.src = produtosNoCarrinho
                ? "/assets/img/carrinhocheio.png"
                : "/assets/img/carrinho2.png";
        });
    }

    // Atualiza totais e frete
    function atualizarTotais() {
        let subtotal = 0;

        document.querySelectorAll(".quantidade").forEach((input) => {
            const preco = parseFloat(input.dataset.preco);
            const quantidade = parseInt(input.value) || 0;
            const subtotalProduto = preco * quantidade;

            input.closest("tr").querySelector(".subtotal").textContent = `R$ ${subtotalProduto.toFixed(2)}`;
            subtotal += subtotalProduto;
        });

        if (subtotal >= limiteFreteGratis) {
            frete = 0;
            freteSpan.textContent = "Parabéns você ganhou frete gratis!";
            freteSpan.style.color = "green";
        } else {
            freteSpan.textContent = `R$ ${frete.toFixed(2)}`;
            freteSpan.style.color = ""; // cor padrão
        }

        subtotalGeral.textContent = `R$ ${subtotal.toFixed(2)}`;
        totalGeral.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
        resumoTotal.textContent = (subtotal + frete).toFixed(2);

        atualizarIconeCarrinho();
    }

    // Verifica se o carrinho está vazio
    function carrinhoVazio() {
        let produtosNoCarrinho = 0;
        document.querySelectorAll(".quantidade").forEach((input) => {
            produtosNoCarrinho += parseInt(input.value) || 0;
        });
        return produtosNoCarrinho === 0;
    }

    // Consulta o frete baseado no CEP
    function calcularFrete() {
        const cep = cepInput.value.replace(/\D/g, "");

        if (cep.length !== 8) return; // Não continua se o CEP for inválido

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert("CEP inválido! Tente novamente.");
                    isCepValidated = false;
                    return;
                }

                enderecoSpan.textContent = `Endereço: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                if (["SP", "RJ"].includes(data.uf)) frete = 30.00;
                else if (["RS", "SC", "PR"].includes(data.uf)) frete = 50.00;
                else frete = 70.00;

                isCepValidated = true;
                atualizarTotais();
            })
            .catch(error => {
                alert("Erro ao buscar o CEP. Tente novamente.");
                console.error("Erro na API ViaCEP:", error);
                isCepValidated = false;
            });
    }

    // Evento quando o campo perde o foco
    cepInput.addEventListener("blur", () => {
        const cep = cepInput.value.replace(/\D/g, "");

        if (cep === "" || cep.length < 8) {
            enderecoSpan.textContent = "";
            frete = 0;
            isCepValidated = false;
            freteSpan.textContent = "Digite seu CEP para calcular o frete.";
            freteSpan.style.color = "#d10000"; // vermelho
            atualizarTotais();
        } else {
            calcularFrete();
        }
    });

    // Atualiza totais ao digitar o CEP
    cepInput.addEventListener("input", () => {
        const cep = cepInput.value.replace(/\D/g, "");

        if (cep === "") {
            enderecoSpan.textContent = "";
            frete = 0;
            isCepValidated = false;
            freteSpan.textContent = "Digite seu CEP para calcular o frete.";
            freteSpan.style.color = "#d10000";
            atualizarTotais();
        }
    });

    // Atualiza totais ao alterar quantidade
    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("input", () => {
            if (isPurchaseFinalized) {
                alert("A compra já foi finalizada. Inicie uma nova compra para modificar.");
                input.value = input.defaultValue;
                return;
            }
            atualizarTotais();
        });
    });

    // Atualiza totais na primeira execução
    atualizarTotais();

    // Expõe as funções globalmente se forem usadas no HTML
    window.calcularFrete = calcularFrete;
});
