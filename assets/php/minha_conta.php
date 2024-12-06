<?php
// Inicia a sessão
session_start();

// Inclui a conexão com o banco de dados e as funções
require "conexao.php";
// Verifica se o usuário já está logado
if (isset($_SESSION['usuario_id'])) {
    header('Location: dashboard.php'); // Se estiver logado, redireciona para o painel
    exit;
}

// Verifica se o formulário de login foi enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recebe os dados do formulário
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    // Verifica o login
    $usuario = verificarLogin($email, $senha);

    if (is_array($usuario)) {
        // Login bem-sucedido, armazena os dados do usuário na sessão
        $_SESSION['usuario_id'] = $usuario['id']; // ID do usuário
        $_SESSION['usuario_nome'] = $usuario['nome']; // Nome do usuário
        $_SESSION['usuario_email'] = $usuario['email']; // Email do usuário

        // Redireciona para a página principal ou painel
        header('Location: dashboard.php');
        exit;
    } else {
        // Caso o login falhe
        $erroLogin = $usuario; // A mensagem de erro será armazenada aqui
    }
}
?>
