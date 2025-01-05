<?php
session_start();

// Verifica se o usuário está logado, caso contrário, redireciona para o login
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

// Obtém os dados do usuário logado
$usuario_nome = $_SESSION['usuario_nome'];
$usuario_email = $_SESSION['usuario_email'];
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel</title>
</head>
<body>

<h1>Bem-vindo, <?= $usuario_nome ?>!</h1>
<p>Seu e-mail: <?= $usuario_email ?></p>

<!-- Formulário de logout -->
<form method="POST" action="logout.php">
    <button type="submit">Sair</button>
</form>

</body>
</html>
