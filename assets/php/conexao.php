<?php
$host = 'localhost'; // Altere para o seu servidor
$dbname = 'angelcosmeticos'; // Altere para o nome do seu banco de dados
$username = 'root'; // Altere para o seu usuário
$password = 'root'; // Altere para a senha do seu banco de dados

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "Conexão bem-sucedida ao banco de dados!";
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro de conexão: " . $e->getMessage();
    exit;
}
?>
