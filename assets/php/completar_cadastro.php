<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

require 'conexao.php'; // Arquivo para conexão com o banco de dados

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $endereco = $_POST['endereco'];
    $telefone = $_POST['telefone'];
    $idade = $_POST['idade'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];
    $usuario_id = $_SESSION['usuario_id'];

    // SQL com placeholders para segurança
    $sql = "INSERT INTO cadastro (usuario_id, endereco, telefone, idade, cidade, estado) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    // Preparar a consulta
    $stmt = $pdo->prepare($sql); // Usando PDO aqui

    // Vincula os parâmetros
    $stmt->bindParam(1, $usuario_id, PDO::PARAM_INT);
    $stmt->bindParam(2, $endereco, PDO::PARAM_STR);
    $stmt->bindParam(3, $telefone, PDO::PARAM_STR);
    $stmt->bindParam(4, $idade, PDO::PARAM_INT);
    $stmt->bindParam(5, $cidade, PDO::PARAM_STR);
    $stmt->bindParam(6, $estado, PDO::PARAM_STR);

    // Executa a consulta
    if ($stmt->execute()) {
        echo "Cadastro completado com sucesso!";
    } else {
        echo "Erro ao completar cadastro.";
    }
}
?>

<form method="POST">
    <input type="text" name="endereco" placeholder="Endereço" required>
    <input type="text" name="telefone" placeholder="Telefone" required>
    <input type="number" name="idade" placeholder="Idade" required>
    <input type="text" name="cidade" placeholder="Cidade" required>
    <input type="text" name="estado" placeholder="Estado" required>
    <button type="submit">Completar Cadastro</button>
</form>
