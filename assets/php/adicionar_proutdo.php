<?php

require  "conexao.php";
// Dados de conexão
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "angelcosmeticos";

// Criando a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificando a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}



// Verificando se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'];
    $preco = $_POST['preco'];
    $descricao = $_POST['descricao'];
    $id_fornecedor = $_POST['id_fornecedor']; // Pegando o ID do fornecedor selecionado

    // Verificando se o id_fornecedor foi selecionado
    if (empty($id_fornecedor)) {
        echo "Erro: Você deve selecionar um fornecedor.";
    } else {
        // Inserindo dados no banco
        $sql = "INSERT INTO produtos (nome_produto, preco, descricao, id_fornecedor) 
                VALUES ('$nome', '$preco', '$descricao', '$id_fornecedor')";

        if ($conn->query($sql) === TRUE) {
            echo "Produto adicionado com sucesso!";
        } else {
            echo "Erro: " . $conn->error;
        }
    }
}

$id_fornecedor = $_POST['id_fornecedor']; // Pegando o ID do fornecedor selecionado

// Verificando se o id_fornecedor foi selecionado
if (empty($id_fornecedor)) {
    echo "Erro: Você deve selecionar um fornecedor.";
} else {
    // Inserindo dados no banco
    $sql = "INSERT INTO produtos (nome_produto, preco, descricao, id_fornecedor) 
            VALUES ('$nome', '$preco', '$descricao', '$id_fornecedor')";
    if ($conn->query($sql) === TRUE) {
        echo "Produto adicionado com sucesso!";
    } else {
        echo "Erro: " . $conn->error;
    }
}

?>



<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adicionar Produto</title>
</head>
<body>
    <h1>Adicionar Produto</h1>
    <form method="POST">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required><br><br>

        <label for="preco">Preço:</label>
        <input type="number" id="preco" name="preco" step="0.01" required><br><br>

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" required></textarea><br><br>

        <label for="id_fornecedor">Fornecedor:</label>
        <select id="id_fornecedor" name="id_fornecedor" required>
            <option value="">Selecione um fornecedor</option>
            <?php
                // Buscando fornecedores cadastrados no banco
                $sql_fornecedores = "SELECT id, nome_fornecedor FROM fornecedores";
                $result_fornecedores = $conn->query($sql_fornecedores);

                // Verificando se existem fornecedores
                if ($result_fornecedores->num_rows > 0) {
                    // Exibindo os fornecedores no select
                    while($row = $result_fornecedores->fetch_assoc()) {
                        echo "<option value='" . $row['id'] . "'>" . $row['nome_fornecedor'] . "</option>";
                    }
                } else {
                    echo "<option value=''>Nenhum fornecedor encontrado</option>";
                }
            ?>
        </select><br><br>

        <button type="submit">Adicionar</button>
    </form>
</body>
</html>
