<?php
include_once 'conexao.php'; // Arquivo para conexão com o banco de dados

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    $confirmaSenha = $_POST['confirmaSenha'];

    // Validação de campos vazios
    if (empty($nome) || empty($email) || empty($senha) || empty($confirmaSenha)) {
        echo "Por favor, preencha todos os campos.";
        exit;
    }

    // Verificar se as senhas coincidem
    if ($senha !== $confirmaSenha) {
        echo "As senhas não coincidem.";
        exit;
    }

    // Verificar se o e-mail já está registrado
    $query = "SELECT * FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "Este e-mail já está registrado.";
        exit;
    }

    // Hash da senha para segurança
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    // Prepara a consulta SQL para inserção no banco de dados
    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    if ($stmt === false) {
        echo "Erro na preparação da consulta: " . $pdo->errorInfo()[2];
        exit;
    }

    // Vincula os parâmetros
    $stmt->bindParam(1, $nome);
    $stmt->bindParam(2, $email);
    $stmt->bindParam(3, $senhaHash);

    // Executa a consulta
    if ($stmt->execute()) {
        // Redirecionar o usuário para a página de complemento de cadastro
        session_start();
        $_SESSION['nome_usuario'] = $nome;
        $_SESSION['email_usuario'] = $email;

        header("Location: cadastro_completo.php");
        exit;
    } else {
        echo "Erro ao cadastrar usuário.";
    }
}
?>
