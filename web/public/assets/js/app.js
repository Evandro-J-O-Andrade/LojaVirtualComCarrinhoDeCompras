var MenuItens = document.getElementById("MenuItens");
var produtoImg = document.getElementById("produtoImg");
var produtoMiniatura = document.getElementsByClassName("protudoMiniatura");

MenuItens.style.maxHeight = "0px";

function menucelular() {
    if (MenuItens.style.maxHeight === "0px") {
        MenuItens.style.maxHeight = "200px";
        MenuItens.classList.add("menu-ativo"); // Adiciona a classe quando o menu é expandido
    } else {
        MenuItens.style.maxHeight = "0px";
        MenuItens.classList.remove("menu-ativo"); // Remove a classe quando o menu é recolhido
    }
}

// Fecha o menu quando clica fora dele
document.addEventListener('click', function(event) {
    // Verifica se o clique foi fora do menu e do botão
    if (!MenuItens.contains(event.target) && !event.target.classList.contains("menu-celular")) {
        MenuItens.style.maxHeight = "0px"; // Fecha o menu
        MenuItens.classList.remove("menu-ativo"); // Remove a classe do menu
    }
});

// Atualiza a imagem do produto ao clicar nas miniaturas
for (let i = 0; i < produtoMiniatura.length; i++) {
    produtoMiniatura[i].onclick = function() {
        produtoImg.src = produtoMiniatura[i].src;
    }
}
