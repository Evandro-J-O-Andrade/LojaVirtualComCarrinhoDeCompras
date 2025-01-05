<?php

// Função para verificar login ou cadastro do usuário
function verificarLoginOuCadastro($email, $senha, $pdo) {
    // Consulta para verificar se o usuário já existe
    $sql = "SELECT id, nome, email, senha FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Se o usuário já existir
    if ($usuario) {
        // Verifica se a senha é válida
        if (password_verify($senha, $usuario['senha'])) {
            // Se a senha estiver correta, retorna os dados do usuário
            return $usuario;
        } else {
            return false; // Senha incorreta
        }
    } else {
        // Se o usuário não for encontrado, faz o cadastro
        return cadastrarUsuario($email, $senha, $pdo);
    }
}

// Função para cadastrar o usuário
function cadastrarUsuario($email, $senha, $pdo) {
    // Cria um hash da senha
    $senha_hash = password_hash($senha, PASSWORD_BCRYPT);

    // Insere o novo usuário no banco de dados
    $sql = "INSERT INTO usuarios (email, senha) VALUES (:email, :senha)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senha_hash);

    // Verifica se o cadastro foi bem-sucedido
    if ($stmt->execute()) {
        // Retorna o novo usuário após o cadastro
        return [
            'id' => $pdo->lastInsertId(), // ID do novo usuário
            'email' => $email
        ];
    } else {
        // Caso haja erro no cadastro
        return false;
    }
}
