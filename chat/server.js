import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRouter from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

// Rota da API do chatbot
app.use('/api/chat', chatRouter);

// Servir arquivos estáticos — ATENÇÃO para o caminho correto:
app.use(express.static('assets'));  // aqui serve toda a pasta assets (css, html, img, js, etc)

// Servir o arquivo index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

// Caso queira uma rota para contato.html (chat) também:
app.get('/contato', (req, res) => {
  res.sendFile(process.cwd() + '/assets/html/contato.html');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
