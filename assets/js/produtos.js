document.addEventListener("DOMContentLoaded", function () {
    const produtos = [
        { id: 1, nome: "Produto 1 em Promoção", imagem: "/assets/img/produto-1.jpg", preco: 110, classificacao: 5, promocao: true, novidade: false, estoque: 10 },
        { id: 2, nome: "Produto 2", imagem: "/assets/img/produto-2.jpg", preco: 150, classificacao: 4, promocao: false, novidade: true, estoque: 0 },
        { id: 3, nome: "Produto 3", imagem: "/assets/img/produto-3.jpg", preco: 90, classificacao: 3, promocao: false, novidade: false, estoque: 5 },
        { id: 4, nome: "Produto 4", imagem: "/assets/img/produto-4.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 5, nome: "Produto 5", imagem: "/assets/img/produto-5.jpg", preco: 110, classificacao: 5, promocao: true, novidade: false, estoque: 10 },
        { id: 6, nome: "Produto 6", imagem: "/assets/img/produto-6.jpg", preco: 150, classificacao: 4, promocao: false, novidade: true, estoque: 0 },
        { id: 7, nome: "Produto 7", imagem: "/assets/img/produto-7.jpg", preco: 90, classificacao: 3, promocao: false, novidade: false, estoque: 5 },
        { id: 8, nome: "Produto 8", imagem: "/assets/img/produto-8.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 9, nome: "Produto 9", imagem: "/assets/img/produto-9.jpg", preco: 110, classificacao: 5, promocao: true, novidade: false, estoque: 10 },
        { id: 10, nome: "Produto 10", imagem: "/assets/img/produto-10.jpg", preco: 150, classificacao: 4, promocao: false, novidade: true, estoque: 0 },
        { id: 11, nome: "Produto 11", imagem: "/assets/img/produto-11.jpg", preco: 90, classificacao: 3, promocao: false, novidade: false, estoque: 5 },
        { id: 12, nome: "Produto 12", imagem: "/assets/img/produto-12.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 13, nome: "Produto 13", imagem: "/assets/img/produto-13.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 14, nome: "Produto 14", imagem: "/assets/img/produto-14.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 15, nome: "Produto 15", imagem: "/assets/img/produto-15.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 16, nome: "Produto 16", imagem: "/assets/img/produto-16.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 17, nome: "Produto 17", imagem: "/assets/img/produto-17.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 18, nome: "Produto 18", imagem: "/assets/img/produto-18.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 19, nome: "Produto 19", imagem: "/assets/img/produto-19.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        { id: 20, nome: "Produto 20", imagem: "/assets/img/produto-20.jpg", preco: 120, classificacao: 5, promocao: true, novidade: true, estoque: 3 },
        // Adicione mais produtos conforme necessário...
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
                    <button type="button" class="btn">Adicionar ao Carrinho</button>
                </form>
            `;

            // Associar o evento de clique ao botão dentro do produto
            const btnAdicionar = produtoDiv.querySelector('button');
            btnAdicionar.addEventListener('click', function (event) {
                event.preventDefault(); // Impedir o envio do formulário
                adicionarAoCarrinho(produto.id, produto.nome, produto.preco);
            });

            produtosLista.appendChild(produtoDiv);
        });
    }

    // Função para aplicar o filtro
    function aplicarFiltro() {
        const filtro = filtroSelect.value;
        let produtosFiltrados = [...produtos];

        if (filtro === "mais-comprados") {
            produtosFiltrados.sort((a, b) => b.preco - a.preco); // Exemplo: Ordenar por preço
        } else if (filtro === "mais-classificados") {
            produtosFiltrados.sort((a, b) => b.classificacao - a.classificacao);
        } else if (filtro === "menor-preco") {
            produtosFiltrados.sort((a, b) => a.preco - b.preco);
        } else if (filtro === "maior-preco") {
            produtosFiltrados.sort((a, b) => b.preco - a.preco);
        } else if (filtro === "em-promocao") {
            produtosFiltrados = produtosFiltrados.filter(produto => produto.promocao);
        } else if (filtro === "novidade") {
            produtosFiltrados = produtosFiltrados.filter(produto => produto.novidade);
        } else if (filtro === "em-estoque") {
            produtosFiltrados = produtosFiltrados.filter(produto => produto.estoque > 0);

        } else if (filtro === "por-nome") {
            produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordenar por nome
        } else if (filtro === "ordem-padrao") {
            // Filtro padrão com ID
            produtosFiltrados.sort((a, b) => a.id - b.id); // Ordena por ID ou qualquer outra lógica numérica
        }
        renderizarProdutos(produtosFiltrados);
    }


    // Função para adicionar o produto ao carrinho
    function adicionarAoCarrinho(id, nome, preco,) {
        // Exibir o alerta de sucesso
        alert(`${nome} foi adicionado ao carrinho!`);

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

        // Mostrar a exclamação no carrinho por 3 segundos
        const alertaCarrinho = document.getElementById("alertaCarrinho");
        alertaCarrinho.style.display = "inline"; // Mostrar a exclamação

        setTimeout(function () {
            alertaCarrinho.style.display = "none"; // Esconder após 3 segundos
        }, 5000);
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
            <td>${item.quantidade}</td>
            <td>R$${item.unitario.toFixed(2)}</td>
            <td>R$${(item.unitario * item.quantidade).toFixed(2)}</td>
        `;
            tabelaCarrinho.appendChild(linha);
        });
    }


    function atualizarQuantidadeCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        let quantidadeTotal = 0;
        carrinho.forEach(item => quantidadeTotal += item.quantidade);
        document.getElementById('quantidade-carrinho').textContent = quantidadeTotal;
    }

    // Chame esta função dentro de adicionarAoCarrinho e atualizarCarrinho

    // Chamar a função de renderização ao carregar a página
    renderizarProdutos(produtos);

    // Atualizar os produtos ao mudar o filtro
    // filtroSelect.addEventListener("change", aplicarFiltro);
    filtroSelect.addEventListener("change", function () {
        produtosExibidos = 0; // Resetar contagem de produtos exibidos
        aplicarFiltro();
    });

    // Chamar a função para atualizar o carrinho quando a página carregar
    atualizarCarrinho();
});
