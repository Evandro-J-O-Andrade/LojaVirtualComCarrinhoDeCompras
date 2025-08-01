import express from 'express';
import cors from 'cors';
import chatRouter from './chat.js'; // Caminho certo se estiver na raiz

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/chat', chatRouter);

// Servir arquivos estáticos (frontend)
app.use(express.static('public')); // ou ajuste se sua pasta for assets

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
