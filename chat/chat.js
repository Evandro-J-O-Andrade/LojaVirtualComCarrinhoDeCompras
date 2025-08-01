import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const mensagem = req.body.mensagem;

  if (!mensagem) {
    return res.status(400).json({ resposta: "Mensagem vazia recebida." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é assistente virtual da loja Angel Cosméticos. 
Oferecemos produtos Mary Kay como maquiagens, cremes faciais, perfumes e cuidados com a pele. 
Nossa consultora é a Grasiely Machado. 
Ajude o cliente com simpatia, explique sobre os produtos, indique onde encontrar informações no site e convide para entrar em contato se necessário.`
        },
        {
          role: "user",
          content: mensagem
        }
      ],
      temperature: 0.7
    });

    const resposta = completion.choices[0].message.content;
    res.json({ resposta });

  } catch (error) {
    console.error("Erro ao consultar o ChatGPT:", error);
    res.status(500).json({ resposta: "Desculpe, houve um erro. Tente novamente mais tarde." });
  }
});

export default router;
