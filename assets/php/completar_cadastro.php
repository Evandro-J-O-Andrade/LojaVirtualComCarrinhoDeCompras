<?php
// Inclui o arquivo de conexão com o banco de dados
include_once 'conexao.php'; 
include_once 'function.php';
// Inicia a sessão para acessar as informações do usuário
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    $_SESSION['erro'] = "Você precisa estar logado para acessar esta página.";
    header("Location: /login.php");
    exit;
}

// Obtém o ID do usuário da sessão
$usuario_id = $_SESSION['usuario_id'];

// Verifica se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Captura os dados do formulário
    $logradouro = trim($_POST['logradouro']);
    $numero = trim($_POST['numero']);
    $complemento = trim($_POST['complemento']);
    $bairro = trim($_POST['bairro']);
    $cidade = trim($_POST['cidade']);
    $estado = trim($_POST['estado']);
    $cep = trim($_POST['cep']);
    $telefone = trim($_POST['telefone']);
    $idade = trim($_POST['idade']);
    $genero = trim($_POST['genero']);

    // Validação dos campos
    if (empty($logradouro) || empty($bairro) || empty($cidade) || empty($estado) || empty($cep) || empty($telefone) || empty($idade) || empty($genero)) {
        $_SESSION['erro'] = "Por favor, preencha todos os campos.";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }

    // Insere os dados na tabela usuarios_completo
    $sql = "INSERT INTO usuarios_completo (usuario_id, nome, email, logradouro, numero, complemento, bairro, cidade, estado, cep, telefone, idade, genero) 
            VALUES (:usuario_id, :nome, :email, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep, :telefone, :idade, :genero)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->bindParam(':nome', $_SESSION['usuario_nome']);
    $stmt->bindParam(':email', $_SESSION['usuario_email']);
    $stmt->bindParam(':logradouro', $logradouro);
    $stmt->bindParam(':numero', $numero);
    $stmt->bindParam(':complemento', $complemento);
    $stmt->bindParam(':bairro', $bairro);
    $stmt->bindParam(':cidade', $cidade);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':cep', $cep);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':idade', $idade);
    $stmt->bindParam(':genero', $genero);

    if ($stmt->execute()) {
        // Cadastro completo com sucesso
        $_SESSION['sucesso'] = "Cadastro completo com sucesso!";
        header("Location: /assets/html/confirmacaoCadastro.html");
        exit;
    } else {
        $_SESSION['erro'] = "Erro ao completar o cadastro. Tente novamente.";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }
}
?>
