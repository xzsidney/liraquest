import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testDbConnection, sequelize } from './server/config/database.js';
import './server/models/index.js';
import authRoutes from './server/routes/authRoutes.js';
import catalogRoutes from './server/routes/catalogRoutes.js';
import familyRoutes from './server/routes/familyRoutes.js';
import characterRoutes from './server/routes/characterRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/character', characterRoutes);

// Health check & status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    app: 'LiraQuest',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do Servidor e Conexão com o Banco
async function startServer() {
  await testDbConnection();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🏰 [LiraQuest] Servidor Fullstack Online na porta ${PORT}!`);
    console.log(`🌐 Acesse no navegador: http://localhost:${PORT}`);
    console.log('====================================================');
  });
}

startServer();
