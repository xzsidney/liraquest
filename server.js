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
import taskRoutes from './server/routes/taskRoutes.js';
import shopRoutes from './server/routes/shopRoutes.js';
import uploadRoutes from './server/routes/uploadRoutes.js';
import progressRoutes from './server/routes/progressRoutes.js';


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
app.use('/api/tasks', taskRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/progress', progressRoutes);


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

// Inicialização Robusta do Servidor (Proteção contra Erro 503 na Hostinger)
async function startServer() {
  try {
    // 1. Iniciar servidor HTTP imediatamente para a Hostinger responder 200 OK
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🏰 [LiraQuest] Servidor Fullstack Online na porta ${PORT}!`);
      console.log(`🌐 Porta ativa: ${PORT}`);
      console.log('====================================================');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ Porta ${PORT} já está em uso. O servidor pode já estar rodando.`);
      } else {
        console.error('❌ Erro no servidor HTTP:', err);
      }
    });

    // 2. Testar conexão com banco MySQL em segundo plano (não bloqueia inicialização)
    testDbConnection().catch((err) => {
      console.error('⚠️ Aviso de banco de dados na Hostinger:', err.message);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
  }
}

startServer();

