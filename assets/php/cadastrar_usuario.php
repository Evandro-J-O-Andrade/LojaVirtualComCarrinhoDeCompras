<?php
// Inclui a conexão com o banco de dados e as funções de cadastro
require 'conexao.php';
// Verifica se o formulário foi submetido via POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recebe os dados do formulário
    $nome = trim($_POST['nome']);   // Remover espaços extras
    $email = trim($_POST['email']); // Remover espaços extras
    $senha = $_POST['senha'];
    $confirmaSenha = $_POST['confirmaSenha'];

    // Verifica se as senhas coincidem
    if ($senha !== $confirmaSenha) {
        echo "As senhas não coincidem!";
        exit;
    }

    // Verifica se os campos estão preenchidos corretamente
    if (empty($nome) || empty($email) || empty($senha) || empty($confirmaSenha)) {
        echo "Todos os campos são obrigatórios!";
        exit;
    }

    // Valida o formato do email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "E-mail inválido!";
        exit;
    }

    // Chama a função de cadastro, passando os dados
    $resultado = cadastrarUsuario($nome, $email, $senha);

    // Verifica o resultado do cadastro
    if ($resultado === true) {
        echo "Cadastro realizado com sucesso!";
        // Redireciona para a página de login ou outra página de sua escolha
        header("Location: login.php");
        exit;
    } else {
        echo $resultado; // Exibe o erro caso haja algum
    }
}
?>

