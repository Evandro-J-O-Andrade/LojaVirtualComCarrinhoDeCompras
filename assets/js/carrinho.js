document.addEventListener("DOMContentLoaded", () => {
    if (!window.fetch) {
        console.error("Fetch API não é suportada neste navegador.");
        alert("Seu navegador não suporta algumas funcionalidades deste site. Atualize seu navegador.");
        return; // Para evitar que o restante do código seja executado
    }


    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    const resumoTotal = document.getElementById("total"); // Referência ao span de total no resumo
    let frete = 0; // Valor inicial do frete
    const limiteFreteGratis = 360; // Valor para aplicar frete grátis

    let isCepValidated = false; // Estado para controle da validação do CEP
    let isPurchaseFinalized = false; // Estado para controle da finalização da compra
    // Atualiza o ícone do carrinho com base no estado do carrinho
    function atualizarIconeCarrinho() {
        const produtosNoCarrinho = !carrinhoVazio(); // Verifica se o carrinho tem produtos
        const cartIcons = document.querySelectorAll(".cart-icon");

        cartIcons.forEach(cartIcon => {
            if (produtosNoCarrinho) {
                cartIcon.src = "/assets/img/carrinho!.png"; // Ícone com alerta (!)
            } else {
                cartIcon.src = "/assets/img/carrinho2.png"; // Ícone padrão do carrinho
            }
        });
    }


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

        // Aplica frete grátis se o total atingir o limite
        if (subtotal >= limiteFreteGratis) {
            frete = 0; // Zera o frete
            freteSpan.textContent = "Parabéns você ganhou frete gratis!";
        } else {
            freteSpan.textContent = `R$ ${frete.toFixed(2)}`;
        }

        // Atualiza os valores no subtotal, total e no resumo
        subtotalGeral.textContent = `R$ ${subtotal.toFixed(2)}`;
        totalGeral.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;

        // Atualiza o total dentro do resumo
        resumoTotal.textContent = (subtotal + frete).toFixed(2); // Atualiza o total no resumo
        atualizarIconeCarrinho();
    }

    // Verifica se o carrinho tem produtos
    function carrinhoVazio() {
        let produtosNoCarrinho = 0;

        document.querySelectorAll(".quantidade").forEach((input) => {
            const quantidade = parseInt(input.value) || 0;
            produtosNoCarrinho += quantidade;
        });

        return produtosNoCarrinho === 0; // Retorna true se o carrinho está vazio
    }
    function gerarPDF() {
        try {
            // Capturando os dados da tabela
            const tabelaCarrinho = document.querySelector("#tabelaCarrinho");
            const linhas = tabelaCarrinho.querySelectorAll("tr");
            const produtos = [];

            // Loop para capturar os dados dos produtos
            linhas.forEach((linha) => {
                const colunas = linha.querySelectorAll("td");
                if (colunas.length === 3) {
                    const nomeProduto = colunas[0].querySelector('p').textContent.trim(); // Nome do produto
                    const quantidade = colunas[1].querySelector('input').value.trim(); // Quantidade
                    const valorUnitario = colunas[1].querySelector('input').dataset.preco; // Valor unitário
                    const subtotalProduto = (parseFloat(valorUnitario) * parseInt(quantidade)).toFixed(2); // Subtotal

                    produtos.push([
                        nomeProduto,
                        quantidade,
                        `R$ ${parseFloat(valorUnitario).toFixed(2).replace('.', ',')}`, // Valor unitário
                        `R$ ${subtotalProduto.replace('.', ',')}` // Subtotal
                    ]);
                }
            });

            // Capturando valores gerais
            const subtotal = document.getElementById("subtotal-geral").textContent.trim();
            const frete = document.getElementById("frete").textContent.trim();
            const total = document.getElementById("total-geral").textContent.trim();

            // Criando o documento PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Adicionando o título
            doc.setFontSize(16);
            doc.text("Resumo do Carrinho de Compras", 105, 20, { align: "center" });

            // Texto de agradecimento (colocado logo abaixo do título)
            doc.setFontSize(14);
            doc.text("Angel Cosméticos agradece a sua preferencia por comprar conosco!.", 105, 30, { align: "center" });
            doc.text("Sua compra será processada para o envio!!.", 105, 40, { align: "center" });

            // Adicionando a tabela de produtos ao PDF
            doc.autoTable({
                head: [["Descrição", "Quantidade", "Valor Unitário", "Total"]],
                body: produtos,
                startY: 45, // Ajuste para começar abaixo do texto de agradecimento
                theme: "grid",
                headStyles: { fillColor: [22, 160, 133] },
                bodyStyles: { fontSize: 10 },
            });

            // Adicionando informações de valores totais
            const posY = doc.previousAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.text(`Sub-Total: ${subtotal}`, 14, posY);
            doc.text(`Frete: ${frete}`, 14, posY + 7);
            doc.text(`Total Geral: ${total}`, 14, posY + 14);

            // Salvando o PDF
            doc.save("Resumo-Carrinho.pdf");
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
        }
    }



    // Funções de CEP e Finalização da Compra
    function calcularFrete() {
        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        if (cep.length !== 8) {
            return; // Não faz nada, sem alertar o usuário enquanto ele digita
        }

        // Faz a consulta na API ViaCEP
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) {
                    alert("CEP inválido! Tente novamente.");
                    isCepValidated = false;
                    return;
                }

                // Exibe o endereço (opcional)
                enderecoSpan.textContent = `Endereço: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                // Calcula o frete com base na região
                if (data.uf === "SP" || data.uf === "RJ") {
                    frete = 30.00; // Sudeste
                } else if (data.uf === "RS" || data.uf === "SC" || data.uf === "PR") {
                    frete = 50.00; // Sul
                } else {
                    frete = 70.00; // Demais regiões
                }

                isCepValidated = true; // Marca o CEP como validado
                atualizarTotais(); // Atualiza os valores totais com o novo frete
            })
            .catch((error) => {
                alert("Erro ao buscar o CEP. Tente novamente.");
                console.error("Erro na API ViaCEP:", error);
                isCepValidated = false;
            });
    }


    function mostrarMensagemFinalizada() {
        const span = document.createElement("span");
        span.textContent = "Compra finalizada! Vá para a página de produtos para uma nova compra.";

        // Estilos para centralizar o span no fim da página
        span.style.position = "fixed"; // Fixa o span na tela
        span.style.left = "50%"; // Posiciona horizontalmente no centro
        span.style.bottom = "360px"; // Posiciona 20px acima do final da página
        span.style.transform = "translateX(-50%)"; // Ajusta para o centro exato horizontalmente
        span.style.color = "red"; // Cor do texto
        span.style.fontSize = "20px"; // Tamanho da fonte
        span.style.textAlign = "center"; // Alinha o texto no centro

        document.body.appendChild(span);

        setTimeout(() => {
            span.remove();
        }, 10000); // Remover após 10 segundos
    }



    function finalizarCompra() {
        if (isPurchaseFinalized) {
            alert("A compra já foi finalizada. Inicie uma nova compra para continuar.");
            return;
        }

        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        const total = parseFloat(totalGeral.textContent.replace("R$", "").trim()) || 0;

        // Verifica se o carrinho está vazio
        if (carrinhoVazio()) {
            alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
            // Você pode adicionar um estilo ou mensagem no carrinho, por exemplo
            document.getElementById("carrinho-vazio-msg").style.display = "block";
            return;
        }


        // Verifica se o CEP foi validado
        if (!isCepValidated) {
            alert("Por favor, insira e valide um CEP antes de finalizar a compra.");
            return;
        }

        // Marca a compra como finalizada
        isPurchaseFinalized = true;
        alert(`Compra finalizada com sucesso! Total: R$ ${total.toFixed(2)}`);

        // Exibe o botão de gerar PDF/Nota Fiscal após a finalização
        document.getElementById("btnGerarPDF").style.display = "inline-block";  // Exibe o botão do PDF
        document.getElementById("btnGerarNotaFiscal").style.display = "inline-block";  // Exibe o botão da Nota Fiscal

        // Desabilita os campos de quantidade
        document.querySelectorAll(".quantidade").forEach((input) => {
            input.disabled = true; // Desabilita o campo
        });

        mostrarMensagemFinalizada();
    }



    // Atualiza quando o campo de CEP é limpo ou alterado
    cepInput.addEventListener("input", () => {
        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        if (cep.length === 8) {
            //calcularFrete(); // Valida o CEP e atualiza o frete//calcula o frete automaticamente habilite se precisar!
        } else if (cep === "") {
            // Quando o campo é limpo, zera o endereço e o frete
            enderecoSpan.textContent = ""; // Limpa o endereço exibido
            frete = 0; // Zera o valor do frete
            isCepValidated = false; // Marca o CEP como não validado
            atualizarTotais(); // Atualiza os valores totais
        }
    });

    cepInput.addEventListener("blur", () => {
        if (cepInput.value === "") {
            enderecoSpan.textContent = ""; // Limpa o endereço se o campo foi deixado vazio
            frete = 0; // Zera o frete
            isCepValidated = false; // Reseta a validação do CEP
            atualizarTotais(); // Atualiza os valores
        }
    });

    // Bloqueia alterações nas quantidades após finalização
    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("input", () => {
            if (isPurchaseFinalized) {
                alert("A compra já foi finalizada. Inicie uma nova compra para modificar.");
                input.value = input.defaultValue; // Reverte para o valor original
                return;
            }

            atualizarTotais();

        });

    });


    // Expõe funções ao escopo global para uso no HTML
    window.calcularFrete = calcularFrete;
    window.finalizarCompra = finalizarCompra;
    window.gerarPDF = gerarPDF;

    // Atualiza os valores iniciais
    atualizarTotais();
});
