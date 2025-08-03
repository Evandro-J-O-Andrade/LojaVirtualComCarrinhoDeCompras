import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,  // Use a key do OpenRouter
  baseURL: 'https://openrouter.ai/api/v1', // Atenção: URL base do OpenRouter
});

router.post('/', async (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // Modelo disponível no OpenRouter
      messages: [
        {
          role: "system",
          content: `Oi! Você está falando com a assistente da Angel Cosméticos, sua parceira para beleza e cuidados pessoais. Fale comigo para tirar dúvidas, conhecer promoções e receber dicas legais.`,
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

    let mensagemErro = "Erro ao consultar o OpenRouter.";

    if (error.response) {
      mensagemErro += ` Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      mensagemErro += ` Mensagem: ${error.message}`;
    }

    return res.status(500).json({ resposta: mensagemErro });
  }
});

export default router;
