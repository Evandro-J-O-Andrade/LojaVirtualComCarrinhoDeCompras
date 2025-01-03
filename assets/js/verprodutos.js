document.addEventListener("DOMContentLoaded", function () {
    const produtos = [
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
        {
            nome: "Blusa de frio manga longa meletinho",
            preco: 500,
            descricao: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda eius ipsum nam, in molestiae magni laborum iste incidunt. Iste saepe harum quisquam odio voluptatum ipsum facere fuga molestiae accusamus in.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui
    ];

    const container = document.querySelector(".corpo-categorias .linha");

    produtos.forEach(produto => {
        const produtoDiv = document.createElement("div");
        produtoDiv.className = "col-2";

        // HTML do produto com imagens e botão
        produtoDiv.innerHTML = `
            <img class="imagemProduto" src="${produto.imagens[0]}" alt="${produto.nome}" id="produtoImg">
            <div class="img-linha">
                ${produto.imagens.map(imagem => `
                    <div class="img-col">
                        <img src="${imagem}" alt="${produto.nome}" width="100%" class="protudoMiniatura">
                    </div>
                `).join('')}
            </div>
            <p>${produto.nome}</p>
            <h1>Compre com desconto</h1>
            <h4>R$${produto.preco.toFixed(2)}</h4>
            <form action="" method="post" id="formAdicionarCarrinho">
                <select name="Tamanho" id="Tamanho">
                    <option value="">Tamanho</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                    <option value="XG">XG</option>
                </select>
                <input type="number" name="quantidade" id="quantidade" value="1" min="1">
                <button type="submit" class="btn">Adicionar ao Carrinho</button>
            </form>
            <div id="feedback"></div>
            <h3>Descrição do Produto:</h3>
            <p>${produto.descricao}</p>
        `;

        container.appendChild(produtoDiv);

        // Troca de imagem principal ao clicar na miniatura
        const produtoImg = produtoDiv.querySelector("#produtoImg");
        const miniaturas = produtoDiv.querySelectorAll(".protudoMiniatura");

        miniaturas.forEach(miniatura => {
            miniatura.addEventListener("click", function () {
                produtoImg.src = this.src; // Troca a imagem principal
            });
        });

        // Adicionar produto ao carrinho ao clicar no botão
        const formCarrinho = produtoDiv.querySelector("#formAdicionarCarrinho");
        formCarrinho.addEventListener("submit", function (event) {
            event.preventDefault(); // Impede o envio do formulário

            // Captura os dados do produto
            const tamanho = produtoDiv.querySelector("#Tamanho").value;
            const quantidade = parseInt(produtoDiv.querySelector("#quantidade").value);
            const nomeProduto = produto.nome;
            const preco = produto.preco;
            const imagemProduto = produtoImg.src;  // Aqui garantimos que pegamos a imagem correta

            // Validação do tamanho e quantidade
            if (!tamanho) {
                alert("Por favor, selecione um tamanho.");
                return;
            }
            if (quantidade < 1) {
                alert("Por favor, insira uma quantidade válida.");
                return;
            }

            // Cria o objeto do produto
            const produtoCarrinho = {
                nome: nomeProduto,
                preco: preco,
                tamanho: tamanho,
                quantidade: quantidade,
                imagem: imagemProduto
            };

            // Recupera o carrinho do localStorage
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            // Verifica se o produto já está no carrinho (não se importa com o tamanho)
            const produtoExistente = carrinho.find(item => item.nome === produtoCarrinho.nome);

            if (produtoExistente) {
                // Incrementa a quantidade e atualiza o total
                produtoExistente.quantidade += produtoCarrinho.quantidade;
                produtoExistente.total = produtoExistente.preco * produtoExistente.quantidade;
            } else {
                // Adiciona o produto ao carrinho
                produtoCarrinho.total = produtoCarrinho.preco * produtoCarrinho.quantidade;
                carrinho.push(produtoCarrinho);
            }

            // Salva o carrinho no localStorage
            localStorage.setItem("carrinho", JSON.stringify(carrinho));

            // Redireciona para a página do carrinho
            alert("Produto adicionado ao carrinho!");
            window.location.href = "/assets/html/carrinho.html";
        });
    });

    // Função para exibir os produtos do carrinho na página de carrinho
    function exibirCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const tabelaCarrinho = document.querySelector('#tabelaCarrinho'); // Referência ao tbody da tabela

        tabelaCarrinho.innerHTML = ''; // Limpa a tabela antes de adicionar os novos produtos

        carrinho.forEach(produto => {
            const row = document.createElement('tr'); // Cria uma nova linha para o produto

            // Adiciona as células na linha
            row.innerHTML = `
                <td><img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto" style="max-width: 100px;"></td>
                <td>${produto.nome}</td>
                <td>${produto.tamanho}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>R$ ${produto.total.toFixed(2)}</td>
            `;
            tabelaCarrinho.appendChild(row);
        });
    }

    // Chama a função para exibir o carrinho quando a página do carrinho for carregada
    if (document.body.contains(document.getElementById('tabelaCarrinho'))) {
        exibirCarrinho();
    }
});
