<?php
include_once'conexao.php'; // Arquivo para conexão com o banco de dados

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    $confirmaSenha = $_POST['confirmaSenha'];

    // Validação de campos vazios
    if  (empty($nome)|| empty($email) || empty($senha) || empty($confirmaSenha)) {
        echo "Por favor, preencha todos os campos.";
        exit;
    }

    // Verificar se as senhas coincidem
    if ($senha !== $confirmaSenha) {
        echo "As senhas não coincidem.";
        exit;
    }

    // Verificar se o e-mail já está registrado
    $query = "SELECT * FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "Este e-mail já está registrado.";
        exit;
    }

    // Hash da senha para segurança
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

   // Cria o hash da senha
   $senha_hash = password_hash($senha, PASSWORD_BCRYPT);

   // Prepara a consulta SQL para inserção no banco de dados
   $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
   $stmt = $conn->prepare($sql);

   if ($stmt === false) {
       echo "Erro na preparação da consulta: " . $conn->error;
       exit;
   }

   // Vincula os parâmetros
   $stmt->bind_param("sss", $nome, $email, $senha_hash);

   // Executa a consulta
   if ($stmt->execute()) {
       echo "Usuário cadastrado com sucesso!";
   } else {
       echo "Erro ao cadastrar usuário: " . $stmt->error;
   }

   // Fecha o statement
   $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Teste Cadastro</title>
</head>
<body>

   <h2>Formulário de Cadastro</h2>

   <form method="POST" action="cadastro_usuario.php">
       <label for="nome">Nome:</label>
       <input type="text" id="nome" name="nome" required><br><br>

       <label for="email">E-mail:</label>
       <input type="email" id="email" name="email" required><br><br>

       <label for="senha">Senha:</label>
       <input type="password" id="senha" name="senha" required><br><br>

       <label for="confirmaSenha">Confirme a Senha:</label>
       <input type="password" id="confirmaSenha" name="confirmaSenha" required><br><br>

       <button type="submit">Cadastrar</button>
   </form>

</body>
</html>
