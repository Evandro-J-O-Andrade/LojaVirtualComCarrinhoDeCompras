
document.addEventListener("DOMContentLoaded", function () {
    const produtos = [
        {
            produtoId: 1,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...
        {
            produtoId: 2,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...
        {
            produtoId: 3,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...
        {
            produtoId: 4,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...
        {
            produtoId: 5,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...
        {
            produtoId: 6,
            nome: "Blusa de frio manga longa meletinho",
            precos: {
                P: 450,
                M: 500,
                G: 550,
                GG: 600,
                XG: 650
            },
            descricao: "Produto de alta qualidade, feito com material de primeira linha.",
            imagens: [
                "/assets/img/galeria-1.jpg",
                "/assets/img/galeria-2.jpg",
                "/assets/img/galeria-3.jpg",
                "/assets/img/galeria-4.jpg",
                "/assets/img/galeria-5.jpg"
            ]
        },
        // Outros produtos podem ser adicionados aqui...

    ];

    const tbody = document.querySelector("tbody");

    imagens.forEach((imgSrc) => {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        const th = document.createElement("th"); // Corrigido aqui
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = "produtoMiniatura"; // Corrigido o texto no alt
        th.appendChild(img);
        td.appendChild(img);
        tr.appendChild(td);
        tbody.appendChild(tr);
    });


    const container = document.querySelector(".corpo-categorias .linha");

    produtos.forEach(produto => {
        const produtoDiv = document.createElement("div");
        produtoDiv.className = "col-2";

        // HTML do produto
        produtoDiv.innerHTML = `
            <img class="imagemProduto" src="${produto.imagens[0]}" alt="${produto.produtoId}" id="produtoImg">
            <div class="img-linha">
                ${produto.imagens.map(imagem => `
                    <div class="img-col">
                        <img src="${imagem}" alt="${produto.nome}" width="100%" class="produtoMiniatura">
                    </div>
                `).join('')}
            </div>
            <p>${produto.nome}</p>
            <h1>Compre com desconto</h1>
            <form action="" method="post" id="formAdicionarCarrinho">
                <select name="Tamanho" id="Tamanho">
                    <option value="">Tamanho</option>
                    ${Object.keys(produto.precos).map(tamanho => `
                        <option value="${tamanho}">${tamanho}</option>
                    `).join('')}
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
        const miniaturas = produtoDiv.querySelectorAll(".produtoMiniatura");

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
            const preco = produto.precos[tamanho];
            const imagemProduto = produtoImg.src;
            const produtoId = produto.produtoId;

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
                produtoId,
                nome: nomeProduto,
                preco,
                tamanho,
                quantidade,
                imagem: imagemProduto,
                total: preco * quantidade
            };

            // Recupera o carrinho do localStorage
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            // Verifica se o produto já está no carrinho pelo ID e tamanho
            const produtoExistente = carrinho.find(item => item.produtoId === produtoCarrinho.produtoId && item.tamanho === produtoCarrinho.tamanho);

            if (produtoExistente) {
                // Incrementa a quantidade e atualiza o total
                produtoExistente.quantidade += produtoCarrinho.quantidade;
                produtoExistente.total = produtoExistente.preco * produtoExistente.quantidade;
            } else {
                // Adiciona o produto ao carrinho
                carrinho.push(produtoCarrinho);
            }

            // Salva o carrinho no localStorage
            localStorage.setItem("carrinho", JSON.stringify(carrinho));

            // Redireciona para a página do carrinho
            alert("Produto adicionado ao carrinho!");
            window.location.href = "/assets/html/carrinho.html";
        });
    });
});
