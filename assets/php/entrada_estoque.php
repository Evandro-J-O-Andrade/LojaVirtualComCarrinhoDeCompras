<?php
require 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_produto = $_POST['id_produto'];
    $quantidade = $_POST['quantidade'];
    $data_entrada = date('Y-m-d H:i:s');

    // Registrar entrada no estoque
    $sql = "INSERT INTO entradas_estoque (id_produto, quantidade, data_entrada) 
            VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iis", $id_produto, $quantidade, $data_entrada);

    if ($stmt->execute()) {
        echo "Entrada registrada com sucesso!";
        // Atualizar estoque do produto
        $sql_update = "UPDATE produtos SET quantidade_estoque = quantidade_estoque + ? WHERE id_produto = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("ii", $quantidade, $id_produto);
        $stmt_update->execute();
    } else {
        echo "Erro ao registrar entrada: " . $stmt->error;
    }
}

// Listar produtos para selecionar
$sql_produtos = "SELECT id_produto, nome_produto FROM produtos";
$result_produtos = $conn->query($sql_produtos);
?>
<h1>Entradas de Estoque</h1>

<form method="POST">
    <select name="id_produto" required>
        <option value="">Selecione o Produto</option>
        <?php while ($produto = $result_produtos->fetch_assoc()): ?>
        <option value="<?= $produto['id_produto'] ?>"><?= $produto['nome_produto'] ?></option>
        <?php endwhile; ?>
    </select>
    <input type="number" name="quantidade" placeholder="Quantidade" required>
    <button type="submit">Registrar Entrada</button>
</form>
