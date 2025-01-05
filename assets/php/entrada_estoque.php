<?php
require 'conexao.php'; // Certifique-se de que a conexão esteja correta e use a variável $pdo

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_produto = $_POST['id_produto'];
    $quantidade = $_POST['quantidade'];
    $data_entrada = date('Y-m-d H:i:s');

    try {
        // Registrar entrada no estoque
        $sql = "INSERT INTO entradas_estoque (id_produto, quantidade, data_entrada) 
                VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_produto, $quantidade, $data_entrada]);

        echo "Entrada registrada com sucesso!";

        // Atualizar estoque do produto
        $sql_update = "UPDATE produtos SET quantidade_estoque = quantidade_estoque + ? WHERE id_produto = ?";
        $stmt_update = $pdo->prepare($sql_update);
        $stmt_update->execute([$quantidade, $id_produto]);
    } catch (PDOException $e) {
        echo "Erro ao registrar entrada: " . $e->getMessage();
    }
}

// Listar produtos para selecionar
$sql_produtos = "SELECT id_produto, nome_produto FROM produtos";
$result_produtos = $pdo->query($sql_produtos);
?>
<h1>Entradas de Estoque</h1>

<form method="POST">
    <select name="id_produto" required>
        <option value="">Selecione o Produto</option>
        <?php while ($produto = $result_produtos->fetch(PDO::FETCH_ASSOC)): ?>
        <option value="<?= htmlspecialchars($produto['id_produto']) ?>"><?= htmlspecialchars($produto['nome_produto']) ?></option>
        <?php endwhile; ?>
    </select>
    <input type="number" name="quantidade" placeholder="Quantidade" required>
    <button type="submit">Registrar Entrada</button>
</form>
