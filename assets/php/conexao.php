<?php
$servername = "localhost"; // Nome do servidor de banco de dados (localhost para ambiente local)
$username = "root"; // Usuário do MySQL (geralmente 'root' no ambiente local)
$password = "root"; // Senha do MySQL (geralmente vazia no ambiente local)
$dbname = "angelcosmeticos"; // Nome do banco de dados criado

// Criando a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificando a conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Conexão bem-sucedida ao banco de dados!";
}
?>
