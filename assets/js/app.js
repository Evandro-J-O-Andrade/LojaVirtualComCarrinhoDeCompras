var MenuItens = document.getElementById("MenuItens");
var produtoImg = document.getElementById("produtoImg");
var produtoMiniatura = document.getElementsByClassName("produtoMiniatura");

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

for (let i = 0; i < produtoMiniatura.length; i++) {
    produtoMiniatura[i].onclick = function() {
        produtoImg.src = produtoMiniatura[i].src;
    }
}
