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

        // Dados do cliente (coloque valores fixos ou carregue dinamicamente se necessário)
        const cliente = {
            nome: "Cliente Exemplo",
            cpf: "123.456.789-00",
            endereco: "Rua do Cliente, 456, Bairro Feliz - SP",
        };
        doc.text("Dados do Cliente:", 14, 44);
        doc.text(`Nome: ${cliente.nome}`, 14, 51);
        doc.text(`CPF: ${cliente.cpf}`, 14, 58);
        doc.text(`Endereço: ${cliente.endereco}`, 14, 65);

        // Dados da tabela de produtos (pegando diretamente do HTML)
        const tabelaCarrinho = document.querySelector("#tabelaCarrinho");
        const linhas = tabelaCarrinho.querySelectorAll("tr");
        const produtos = [];

        linhas.forEach((linha) => {
            const colunas = linha.querySelectorAll("td");
            if (colunas.length === 4) {
                produtos.push([
                    colunas[0].textContent.trim(), // Descrição
                    colunas[1].textContent.trim(), // valorUnitario

                    colunas[2].textContent.trim(), // Quantidade
                    colunas[3].textContent.trim(), // Valor unitário
                ]);
            }
        });

        // Adiciona a tabela de produtos ao PDF
        doc.autoTable({
            head: [["Descrição", "ValorUnitario","Quantidade", "ValorTotal"]],
            body: produtos,
            startY: 75,
            theme: "grid",
            headStyles: { fillColor: [22, 160, 133] },
            bodyStyles: { fontSize: 10 },
        });

        // Totais (pegando do DOM)
        const subtotal = document.getElementById("subtotal-geral").textContent.trim();
        const frete = document.getElementById("frete").textContent.trim();
        const total = document.getElementById("total-geral").textContent.trim();

        // Adiciona os valores totais
        const posY = doc.previousAutoTable.finalY + 10;
        doc.text(`Subtotal: ${subtotal}`, 14, posY);
        doc.text(`Frete: ${frete}`, 14, posY + 10);
        doc.text(`Total Geral: ${total}`, 14, posY + 20);

        // Salva o PDF
        doc.save("Nota-Fiscal.pdf");
    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    }
}
