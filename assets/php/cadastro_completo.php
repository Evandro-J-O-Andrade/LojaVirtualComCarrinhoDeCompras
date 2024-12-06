<?php
// Incluir a conexão com o banco de dados
require 'conexao.php'; // Incluindo o arquivo de conexão com o banco de dados

// Verificar se o formulário foi submetido
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Capturar os dados do formulário
    $nome_usuario = $_POST['nome_usuario'];
    $email_usuario = $_POST['email_usuario'];
    $senha_usuario = $_POST['senha_usuario'];
    $telefone_usuario = $_POST['telefone_usuario'];
    $endereco_usuario = $_POST['endereco_usuario'];
    $logradouro_usuario = $_POST['logradouro_usuario'];
    $cidade_usuario = $_POST['cidade_usuario'];
    $estado_usuario = $_POST['estado_usuario'];
    $cep_usuario = $_POST['cep_usuario'];


    // Inserir dados adicionais após o login
    $sql = "INSERT INTO dados_adicionais (usuario_id, endereco, telefone, idade, cidade, estado) 
VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississ", $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);
    $stmt->execute();


    // Criptografar a senha do usuário
    $senha_usuario = password_hash($senha_usuario, PASSWORD_DEFAULT);

    // Preparar a consulta SQL com parâmetros (prepared statement)
    $sql = "INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario, telefone_usuario, endereco_usuario, logradouro_usuario, cidade_usuario, estado_usuario, cep_usuario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Preparar a declaração
    $stmt = $conn->prepare($sql);

    // Vincular os parâmetros aos valores recebidos do formulário
    $stmt->bind_param("sssssssss", $nome_usuario, $email_usuario, $senha_usuario, $telefone_usuario, $endereco_usuario, $logradouro_usuario, $cidade_usuario, $estado_usuario, $cep_usuario);

    // Executar a consulta
    if ($stmt->execute()) {
        echo "Usuário cadastrado com sucesso!";
    } else {
        echo "Erro: " . $stmt->error;
    }

    // Fechar a declaração e a conexão
    $stmt->close();
    $conn->close();
}
