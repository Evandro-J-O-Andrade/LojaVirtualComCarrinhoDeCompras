<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    header('Location: minha_conta.php'); // Se não estiver logado, redireciona para o login
    exit;
}

echo "<h1>Bem-vindo, " . $_SESSION['usuario_nome'] . "!</h1>";
echo "<p>Seu e-mail: " . $_SESSION['usuario_email'] . "</p>";
?>
