<?php
session_start(); // Inicia a sessão

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'Usuário não está logado']); // Retorna um erro caso não esteja logado
    exit; // Interrompe a execução do script
}

require_once("conexao.php"); // Conectar ao banco de dados

$usuario_id = $_SESSION['usuario_id']; // Obtém o ID do usuário da sessão

// Prepara a consulta para buscar os produtos no carrinho
$sql = "SELECT * FROM carrinho WHERE usuario_id = ?";
$stmt = $pdo->prepare($sql);

// Executa a consulta
$stmt->execute([$usuario_id]);

// Fetch os dados do carrinho
$carrinho = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Retorna os dados do carrinho ou uma mensagem caso esteja vazio
if (empty($carrinho)) {
    echo json_encode(['message' => 'Carrinho vazio']); // Mensagem caso não haja itens no carrinho
} else {
    echo json_encode(['carrinho' => $carrinho]); // Retorna os itens do carrinho em formato JSON
}
?>
