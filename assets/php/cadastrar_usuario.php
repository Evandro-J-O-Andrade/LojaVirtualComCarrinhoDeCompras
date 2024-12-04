<?php
require 'db_config.php'; // Arquivo de configuração do banco

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Sanitização básica dos dados
    $nome = htmlspecialchars(trim($_POST['nome']));
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $senha = $_POST['senha'];
    $cpf = htmlspecialchars(trim($_POST['cpf']));
    $rg = htmlspecialchars(trim($_POST['rg']));

    // Validação dos campos
    if (empty($nome) || empty($email) || empty($senha) || empty($cpf) || empty($rg)) {
        echo "Todos os campos são obrigatórios.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "E-mail inválido.";
        exit;
    }

    if (strlen($senha) < 6) {
        echo "A senha deve ter pelo menos 6 caracteres.";
        exit;
    }

    // Hash seguro para a senha
    $senha_hashed = password_hash($senha, PASSWORD_DEFAULT);

    // Prepara e executa a consulta
    $sql = "INSERT INTO usuarios (nome, email, senha, cpf, rg) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo "Erro na preparação da consulta: " . $conn->error;
        exit;
    }

    $stmt->bind_param("sssss", $nome, $email, $senha_hashed, $cpf, $rg);

    if ($stmt->execute()) {
        echo "Usuário cadastrado com sucesso!";
    } else {
        echo "Erro ao cadastrar: " . $stmt->error;
    }

    // Fecha o statement
    $stmt->close();
}

// Fecha a conexão
$conn->close();
?>
