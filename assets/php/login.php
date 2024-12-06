<?php
require "conexao.php";
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Captura os dados do formulário
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    // Exibir dados recebidos para depuração
    echo "E-mail: $email<br>";
    echo "Senha: $senha<br>";
    // Verifica se o usuário já existe no banco de dados
    $sql = "SELECT id, senha FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // O usuário existe, então verifica a senha
        $user = $result->fetch_assoc();
        if (password_verify($senha, $user['senha'])) {
            // Senha correta, inicia a sessão e redireciona
            session_start();
            $_SESSION['usuario_id'] = $user['id'];
            header("Location: minha_conta.php");
        } else {
            // Senha incorreta
            echo "Senha incorreta!";
        }
    } else {
        // Usuário não encontrado, então cria um novo usuário
        // Antes de inserir, recomenda-se fazer a senha ser mais segura
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT); // Criptografa a senha

        // SQL para inserir o novo usuário
        $sql_insert = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("ss", $email, $senhaHash); // 'ss' indica que são dois parâmetros tipo string

        if ($stmt_insert->execute()) {
            echo "Novo registro criado com sucesso!";
        } else {
            echo "Erro ao criar o registro: " . $stmt_insert->error;
        }

        $stmt_insert->close();
    }

    $stmt->close(); // Fechar a consulta preparada
    $conn->close(); // Fechar a conexão
}
