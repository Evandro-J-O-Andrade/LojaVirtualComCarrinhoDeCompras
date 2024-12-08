<?php
session_start();
require_once("conexao.php"); // Conectar ao banco de dados

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $produto_id = $_POST['produto_id'];
    $usuario_id = $_SESSION['usuario_id']; // Supondo que o usuário esteja logado e tenha um ID na sessão

    // Remove o produto do carrinho
    $sql = "DELETE FROM carrinho WHERE id = ? AND usuario_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$produto_id, $usuario_id]);

    echo json_encode(["status" => "sucesso"]);
}
?>
