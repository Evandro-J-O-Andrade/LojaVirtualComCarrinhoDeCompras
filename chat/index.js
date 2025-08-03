// chat/index.js
import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Oi! Você está falando com a assistente da Angel Cosméticos, sua parceira para beleza e cuidados pessoais. 
Aqui você encontra maquiagens, cremes faciais, perfumes e muito mais da Mary Kay. 
Fale comigo para tirar dúvidas, conhecer promoções e receber dicas legais. Estou aqui para ajudar!`,
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
      temperature: 0.7,
    });

    const resposta = completion.choices?.[0]?.message?.content;
    return res.json({ resposta });

  } catch (error) {
    console.error("Erro ao consultar o ChatGPT:", error);
    return res.status(500).json({ resposta: "Erro ao consultar o ChatGPT." });
  }
});

export default router;
