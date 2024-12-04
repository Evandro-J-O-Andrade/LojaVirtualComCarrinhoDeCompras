<?php
require 'db_config.php';

// Adicionar fornecedor
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome_fornecedor = $_POST['nome_fornecedor'];
    $cnpj = $_POST['cnpj'];
    $endereco_fornecedor = $_POST['endereco_fornecedor'];
    $telefone_fornecedor = $_POST['telefone_fornecedor'];
    $email_fornecedor = $_POST['email_fornecedor'];

    $sql = "INSERT INTO fornecedores (nome_fornecedor, cnpj, endereco_fornecedor, telefone_fornecedor, email_fornecedor) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $nome_fornecedor, $cnpj, $endereco_fornecedor, $telefone_fornecedor, $email_fornecedor);

    if ($stmt->execute()) {
        echo "Fornecedor cadastrado com sucesso!";
    } else {
        echo "Erro ao cadastrar fornecedor: " . $stmt->error;
    }
}

// Listar fornecedores
$sql_list = "SELECT * FROM fornecedores";
$result = $conn->query($sql_list);
?>
<h1>Gerenciamento de Fornecedores</h1>

<!-- Formulário para adicionar fornecedor -->
<form method="POST">
    <input type="text" name="nome_fornecedor" placeholder="Nome do Fornecedor" required>
    <input type="text" name="cnpj" placeholder="CNPJ" required>
    <input type="text" name="endereco_fornecedor" placeholder="Endereço" required>
    <input type="text" name="telefone_fornecedor" placeholder="Telefone" required>
    <input type="email" name="email_fornecedor" placeholder="E-mail" required>
    <button type="submit">Adicionar Fornecedor</button>
</form>

<h2>Lista de Fornecedores</h2>
<table border="1">
    <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>CNPJ</th>
        <th>Endereço</th>
        <th>Telefone</th>
        <th>E-mail</th>
    </tr>
    <?php while ($fornecedor = $result->fetch_assoc()): ?>
    <tr>
        <td><?= $fornecedor['id_fornecedor'] ?></td>
        <td><?= $fornecedor['nome_fornecedor'] ?></td>
        <td><?= $fornecedor['cnpj'] ?></td>
        <td><?= $fornecedor['endereco_fornecedor'] ?></td>
        <td><?= $fornecedor['telefone_fornecedor'] ?></td>
        <td><?= $fornecedor['email_fornecedor'] ?></td>
    </tr>
    <?php endwhile; ?>
</table>
