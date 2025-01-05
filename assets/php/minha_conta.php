<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php'); // Se não estiver logado, redireciona para a página de login
    exit;
}

// Obtém os dados do usuário logado
$usuario_nome = $_SESSION['usuario_nome'];
$usuario_email = $_SESSION['usuario_email'];

// Verifica se o botão de logout foi clicado
if (isset($_POST['logout'])) {
    // Finaliza a sessão e redireciona para a página de login
    session_unset();
    session_destroy();
    header('Location: login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Conta</title>
</head>
<body>

<h1>Bem-vindo, <?= $usuario_nome ?>!</h1>
<p>Seu e-mail: <?= $usuario_email ?></p>

<!-- Formulário de logout -->
<form method="POST">
    <button type="submit" name="logout">Sair</button>
</form>

</body>
</html>
