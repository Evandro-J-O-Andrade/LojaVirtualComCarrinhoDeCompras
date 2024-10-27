var MenuItens = document.getElementById("MenuItens");
var produtoImg =document.getElementById("produtoImg");
var produtoMiniatura = document.getElementsByClassName("produtoMiniatura");
MenuItens.style.maxHeight = "0px";

function menucelular(){
    if(MenuItens.style.maxHeight == "0px"){
        MenuItens.style.maxHeight = "200px";
        MenuItens.classList.add("menu-ativo"); // Adiciona a classe quando o menu é expandido
    } else {
        MenuItens.style.maxHeight = "0px";
        MenuItens.classList.remove("menu-ativo"); // Remove a classe quando o menu é recolhido
    }
}

produtoMiniatura[0].onclick= function(){
    produtoImg.src = produtoMiniatura[0].src;
}

produtoMiniatura[1].onclick =function(){
    produtoImg.src=produtoMiniatura[1].src;
}

produtoMiniatura[2].onclick =function(){
    produtoImg.src = produtoMiniatura[2].src;
}

produtoMiniatura[3].onclick =function(){
    produtoImg.src=produtoMiniatura[3].src;
}