function gerarNotaFiscalPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cabeçalho da empresa
        doc.setFontSize(16);
        doc.text("Nota Fiscal - Angel Cosméticos", 105, 10, { align: "center" });
        doc.setFontSize(12);
        doc.text("CNPJ: 12.345.678/0001-99", 14, 20);
        doc.text("Endereço: Rua da Beleza, 123, Cidade dos Sonhos - SP", 14, 27);
        doc.text("Telefone: (11) 98765-4321", 14, 34);

        // Dados do cliente

         // Se você estiver buscando via API, pode usar algo assim:
        // fetch("/api/dadosCliente")
        //     .then(response => response.json())
        //     .then(cliente => {
        //         // Agora você tem os dados do cliente
        //     });
        
        const cliente = {
            nome: "Cliente Exemplo",
            cpf: "123.456.789-00",
            endereco: "Rua do Cliente, 456, Bairro Feliz - SP",
        };
        doc.text("Dados do Cliente:", 14, 44);
        doc.text(`Nome: ${cliente.nome}`, 14, 51);
        doc.text(`CPF: ${cliente.cpf}`, 14, 58);
        doc.text(`Endereço: ${cliente.endereco}`, 14, 65);

        // Recuperar o carrinho do localStorage
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produtos = [];

        carrinho.forEach((produto) => {
            const descricao = produto.nome || "Produto não informado";  // Usar produto.nome ou valor equivalente
            const valorUnitario = parseFloat(produto.preco) || 0;  // Usar produto.preco
            const quantidade = produto.quantidade || 0;
            const total = valorUnitario * quantidade;

            // Formatar valores para exibição monetária
            const valorUnitarioFormatado = `R$ ${valorUnitario.toFixed(2).replace('.', ',')}`;
            const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;

            // Adiciona ao array produtos
            produtos.push([
                descricao,
                quantidade,
                valorUnitarioFormatado,  // Agora incluindo o valor unitário formatado
                totalFormatado
            ]);
        });

        // Adicionando a tabela de produtos ao PDF
        doc.autoTable({
            head: [["Descrição", "Quantidade", "Valor Unitário", "Total"]],
            body: produtos,
            startY: 75,
            theme: "grid",
            headStyles: { fillColor: [22, 160, 133] },
            bodyStyles: { fontSize: 10 },
        });

        // Totais (pegando do DOM ou calculando)
        const subtotal = document.getElementById("subtotal-geral")?.textContent.trim() || "R$ 0,00";
        const frete = document.getElementById("frete")?.textContent.trim() || "R$ 0,00";
        const totalGeral = document.getElementById("total-geral")?.textContent.trim() || "R$ 0,00";

        // Adiciona os valores totais
        const posY = doc.previousAutoTable.finalY + 10;
        doc.text(`Subtotal: ${subtotal}`, 14, posY);
        doc.text(`Frete: ${frete}`, 14, posY + 10);
        doc.text(`Total Geral: ${totalGeral}`, 14, posY + 20);
        // Texto de agradecimento
        const posYFinal = doc.previousAutoTable.finalY + 50; // Ajusta a posição do texto de agradecimento
        doc.setFontSize(14);
        doc.text("Angel Cosméticos agradece a sua preferencia por comprar conosco!.", 105, posYFinal, { align: "center" });
        doc.setFontSize(14);
        doc.text("Sua compra será processada para o envio!!.", 105, posYFinal + 10, { align: "center" });
        // Salva o PDF
        doc.save("Nota-Fiscal.pdf");
    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    }
}
