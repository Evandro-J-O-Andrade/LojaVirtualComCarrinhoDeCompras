import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Carrega variáveis do .env
dotenv.config();

// Inicializa OpenAI com a chave
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, //    Certifique-se de definir a variável OPENAI_API_KEY no seu arquivo .env
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
  timeout: 10000, // Tempo limite de 10 segundos
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor da Angel Cosméticos rodando 🚀');
});

// Rota para chat com OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const { mensagem } = req.body;

    const resposta = await openai.chat.completions.create({
      messages: [{ role: 'user', content: mensagem }],
      model: 'gpt-3.5-turbo',
    });

    res.json({ resposta: resposta.choices[0].message.content });
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error.message);
    res.status(500).json({ erro: 'Erro ao processar a requisição' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
