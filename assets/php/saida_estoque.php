<?php
require 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_produto = $_POST['id_produto'];
    $quantidade = $_POST['quantidade'];
    $data_saida = date('Y-m-d H:i:s');

    // Verificar se há estoque suficiente
    $sql_check = "SELECT quantidade_estoque FROM produtos WHERE id_produto = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("i", $id_produto);
    $stmt_check->execute();
    $stmt_check->bind_result($quantidade_estoque);
    $stmt_check->fetch();

    if ($quantidade_estoque >= $quantidade) {
        // Registrar saída no estoque
        $sql = "INSERT INTO saidas_estoque (id_produto, quantidade, data_saida) 
                VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iis", $id_produto, $quantidade, $data_saida);
        $stmt->execute();

        // Atualizar estoque do produto
        $sql_update = "UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id_produto = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("ii", $quantidade, $id_produto);
        $stmt_update->execute();

        echo "Saída registrada com sucesso!";
    } else {
        echo "Estoque insuficiente!";
    }
}

// Listar produtos para selecionar
$sql_produtos = "SELECT id_produto, nome_produto FROM produtos";
$result_produtos = $conn->query($sql_produtos);
?>
<h1>Saídas de Estoque</h1>

<form method="POST">
    <select name="id_produto" required>
        <option value="">Selecione o Produto</option>
        <?php while ($produto = $result_produtos->fetch_assoc()): ?>
        <option value="<?= $produto['id_produto'] ?>"><?= $produto['nome_produto'] ?></option>
        <?php endwhile; ?>
    </select>
    <input type="number" name="quantidade" placeholder="Quantidade" required>
    <button type="submit">Registrar Saída</button>
</form>
