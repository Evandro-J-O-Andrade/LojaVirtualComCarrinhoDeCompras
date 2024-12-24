document.addEventListener("DOMContentLoaded", () => {
    const subtotalGeral = document.getElementById("subtotal-geral");
    const totalGeral = document.getElementById("total-geral");
    const freteSpan = document.getElementById("frete");
    const cepInput = document.getElementById("cep");
    const enderecoSpan = document.getElementById("endereco");
    const resumoTotal = document.getElementById("total"); // Referência ao span de total no resumo
    let frete = 0; // Valor inicial do frete
    const limiteFreteGratis = 300; // Valor para aplicar frete grátis

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
            freteSpan.textContent = "Frete Grátis aplicado!";
        } else {
            freteSpan.textContent = `R$ ${frete.toFixed(2)}`;
        }

        // Atualiza os valores no subtotal, total e no resumo
        subtotalGeral.textContent = `R$ ${subtotal.toFixed(2)}`;
        totalGeral.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;

        // Atualiza o total dentro do resumo
        resumoTotal.textContent = (subtotal + frete).toFixed(2); // Atualiza o total no resumo
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

    // Gerar PDF
    function gerarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tabela = document.getElementById("tabela-resumo");
        doc.autoTable({ html: tabela });
        doc.save("resumo-compra.pdf");
    }

    // Gerar Excel
    function gerarExcel() {
        const tabela = document.getElementById("tabela-resumo");
        const wb = XLSX.utils.table_to_book(tabela);
        XLSX.writeFile(wb, "resumo-compra.xlsx");
    }

    // Imprimir o resumo
    function imprimirCompra() {
        const conteudoImprimir = document.getElementById("resumo-compra").outerHTML;
        const janela = window.open('', '', 'height=500, width=800');
        janela.document.write('<html><head><title>Nota Fiscal</title></head><body>');
        janela.document.write(conteudoImprimir);
        janela.document.write('</body></html>');
        janela.document.close();
        janela.print();
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
                    return;
                }

                // Exibe o endereço (opcional)
                enderecoSpan.textContent = `Endereço: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                // Calcula o frete com base na região
                if (data.uf === "SP" || data.uf === "RJ") {
                    frete = 20.00; // Sudeste
                } else if (data.uf === "RS" || data.uf === "SC" || data.uf === "PR") {
                    frete = 30.00; // Sul
                } else {
                    frete = 50.00; // Demais regiões
                }

                atualizarTotais(); // Atualiza os valores totais com o novo frete
            })
            .catch((error) => {
                alert("Erro ao buscar o CEP. Tente novamente.");
                console.error("Erro na API ViaCEP:", error);
            });

        cepInput.addEventListener("input", () => {
            if (cepInput.value.trim() === "") {
                enderecoSpan.textContent = ""; // Limpa o endereço
                frete = 0; // Zera o frete
                freteSpan.textContent = `R$ 0,00`; // Atualiza o valor do frete
                atualizarTotais(); // Atualiza os totais
            }
        });
    }

    function finalizarCompra() {
        const cep = cepInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        const total = parseFloat(totalGeral.textContent.replace("R$", "").trim()) || 0;

        // Verifica se o carrinho está vazio
        if (carrinhoVazio()) {
            alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
            return;
        }

        // Verifica se o CEP foi preenchido
        if (cep.length !== 8) {
            alert("Por favor, insira um CEP válido antes de finalizar a compra.");
            return;
        }

        alert(`Compra finalizada com sucesso! Total: R$ ${total.toFixed(2)}`);
    }

    // Expõe funções ao escopo global para uso no HTML
    window.calcularFrete = calcularFrete;
    window.finalizarCompra = finalizarCompra;
    window.gerarPDF = gerarPDF;
    window.gerarExcel = gerarExcel;
    window.imprimirCompra = imprimirCompra;

    // Atualiza os valores iniciais
    atualizarTotais();

    // Atualiza os valores ao alterar a quantidade
    document.querySelectorAll(".quantidade").forEach((input) => {
        input.addEventListener("input", atualizarTotais);
    });
});
