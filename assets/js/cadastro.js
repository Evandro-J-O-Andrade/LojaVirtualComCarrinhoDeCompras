
var EntrarPainel= document.getElementById("EntrarPainel");
var CadastroSite= document.getElementById("CadastroSite");
var Indicador= document.getElementById("Indicador");

function Cadastro() {
    // Exibe o formulário de cadastro e oculta o de login
    document.getElementById("EntrarPainel").style.display = "none";
    document.getElementById("CadstroSite").style.display = "block";

    // Alterar estilo do indicador para o botão 'Cadastro'
    document.getElementById("Indicador").style.transform = "translateX(65px)";  // Ajuste conforme o layout

   
}

function Entrar() {
    // Exibe o formulário de login e oculta o de cadastro
    document.getElementById("EntrarPainel").style.display = "block";
    document.getElementById("CadastroSite").style.display = "none";

    // Alterar estilo do indicador para o botão 'Entrar'
    document.getElementById("Indicador").style.transform = "translateX(-65px)";  // Ajuste conforme o layout
}
  
// Elementos principais
var EntrarPainel = document.getElementById("EntrarPainel");
var CadastroSite = document.getElementById("CadastroSite");
var RecuperarSenhaForm = document.getElementById("RecuperarSenha");
var Indicador = document.getElementById("Indicador");
var EsqueceuSenha = document.querySelector(".esqueceu-senha");
var BtnEntrar = document.getElementById("btnEntrar");
var BtnCadastro = document.getElementById("btnCadastro");

function Cadastro() {
    EntrarPainel.style.display = "none";
    CadastroSite.style.display = "block";
    RecuperarSenhaForm.style.display = "none";

    // Movimenta o Indicador
    document.getElementById("Indicador").style.transform = "translateX(65px)";  // Ajuste conforme o layout

    // Reseta textos dos botões
    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    // Esconde o span "Esqueceu sua senha!"
    EsqueceuSenha.style.display = "none";
}

function Entrar() {
    EntrarPainel.style.display = "block";
    CadastroSite.style.display = "none";
    RecuperarSenhaForm.style.display = "none";

    // Movimenta o Indicador
    document.getElementById("Indicador").style.transform = "translateX(-65px)";  // Ajuste conforme o layout
    // Reseta textos dos botões
    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    // Exibe novamente o span "Esqueceu sua senha!"
    EsqueceuSenha.style.display = "block";
}

function RecuperarSenha() {
    EntrarPainel.style.display = "none";
    CadastroSite.style.display = "none";
    RecuperarSenhaForm.style.display = "block";

    // Movimenta o Indicador
    document.getElementById("Indicador").style.transform = "translateX(65px)";  // Ajuste conforme o layout
    // Altera os spans para "Recuperar Conta!"
    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    // Esconde o span "Esqueceu sua senha!"
    EsqueceuSenha.style.display = "none";
}
