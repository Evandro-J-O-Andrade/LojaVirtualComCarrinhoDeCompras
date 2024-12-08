
<?php
session_start();
require_once("conexao.php"); // Conectar ao banco de dados

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $produto_nome = $_POST['produto_nome'];
    $preco = $_POST['preco'];
    $quantidade = $_POST['quantidade'];
    $usuario_id = $_SESSION['usuario_id']; // Supondo que o usuário esteja logado e tenha um ID na sessão

    // Verifica se o produto já existe no carrinho
    $sql = "SELECT * FROM carrinho WHERE produto_nome = ? AND usuario_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$produto_nome, $usuario_id]);

    if ($stmt->rowCount() > 0) {
        // Produto já existe, atualiza a quantidade
        $produto = $stmt->fetch();
        $nova_quantidade = $produto['quantidade'] + $quantidade;
        $sql = "UPDATE carrinho SET quantidade = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nova_quantidade, $produto['id']]);
    } else {
        // Produto não existe no carrinho, insere novo produto
        $sql = "INSERT INTO carrinho (produto_nome, preco, quantidade, usuario_id) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$produto_nome, $preco, $quantidade, $usuario_id]);
    }

    echo json_encode(["status" => "sucesso"]);
}
?>
