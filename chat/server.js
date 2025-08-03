import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // NOVO
import chatRouter from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

// API do chatbot
app.use('/api/chat', chatRouter);

// Servir a pasta "assets" corretamente mesmo o server.js estando dentro de /chat
app.use(express.static(path.join(process.cwd(), 'assets')));

// Servir index.html da raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Servir contato.html dentro de assets/html
app.get('/contato', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'assets/html/contato.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
