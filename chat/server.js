import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import chatRouter from './chat.js'; // ⬅️ Verifique se está importando o arquivo certo!

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ROTA DA API
app.use('/api/chat', chatRouter);

// Arquivos estáticos (pasta assets)
app.use(express.static(path.join(process.cwd(), 'assets')));

// Página raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Página de contato
app.get('/contato', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'assets/html/contato.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
