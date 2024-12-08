document.addEventListener("DOMContentLoaded", function() {
    const produtos = [
        { id: 1, nome: "Produto 1", imagem: "/assets/img/produto-1.jpg", preco: 110, classificacao: 5 },
        { id: 2, nome: "Produto 2", imagem: "/assets/img/produto-2.jpg", preco: 150, classificacao: 4 },
        { id: 3, nome: "Produto 3", imagem: "/assets/img/produto-3.jpg", preco: 90, classificacao: 3 },
        { id: 4, nome: "Produto 4", imagem: "/assets/img/produto-4.jpg", preco: 120, classificacao: 5 },
        { id: 5, nome: "Produto 5", imagem: "/assets/img/produto-5.jpg", preco: 110, classificacao: 4 },
        { id: 6, nome: "Produto 6", imagem: "/assets/img/produto-6.jpg", preco: 140, classificacao: 5 },
        { id: 7, nome: "Produto 7", imagem: "/assets/img/produto-7.jpg", preco: 130, classificacao: 4 },
        { id: 8, nome: "Produto 8", imagem: "/assets/img/produto-8.jpg", preco: 115, classificacao: 3 }
    ];

    const produtosLista = document.getElementById("produtos-lista");
    const filtroSelect = document.getElementById("filtro-produtos");

    // Função para renderizar os produtos
    function renderizarProdutos(produtosFiltrados) {
        produtosLista.innerHTML = ''; // Limpar lista existente

        produtosFiltrados.forEach(produto => {
            const produtoDiv = document.createElement('div');
            produtoDiv.classList.add('col-4');
            produtoDiv.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h4>${produto.nome}</h4>
                <div class="classificacao">
                    ${'<ion-icon name="star"></ion-icon>'.repeat(produto.classificacao)}
                </div>
                <p>R$${produto.preco}</p>
                <form class="form-carrinho">
                    <button type="submit" class="btn" onclick="adicionarAoCarrinho(event, ${produto.id}, '${produto.nome}', ${produto.preco})">Adicionar ao Carrinho</button>
                </form>
            `;
            produtosLista.appendChild(produtoDiv);
        });
    }

    // Função para aplicar o filtro
    function aplicarFiltro() {
        const filtro = filtroSelect.value;
        let produtosFiltrados = [...produtos];

        if (filtro === "mais-comprados") {
            produtosFiltrados.sort((a, b) => b.preco - a.preco); // Exemplo, ordenando por preço
        } else if (filtro === "mais-classificados") {
            produtosFiltrados.sort((a, b) => b.classificacao - a.classificacao);
        } else if (filtro === "menor-preco") {
            produtosFiltrados.sort((a, b) => a.preco - b.preco);
        } else if (filtro === "maior-preco") {
            produtosFiltrados.sort((a, b) => b.preco - a.preco);
        }

        renderizarProdutos(produtosFiltrados);
    }
    

    // Função para adicionar o produto ao carrinho
    function adicionarAoCarrinho(event, id, nome, preco) {
        // Impedir o envio do formulário
        event.preventDefault();

        // Obter o carrinho do localStorage ou criar um novo array
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

        // Verificar se o produto já existe no carrinho
        const produtoExistente = carrinho.find(item => item.id === id);

        if (produtoExistente) {
            // Se o produto já estiver no carrinho, aumentar a quantidade
            produtoExistente.quantidade++;
        } else {
            // Caso contrário, adicionar o produto ao carrinho com quantidade 1
            carrinho.push({ id, nome, preco, quantidade: 1 });
        }

        // Salvar o carrinho atualizado no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        // Atualizar a tabela do carrinho
        atualizarCarrinho();
    }

    // Função para atualizar a tabela do carrinho
    function atualizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const tabelaCarrinho = document.getElementById('tabelaCarrinho');

        // Limpar a tabela
        tabelaCarrinho.innerHTML = '';

        // Adicionar os produtos do carrinho à tabela
        carrinho.forEach(item => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${item.nome}</td>
                <td>R$${item.preco}</td>
                <td>${item.quantidade}</td>
            `;
            tabelaCarrinho.appendChild(linha);
        });
    }
    

    // Chamar a função de renderização ao carregar a página
    renderizarProdutos(produtos);

    // Atualizar os produtos ao mudar o filtro
    filtroSelect.addEventListener("change", aplicarFiltro);

    // Chamar a função para atualizar o carrinho quando a página carregar
    atualizarCarrinho();
});
