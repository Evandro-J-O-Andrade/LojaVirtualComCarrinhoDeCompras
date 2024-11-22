var EntrarPainel= document.getElementById("EntrarPainel");
var CadastroSite= document.getElementById("CadastroSite");
var Indicador= document.getElementById("Indicador");

function Cadastro() {
    // Exibe o formulário de cadastro e oculta o de login
    document.getElementById("EntrarPainel").style.display = "none";
    document.getElementById("CadstroSite").style.display = "block";

    // Alterar estilo do indicador para o botão 'Cadastro'
    document.getElementById("Indicador").style.transform = "translateX(0px)";  // Ajuste conforme o layout

   
}

function Entrar() {
    // Exibe o formulário de login e oculta o de cadastro
    document.getElementById("EntrarPainel").style.display = "block";
    document.getElementById("CadstroSite").style.display = "none";

    // Alterar estilo do indicador para o botão 'Entrar'
    document.getElementById("Indicador").style.transform = "translateX(300px)";  // Ajuste conforme o layout
}
   

