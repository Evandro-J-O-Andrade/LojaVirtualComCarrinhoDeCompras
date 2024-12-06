<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

require 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $endereco = $_POST['endereco'];
    $telefone = $_POST['telefone'];
    $idade = $_POST['idade'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];
    $usuario_id = $_SESSION['usuario_id'];

    $sql = "INSERT INTO cadastro (usuario_id, endereco, telefone, idade, cidade, estado) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississ", $usuario_id, $endereco, $telefone, $idade, $cidade, $estado);

    if ($stmt->execute()) {
        echo "Cadastro completado com sucesso!";
    } else {
        echo "Erro ao completar cadastro: " . $stmt->error;
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
