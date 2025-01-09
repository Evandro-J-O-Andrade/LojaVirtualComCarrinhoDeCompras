<?php
// Inclui o arquivo de conexão com o banco de dados
include_once 'conexao.php'; 

// Inicia a sessão antes de qualquer saída
session_start();

// Verifica se o formulário foi enviado via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Captura os dados enviados pelo formulário
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $senha = trim($_POST['senha']);
    $confirmaSenha = trim($_POST['confirmaSenha']);

    // Validação de campos vazios
    if (empty($nome) || empty($email) || empty($senha) || empty($confirmaSenha)) {
        $_SESSION['erro'] = "Por favor, preencha todos os campos.";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }

    // Verifica se as senhas coincidem
    if ($senha !== $confirmaSenha) {
        $_SESSION['erro'] = "As senhas não coincidem!";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }

    // Verifica se o e-mail já está cadastrado
    $query = "SELECT * FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $_SESSION['erro'] = "Este e-mail já está registrado.";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }

    // Criptografa a senha para maior segurança
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    // Insere os dados no banco de dados
    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senhaHash);

    if ($stmt->execute()) {
        // Armazena dados do usuário na sessão
        $_SESSION['usuario_nome'] = $nome;
        $_SESSION['usuario_email'] = $email;

        // Armazena a mensagem de sucesso na sessão
        $_SESSION['cadastro_sucesso'] = "Cadastro realizado com sucesso! Você está sendo redirecionado para finalizar o cadastro.";

        // Redireciona para a página HTML de completar o cadastro
        header("Location: /assets/html/completarCadastro.html");
        exit;
    } else {
        $_SESSION['erro'] = "Erro ao cadastrar o usuário. Tente novamente.";
        header("Location: /assets/html/completarCadastro.html");
        exit;
    }
} else {
    $_SESSION['erro'] = "Método de requisição inválido.";
    header("Location: /assets/html/completarCadastro.html");
    exit;
}
?>
