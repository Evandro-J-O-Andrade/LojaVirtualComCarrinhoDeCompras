import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import chatRouter from './chat'; // Certifique-se que o caminho está correto

const app = express();
const port = process.env.PORT || 1000;

// Middleware para permitir requisições de qualquer origem (CORS)
app.use(cors());

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Rotas da API para chatbot
app.use('/api/chat', chatRouter);

// Servir arquivos estáticos (frontend)
// Ajuste 'public' para o nome da sua pasta que contém arquivos HTML, CSS, JS, imagens, etc.
app.use(express.static('assets'));

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
