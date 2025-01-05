<?php
// Inicia a sessão
session_start();

// Inclui a conexão com o banco de dados
require "conexao.php"; // Verifique se o caminho está correto para o arquivo de conexão

// Inclui as funções (se estiverem em um arquivo separado, como funcoes.php)
require "function.php"; // Certifique-se de incluir a função verificarLoginOuCadastro()

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

    // Verifica login ou cadastro
    $usuario = verificarLoginOuCadastro($email, $senha, $pdo);

    if (is_array($usuario)) {
        // Login bem-sucedido, armazena os dados do usuário na sessão
        $_SESSION['usuario_id'] = $usuario['id']; // ID do usuário
        $_SESSION['usuario_nome'] = $usuario['nome']; // Nome do usuário
        $_SESSION['usuario_email'] = $usuario['email']; // Email do usuário

        // Redireciona para a página principal ou painel
        header('Location: dashboard.php');
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
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>

<h1>Login</h1>

<!-- Exibe a mensagem de erro, se houver -->
<?php if (isset($erroLogin)): ?>
    <p style="color: red;"><?= $erroLogin ?></p>
<?php endif; ?>

<form method="POST">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br><br>

    <label for="senha">Senha:</label>
    <input type="password" id="senha" name="senha" required><br><br>

    <button type="submit">Entrar</button>
</form>

<p>Ainda não tem uma conta? <a href="cadastro.php">Cadastre-se aqui</a></p>

</body>
</html>
