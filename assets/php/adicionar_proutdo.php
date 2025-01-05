<?php
// Incluir a conexão com o banco de dados
require "conexao.php"; // Arquivo com a conexão PDO (não mais MySQLi)

// Verificando se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Capturar dados do formulário
    $nome = $_POST['nome'];
    $preco = $_POST['preco'];
    $descricao = $_POST['descricao'];
    $id_fornecedor = $_POST['id_fornecedor'];

    // Verificando se o id_fornecedor foi selecionado
    if (empty($id_fornecedor)) {
        echo "Erro: Você deve selecionar um fornecedor.";
    } else {
        // Inserir produto no banco com prepared statement
        $sql = "INSERT INTO produtos (nome_produto, preco, descricao, id_fornecedor) 
                VALUES (?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        
        // Vincular os parâmetros aos valores do formulário
        $stmt->bindParam(1, $nome, PDO::PARAM_STR);
        $stmt->bindParam(2, $preco, PDO::PARAM_STR);
        $stmt->bindParam(3, $descricao, PDO::PARAM_STR);
        $stmt->bindParam(4, $id_fornecedor, PDO::PARAM_INT);
        
        // Executar a consulta
        if ($stmt->execute()) {
            echo "Produto adicionado com sucesso!";
        } else {
            echo "Erro ao adicionar produto.";
        }
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
                $result_fornecedores = $pdo->query($sql_fornecedores);

                // Verificando se existem fornecedores
                if ($result_fornecedores->rowCount() > 0) {
                    // Exibindo os fornecedores no select
                    while ($row = $result_fornecedores->fetch(PDO::FETCH_ASSOC)) {
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
