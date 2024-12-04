<?php
$servername = "localhost"; // Substitua pelo IP/URL do servidor quando subir
$username = "root"; // Seu usuário MySQL
$password = "root"; // Sua senha MySQL
$dbname = "angelcosmeticos"; // Nome do banco de dados

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Erro ao conectar: " . $conn->connect_error);
}
?>
