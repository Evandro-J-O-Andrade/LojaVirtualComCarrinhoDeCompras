<?php
// Incluir a conexão com o banco de dados
require 'conexao.php'; // Inclui o arquivo de conexão com o banco de dados usando PDO

// Verificar se o formulário foi submetido
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Capturar os dados do formulário
    $nome_usuario = $_POST['nome_usuario'];
    $email_usuario = $_POST['email_usuario'];
    $senha_usuario = $_POST['senha_usuario'];
    $telefone_usuario = $_POST['telefone_usuario'];
    $endereco_usuario = $_POST['endereco_usuario'];
    $logradouro_usuario = $_POST['logradouro_usuario'];
    $cidade_usuario = $_POST['cidade_usuario'];
    $estado_usuario = $_POST['estado_usuario'];
    $cep_usuario = $_POST['cep_usuario'];

    try {
        // Iniciar uma transação
        $pdo->beginTransaction();

        // Criptografar a senha do usuário
        $senha_usuario = password_hash($senha_usuario, PASSWORD_DEFAULT);

        // Inserir na tabela 'usuarios'
        $sql_usuarios = "INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario, telefone_usuario, endereco_usuario, logradouro_usuario, cidade_usuario, estado_usuario, cep_usuario) 
                         VALUES (:nome_usuario, :email_usuario, :senha_usuario, :telefone_usuario, :endereco_usuario, :logradouro_usuario, :cidade_usuario, :estado_usuario, :cep_usuario)";
        $stmt_usuarios = $pdo->prepare($sql_usuarios);
        $stmt_usuarios->execute([
            ':nome_usuario' => $nome_usuario,
            ':email_usuario' => $email_usuario,
            ':senha_usuario' => $senha_usuario,
            ':telefone_usuario' => $telefone_usuario,
            ':endereco_usuario' => $endereco_usuario,
            ':logradouro_usuario' => $logradouro_usuario,
            ':cidade_usuario' => $cidade_usuario,
            ':estado_usuario' => $estado_usuario,
            ':cep_usuario' => $cep_usuario
        ]);

        // Obter o ID do usuário recém-inserido
        $usuario_id = $pdo->lastInsertId();

        // Inserir na tabela 'dados_adicionais'
        $sql_dados = "INSERT INTO dados_adicionais (usuario_id, endereco, telefone, cidade, estado) 
                      VALUES (:usuario_id, :endereco, :telefone, :cidade, :estado)";
        $stmt_dados = $pdo->prepare($sql_dados);
        $stmt_dados->execute([
            ':usuario_id' => $usuario_id,
            ':endereco' => $endereco_usuario,
            ':telefone' => $telefone_usuario,
            ':cidade' => $cidade_usuario,
            ':estado' => $estado_usuario
        ]);

        // Confirmar a transação
        $pdo->commit();

        echo "Usuário cadastrado com sucesso!";
    } catch (Exception $e) {
        // Reverter a transação em caso de erro
        $pdo->rollBack();
        echo "Erro ao cadastrar usuário: " . $e->getMessage();
    }
}
?>
