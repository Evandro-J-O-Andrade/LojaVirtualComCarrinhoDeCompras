<?php
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "angelcosmeticos";

try {
    // Criando a conexão
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Verificando a conexão
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    echo "Conexão bem-sucedida ao banco de dados!";
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
?>
