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
var erroSenhaCadastro = document.getElementById('erroSenhaCadastro'); // Para senhas não coincidirem no cadastro
var sucessoMensagem = document.getElementById('sucessoMensagem'); // Para mensagem de sucesso

// Função para exibir o formulário de cadastro
function Cadastro() {
    EntrarPainel.style.display = "none";
    CadastroSite.style.display = "block";
    RecuperarSenhaForm.style.display = "none";

    // Movimenta o indicador para o lado do cadastro
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

    // Movimenta o indicador para o lado do login
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

    // Movimenta o indicador para o lado do cadastro
    Indicador.style.transform = "translateX(65px)";  // Ajuste conforme o layout

    BtnEntrar.textContent = "Entrar";
    BtnCadastro.textContent = "Cadastro";

    EsqueceuSenha.style.display = "none";
}

// Validação dinâmica ao digitar as senhas
function validarSenhas() {
    const senha = document.getElementById('senhaCad').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();

    // Verifica se as senhas coincidem
    if (senha !== confirmaSenha) {
        erroSenha.style.display = "inline";  // Exibe a mensagem de erro
    } else {
        erroSenha.style.display = "none";  // Se as senhas forem iguais, esconde a mensagem
    }
}

// Alternar visibilidade da senha
function alternarVisibilidadeSenha() {
    const senhaInput = document.getElementById('senhaCad');
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
document.getElementById('senhaCad').addEventListener('input', validarSenhas);
document.getElementById('confirmaSenha').addEventListener('input', validarSenhas);

// Função para exibir a mensagem de sucesso
function exibirSucesso(mensagem) {
    sucessoMensagem.style.display = "inline";  // Exibe a mensagem de sucesso
    sucessoMensagem.textContent = mensagem;
}

// Função para exibir o indicador (hr) quando clicar em "Entrar"
BtnEntrar.addEventListener("click", function() {
    // Exibir o hr
    Indicador.style.display = "block"; 

    // Chama a função de exibição do formulário de login
    Entrar();
});

// Função para exibir o indicador (hr) quando clicar em "Cadastrar"
BtnCadastro.addEventListener("click", function() {
    // Exibir o hr
    Indicador.style.display = "block"; 

    // Chama a função de exibição do formulário de cadastro
    Cadastro();
});

// Validação ao clicar no botão "Cadastrar"
document.getElementById('btnCadastro').addEventListener('click', function(event) {
    const senha = document.getElementById('senhaCad').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();
    const email = document.getElementById('email').value.trim(); // Captura o valor do campo de e-mail
    // Validação de campos preenchidos
    var camposPreenchidos = true;
    var campos = [email, senha, confirmaSenha]; // Adiciona o campo de e-mail à validação

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
        return;  // Se algum campo estiver vazio, não prossegue
    } else {
        erroCampos.style.display = "none"; // Se todos os campos estão preenchidos, esconde a mensagem de erro
    }

    // Validação de senhas
    if (senha !== confirmaSenha) {
        erroSenhaCadastro.style.display = "inline";
        erroSenhaCadastro.textContent = "As senhas não coincidem.";
        event.preventDefault(); // Impede o envio do formulário
        return;  // Se as senhas não coincidirem, não prossegue
    } else {
        erroSenhaCadastro.style.display = "none";  // Se as senhas coincidem, esconde a mensagem de erro
    }

    // Validação de e-mail
    if (email === "") {
        erroCampos.style.display = "inline";
        erroCampos.textContent = "O e-mail é obrigatório.";
        event.preventDefault(); // Impede o envio do formulário
        return;
    }

    // Se tudo estiver correto, exibe a mensagem de sucesso
    exibirSucesso("Enviado com sucesso!");

    // Aqui você pode enviar o formulário para o servidor ou realizar outra ação desejada
    event.preventDefault(); // Não envia o formulário por enquanto
});
