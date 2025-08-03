// chat/index.js
import express from 'express';
import dotenv from 'dotenv';
import OpenRouter from 'openrouter-sdk';

dotenv.config();

const router = express.Router();

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY, // sua chave OpenRouter
  // endpoint padrão já configurado pela SDK (https://openrouter.ai)
});

router.post('/', async (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  try {
    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // modelo suportado pelo OpenRouter
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
    console.error("Erro ao consultar o OpenRouter:", error);

    let mensagemErro = "Erro ao consultar o chatbot.";

    if (error.response) {
      mensagemErro += ` Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      mensagemErro += ` Mensagem: ${error.message}`;
    }

    return res.status(500).json({ resposta: mensagemErro });
  }
});

export default router;
