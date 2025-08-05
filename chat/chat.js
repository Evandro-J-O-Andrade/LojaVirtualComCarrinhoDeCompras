// chat/chat.js ou chat/index.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // você pode testar com outro, como mistralai/mistral-7b-instruct
     messages: [
  {
    role: "system",
    content: `Você é Angel, a assistente virtual da Angel Cosméticos. A empresa vende produtos de beleza Mary Kay, como maquiagem, cuidados com a pele (skincare), perfumes e acessórios femininos. 
    A loja é gerenciada por Grasiely Machado, consultora Mary Kay, e atende especialmente o público feminino.
    Sempre que possível, seja simpática, educada e empática, ajudando a responder dúvidas sobre produtos, atendimento, promoções ou onde encontrar a loja.`
  },
  {
    role: "user",
    content: mensagem
  }
]

      })
    });

    // 💡 ADICIONE LOG PARA DEBUG
    const data = await response.json();
    console.log("Resposta da OpenRouter:", data);

    const resposta = data.choices?.[0]?.message?.content;

    return res.json({ resposta: resposta || "Desculpe, sem resposta no momento." });

  } catch (error) {
    console.error("Erro ao consultar OpenRouter:", error);
    return res.status(500).json({ resposta: "Erro ao consultar OpenRouter." });
  }
});

export default router;
function sendSuggestion(mensagem) {
  appendMessage(mensagem, "user");
  enviarMensagemAoBackend(mensagem);
}
