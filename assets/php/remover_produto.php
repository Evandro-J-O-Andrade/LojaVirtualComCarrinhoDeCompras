<?php
session_start();
require_once("conexao.php"); // Conectar ao banco de dados

// Verifique se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(["status" => "erro", "mensagem" => "Usuário não logado"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $produto_id = $_POST['produto_id'];
    $usuario_id = $_SESSION['usuario_id']; // ID do usuário na sessão

    try {
        // Remove o produto do carrinho
        $sql = "DELETE FROM carrinho WHERE id = ? AND usuario_id = ?";
        $stmt = $pdo->prepare($sql);

        // Bind os parâmetros e executa a query
        $stmt->bindParam(1, $produto_id, PDO::PARAM_INT);
        $stmt->bindParam(2, $usuario_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(["status" => "sucesso"]);
        } else {
            echo json_encode(["status" => "erro", "mensagem" => "Falha ao remover o produto"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "erro", "mensagem" => "Erro: " . $e->getMessage()]);
    }
}
?>
