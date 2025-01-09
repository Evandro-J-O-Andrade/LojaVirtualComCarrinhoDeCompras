<?php
session_start();
require 'conexao.php'; // Arquivo para conexão com o banco de dados
include_once'function.php';
// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_email'])) {
    header("Location: login.php");
    exit;
}

$mensagem = ''; // Variável para armazenar mensagens de erro ou sucesso

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Pega o novo valor da senha
    $nova_senha = trim($_POST['nova_senha']);
    $confirma_senha = trim($_POST['confirma_senha']);
    
    // Verifica se as senhas coincidem
    if ($nova_senha !== $confirma_senha) {
        $mensagem = "As senhas não coincidem!";
    } else {
        // Criptografa a nova senha
        $senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);

        // Atualiza a senha no banco de dados
        $email = $_SESSION['usuario_email']; // Pega o e-mail do usuário da sessão
        $sql = "UPDATE usuarios SET senha = :senha WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':senha', $senha_hash);
        $stmt->bindParam(':email', $email);
        
        // Executa a consulta e verifica o sucesso
        if ($stmt->execute()) {
            $mensagem = "Senha atualizada com sucesso!";
        } else {
            $mensagem = "Erro ao atualizar a senha. Tente novamente.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resetar Senha</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Resetar Senha</h1>
        
        <!-- Exibe mensagem de erro ou sucesso -->
        <?php if ($mensagem): ?>
            <div class="mensagem"><?php echo $mensagem; ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="nova_senha">Nova Senha</label>
                <input type="password" id="nova_senha" name="nova_senha" placeholder="Nova Senha" required>
            </div>

            <div class="form-group">
                <label for="confirma_senha">Confirmar Senha</label>
                <input type="password" id="confirma_senha" name="confirma_senha" placeholder="Confirmar Senha" required>
            </div>

            <button type="submit" class="submit-btn">Alterar Senha</button>
        </form>
    </div>
</body>
</html>
