<?php
require 'conexao.php';



// Adicionar produto
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome_produto = $_POST['nome_produto'];
    $descricao_produto = $_POST['descricao_produto'];
    $preco = $_POST['preco'];
    $quantidade_estoque = $_POST['quantidade_estoque'];

    $sql = "INSERT INTO produtos (nome_produto, descricao_produto, preco, quantidade_estoque) 
            VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssd", $nome_produto, $descricao_produto, $preco, $quantidade_estoque);

    if ($stmt->execute()) {
        echo "Produto cadastrado com sucesso!";
    } else {
        echo "Erro ao cadastrar produto: " . $stmt->error;
    }
}

// Listar produtos
$sql_list = "SELECT * FROM produtos";
$result = $conn->query($sql_list);
?>
<h1>Gerenciamento de Produtos</h1>

<form method="POST">
    <input type="text" name="nome_produto" placeholder="Nome do Produto" required>
    <input type="text" name="descricao_produto" placeholder="Descrição" required>
    <input type="number" name="preco" placeholder="Preço" step="0.01" required>
    <input type="number" name="quantidade_estoque" placeholder="Quantidade em Estoque" required>
    <button type="submit">Adicionar Produto</button>
</form>

<h2>Lista de Produtos</h2>
<table border="1">
    <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Descrição</th>
        <th>Preço</th>
        <th>Estoque</th>
    </tr>
    <?php while ($produto = $result->fetch_assoc()): ?>
    <tr>
        <td><?= $produto['id_produto'] ?></td>
        <td><?= $produto['nome_produto'] ?></td>
        <td><?= $produto['descricao_produto'] ?></td>
        <td><?= $produto['preco'] ?></td>
        <td><?= $produto['quantidade_estoque'] ?></td>
    </tr>
    <?php endwhile; ?>
</table>
