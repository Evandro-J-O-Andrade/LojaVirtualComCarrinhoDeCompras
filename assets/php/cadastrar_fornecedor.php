<?php
// Incluir a conexão com o banco de dados
include 'conexao.php'; // Incluindo o arquivo de conexão com o banco de dados

// Verificar se o formulário foi submetido
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Capturar os dados do formulário
    $nome_fornecedor = $_POST['nome_fornecedor'];
    $cnpj = $_POST['cnpj'];
    $endereco_fornecedor = $_POST['endereco_fornecedor'];
    $telefone_fornecedor = $_POST['telefone_fornecedor'];
    $email_fornecedor = $_POST['email_fornecedor'];

    // Preparar a consulta SQL com parâmetros (prepared statement)
    $sql = "INSERT INTO fornecedores (nome_fornecedor, cnpj, endereco_fornecedor, telefone_fornecedor, email_fornecedor) 
            VALUES (?, ?, ?, ?, ?)";
    
    // Preparar a declaração
    $stmt = $conn->prepare($sql);
    
    // Vincular os parâmetros aos valores recebidos do formulário
    $stmt->bind_param("sssss", $nome_fornecedor, $cnpj, $endereco_fornecedor, $telefone_fornecedor, $email_fornecedor);
    
    // Executar a consulta
    if ($stmt->execute()) {
        echo "Fornecedor cadastrado com sucesso!";
    } else {
        echo "Erro: " . $stmt->error;
    }

    // Fechar a declaração e a conexão
    $stmt->close();
    $conn->close();
}
?>
