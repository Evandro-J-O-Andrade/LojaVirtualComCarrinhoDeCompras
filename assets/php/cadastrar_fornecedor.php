<?php
include_once 'conexao.php'; // Arquivo para conexão com o banco de dados

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Captura os dados do formulário
    $nome_fornecedor = $_POST['nome_fornecedor'];
    $cnpj = $_POST['cnpj'];
    $endereco_fornecedor = $_POST['endereco_fornecedor'];
    $telefone_fornecedor = $_POST['telefone_fornecedor'];
    $email_fornecedor = $_POST['email_fornecedor'];

    // Verifica se os campos obrigatórios estão preenchidos
    if (empty($nome_fornecedor) || empty($cnpj) || empty($endereco_fornecedor) || empty($telefone_fornecedor) || empty($email_fornecedor)) {
        echo "Por favor, preencha todos os campos.";
        exit;
    }

    // Prepara a consulta SQL para inserir no banco
    $sql = "INSERT INTO fornecedores (nome_fornecedor, cnpj, endereco_fornecedor, telefone_fornecedor, email_fornecedor) 
            VALUES (?, ?, ?, ?, ?)";

    // Verifique se a conexão com o banco foi bem-sucedida
    if ($pdo) {
        $stmt = $pdo->prepare($sql);

        // Vincula os parâmetros aos valores do formulário
        $stmt->bindParam(1, $nome_fornecedor, PDO::PARAM_STR);
        $stmt->bindParam(2, $cnpj, PDO::PARAM_STR);
        $stmt->bindParam(3, $endereco_fornecedor, PDO::PARAM_STR);
        $stmt->bindParam(4, $telefone_fornecedor, PDO::PARAM_STR);
        $stmt->bindParam(5, $email_fornecedor, PDO::PARAM_STR);

        // Executa a consulta e verifica se foi bem-sucedida
        if ($stmt->execute()) {
            echo "Fornecedor cadastrado com sucesso!";
        } else {
            echo "Erro ao cadastrar fornecedor: " . $stmt->errorInfo()[2];
        }
    } else {
        echo "Erro na conexão com o banco de dados.";
    }
}
?>
