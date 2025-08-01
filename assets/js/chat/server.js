// server.js - backend simples para chatbot com OpenAI

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Permite que seu frontend faça requisições para este backend
app.use(cors());

// Permite receber JSON no corpo da requisição
app.use(express.json());

// Configura a API da OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Rota POST /chat para receber mensagem e responder com ChatGPT
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória.' });
  }

  try {
    // Envia a mensagem para o modelo GPT-4 (ou GPT-3.5-turbo)
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // ou 'gpt-4' se tiver acesso
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error('Erro na API OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
