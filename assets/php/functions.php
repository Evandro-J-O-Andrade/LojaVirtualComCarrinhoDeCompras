<?php
require 'conexao.php';

// Função para cadastrar um novo usuário
function cadastrarUsuario($nome, $email, $senha) {
    global $conn;
    $senha_hash = password_hash($senha, PASSWORD_BCRYPT);
    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $nome, $email, $senha_hash);

    if ($stmt->execute()) {
        return true;
    } else {
        return "Erro ao cadastrar usuário: " . $stmt->error;
    }
}

// Função para verificar login
function verificarLogin($email, $senha) {
    global $conn;
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        if (password_verify($senha, $usuario['senha'])) {
            return $usuario; // Retorna o usuário logado
        } else {
            return "Senha incorreta.";
        }
    } else {
        return "Usuário não encontrado.";
    }
}

// Função para completar cadastro do usuário
function completarCadastro($usuario_id, $endereco, $telefone, $idade, $cidade, $estado) {
    global $conn;
    $sql = "INSERT INTO cadastro (usuario_id, endereco, telefone, idade, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississ", $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);

    if ($stmt->execute()) {
        return true;
    } else {
        return "Erro ao completar cadastro: " . $stmt->error;
    }
}
?>
