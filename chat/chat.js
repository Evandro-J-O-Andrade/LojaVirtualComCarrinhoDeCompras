const express = require('express');
const router = express.Router();

// Simula uma resposta (aqui seria onde você integraria com ChatGPT real ou lógica do bot)
router.post('/', (req, res) => {
  const mensagem = req.body.mensagem;

  console.log("Mensagem recebida:", mensagem);

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  // Lógica de resposta simples com base em palavras-chave
  let resposta = "Desculpe, não entendi sua solicitação.";

  if (mensagem.toLowerCase().includes("oi") || mensagem.toLowerCase().includes("olá")) {
    resposta = "Olá! Como posso te ajudar?";
  } else if (mensagem.toLowerCase().includes("produtos")) {
    resposta = "Temos maquiagens, cuidados com a pele, perfumes e muito mais!";
  } else if (mensagem.toLowerCase().includes("consultora")) {
    resposta = "Você pode falar diretamente com nossa consultora clicando em 'Contato'.";
  }

  return res.json({ resposta });
});

module.exports = router;
