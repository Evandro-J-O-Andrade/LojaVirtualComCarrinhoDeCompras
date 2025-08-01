import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  const msg = mensagem.toLowerCase();
  let resposta = "Desculpe, não entendi sua solicitação.";

  if (msg.includes("oi") || msg.includes("olá")) {
    resposta = "Olá! Como posso te ajudar?";
  } else if (msg.includes("produtos")) {
    resposta = "Temos maquiagens, cuidados com a pele, perfumes e muito mais!";
  } else if (msg.includes("consultora")) {
    resposta = "Você pode falar diretamente com nossa consultora clicando em 'Contato'.";
  } else if (msg.includes("fale com um atendente")) {
    resposta = "Claro! Nossa equipe estará disponível em instantes. Ou fale agora pelo WhatsApp: https://wa.me/5511963205776";
  }

  res.json({ resposta });
});

export default router;
