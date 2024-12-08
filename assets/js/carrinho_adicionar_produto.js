// Função para adicionar produto ao carrinho
function adicionarProduto(nomeProduto, precoProduto) {
    const quantidade = 1; // Defina a quantidade como 1 por padrão ou pegue de um campo de input

    // Cria um objeto com os dados para enviar via AJAX
    const dados = new FormData();
    dados.append("produto_nome", nomeProduto);
    dados.append("preco", precoProduto);
    dados.append("quantidade", quantidade);

    // Envia os dados via AJAX para o PHP
    fetch("adicionar_produto.php", {
        method: "POST",
        body: dados
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "sucesso") {
            alert("Produto adicionado ao carrinho!");
            // Atualiza a interface do carrinho (exibindo os produtos no carrinho)
            atualizarCarrinho();
        } else {
            alert("Erro ao adicionar o produto.");
        }
    })
    .catch(error => {
        console.error("Erro na requisição:", error);
    });
}

// Função para atualizar a interface do carrinho
function atualizarCarrinho() {
    // Aqui você pode implementar a lógica para buscar e exibir os produtos no carrinho
    // Por exemplo, você pode fazer uma requisição para buscar os produtos do carrinho no banco
    fetch("obter_carrinho.php")
    .then(response => response.json())
    .then(carrinho => {
        const tbody = document.querySelector('#carrinho tbody');
        tbody.innerHTML = ''; // Limpa o conteúdo da tabela

        let subtotal = 0;

        carrinho.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.produto_nome}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${(produto.preco * produto.quantidade).toFixed(2)}</td>
                <td><button onclick="removerProduto(${produto.id})">Remover</button></td>
            `;
            tbody.appendChild(row);
            subtotal += produto.preco * produto.quantidade;
        });

        document.getElementById('subtotal').textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `Total: R$ ${subtotal.toFixed(2)}`;
    })
    .catch(error => console.error("Erro ao atualizar carrinho:", error));
}

// Função para remover produto do carrinho (utiliza PHP também)
function removerProduto(produtoId) {
    const dados = new FormData();
    dados.append("produto_id", produtoId);

    fetch("remover_produto.php", {
        method: "POST",
        body: dados
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "sucesso") {
            alert("Produto removido do carrinho!");
            // Atualiza a interface do carrinho
            atualizarCarrinho();
        } else {
            alert("Erro ao remover o produto.");
        }
    })
    .catch(error => {
        console.error("Erro na requisição:", error);
    });
}

// Inicializa o carrinho ao carregar a página
atualizarCarrinho();
