import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
import rewardRoutes from './server/routes/rewardRoutes.js';
import quizRoutes from './server/routes/quizRoutes.js';
import { initChameleonSocket } from './server/sockets/chameleonSocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Inicializar WebSockets do Esconde-Esconde
initChameleonSocket(io);

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
app.use('/api/rewards', rewardRoutes);
app.use('/api/quiz', quizRoutes);


// Health check & status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    app: 'LiraQuest',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Rota Diagnóstica de Teste do Banco de Dados: http://liraquest.com.br/testeBD
app.get(['/testeBD', '/api/testeBD'], async (req, res) => {
  const startTime = Date.now();
  try {
    await sequelize.authenticate();
    const responseTimeMs = Date.now() - startTime;

    const rawUrl = process.env.DATABASE_URL || '';
    const maskedUrl = rawUrl ? rawUrl.replace(/:([^:@]+)@/, ':****@') : 'Não definida no .env';

    return res.json({
      success: true,
      status: 'Conectado com sucesso! 🎉',
      message: '✅ A conexão entre o Node.js e o banco MySQL da Hostinger está 100% operacional!',
      database: {
        dialect: sequelize.getDialect(),
        database_name: sequelize.config.database || 'N/A',
        host: sequelize.config.host || 'localhost',
        port: sequelize.config.port || 3306,
        response_time_ms: `${responseTimeMs}ms`,
      },
      env_check: {
        has_database_url: Boolean(process.env.DATABASE_URL),
        masked_database_url: maskedUrl,
        node_env: process.env.NODE_ENV || 'production',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      status: 'Falha na conexão com o banco de dados',
      message: '❌ Não foi possível conectar ao MySQL. Verifique as credenciais no arquivo .env.',
      error_details: {
        message: error.message,
        code: error.code || error.original?.code || 'UNKNOWN_ERROR',
        name: error.name,
      },
      env_check: {
        has_database_url: Boolean(process.env.DATABASE_URL),
        node_env: process.env.NODE_ENV || 'production',
      },
      timestamp: new Date().toISOString(),
    });
  }
});


// Fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização Robusta do Servidor (Proteção contra Erro 503 na Hostinger)
async function startServer() {
  try {
    // 1. Iniciar servidor HTTP imediatamente para a Hostinger responder 200 OK
    const server = httpServer.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🏰 [LiraQuest] Servidor Fullstack com WebSockets Online na porta ${PORT}!`);
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

