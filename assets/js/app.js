var MenuItens = document.getElementById("MenuItens");

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
