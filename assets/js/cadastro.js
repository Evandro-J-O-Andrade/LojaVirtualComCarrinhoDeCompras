// Elementos principais
var EntrarPainel = document.getElementById("EntrarPainel");
var CadastroSite = document.getElementById("CadastroSite");
var RecuperarSenhaForm = document.getElementById("RecuperarSenha");
var Indicador = document.getElementById("Indicador");
var EsqueceuSenha = document.querySelector(".esqueceu-senha");
var BtnEntrar = document.getElementById("btnEntrar");
var BtnCadastro = document.getElementById("btnCadastro");

// Mensagens de erro
var erroCampos = document.getElementById('erroCampos'); // Para campos vazios
var erroSenha = document.getElementById('erroSenha');   // Para senhas não coincidirem

// Função para exibir o formulário de cadastro
function Cadastro() {
    EntrarPainel.style.display = "none";
    CadastroSite.style.display = "block";
    RecuperarSenhaForm.style.display = "none";

    Indicador.style.transform = "translateX(65px)";  // Ajuste conforme o layout

    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    EsqueceuSenha.style.display = "none";
}

// Função para exibir o formulário de login
function Entrar() {
    EntrarPainel.style.display = "block";
    CadastroSite.style.display = "none";
    RecuperarSenhaForm.style.display = "none";

    Indicador.style.transform = "translateX(-55px)";  // Ajuste conforme o layout

    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    EsqueceuSenha.style.display = "block";
}

// Função para exibir o formulário de recuperação de senha
function RecuperarSenha() {
    EntrarPainel.style.display = "none";
    CadastroSite.style.display = "none";
    RecuperarSenhaForm.style.display = "block";

    Indicador.style.transform = "translateX(65px)";  // Ajuste conforme o layout

    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    EsqueceuSenha.style.display = "none";
}

// Validação ao clicar no botão "Cadastrar"
document.getElementById('btnCadastro').addEventListener('click', function(event) {
    const senha = document.getElementById('senha').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();
    
    // Validação de campos preenchidos
    var camposPreenchidos = true;
    var campos = [senha, confirmaSenha];

    for (var i = 0; i < campos.length; i++) {
        if (campos[i] === "") {
            camposPreenchidos = false;
            break;  // Se algum campo estiver vazio, não envia o formulário
        }
    }

    // Exibe mensagem se algum campo estiver vazio
    if (!camposPreenchidos) {
        erroCampos.style.display = "inline";
        erroCampos.textContent = "Todos os campos devem ser preenchidos.";
        event.preventDefault(); // Impede o envio do formulário
        return;
    } else {
        erroCampos.style.display = "none";
    }

    // Validação de senhas
    if (senha !== confirmaSenha) {
        erroSenha.style.display = "inline";
        erroSenha.textContent = "As senhas não coincidem.";
        event.preventDefault(); // Impede o envio do formulário
    } else {
        erroSenha.style.display = "none";
    }
});

// Validação dinâmica ao digitar as senhas
function validarSenhas() {
    const senha = document.getElementById('senha').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();
    const erroSenha = document.getElementById('erroSenha');

    // Verifica se as senhas coincidem
    if (senha !== confirmaSenha) {
        erroSenha.style.display = "inline";  // Exibe a mensagem de erro
    } else {
        erroSenha.style.display = "none";  // Se as senhas forem iguais, esconde a mensagem
    }
}

// Alternar visibilidade da senha
function alternarVisibilidadeSenha() {
    const senhaInput = document.getElementById('senha');
    const tipo = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
    senhaInput.setAttribute('type', tipo);

    const toggleSenha = document.getElementById('toggleSenha');
    toggleSenha.textContent = tipo === 'password' ? '👁️' : '🙈';  // Altera o ícone
}

// Alternar visibilidade da confirmação de senha
function alternarVisibilidadeConfirmaSenha() {
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const tipo = confirmaSenhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmaSenhaInput.setAttribute('type', tipo);

    const toggleConfirmaSenha = document.getElementById('toggleConfirmaSenha');
    toggleConfirmaSenha.textContent = tipo === 'password' ? '👁️' : '🙈';  // Altera o ícone
}

// Adiciona evento para validação dinâmica ao digitar
document.getElementById('senha').addEventListener('input', validarSenhas);
document.getElementById('confirmaSenha').addEventListener('input', validarSenhas);

// Função para exibir o indicador (hr) quando clicar em "Entrar"
BtnEntrar.addEventListener("click", function() {
    // Exibir o hr
    document.getElementById("Indicador").style.display = "block"; 
    // Realize outras ações relacionadas ao botão Entrar
});

// Função para exibir o indicador (hr) quando clicar em "Cadastrar"
BtnCadastro.addEventListener("click", function() {
    // Exibir o hr
    document.getElementById("Indicador").style.display = "block"; 
    // Realize outras ações relacionadas ao botão Cadastrar
});


