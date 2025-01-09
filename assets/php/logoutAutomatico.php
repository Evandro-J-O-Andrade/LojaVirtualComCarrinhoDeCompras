<?php
session_start(); // Inicia a sessão

// Defina o tempo limite em segundos (15 minutos)
$tempo_limite = 900; // 15 minutos em segundos

// Verifica se o tempo limite foi atingido
if (isset($_SESSION['ultimo_acesso']) && (time() - $_SESSION['ultimo_acesso']) > $tempo_limite) {
    // Se o tempo de inatividade for maior que o tempo limite, encerra a sessão
    session_unset(); // Remove todas as variáveis de sessão
    session_destroy(); // Destrói a sessão
    header("Location: /assets/html/conta.html"); // Redireciona para a página de login ou conta
    exit;
}

// Atualiza o tempo de acesso
$_SESSION['ultimo_acesso'] = time();
?>
