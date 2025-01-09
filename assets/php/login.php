<?php
// Inicia a sessão
session_start();

// Inclui a conexão com o banco de dados
include_once "conexao.php"; // Verifique se o caminho está correto para o arquivo de conexão

// Inclui as funções (se estiverem em um arquivo separado, como funcoes.php)
include_once "function.php"; // Certifique-se de incluir a função verificarLoginOuCadastro()

// Verifica se o usuário já está logado
if (isset($_SESSION['usuario_id'])) {
    // Se estiver logado, redireciona para o painel (página inicial ou carrinho)
    header("Location: /index.html"); // Redireciona para a página inicial
    exit;
}
// Verifica se a mensagem de logout existe na sessão e exibe
if (isset($_SESSION['sucesso_logout'])) {
    echo "<div class='sucesso-msg' style='background-color: #4CAF50; color: white; padding: 10px; text-align: center; font-size: 18px; border-radius: 5px;'>"
        . $_SESSION['sucesso_logout'] . "</div>";
    unset($_SESSION['sucesso_logout']); // Remove a mensagem após exibição
}
// Verifica se o formulário de login foi enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recebe os dados do formulário
    $email = $_POST['email_login'] ?? null;
    $senha = $_POST['senha_login'] ?? null;

    // Valida os campos
    if (empty($email) || empty($senha)) {
        $erroLogin = "Por favor, preencha todos os campos!";
    } else {
        // Verifica login ou cadastro
        $usuario = verificarLoginOuCadastro($email, $senha, $pdo);

        if (is_array($usuario)) {
            // Login bem-sucedido, armazena os dados do usuário na sessão
            $_SESSION['usuario_id'] = $usuario['id']; // ID do usuário
            $_SESSION['usuario_nome'] = $usuario['nome']; // Nome do usuário
            $_SESSION['usuario_email'] = $usuario['email']; // Email do usuário

            // Define a mensagem de sucesso
            $_SESSION['sucesso_login'] = "Você fez login com sucesso!";

            // Redireciona para o carrinho ou para a página inicial
            if (temProdutosNoCarrinho($_SESSION['usuario_id'], $pdo)) {
                header("Location: /carrinho.php"); // Redireciona para a página do carrinho
            } else {
                header("Location: /index.html"); // Redireciona para a página inicial
            }
            exit;
        } elseif ($usuario === false) {
            // Usuário não encontrado, redireciona para página de cadastro
            header('Location: cadastro.php');
            exit;
        } else {
            // Caso o login falhe
            $erroLogin = "E-mail ou senha incorretos!"; // A mensagem de erro será exibida aqui
        }
    }
}
?>
