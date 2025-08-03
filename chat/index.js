// chat/index.js
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
        model: "openai/gpt-3.5-turbo", // ou outro modelo compatível com sua conta
        messages: [
          {
            role: "system",
            content: `Oi! Você está falando com a assistente da Angel Cosméticos, sua parceira para beleza e cuidados pessoais.`
          },
          {
            role: "user",
            content: mensagem
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Resposta da OpenRouter:", data); // 👈 VERIFIQUE isso no console do Render

    const resposta = data.choices?.[0]?.message?.content;

    return res.json({ resposta: resposta || "Desculpe, sem resposta no momento." });

  } catch (error) {
    console.error("Erro ao consultar OpenRouter:", error);
    return res.status(500).json({ resposta: "Erro ao consultar OpenRouter." });
  }
});

export default router;
