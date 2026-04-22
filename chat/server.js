import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import chatRouter from './chat.js';

dotenv.config();

const projectRoot = path.resolve(__dirname, '..');

const app = express();
const port = process.env.PORT || 10000;

// ROTA DA API
app.use('/api/chat', chatRouter);

app.use(cors());
app.use(express.json());

// Arquivos estáticos (pasta assets)
const assetsPath = path.join(projectRoot, 'assets');
app.use('/assets', express.static(assetsPath, { dotfiles: 'allow' }));

// Página raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// site.webmanifest
app.get('/site.webmanifest', (req, res) => {
  res.sendFile(path.join(projectRoot, 'site.webmanifest'));
});

// Página de contato
app.get('/contato', (req, res) => {
  res.sendFile(path.join(projectRoot, 'assets/html/contato.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
