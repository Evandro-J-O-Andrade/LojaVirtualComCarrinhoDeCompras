<?php
session_start();
require_once("conexao.php"); // Conexão com o banco de dados

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'Usuário não está logado']);
    exit;
}

// Captura os dados enviados pelo JavaScript (JSON)
$dadosCarrinho = json_decode(file_get_contents('php://input'), true);

// Valida os dados
if (empty($dadosCarrinho)) {
    echo json_encode(['error' => 'Carrinho vazio ou dados inválidos']);
    exit;
}

$usuario_id = $_SESSION['usuario_id']; // ID do usuário logado

// Insere os produtos no banco de dados
foreach ($dadosCarrinho as $produto) {
    $produtoNome = $produto['produto_nome'];
    $preco = $produto['preco'];
    $quantidade = $produto['quantidade'];

    // Insere ou atualiza no carrinho
    $sql = "SELECT * FROM carrinho WHERE produto_nome = ? AND usuario_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$produtoNome, $usuario_id]);

    if ($stmt->rowCount() > 0) {
        $produtoExistente = $stmt->fetch();
        $novaQuantidade = $produtoExistente['quantidade'] + $quantidade;

        $sql = "UPDATE carrinho SET quantidade = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$novaQuantidade, $produtoExistente['id']]);
    } else {
        $sql = "INSERT INTO carrinho (produto_nome, preco, quantidade, usuario_id) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$produtoNome, $preco, $quantidade, $usuario_id]);
    }
}

// Retorna uma resposta de sucesso
echo json_encode(['status' => 'sucesso', 'mensagem' => 'Compra finalizada e salva no banco de dados!']);
?>
