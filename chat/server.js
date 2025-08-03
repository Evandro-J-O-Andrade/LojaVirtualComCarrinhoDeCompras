import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRouter from './index.js';  // router na mesma pasta chat/

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

// Como o server.js está dentro da pasta chat, para servir arquivos estáticos da pasta assets (que está na raiz),
// precisamos ajustar o caminho para subir um nível: '../assets'
app.use(express.static('../assets'));

// Servir o index.html que está na raiz do projeto
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

// Servir a página contato.html dentro de assets/html
app.get('/contato', (req, res) => {
  res.sendFile(process.cwd() + '/assets/html/contato.html');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
