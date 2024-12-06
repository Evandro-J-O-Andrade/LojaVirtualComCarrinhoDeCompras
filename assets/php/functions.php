<?php
// Função para cadastrar um novo usuário
function cadastrarUsuario($nome, $email, $senha) {
    global $conn;

    // Cria um hash da senha para segurança
    $senha_hash = password_hash($senha, PASSWORD_BCRYPT);

    // Prepara a query para inserção no banco de dados
    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        return "Erro na preparação da consulta: " . $conn->error;
    }

    // Vincula os parâmetros na consulta preparada
    $stmt->bind_param("sss", $nome, $email, $senha_hash);

    // Executa a consulta e verifica se o cadastro foi bem-sucedido
    if ($stmt->execute()) {
        return true;
    } else {
        return "Erro ao cadastrar usuário: " . $stmt->error;
    }

    // Fecha o statement após a execução
    $stmt->close();
}
// functions.php

function inserirDadosAdicionais($conn, $usuario_id, $endereco, $telefone, $idade, $cidade, $estado) {
    $sql = "INSERT INTO dados_adicionais (usuario_id, endereco, telefone, idade, cidade, estado) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississ", $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);
    $stmt->execute();
}
// Incluir a conexão com o banco de dados
include('config.php');

// Incluir as funções
include('functions.php');

// Verificar se o formulário foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obter os dados do formulário
    $usuario_id = $_SESSION['usuario_id']; // ou recuperar o ID do usuário logado
    $endereco = $_POST['endereco'];
    $telefone = $_POST['telefone'];
    $idade = $_POST['idade'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];

    // Chamar a função para inserir os dados adicionais
    inserirDadosAdicionais($conn, $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);

    // Redirecionar ou exibir uma mensagem de sucesso
    echo "Dados cadastrados com sucesso!";
}
// Função para verificar o login
function verificarLogin($email, $senha) {
    global $conn;

    // Prepara a consulta para buscar o usuário no banco de dados
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();

    // Verifica se o usuário existe e se a senha bate
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        if (password_verify($senha, $usuario['senha'])) {
            return $usuario; // Retorna os dados do usuário logado
        } else {
            return "Senha incorreta.";
        }
    } else {
        return "Usuário não encontrado.";
    }

    // Fecha a consulta
    $stmt->close();
}

// Função para completar cadastro com informações adicionais (ex: endereço, telefone)
function completarCadastro($usuario_id, $endereco, $telefone, $idade, $cidade, $estado) {
    global $conn;

    // Prepara a consulta para completar o cadastro com dados adicionais
    $sql = "INSERT INTO cadastro (usuario_id, endereco, telefone, idade, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississ", $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);

    // Executa a consulta e verifica se a operação foi bem-sucedida
    if ($stmt->execute()) {
        return true;
    } else {
        return "Erro ao completar cadastro: " . $stmt->error;
    }

    // Fecha a consulta
    $stmt->close();
}
?>
