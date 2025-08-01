const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Importa a rota do chatbot
const chatRoutes = require('./chat/chat');

// Usa a rota em /api/chat
app.use('/api/chat', chatRoutes);

// Rota básica de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
