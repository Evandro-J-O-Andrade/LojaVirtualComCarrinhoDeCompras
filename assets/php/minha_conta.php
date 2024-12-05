<?php
include 'conexao.php';
 // Conexão com o banco de dados
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

require 'conexao.php';

$usuario_id = $_SESSION['usuario_id'];

$sql = "SELECT nome, email FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
?>
<h1>Bem-vindo, <?= $user['nome'] ?>!</h1>
<p>Email: <?= $user['email'] ?></p>
<a href="completar_cadastro.php">Completar Cadastro</a>
