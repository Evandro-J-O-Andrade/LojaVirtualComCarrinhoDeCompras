<?php
session_start(); // Inicia a sessão

// Destrói todas as variáveis de sessão
session_unset();

// Destrói a sessão
session_destroy();

// Redireciona para a página de conta.html
header("Location: /assets/html/conta.html"); // Corrigido para um redirecionamento correto
exit; // Garante que o script pare de rodar após o redirecionamento
?>
