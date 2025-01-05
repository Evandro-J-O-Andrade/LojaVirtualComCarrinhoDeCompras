<?php
session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'Usuário não está logado']);
    exit;
}

require_once("conexao.php"); // Conectar ao banco de dados

$usuario_id = $_SESSION['usuario_id']; // Supondo que o usuário esteja logado e tenha um ID na sessão

// Busca os produtos no carrinho do usuário
$sql = "SELECT * FROM carrinho WHERE usuario_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$usuario_id]);

$carrinho = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retorna uma resposta com os dados do carrinho ou uma mensagem
if (empty($carrinho)) {
    echo json_encode(['message' => 'Carrinho vazio']);
} else {
    echo json_encode($carrinho);
}
?>
