document.addEventListener("DOMContentLoaded", function () {
    const produtos = [
        {
            "data-prodoutoid": 1,
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

         {
            "data-prodoutoid": 2,
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
         {
            "data-prodoutoid": 3,
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
         {
            "data-prodoutoid": 4,
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
        // Adicione os outros produtos aqui...
    ];

    const container = document.querySelector(".corpo-categorias .linha");

    produtos.forEach(produto => {
        const produtoDiv = document.createElement("div");
        produtoDiv.className = "col-2";

        // HTML do produto
        produtoDiv.innerHTML = `
            <img class="imagemProduto" src="${produto.imagens[0]}" alt="${produto.nome}" data-prodoutoid="${produto['data-prodoutoid']}">
            <div class="img-linha">
                ${produto.imagens.map(imagem => `
                    <div class="img-col">
                        <img src="${imagem}" alt="${produto.nome}" width="100%" class="produtoMiniatura" data-prodoutoid="${produto['data-prodoutoid']}">
                    </div>
                `).join('')}
            </div>
            <p>${produto.nome}</p>
            <h1>Compre com desconto</h1>
            <form action="" method="post" class="formAdicionarCarrinho">
                <select name="Tamanho" class="Tamanho">
                    <option value="">Tamanho</option>
                    ${Object.keys(produto.precos).map(tamanho => `
                        <option value="${tamanho}">${tamanho}</option>
                    `).join('')}
                </select>
                <input type="number" name="quantidade" class="quantidade" value="1" min="1">
                <button type="submit" class="btn">Adicionar ao Carrinho</button>
            </form>
            <div class="feedback"></div>
            <h3>Descrição do Produto:</h3>
            <p>${produto.descricao}</p>
        `;

        container.appendChild(produtoDiv);

        // Troca de imagem principal
        const produtoImg = produtoDiv.querySelector(`.imagemProduto[data-prodoutoid="${produto['data-prodoutoid']}"]`);
        const miniaturas = produtoDiv.querySelectorAll(".produtoMiniatura");

        miniaturas.forEach(miniatura => {
            miniatura.addEventListener("click", function () {
                produtoImg.src = this.src;
            });
        });

        // Adicionar ao carrinho
        const formCarrinho = produtoDiv.querySelector(".formAdicionarCarrinho");
        formCarrinho.addEventListener("submit", function (event) {
            event.preventDefault();

            const tamanho = produtoDiv.querySelector(".Tamanho").value;
            const quantidade = parseInt(produtoDiv.querySelector(".quantidade").value);
            const preco = produto.precos[tamanho];
            const idProduto = produto['data-prodoutoid'];
            const imagemProduto = produtoImg.src;

            // Validações
            if (!tamanho) {
                alert("Por favor, selecione um tamanho.");
                return;
            }
            if (quantidade < 1) {
                alert("Por favor, insira uma quantidade válida.");
                return;
            }

            // Objeto do produto
            const produtoCarrinho = {
                id: idProduto,
                nome: produto.nome,
                preco,
                tamanho,
                quantidade,
                imagem: imagemProduto,
                total: preco * quantidade
            };

            // Adicionar ao carrinho no localStorage
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
            const produtoExistente = carrinho.find(item => item.id === produtoCarrinho.id && item.tamanho === produtoCarrinho.tamanho);

            if (produtoExistente) {
                produtoExistente.quantidade += produtoCarrinho.quantidade;
                produtoExistente.total = produtoExistente.preco * produtoExistente.quantidade;
            } else {
                carrinho.push(produtoCarrinho);
            }

            localStorage.setItem("carrinho", JSON.stringify(carrinho));

            alert("Produto adicionado ao carrinho!");
            window.location.href = "/assets/html/carrinho.html";
        });
    });
});
