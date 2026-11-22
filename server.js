import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './backend/src/config/database.js';
import familyRoutes from './backend/src/modules/family/familyRoutes.js';
import tasksRoutes from './backend/src/modules/tasks/tasksRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 1. Rotas da API Backend
app.use('/api', familyRoutes);
app.use('/api/tasks', tasksRoutes);

// Rota diagnóstica de teste do banco de dados: /testeBD
app.get('/testeBD', (req, res) => {
  res.redirect('/api/testeBD');
});

// 2. Servir Frontend Estático no mesmo servidor
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/public', express.static(path.join(__dirname, 'frontend/public')));

// Qualquer endpoint /api ou /api/* não mapeado retorna 404 JSON em qualquer método HTTP
app.all(['/api', '/api/*'], (req, res) => {
  return res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
});

// Redirecionar qualquer rota web para o index.html da SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await testDbConnection();
  console.log('====================================================');
  console.log(`🏰 LiraQuest Monorepo rodando na porta ${PORT}`);
  console.log(`🌐 Servidor Fullstack Unificado Online!`);
  console.log('====================================================');
});

export default app;
