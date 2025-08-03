// chat/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRouter from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

// API do chatbot
app.use('/api/chat', chatRouter);

// Servir arquivos estáticos
app.use(express.static('../html'));      // página HTML
app.use('/js', express.static('../js')); // scripts do navegador
app.use('/assets', express.static('../assets')); // imagens, estilos, etc.

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
